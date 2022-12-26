import { TTokens } from "../lexer/tokens.ts";

type Operator = TTokens["OPERATOR"][keyof TTokens["OPERATOR"]];

export interface Visitor<TReturn = void> {
	visitBinary(expr: Binary): TReturn;
	visitGrouping(expr: Grouping): TReturn;
	visitLiteral(expr: Literal): TReturn;
	visitUnary(expr: Unary): TReturn;
}
export interface Expr {
	accept<V>(visitor: Visitor<V>): V;
}

export class Binary implements Expr {
	constructor(
		public readonly left: Expr,
		public readonly op: Operator,
		public readonly right: Expr,
	) {
	}
	accept<V>(visitor: Visitor<V>): V {
		return visitor.visitBinary(this);
	}
}
export class Grouping implements Expr {
	constructor(public readonly expr: Expr) {
	}
	accept<V>(visitor: Visitor<V>): V {
		return visitor.visitGrouping(this);
	}
}
export class Literal<T extends number | string | boolean | null = number | string | boolean | null>
	implements Expr {
	constructor(public readonly value: T) {}
	accept<V>(visitor: Visitor<V>): V {
		return visitor.visitLiteral(this);
	}
}
export class Unary implements Expr {
	constructor(public readonly op: Operator, public readonly right: Expr) {
	}
	accept<V>(visitor: Visitor<V>): V {
		return visitor.visitUnary(this);
	}
}