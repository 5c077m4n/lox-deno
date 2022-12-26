import { Binary, Expr, Grouping, Literal, Unary, Visitor } from "../types.ts";

export class Interpreter implements Visitor<Literal> {
	evaluate(expr: Expr): Literal {
		return expr.accept(this);
	}

	visitBinary(expr: Binary): Literal {
		const left = this.evaluate(expr.left);
		const right = this.evaluate(expr.right);

		switch (expr.op) {
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
				throw Error(`Unknown binary operator recieved: ${expr.op}`);
			}
		}
	}
	visitGrouping(expr: Grouping): Literal {
		return this.evaluate(expr);
	}
	visitLiteral(expr: Literal): Literal {
		return expr;
	}
	visitUnary(expr: Unary): Literal {
		const right = this.evaluate(expr.right);
		switch (expr.op) {
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
				throw Error(`Unknown unary operator recieved: ${expr.op}`);
			}
		}
	}
}
