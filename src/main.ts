import { parse } from "flags";

import { scan } from "./lib/lexer/scan.ts";
import { Parser } from "./lib/parser/parser.ts";
import { Parenthesize } from "./lib/parser/visitors/paren.ts";

const PRINTER = new Parenthesize();

async function main() {
	const { _: fileName, eval: evaluate, printAst } = parse(Deno.args, {
		string: ["eval"],
		boolean: ["printAst"],
		default: { printAst: false },
	});

	if (fileName?.length) {
		const fileContent = await Deno.readTextFile(fileName.join(" "));
		const tokens = scan(fileContent);
		const parser = new Parser(tokens);
		const expr = parser.parse();

		if (parser.getErrors().length) {
			console.error(parser.getErrors());
		}

		if (printAst && expr) {
			const paren = PRINTER.print(expr);
			console.log(paren);
		}
	} else if (evaluate && typeof evaluate === "string") {
		const tokens = scan(evaluate);
		const parser = new Parser(tokens);
		const expr = parser.parse();

		if (parser.getErrors().length) {
			console.error(parser.getErrors());
		}

		if (printAst && expr) {
			const paren = PRINTER.print(expr);
			console.log(paren);
		}
	}
}

if (import.meta.main) {
	main().catch((e) => {
		console.error(e);
		Deno.exit(1);
	});
}
