import { TAnyDetectionResult as TTokenType } from "../lexer/scan.ts";
import { Binary, Expr, Grouping, Literal, Unary } from "./types.ts";

export class Parser {
	private history: TTokenType[] = [];
	private errors: Error[] = [];

	constructor(private readonly tokens: Iterator<TTokenType>) {
		this.advance();
	}

	private advance(): void {
		const token = this.tokens.next();
		if (!token.done) {
			this.history.push(token.value);
		} else {
			this.history.push({
				category: "MISC",
				token: "END_OF_FILE",
				value: "",
				position: this.current().position,
			});
		}
	}
	private previous(): TTokenType {
		const prev = this.history[this.history.length - 2];
		if (!prev) {
			throw Error("Could not get the previous token");
		}
		return prev;
	}
	private current(): TTokenType {
		const prev = this.history[this.history.length - 1];
		if (!prev) {
			throw Error("Could not get the current token");
		}
		return prev;
	}
	private isAtEnd(): boolean {
		const { category, token } = this.current();
		return category === "MISC" && token === "END_OF_FILE";
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
	private assertNext(token: TTokenType["token"], message: string) {
		if (this.check(token)) {
			return this.advance();
		} else {
			throw TypeError(message + " " + this.current());
		}
	}
	private sync(): void {
		this.advance();
		while (!this.isAtEnd()) {
			if (this.previous().token === "SEMICOLON") return;

			const { token } = this.current();
			if (
				token === "CLASS" || token === "FUNCTION" || token === "CONST" || token === "LET" ||
				token === "FOR" || token === "IF" || token === "WHILE" || token === "PRINT" ||
				token === "RETURN"
			) return;
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
		} else if (this.match("STRING_SINGLE", "STRING_DOUBLE", "STRING_TEMPLATE")) {
			const { value } = this.previous();
			return new Literal(value);
		} else if (this.match("NULL")) {
			return new Literal(null);
		} else if (this.match("BRACKET_OPEN")) {
			const expr = this.expression();
			this.assertNext("BRACKET_CLOSE", "Expected a `)` after the expression");
			return new Grouping(expr);
		} else {
			throw TypeError(`Expected an expression but got ${this.current()}`);
		}
	}
	private unary(): Expr {
		if (this.match("NOT", "ADD", "SUB")) {
			const { value: op } = this.previous();
			if (op !== "!" && op !== "+" && op !== "-") {
				throw TypeError(`The unary operator should be '!', '+' or '-', but got ${op}`);
			}
			const right = this.unary();
			return new Unary(op, right);
		}
		return this.primary();
	}
	private factor(): Expr {
		let expr = this.unary();
		while (this.match("MUL", "DIV")) {
			const { value: op } = this.previous();
			if (op !== "*" && op !== "/") {
				throw TypeError(`The factor operator should be '*' or '/', but got ${op}`);
			}
			const right = this.unary();
			expr = new Binary(expr, op, right);
		}
		return expr;
	}
	private term(): Expr {
		let expr = this.factor();
		while (this.match("SUB", "ADD")) {
			const { value: op } = this.previous();
			if (op !== "-" && op !== "+") {
				throw TypeError(`The term operator should be '-' or '+', but got ${op}`);
			}
			const right = this.factor();
			expr = new Binary(expr, op, right);
		}
		return expr;
	}
	private comparison(): Expr {
		let expr = this.term();
		while (this.match("GT", "GTE", "LT", "LTE")) {
			const { value: op } = this.previous();
			if (op !== ">" && op !== ">=" && op !== "<" && op !== "<=") {
				throw TypeError(
					`The comparison operator should be '>', '>=', '<' or '<=', but got ${op}`,
				);
			}
			const right = this.term();
			expr = new Binary(expr, op, right);
		}
		return expr;
	}
	private equality(): Expr {
		let expr = this.comparison();
		while (this.match("NOTEQ", "EQEQ")) {
			const { value: op } = this.previous();
			if (op !== "!=" && op !== "==") {
				throw TypeError(`The equality operator should be '!=' or '==', but got ${op}`);
			}

			const right = this.comparison();
			expr = new Binary(expr, op, right);
		}
		return expr;
	}
	private expression(): Expr {
		return this.equality();
	}

	public getErrors(): Error[] {
		return this.errors;
	}
	public parse(): Expr | undefined {
		try {
			return this.expression();
		} catch (e) {
			this.errors.push(e);
		}
	}
}
