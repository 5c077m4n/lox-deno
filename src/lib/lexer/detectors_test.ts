import { assertEquals } from "asserts";

import {
	detectKeyword,
	detectLiteral,
	detectPunctuation,
	TDetectionResultMaybe,
} from "./detectors.ts";

Deno.test("detectors", async (testCtx) => {
	await testCtx.step("detect a comma", () => {
		const result = detectPunctuation(",");
		assertEquals<
			TDetectionResultMaybe<"PUNCTUATION">
		>(result, {
			category: "PUNCTUATION",
			token: "COMMA",
			tail: "",
			value: ",",
		});
	});

	await testCtx.step("detect `null`", () => {
		const result = detectLiteral("null");
		assertEquals<
			TDetectionResultMaybe<"LITERAL">
		>(result, {
			category: "LITERAL",
			token: "NULL",
			tail: "",
			value: "null",
		});
	});

	await testCtx.step("detect a string - single quotes", () => {
		const result = detectLiteral("'asdf' 123");
		assertEquals<
			TDetectionResultMaybe<"LITERAL">
		>(result, {
			category: "LITERAL",
			token: "STRING_SINGLE",
			tail: " 123",
			value: "asdf",
		});
	});

	await testCtx.step("detect a string - double quotes", () => {
		const result = detectLiteral('"asdf" ');
		assertEquals<
			TDetectionResultMaybe<"LITERAL">
		>(result, {
			category: "LITERAL",
			token: "STRING_DOUBLE",
			tail: " ",
			value: "asdf",
		});
	});

	await testCtx.step("detect a keywork and leave a space after", () => {
		const result = detectKeyword("const ");
		assertEquals<
			TDetectionResultMaybe<"KEYWORD">
		>(result, { category: "KEYWORD", token: "CONST", tail: " ", value: "const" });
	});

	await testCtx.step("detect a keywork and leave a tail", () => {
		const result = detectKeyword("const a = 1;");
		assertEquals<
			TDetectionResultMaybe<"KEYWORD">
		>(result, { category: "KEYWORD", token: "CONST", tail: " a = 1;", value: "const" });
	});

	await testCtx.step("detect a number literal", () => {
		const result = detectLiteral("123");
		assertEquals<
			TDetectionResultMaybe<"LITERAL">
		>(result, {
			category: "LITERAL",
			token: "NUMBER",
			value: "123",
			tail: "",
		});
	});

	await testCtx.step("detect a negative number literal", () => {
		const result = detectLiteral("-123");
		assertEquals<
			TDetectionResultMaybe<"LITERAL">
		>(result, {
			category: "LITERAL",
			token: "NUMBER",
			value: "-123",
			tail: "",
		});
	});

	await testCtx.step("detect a number and leave the tail", () => {
		const result = detectLiteral("123+123");
		assertEquals<TDetectionResultMaybe<"LITERAL">>(result, {
			category: "LITERAL",
			token: "NUMBER",
			tail: "+123",
			value: "123",
		});
	});
});
