import { Literal } from "./types/expr.ts";

export class Env {
	private readonly values: Map<string, Literal> = new Map();

	constructor(private readonly parent?: Env) {}

	get(name: string): Literal | undefined {
		const value = this.values.get(name);

		if (value) {
			return value;
		} else if (this.parent) {
			return this.parent.get(name);
		}
	}
	set(name: string, value: Literal): void {
		if (this.values.has(name)) {
			this.values.set(name, value);
		} else if (this.parent) {
			this.parent.set(name, value);
		}
	}
	define(name: string, value: Literal): void {
		if (this.values.has(name)) {
			throw Error(`The param "${name}" already exists`);
		}
		this.values.set(name, value);
	}
	redefine(name: string, value: Literal): void {
		if (!this.get(name)) {
			throw Error(`The param "${name}" doesn't exist`);
		}
		this.set(name, value);
	}
}
