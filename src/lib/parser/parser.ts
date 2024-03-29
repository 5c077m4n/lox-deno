import { TAnyDetectionResult as TTokenType } from "../lexer/scan.ts";
import {
	Assign,
	Binary,
	Call,
	Expr,
	Grouping,
	Literal,
	Logical,
	Unary,
	Variable,
} from "./types/expr.ts";
import {
	Block,
	Expression,
	For,
	If,
	Print,
	Stmt,
	VariableDeclaration,
	While,
} from "./types/stmt.ts";

export class Parser {
	private history: TTokenType[] = [];
	private errors: Error[] = [];

	constructor(private readonly tokens: Iterator<TTokenType>) {
		this.advance();
	}

	private previous(): TTokenType {
		const prev = this.history.at(-2);
		if (!prev) {
			throw Error("Could not get the previous token");
		}
		return prev;
	}
	private current(): TTokenType {
		const prev = this.history.at(-1);
		if (!prev) {
			throw Error("Could not get the current token");
		}
		return prev;
	}
	private isAtEnd(): boolean {
		const { category, token } = this.current();
		return category === "MISC" && token === "END_OF_FILE";
	}
	private advance(): void {
		const token = this.tokens.next();
		if (!token.done) {
			this.history.push(token.value);
		}
	}
	private check(token: TTokenType["token"]): boolean {
		if (this.isAtEnd()) return false;
		return this.current().token === token;
	}
	private match(...tokens: TTokenType["token"][]): boolean {
		for (const token of tokens) {
			if (this.check(token)) {
				this.advance();
				return true;
			}
		}
		return false;
	}
	private assertNext(token: TTokenType["token"], message: string): TTokenType {
		if (this.check(token)) {
			this.advance();
			return this.previous();
		} else {
			throw TypeError(message + " " + JSON.stringify(this.current()));
		}
	}
	private sync(): void {
		this.advance();
		while (!this.isAtEnd()) {
			if (this.previous().token === "SEMICOLON") return;

			const { token } = this.current();
			if (
				token === "CLASS" ||
				token === "FUNCTION" ||
				token === "CONST" ||
				token === "LET" ||
				token === "FOR" ||
				token === "IF" ||
				token === "WHILE" ||
				token === "PRINT" ||
				token === "RETURN"
			) {
				return;
			}
			this.advance();
		}
	}

	private primary(): Expr {
		if (this.match("BOOLEAN")) {
			const { value } = this.previous();
			if (value !== "true" && value !== "false") {
				throw TypeError(`Expected a boolean but got ${value}`);
			}
			return new Literal(value === "true");
		} else if (this.match("NUMBER")) {
			const { value } = this.previous();
			const numericValue = +value;
			if (Number.isNaN(numericValue)) {
				throw TypeError(`Expected a number but got ${value}`);
			}
			return new Literal(numericValue);
		} else if (
			this.match("STRING_SINGLE", "STRING_DOUBLE", "STRING_TEMPLATE")
		) {
			const { value } = this.previous();
			return new Literal(value);
		} else if (this.match("NULL")) {
			return new Literal(null);
		} else if (this.match("BRACKET_OPEN")) {
			const expr = this.expression();
			this.assertNext("BRACKET_CLOSE", "Expected a `)` after the expression");
			return new Grouping(expr);
		} else if (this.match("IDENTIFIER")) {
			const { value } = this.previous();
			return new Variable(value);
		} else {
			throw TypeError(
				`Expected an expression but got '${JSON.stringify(this.current())}'`,
			);
		}
	}
	private finishCall(callee: Expr): Expr {
		const args: Expr[] = [];
		if (!this.check("BRACKET_CLOSE")) {
			do {
				const expr = this.expression();
				args.push(expr);
			} while (this.match("COMMA"));
		}
		this.assertNext("BRACKET_CLOSE", "Expected a `)` after the argument list");

		return new Call(callee, args);
	}
	private call(): Expr {
		let expr = this.primary();
		while (this.match("BRACKET_OPEN")) {
			expr = this.finishCall(expr);
		}

		return expr;
	}
	private unary(): Expr {
		if (this.match("NOT", "ADD", "SUB")) {
			const op = this.previous();
			if (op.token !== "NOT" && op.token !== "ADD" && op.token !== "SUB") {
				throw TypeError(
					`The unary operator should be '!', '+' or '-', but got ${op}`,
				);
			}
			const right = this.unary();
			return new Unary(op.token, right);
		}
		return this.call();
	}
	private factor(): Expr {
		let expr = this.unary();
		while (this.match("MUL", "DIV")) {
			const op = this.previous();
			if (op.token !== "MUL" && op.token !== "DIV") {
				throw TypeError(
					`The factor operator should be '*' or '/', but got ${op.value}`,
				);
			}
			const right = this.unary();
			expr = new Binary(expr, op.token, right);
		}
		return expr;
	}
	private term(): Expr {
		let expr = this.factor();
		while (this.match("SUB", "ADD")) {
			const op = this.previous();
			if (op.token !== "SUB" && op.token !== "ADD") {
				throw TypeError(
					`The term operator should be '-' or '+', but got ${op.value}`,
				);
			}
			const right = this.factor();
			expr = new Binary(expr, op.token, right);
		}
		return expr;
	}
	private comparison(): Expr {
		let expr = this.term();
		while (this.match("GT", "GTE", "LT", "LTE")) {
			const op = this.previous();
			if (
				op.token !== "GT" &&
				op.token !== "GTE" &&
				op.token !== "LT" &&
				op.token !== "LTE"
			) {
				throw TypeError(
					`The comparison operator should be '>', '>=', '<' or '<=', but got ${op.value}`,
				);
			}
			const right = this.term();
			expr = new Binary(expr, op.token, right);
		}
		return expr;
	}
	private equality(): Expr {
		let expr = this.comparison();

		while (this.match("NOTEQ", "EQEQ")) {
			const op = this.previous();
			if (op.token !== "NOTEQ" && op.token !== "EQEQ") {
				throw TypeError(
					`The equality operator should be '!=' or '==', but got ${op.value}`,
				);
			}

			const right = this.comparison();
			expr = new Binary(expr, op.token, right);
		}
		return expr;
	}
	private and(): Expr {
		let expr = this.equality();

		while (this.match("AND")) {
			const op = this.previous();
			const right = this.equality();

			if (op.token === "AND") {
				expr = new Logical(expr, op.token, right);
			} else {
				throw Error("Expected `&&` but got " + JSON.stringify(op));
			}
		}
		return expr;
	}
	private or(): Expr {
		let expr = this.and();

		while (this.match("OR")) {
			const op = this.previous();
			const right = this.and();

			if (op.token === "OR") {
				expr = new Logical(expr, op.token, right);
			} else {
				throw Error("Expected `||` but got " + JSON.stringify(op));
			}
		}
		return expr;
	}
	private assignment(): Expr {
		const expr = this.or();

		if (this.match("EQ")) {
			const equals = this.previous();
			const value = this.assignment();

			if (expr instanceof Variable) {
				return new Assign(expr.name, value);
			} else {
				throw Error(`Invalid assignment target ${JSON.stringify(equals)}`);
			}
		}
		return expr;
	}
	private expression(): Expr {
		return this.assignment();
	}

