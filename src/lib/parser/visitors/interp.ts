import { Env } from "../env.ts";
import { Binary, Expr, ExprVisitor, Grouping, Literal, Unary, Variable } from "../types/expr.ts";
import { Expression, Print, Stmt, StmtVisitor, VariableDeclaration } from "../types/stmt.ts";

export class Interpreter implements ExprVisitor<Literal>, StmtVisitor<Literal> {
	private env: Env = new Env();

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

	visitExpression(exprStmt: Expression): Literal {
		return this.evaluate(exprStmt.expr);
	}
	visitPrint(printStmt: Print): Literal {
		const value = this.evaluate(printStmt.expr);
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
}
