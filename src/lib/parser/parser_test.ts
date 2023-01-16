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
	await testCtx.step("sanity", () => {
		const interp = new Interpreter();

		const [stmts, errors] = parse("1;");
		assertEquals(errors, []);

		const results = stmts.map((s) => interp.execute(s));
		assertEquals(results, [new Literal(1)]);
	});

	await testCtx.step("sanity expression", () => {
		const interp = new Interpreter();

		const [stmts, errors] = parse("1 + 1 / 1;");
		assertEquals(errors, []);

		const results = [];
		for (const stmt of stmts) {
			const result = interp.execute(stmt);
			results.push(result);
		}

		assertEquals(results, [new Literal(2)]);
	});

	await testCtx.step("equality expression", () => {
		const interp = new Interpreter();

		const [stmts, errors] = parse("1 == 1;");
		assertEquals(errors, []);

		const results = [];
		for (const stmt of stmts) {
			const result = interp.execute(stmt);
			results.push(result);
		}

		assertEquals(results, [new Literal(true)]);
	});

	await testCtx.step("false equality expression", () => {
		const interp = new Interpreter();

		const [stmts, errors] = parse("1 != 1;");
		assertEquals(errors, []);

		const results = [];
		for (const stmt of stmts) {
			const result = interp.execute(stmt);
			results.push(result);
		}

		assertEquals(results, [new Literal(false)]);
	});

	await testCtx.step("non equality expression", () => {
		const interp = new Interpreter();

		const [stmts, errors] = parse("1 != 2;");
		assertEquals(errors, []);

		const results = [];
		for (const stmt of stmts) {
			const result = interp.execute(stmt);
			results.push(result);
		}

		assertEquals(results, [new Literal(true)]);
	});

	await testCtx.step("use global var inside block", () => {
		const interp = new Interpreter();

		const [stmts, errors] = parse("const a = 1; { a + 1; }");
		assertEquals(errors, []);

		const results = stmts.map((s) => interp.execute(s));
		assertEquals(results, [new Literal(1), new Literal(2)]);
	});

	await testCtx.step("set global var inside block", () => {
		const interp = new Interpreter();

		const [stmts, errors] = parse("const b = 1; { b = b + 1; }");
		assertEquals(errors, []);

		const results = stmts.map((s) => interp.execute(s));
		assertEquals(results, [new Literal(1), new Literal(2)]);
	});

	await testCtx.step("undefined variable - should fail", () => {
		const interp = new Interpreter();

		const [stmts, errors] = parse("c + 1;");
		assertEquals(errors, []);

		try {
			for (const stmt of stmts) {
				interp.execute(stmt);
			}
			throw new AssertionError("Unreachable");
		} catch (e) {
			assertExists(e);
			assertEquals(e.message, 'The requested param "c" isn\'t set');
		}
	});

	await testCtx.step("variable defined in block and used outside - should fail", () => {
		const interp = new Interpreter();

		const [stmts, errors] = parse("{ const d = 2; } d + 1;");
		assertEquals(errors, []);

		try {
			for (const stmt of stmts) {
				interp.execute(stmt);
			}
			throw new AssertionError("Unreachable");
		} catch (e) {
			assertExists(e);
			assertEquals(e.message, 'The requested param "d" isn\'t set');
		}
	});

	await testCtx.step("if statement", () => {
		const interp = new Interpreter();

		const [stmts, errors] = parse("if (1) { 1; } else { 0; }");
		assertEquals(errors, []);

		const results = stmts.map((s) => interp.execute(s));
		assertEquals(results, [new Literal(1)]);
	});

	await testCtx.step("while loop", () => {
		const interp = new Interpreter();

		const [stmts, errors] = parse(`
			let i = 0;
			while(i < 3) {
				i = i + 1;
			}
		`);
		assertEquals(errors, []);

		const results = stmts.map((s) => interp.execute(s));
		assertEquals(results, [new Literal(0), new Literal(3)]);
	});

	await testCtx.step("for loop", () => {
		const interp = new Interpreter();

		const [stmts, errors] = parse(`
			for (let j = 0; j < 3; j = j + 1) {
				j;
			}
		`);
		assertEquals(errors, []);

		const results = stmts.map((s) => interp.execute(s));
		assertEquals(results, [new Literal(3)]);
	});
});
