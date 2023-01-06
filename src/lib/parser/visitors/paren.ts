import {
	Assign,
	Binary,
	Expr,
	ExprVisitor,
	Grouping,
	Literal,
	Unary,
	Variable,
} from "../types/expr.ts";
import { Expression, Print, Stmt, StmtVisitor, VariableDeclaration } from "../types/stmt.ts";

export class Parenthesize implements ExprVisitor<string>, StmtVisitor<string> {
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
	visitVariable(expr: Variable): string {
		return this.parenthesize("variable " + expr.name);
	}
	visitAssign(expr: Assign): string {
		return this.parenthesize("assign", expr);
	}

	visitExpression({ expr }: Expression): string {
		if (expr instanceof Binary) {
			return this.visitBinary(expr);
		} else if (expr instanceof Grouping) {
			return this.visitGrouping(expr);
		} else if (expr instanceof Literal) {
			return this.visitLiteral(expr);
		} else if (expr instanceof Unary) {
			return this.visitUnary(expr);
		} else if (expr instanceof Variable) {
			return this.visitVariable(expr);
		} else if (expr instanceof Assign) {
			return this.visitAssign(expr);
		} else {
			throw Error(`Unknown expression: ${JSON.stringify(expr)}`);
		}
	}
	visitPrint(print: Print): string {
		return this.parenthesize("print", print.expr);
	}
	visitVariableDeclaration({ name, init }: VariableDeclaration): string {
		if (init) {
			return this.parenthesize(name, init);
		} else {
			return this.parenthesize(name);
		}
	}

	print(expr: Stmt): string {
		return expr.accept(this);
	}
}
