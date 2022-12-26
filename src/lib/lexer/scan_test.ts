import { assertEquals } from "asserts";

import { scan, TAnyDetectionResult } from "./scan.ts";

Deno.test("Sanity", () => {
	const result = [...scan("const a = 1;")];
	const expected: TAnyDetectionResult[] = [
		{ category: "KEYWORD", token: "CONST", value: "const", position: 0 },
		{ category: "MISC", token: "IDENTIFIER", value: "a", position: 6 },
		{ category: "OPERATOR", token: "EQ", value: "=", position: 8 },
		{ category: "LITERAL", token: "NUMBER", value: "1", position: 10 },
		{ category: "PUNCTUATION", token: "SEMICOLON", value: ";", position: 11 },
		{ category: "MISC", token: "END_OF_FILE", value: "", position: 12 },
	];
	assertEquals(result, expected);
});

Deno.test("Sanity 2", () => {
	const result = [...scan("let abc = 'qwerty';")];
	const expected: TAnyDetectionResult[] = [
		{ category: "KEYWORD", token: "LET", value: "let", position: 0 },
		{ category: "MISC", token: "IDENTIFIER", value: "abc", position: 4 },
		{ category: "OPERATOR", token: "EQ", value: "=", position: 8 },
		{ category: "LITERAL", token: "STRING_SINGLE", value: "qwerty", position: 10 },
		{ category: "PUNCTUATION", token: "SEMICOLON", value: ";", position: 16 },
		{ category: "MISC", token: "END_OF_FILE", value: "", position: 17 },
	];
	assertEquals(result, expected);
});
