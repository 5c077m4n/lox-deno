import { assertEquals, assertExists, AssertionError } from "asserts";

import { Parser } from "./parser.ts";
import { Literal } from "./types/expr.ts";
import { Interpreter } from "./visitors/interp.ts";
import { scan } from "../lexer/scan.ts";
import { Stmt } from "./types/stmt.ts";

function parse(input: string): [statements: readonly Stmt[], errors: readonly Error[]] {
	const tokens = scan(input);
	const parser = new Parser(tokens);

	const stmts = parser.parse();
	const errors = parser.getErrors();

	return [stmts, errors];
}

Deno.test("parser", async (testCtx) => {
	const INTERPRETER = new Interpreter();

	await testCtx.step("sanity", () => {
		const [stmts, errors] = parse("1;");
		assertEquals(errors, []);

		const results = stmts.map((s) => INTERPRETER.execute(s));
		assertEquals(results, [new Literal(1)]);
	});

	await testCtx.step("sanity expression", () => {
		const [stmts, errors] = parse("1 + 1 / 1;");
		assertEquals(errors, []);

		const results = [];
		for (const stmt of stmts) {
			const result = INTERPRETER.execute(stmt);
			results.push(result);
		}

		assertEquals(results, [new Literal(2)]);
	});

	await testCtx.step("equality expression", () => {
		const [stmts, errors] = parse("1 == 1;");
		assertEquals(errors, []);

		const results = [];
		for (const stmt of stmts) {
			const result = INTERPRETER.execute(stmt);
			results.push(result);
		}

		assertEquals(results, [new Literal(true)]);
	});

	await testCtx.step("false equality expression", () => {
		const [stmts, errors] = parse("1 != 1;");
		assertEquals(errors, []);

		const results = [];
		for (const stmt of stmts) {
			const result = INTERPRETER.execute(stmt);
			results.push(result);
		}

		assertEquals(results, [new Literal(false)]);
	});

	await testCtx.step("non equality expression", () => {
		const [stmts, errors] = parse("1 != 2;");
		assertEquals(errors, []);

		const results = [];
		for (const stmt of stmts) {
			const result = INTERPRETER.execute(stmt);
			results.push(result);
		}

		assertEquals(results, [new Literal(true)]);
	});

	await testCtx.step("use global var inside block", () => {
		const [stmts, errors] = parse("const a = 1; { a + 1; }");
		assertEquals(errors, []);

		const results = stmts.map((s) => INTERPRETER.execute(s));
		assertEquals(results, [new Literal(null), new Literal(null)]);
	});

	await testCtx.step("undefined variable - should fail", () => {
		const [stmts, errors] = parse("b + 1;");
		assertEquals(errors, []);

		try {
			for (const stmt of stmts) {
				INTERPRETER.execute(stmt);
			}
			throw new AssertionError("Unreachable");
		} catch (e) {
			assertExists(e);
			assertEquals(e.message, 'The requested param "b" isn\'t set');
		}
	});

	await testCtx.step("variable defined in block and used outside - should fail", () => {
		const [stmts, errors] = parse("{ const c = 2; } c + 1;");
		assertEquals(errors, []);

		try {
			for (const stmt of stmts) {
				INTERPRETER.execute(stmt);
			}
			throw new AssertionError("Unreachable");
		} catch (e) {
			assertExists(e);
			assertEquals(e.message, 'The requested param "c" isn\'t set');
		}
	});

	await testCtx.step("if statement", () => {
		const [stmts, errors] = parse("if (1) { 1; } else { 0; }");
		assertEquals(errors, []);

		const results = stmts.map((s) => INTERPRETER.execute(s));
		assertEquals(results, [new Literal(null)]);
	});
});
