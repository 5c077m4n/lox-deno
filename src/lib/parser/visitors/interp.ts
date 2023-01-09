import { Env } from "../env.ts";
import {
	Assign,
	Binary,
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
	If,
	Print,
	Stmt,
	StmtVisitor,
	VariableDeclaration,
} from "../types/stmt.ts";

export class Interpreter implements ExprVisitor<Literal>, StmtVisitor<Literal> {
	private env: Env = new Env();

	private evaluate(expr: Expr): Literal {
		return expr.accept(this);
	}
	execute(stmt: Stmt): Literal {
		return stmt.accept(this);
	}
	executeBlock(block: Stmt[], env: Env): Literal {
		const prevEnv = this.env;

		let result: Literal = new Literal(null);
		try {
			this.env = env;
			for (const stmt of block) {
				result = this.execute(stmt);
			}
		} catch (e) {
			console.warn(e);
		}
		this.env = prevEnv;

		return result;
	}

	visitBinary(binary: Binary): Literal {
		const left = this.evaluate(binary.left);
		const right = this.evaluate(binary.right);

		switch (binary.op) {
			case "+": {
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
			case "-": {
				if (typeof left.value === "number" && typeof right.value === "number") {
					return new Literal(left.value - right.value);
				}
				throw Error(`Cannot subtract type ${typeof left.value} from ${typeof right.value}`);
			}
			case "*": {
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
			case "/": {
				if (typeof left.value === "number" && typeof right.value === "number") {
					return new Literal(left.value / right.value);
				}
				throw Error(`Cannot divide type ${typeof left.value} by ${typeof right.value}`);
			}
			case "<": {
				if (typeof left.value === "number" && typeof right.value === "number") {
					return new Literal(left.value < right.value);
				}
				throw Error(`Cannot compare type ${typeof left.value} to ${typeof right.value}`);
			}
			case "<=": {
				if (typeof left.value === "number" && typeof right.value === "number") {
					return new Literal(left.value <= right.value);
				}
				throw Error(`Cannot compare type ${typeof left.value} to ${typeof right.value}`);
			}
			case ">": {
				if (typeof left.value === "number" && typeof right.value === "number") {
					return new Literal(left.value > right.value);
				}
				throw Error(`Cannot compare type ${typeof left.value} to ${typeof right.value}`);
			}
			case ">=": {
				if (typeof left.value === "number" && typeof right.value === "number") {
					return new Literal(left.value >= right.value);
				}
				throw Error(`Cannot compare type ${typeof left.value} to ${typeof right.value}`);
			}
			case "==": {
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
			case "!=": {
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
			case "!": {
				return new Literal(!right.isTruthy());
			}
			case "+": {
				if (right.value === null) {
					return new Literal(null);
				} else if (typeof right.value === "number" || typeof right.value === "boolean") {
					return new Literal(+right.value);
				}
				throw Error(`Could not cast type ${typeof right.value} to number`);
			}
			case "-": {
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
		return this.env.get(name);
	}
	visitAssign({ name, value }: Assign): Literal {
		const litValue = this.evaluate(value);
		this.env.redefine(name, litValue);

		return new Literal(null);
	}
	visitLogical(expr: Logical): Literal {
		const left = this.evaluate(expr.left);
		if (expr.op === "||") {
			if (left.isTruthy()) return left;
		} else {
			if (!left.isTruthy()) return left;
		}
		const right = this.evaluate(expr.right);
		return right;
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
		this.env.define(name, initLiteral);

		return new Literal(null);
	}
	visitBlock({ statments }: Block): Literal {
		this.executeBlock(statments, new Env(this.env));
		return new Literal(null);
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
}
