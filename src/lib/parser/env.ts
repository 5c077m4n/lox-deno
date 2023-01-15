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
	set(name: string, value: Literal): boolean {
		if (this.values.has(name)) {
			this.values.set(name, value);
			return true;
		} else if (this.parent) {
			this.parent.set(name, value);
			return true;
		}
		return false;
	}
	define(name: string, value: Literal): boolean {
		if (this.values.has(name)) {
			return false;
		}
		this.values.set(name, value);
		return true;
	}
	redefine(name: string, value: Literal): boolean {
		if (this.values.has(name)) {
			this.values.set(name, value);
			return true;
		} else if (this.parent) {
			this.parent.redefine(name, value);
			return true;
		}
		return false;
	}
	remove(name: string): boolean {
		return this.values.delete(name);
	}
}
