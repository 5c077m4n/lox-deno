import { Literal } from "../types/expr.ts";
import { Interpreter } from "../visitors/interp.ts";

export class Callable {
	constructor(public readonly arity = 0) {}
	call(intrep: Interpreter, args: Literal[]) {}
}