	private printStmt(): Stmt {
		const value = this.expression();
		this.assertNext("SEMICOLON", "Expected a `;` after the print expression");
		return new Print(value);
	}
	private expressionStmt(): Stmt {
		const value = this.expression();
		this.assertNext("SEMICOLON", "Expected a `;` after the expression");
		return new Expression(value);
	}
	private block(): Stmt[] {
		const stmts: Stmt[] = [];
		while (!this.check("BRACKET_CURLY_CLOSE") && !this.isAtEnd()) {
			const decl = this.declaration();
			stmts.push(decl);
		}

		this.assertNext("BRACKET_CURLY_CLOSE", "Expected `}` after a block");
		return stmts;
	}
	private ifStmt(): Stmt {
		this.assertNext("BRACKET_OPEN", "Expected a `(` before the if condition");
		const condition = this.expression();
		this.assertNext("BRACKET_CLOSE", "Expected a `)` after the if condition");
		const thenBranch = this.statement();

		let elseBranch: Stmt | undefined;
		if (this.match("ELSE")) {
			elseBranch = this.statement();
		}

		return new If(condition, thenBranch, elseBranch);
	}
	private whileStmt(): Stmt {
		this.assertNext("BRACKET_OPEN", "Expected a `(` after the `while` keyword");
		const cond = this.expression();
		this.assertNext(
			"BRACKET_CLOSE",
			"Expected a `)` after the `while` condition",
		);
		const body = this.statement();

		return new While(cond, body);
	}
	private forStmt(): Stmt {
		this.assertNext("BRACKET_OPEN", "Expected a `(` after the for keyword");

		let init: Stmt | undefined;
		if (this.match("SEMICOLON")) {
			init = undefined;
		} else if (this.match("CONST", "LET")) {
			init = this.varDecl();
		} else {
			init = this.expressionStmt();
		}

		let cond: Expr | undefined;
		if (!this.check("SEMICOLON")) {
			cond = this.expression();
		}
		this.assertNext("SEMICOLON", "Expected a `;` after the loop condition");

		let inc: Expr | undefined;
		if (!this.check("BRACKET_CLOSE")) {
			inc = this.expression();
		}
		this.assertNext("BRACKET_CLOSE", "Expected a `)` after the loop's clause");

		const body = this.statement();
		return new For(init, cond, inc, body);
	}
	private statement(): Stmt {
		if (this.match("PRINT")) {
			return this.printStmt();
		} else if (this.match("BRACKET_CURLY_OPEN")) {
			const block = this.block();
			return new Block(block);
		} else if (this.match("IF")) {
			return this.ifStmt();
		} else if (this.match("WHILE")) {
			return this.whileStmt();
		} else if (this.match("FOR")) {
			return this.forStmt();
		} else {
			return this.expressionStmt();
		}
	}
	private varDecl(): Stmt {
		const name = this.assertNext("IDENTIFIER", "Expected a variable's name");

		let init: Expr | undefined;
		if (this.match("EQ")) {
			init = this.expression();
		}

		this.assertNext("SEMICOLON", "Expected a `;` after a variable declaration");
		return new VariableDeclaration(name.value, init);
	}
	private declaration(): Stmt {
		if (this.match("CONST", "LET")) {
			return this.varDecl();
		} else {
			return this.statement();
		}
	}

	public parse(): readonly Stmt[] {
		const statments: Stmt[] = [];
		while (!this.isAtEnd()) {
			try {
				const stmt = this.declaration();
				statments.push(stmt);
			} catch (e) {
				this.errors.push(e);
				this.sync();
			}
		}
		return statments;
	}
	public getErrors(): readonly Error[] {
		return this.errors;
	}
}
