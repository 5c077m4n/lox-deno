import { type TTokenCategories } from "./tokens.ts";
import {
	detectKeyword,
	detectLiteral,
	detectMisc,
	detectOperators,
	detectPunctuation,
	type TDetectionResult,
} from "./detectors.ts";

const DETECTORS = [
	detectOperators,
	detectKeyword,
	detectLiteral,
	detectMisc,
	detectPunctuation,
] as const;

export type TAnyDetectionResult = {
	[K in TTokenCategories]: Omit<TDetectionResult<K>, "tail"> & { position: number };
}[TTokenCategories];

export function* scan(
	input: string,
): Generator<TAnyDetectionResult> {
	let currentInput = input;
	let position = 0;

	while (currentInput) {
		for (const detector of DETECTORS) {
			const result = detector(currentInput);

			if (result) {
				const { tail, ...tokenValue } = result;
				if (tokenValue.token !== "TAB" && tokenValue.token !== "SPACE") {
					yield { ...tokenValue, position };
				}

				currentInput = tail;
				position += tokenValue.value.length;
				break;
			}
		}
	}
}
