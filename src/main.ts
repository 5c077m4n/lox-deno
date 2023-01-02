import { parse } from "flags";

import { scan } from "./lib/lexer/scan.ts";
import { Parser } from "./lib/parser/parser.ts";
import { Parenthesize } from "./lib/parser/visitors/paren.ts";
import { Interpreter } from "./lib/parser/visitors/interp.ts";

const PRINTER = new Parenthesize();
const INTERPRETER = new Interpreter();

async function main() {
	const { _: fileName, eval: evaluate, "print-ast": printAst } = parse(Deno.args, {
		string: ["eval"],
		boolean: ["print-ast"],
		default: { "print-ast": false },
	});

	let code: string;
	if (fileName?.length) {
		code = await Deno.readTextFile(fileName.join(" "));
	} else if (evaluate && typeof evaluate === "string") {
		code = evaluate;
	} else {
		throw Error("No code input");
	}
	const tokens = scan(code);

	const parser = new Parser(tokens);
	const stmts = parser.parse();

	if (parser.getErrors().length) {
		console.error(parser.getErrors());
	}

	for (const stmt of stmts) {
		if (printAst) {
			const paren = PRINTER.print(stmt);
			console.log(paren);
		}
		INTERPRETER.execute(stmt);
	}
}

if (import.meta.main) {
	main().catch((e) => {
		console.error(e);
		Deno.exit(1);
	});
}
