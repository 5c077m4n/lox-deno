import { Env } from "../env.ts";
import {
	Assign,
	Binary,
	Call,
	Expr,
	ExprVisitor,
	Grouping,
	Literal,
	Logical,
	Unary,
	Variable,
} from "../types/expr.ts";
import {
	Block,
	Expression,
	For,
	If,
	Print,
	Stmt,
	StmtVisitor,
	VariableDeclaration,
	While,
} from "../types/stmt.ts";

export class Interpreter implements ExprVisitor<Literal>, StmtVisitor<Literal> {
	private env: Env = new Env();
	private globals: Env = new Env();

	private evaluate(expr: Expr): Literal {
		return expr.accept(this);
	}
	execute(stmt: Stmt): Literal {
		return stmt.accept(this);
	}

	visitBinary(binary: Binary): Literal {
		const left = this.evaluate(binary.left);
		const right = this.evaluate(binary.right);

		switch (binary.op) {
			case "ADD": {
				if (typeof left.value === "number" && typeof right.value === "number") {
					return new Literal(left.value + right.value);
				} else if (
					typeof left.value === "number" && typeof right.value === "string" ||
					typeof left.value === "string" && typeof right.value === "number"
				) {
					return new Literal(left.value.toString() + right.value.toString());
				}
				throw Error(`Cannot add type ${typeof left.value} to ${typeof right.value}`);
			}
			case "SUB": {
				if (typeof left.value === "number" && typeof right.value === "number") {
					return new Literal(left.value - right.value);
				}
				throw Error(`Cannot subtract type ${typeof left.value} from ${typeof right.value}`);
			}
			case "MUL": {
				if (typeof left.value === "number" && typeof right.value === "number") {
					return new Literal(left.value * right.value);
				} else if (
					typeof left.value === "number" && typeof right.value === "string"
				) {
					return new Literal(right.value.repeat(left.value));
				} else if (
					typeof left.value === "string" && typeof right.value === "number"
				) {
					return new Literal(left.value.repeat(right.value));
				}
				throw Error(`Cannot multiply type ${typeof left.value} by ${typeof right.value}`);
			}
			case "DIV": {
				if (typeof left.value === "number" && typeof right.value === "number") {
					return new Literal(left.value / right.value);
				}
				throw Error(`Cannot divide type ${typeof left.value} by ${typeof right.value}`);
			}
			case "LT": {
				if (typeof left.value === "number" && typeof right.value === "number") {
					return new Literal(left.value < right.value);
				}
				throw Error(`Cannot compare type ${typeof left.value} to ${typeof right.value}`);
			}
			case "LTE": {
				if (typeof left.value === "number" && typeof right.value === "number") {
					return new Literal(left.value <= right.value);
				}
				throw Error(`Cannot compare type ${typeof left.value} to ${typeof right.value}`);
			}
			case "GT": {
				if (typeof left.value === "number" && typeof right.value === "number") {
					return new Literal(left.value > right.value);
				}
				throw Error(`Cannot compare type ${typeof left.value} to ${typeof right.value}`);
			}
			case "GTE": {
				if (typeof left.value === "number" && typeof right.value === "number") {
					return new Literal(left.value >= right.value);
				}
				throw Error(`Cannot compare type ${typeof left.value} to ${typeof right.value}`);
			}
			case "EQEQ": {
				if (left.value === null && right.value === null) {
					return new Literal(true);
				} else if (typeof left.value === "number" && typeof right.value === "number") {
					if (Number.isNaN(left.value) && Number.isNaN(right.value)) {
						return new Literal(true);
					} else {
						return new Literal(left.value === right.value);
					}
				}
				throw Error(`Cannot compare type ${typeof left.value} to ${typeof right.value}`);
			}
			case "NOTEQ": {
				if (typeof left.value === "number" && typeof right.value === "number") {
					return new Literal(left.value !== right.value);
				}
				throw Error(`Cannot compare type ${typeof left.value} to ${typeof right.value}`);
			}
			default: {
				throw Error(`Unknown binary operator recieved: ${binary.op}`);
			}
		}
	}
	visitGrouping(group: Grouping): Literal {
		return this.evaluate(group.expr);
	}
	visitLiteral(lit: Literal): Literal {
		return lit;
	}
	visitUnary(unary: Unary): Literal {
		const right = this.evaluate(unary.right);
		switch (unary.op) {
			case "NOT": {
				return new Literal(!right.isTruthy());
			}
			case "ADD": {
				if (right.value === null) {
					return new Literal(null);
				} else if (typeof right.value === "number" || typeof right.value === "boolean") {
					return new Literal(+right.value);
				}
				throw Error(`Could not cast type ${typeof right.value} to number`);
			}
			case "SUB": {
				if (right.value === null) {
					return new Literal(null);
				} else if (typeof right.value === "number" || typeof right.value === "boolean") {
					return new Literal(-right.value);
				}
				throw Error(`Could not negeate type ${typeof right.value}`);
			}
			default: {
				throw Error(`Unknown unary operator recieved: ${unary.op}`);
			}
		}
	}
	visitVariable({ name }: Variable): Literal {
		const value = this.env.get(name);
		if (!value) {
			throw Error(`The requested param "${name}" isn't set`);
		}
		return value;
	}
	visitAssign({ name, value }: Assign): Literal {
		const litValue = this.evaluate(value);
		if (!this.env.redefine(name, litValue)) {
			throw Error(`The param "${name}" doesn't exist`);
		}

		return litValue;
	}
	visitLogical(expr: Logical): Literal {
		const left = this.evaluate(expr.left);
		if (expr.op === "OR") {
			if (left.isTruthy()) return left;
		} else {
			if (!left.isTruthy()) return left;
		}
		const right = this.evaluate(expr.right);
		return right;
	}
	visitCall(call: Call): Literal {
		const callee = this.evaluate(call.callee);

		const args: Literal[] = [];
		for (const arg of call.args) {
			const parsedArg = this.evaluate(arg);
			args.push(parsedArg);
		}

		throw Error("Unimplemented");
	}

