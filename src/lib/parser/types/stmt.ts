import { Expr } from "./expr.ts";

export interface StmtVisitor<TReturn = void> {
	visitExpression(expr: Expression): TReturn;
	visitPrint(expr: Print): TReturn;
}
export interface Stmt {
	readonly expr: Expr;
	accept<V>(visitor: StmtVisitor<V>): V;
}

export class Expression implements Stmt {
	constructor(public readonly expr: Expr) {}
	accept<V>(visitor: StmtVisitor<V>): V {
		return visitor.visitExpression(this);
	}
}
export class Print implements Stmt {
	constructor(public readonly expr: Expr) {}
	accept<V>(visitor: StmtVisitor<V>): V {
		return visitor.visitPrint(this);
	}
}
