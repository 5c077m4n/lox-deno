import { parse } from "flags";

import { scan } from "./lib/lexer/scan.ts";

async function main() {
	const { _: fileName, eval: evaluate } = parse(Deno.args, { string: ["eval"] });

	if (fileName?.length) {
		const fileContent = await Deno.readTextFile(fileName.join(" "));
		const tokens = [...scan(fileContent)];
		console.log(tokens);
	} else if (evaluate && typeof evaluate === "string") {
		const tokens = [...scan(evaluate)];
		console.log(tokens);
	}
}

if (import.meta.main) {
	main().catch((e) => {
		console.error(e);
		Deno.exit(1);
	});
}
