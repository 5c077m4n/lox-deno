import { Binary, Expr, Grouping, Literal, Unary, Visitor } from "../types.ts";

export class Parenthesize implements Visitor<string> {
	private parenthesize(name: string, ...exprs: Expr[]): string {
		return `( ${name} ${exprs.map((e) => e.accept(this)).join(" ")} )`;
	}

	visitBinary(expr: Binary): string {
		return this.parenthesize(expr.op, expr.left, expr.right);
	}
	visitGrouping(expr: Grouping): string {
		return this.parenthesize("group", expr.expr);
	}
	visitLiteral({ value }: Literal): string {
		if (value === null) {
			return "null";
		} else if (typeof value === "string") {
			return `"${value.replaceAll('"', '\\"')}"`;
		} else {
			return value.toString();
		}
	}
	visitUnary(expr: Unary): string {
		return this.parenthesize(expr.op, expr.right);
	}

	print(expr: Expr): string {
		return expr.accept(this);
	}
}
