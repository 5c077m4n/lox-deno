type TTokenGroup<T extends string | RegExp = string | RegExp> = Record<Uppercase<string>, T>;

function regexValidator<T extends RegExp>(regex: T): T {
	if (regex.source.startsWith("^") && !regex.global) {
		return regex;
	} else {
		throw TypeError(
			"The matcher regex for tokens must start with a `^` and not be global (only one match)",
		);
	}
}

export const TOKENS = {
	OPERATOR: {
		NOTEQ: "!=",
		EQEQ: "==",
		NOT: "!",
		EQ: "=",
		GTE: ">=",
		LTE: "<=",
		GT: ">",
		LT: "<",
		ADD: "+",
		SUB: "-",
		MUL: "*",
		DIV: "/",
		AND: "&&",
		OR: "||",
	} as const satisfies TTokenGroup<string>,
	PUNCTUATION: {
		BRACKET_OPEN: "(",
		BRACKET_CLOSE: ")",
		BRACKET_CURLY_OPEN: "{",
		BRACKET_CURLY_CLOSE: "}",
		QUOTE_SINGLE: "'",
		QUOTE_DOUBLE: '"',
		COLON: ":",
		SEMICOLON: ";",
		PIPE: "|",
		AMPERSAND: "&",
		DOT: ".",
		COMMA: ",",
	} as const satisfies TTokenGroup<string>,
	KEYWORD: {
		LET: "let",
		CONST: "const",
		CLASS: "class",
		IF: "if",
		ELSE: "else",
		FUNCTION: "fn",
		FOR: "for",
		WHILE: "while",
		PRINT: "print",
		RETURN: "return",
		SUPER: "super",
		THIS: "this",
	} as const satisfies TTokenGroup<string>,
	LITERAL: {
		BOOLEAN: regexValidator(/^(?:true|false)/),
		NUMBER: regexValidator(/^(?:-?\d+(?:\.\d+)?)/),
		STRING_SINGLE: regexValidator(/^'(.*)'/),
		STRING_DOUBLE: regexValidator(/^"(.*)"/),
		STRING_TEMPLATE: regexValidator(/^`(.*)`/m),
		NULL: regexValidator(/^null/),
	} as const satisfies TTokenGroup<RegExp>,
	MISC: {
		SPACE: regexValidator(/^\s/),
		TAB: regexValidator(/^\t/),
		END_OF_LINE: regexValidator(/^\n|\r\n/),
		END_OF_FILE: regexValidator(/^$/),
		COMMENT: regexValidator(/^\/\*(?:.*)\*\//m),
		IDENTIFIER: regexValidator(/^[\w$_]+[\w\d$_]*/),
	} as const satisfies TTokenGroup<RegExp>,
} as const satisfies Record<Uppercase<string>, TTokenGroup>;

export type TTokens = typeof TOKENS;
export type TTokenCategories = keyof TTokens;
