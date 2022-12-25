import { TOKENS, type TTokenCategories, type TTokens } from "./tokens.ts";

export type TDetectionResult<
	TTokenCategory extends TTokenCategories,
> = {
	category: TTokenCategory;
	token: keyof TTokens[TTokenCategory];
	tail: string;
	value: string;
};
export type TDetectionResultMaybe<TCategory extends TTokenCategories> =
	| TDetectionResult<TCategory>
	| undefined;

export function detectOperators(
	input: string,
): TDetectionResultMaybe<"OPERATOR"> {
	for (const [name, value] of Object.entries(TOKENS.OPERATOR)) {
		if (input.startsWith(value)) {
			const token = name as keyof TTokens["OPERATOR"];
			return {
				category: "OPERATOR",
				token,
				value: TOKENS.OPERATOR[token],
				tail: input.slice(value.length),
			};
		}
	}
}
export function detectPunctuation(
	input: string,
): TDetectionResultMaybe<"PUNCTUATION"> {
	for (const [name, value] of Object.entries(TOKENS.PUNCTUATION)) {
		if (input.startsWith(value)) {
			const token = name as keyof TTokens["PUNCTUATION"];
			return {
				category: "PUNCTUATION",
				token,
				value: TOKENS.PUNCTUATION[token],
				tail: input.slice(value.length),
			};
		}
	}
}
export function detectKeyword(
	input: string,
): TDetectionResultMaybe<"KEYWORD"> {
	for (const [name, value] of Object.entries(TOKENS.KEYWORD)) {
		if (input.startsWith(value)) {
			const token = name as keyof TTokens["KEYWORD"];
			return {
				category: "KEYWORD",
				token,
				value: TOKENS.KEYWORD[token],
				tail: input.slice(value.length),
			};
		}
	}
}
export function detectLiteral(
	input: string,
): TDetectionResultMaybe<"LITERAL"> {
	for (const [name, regex] of Object.entries(TOKENS.LITERAL)) {
		const [generalMatch, spcificMatch] = regex.exec(input) || [];
		const value = spcificMatch ?? generalMatch;
		if (value && generalMatch) {
			const token = name as keyof TTokens["LITERAL"];
			return {
				category: "LITERAL",
				token,
				value,
				tail: input.slice(generalMatch.length),
			};
		}
	}
}
export function detectMisc(
	input: string,
): TDetectionResultMaybe<"MISC"> {
	for (const [name, regex] of Object.entries(TOKENS.MISC)) {
		const [generalMatch, ...spcificMatches] = regex.exec(input) || [];
		const value = spcificMatches.find((m) => m) ?? generalMatch;
		if (value && generalMatch) {
			const token = name as keyof TTokens["MISC"];
			return {
				category: "MISC",
				token,
				value,
				tail: input.slice(generalMatch.length),
			};
		}
	}
}
