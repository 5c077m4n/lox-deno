import { Literal } from "../types/expr.ts";
import { Interpreter } from "../visitors/interp.ts";

export class Callable {
	constructor(
		public readonly call: (intrep: Interpreter, args: Literal[]) => Literal,
		public readonly arity = 0,
	) {}
}