	visitExpression({ expr }: Expression): Literal {
		return this.evaluate(expr);
	}
	visitPrint({ expr }: Print): Literal {
		const value = this.evaluate(expr);
		console.log(value);
		return value;
	}
	visitVariableDeclaration({ name, init }: VariableDeclaration): Literal {
		let initLiteral: Literal;
		if (init) {
			initLiteral = this.evaluate(init);
		} else {
			initLiteral = new Literal(null);
		}
		if (!this.env.define(name, initLiteral)) {
			throw Error(`The param "${name}" already exists`);
		}

		return initLiteral;
	}
	visitBlock({ statments }: Block): Literal {
		const prevEnv = this.env;
		const blockEnv = new Env(prevEnv);
		this.env = blockEnv;

		let result: Literal = new Literal(null);
		try {
			for (const stmt of statments) {
				result = this.execute(stmt);
			}
		} catch (e) {
			console.warn(e);
		}
		this.env = prevEnv;

		return result;
	}
	visitIf({ condition, thenBranch, elseBranch }: If): Literal {
		const cond = this.evaluate(condition);
		if (cond.isTruthy()) {
			return this.execute(thenBranch);
		} else if (elseBranch) {
			return this.execute(elseBranch);
		} else {
			return new Literal(null);
		}
	}
	visitWhile({ condition, body }: While): Literal {
		let result: Literal = new Literal(null);
		while (this.evaluate(condition).isTruthy()) {
			result = this.execute(body);
		}
		return result;
	}
	visitFor({ initializer, condition = new Literal(true), increment, body }: For): Literal {
		if (increment) {
			body = new Block([body, new Expression(increment)]);
		}
		if (initializer instanceof VariableDeclaration) {
			this.visitVariableDeclaration(initializer);
		} else {
			throw Error("Expected a variable declaration here");
		}

		let result: Literal = new Literal(null);
		while (this.evaluate(condition).isTruthy()) {
			result = this.execute(body);
		}
		if (!this.env.remove(initializer.name)) {
			throw Error(`Could not delete the loop's initial values "${initializer.name}"`);
		}

		return result;
	}
}
