import { TTokens } from "../../lexer/tokens.ts";

type Operator = keyof TTokens["OPERATOR"];

export interface ExprVisitor<TReturn = void> {
	visitBinary(expr: Binary): TReturn;
	visitGrouping(expr: Grouping): TReturn;
	visitLiteral(expr: Literal): TReturn;
	visitUnary(expr: Unary): TReturn;
	visitVariable(expr: Variable): TReturn;
	visitAssign(expr: Assign): TReturn;
	visitLogical(expr: Logical): TReturn;
	visitCall(expr: Call): TReturn;
}
export interface Expr {
	accept<V>(visitor: ExprVisitor<V>): V;
}

export class Binary implements Expr {
	constructor(
		public readonly left: Expr,
		public readonly op: Extract<
			Operator,
			"EQ" | "SUB" | "ADD" | "MUL" | "DIV" | "EQEQ" | "NOTEQ" | "LT" | "LTE" | "GT" | "GTE"
		>,
		public readonly right: Expr,
	) {}
	accept<V>(visitor: ExprVisitor<V>): V {
		return visitor.visitBinary(this);
	}
}
export class Grouping implements Expr {
	constructor(public readonly expr: Expr) {}
	accept<V>(visitor: ExprVisitor<V>): V {
		return visitor.visitGrouping(this);
	}
}
export class Literal<
	T extends number | string | boolean | null = number | string | boolean | null,
> implements Expr {
	constructor(public readonly value: T) {}
	accept<V>(visitor: ExprVisitor<V>): V {
		return visitor.visitLiteral(this);
	}
	isTruthy(): boolean {
		return !!this.value;
	}
}
export class Unary implements Expr {
	constructor(
		public readonly op: Extract<Operator, "ADD" | "SUB" | "NOT">,
		public readonly right: Expr,
	) {}
	accept<V>(visitor: ExprVisitor<V>): V {
		return visitor.visitUnary(this);
	}
}
export class Variable implements Expr {
	constructor(public readonly name: string) {}
	accept<V>(visitor: ExprVisitor<V>): V {
		return visitor.visitVariable(this);
	}
}
export class Assign implements Expr {
	constructor(public readonly name: string, public readonly value: Expr) {}
	accept<V>(visitor: ExprVisitor<V>): V {
		return visitor.visitAssign(this);
	}
}
export class Logical implements Expr {
	constructor(
		public readonly left: Expr,
		public readonly op: Extract<Operator, "AND" | "OR">,
		public readonly right: Expr,
	) {}
	accept<V>(visitor: ExprVisitor<V>): V {
		return visitor.visitLogical(this);
	}
}
export class Call implements Expr {
	constructor(public readonly callee: Expr, public readonly args: Expr[]) {}
	accept<V>(visitor: ExprVisitor<V>): V {
		return visitor.visitCall(this);
	}
}
