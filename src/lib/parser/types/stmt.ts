import { Expr } from "./expr.ts";

export interface StmtVisitor<TReturn = void> {
	visitExpression(expr: Expression): TReturn;
	visitPrint(expr: Print): TReturn;
	visitVariableDeclaration(expr: VariableDeclaration): TReturn;
}
export interface Stmt {
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
export class VariableDeclaration implements Stmt {
	constructor(public readonly name: string, public readonly init?: Expr) {}
	accept<V>(visitor: StmtVisitor<V>): V {
		return visitor.visitVariableDeclaration(this);
	}
}
