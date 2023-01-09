import { TTokens } from "../../lexer/tokens.ts";

type Operator = TTokens["OPERATOR"][keyof TTokens["OPERATOR"]];

export interface ExprVisitor<TReturn = void> {
	visitBinary(expr: Binary): TReturn;
	visitGrouping(expr: Grouping): TReturn;
	visitLiteral(expr: Literal): TReturn;
	visitUnary(expr: Unary): TReturn;
	visitVariable(expr: Variable): TReturn;
	visitAssign(expr: Assign): TReturn;
	visitLogical(expr: Logical): TReturn;
}
export interface Expr {
	accept<V>(visitor: ExprVisitor<V>): V;
}

export class Binary implements Expr {
	constructor(
		public readonly left: Expr,
		public readonly op: Operator,
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
	constructor(public readonly op: Operator, public readonly right: Expr) {}
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
		public readonly op: Extract<Operator, "||" | "&&">,
		public readonly right: Expr,
	) {}
	accept<V>(visitor: ExprVisitor<V>): V {
		return visitor.visitLogical(this);
	}
}
