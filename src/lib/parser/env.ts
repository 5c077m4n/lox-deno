import { Literal } from "./types/expr.ts";

export class Env {
	private values: Map<string, Literal> = new Map();

	get(name: string): Literal {
		const value = this.values.get(name);
		if (!value) {
			throw Error(`The requested param "${name}" isn't set`);
		}
		return value;
	}
	define(name: string, value: Literal): void {
		if (this.values.has(name)) {
			throw Error(`The param "${name}" already exists`);
		}
		this.values.set(name, value);
	}
	redefine(name: string, value: Literal): void {
		if (!this.values.has(name)) {
			throw Error(`The param "${name}" doesn't exist`);
		}
		this.values.set(name, value);
	}
}
