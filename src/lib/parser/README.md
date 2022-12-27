# Expressions

| name       | value                                                                  |
| ---------- | ---------------------------------------------------------------------- |
| expression | literal \| unary \| binary \| grouping                                 |
| literal    | NUMBER \| STRING \| BOOLEAN \| NULL                                    |
| grouping   | `(` expression `)`                                                     |
| unary      | ( `-` \| `+` \| `!` ) expression                                       |
| binary     | expression operator expression                                         |
| operator   | `==` \| `!=` \| `<` \| `<=` \| `>` \| `>=` \| `+` \| `-` \| `*` \| `/` |
| comparison | term ( ( `>` \| `>=` \| `<` \| `<=` ) term ) \*                        |
| unary      | ( `!` \| `+` \| `-` ) \| primary                                       |
| primary    | NUMBER \| STRING \| BOOLEAN \| `null` \| `(` expression `)`            |

# Statements

| name      | value                  |
| --------- | ---------------------- |
| program   | statement \* EOF       |
| statement | exprStmt \| printStmt  |
| exprStmt  | expression `;`         |
| printStmt | `print` expression `;` |
