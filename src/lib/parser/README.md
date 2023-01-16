# Expressions

| name       | value                                                                     |
| ---------- | ------------------------------------------------------------------------- |
| expression | assignment                                                                |
| assignment | IDENTIFIER `=` assignment \| logic_or                                     |
| logic_or   | logic_and ( `\|\|` logic_and )\*                                          |
| logic_and  | equality ( `&&` equality )\*                                              |
| literal    | NUMBER \| STRING \| BOOLEAN \| NULL                                       |
| grouping   | `(` expression `)`                                                        |
| unary      | ( `-` \| `+` \| `!` ) expression                                          |
| binary     | expression operator expression                                            |
| operator   | `==` \| `!=` \| `<` \| `<=` \| `>` \| `>=` \| `+` \| `-` \| `*` \| `/`    |
| comparison | term ( ( `>` \| `>=` \| `<` \| `<=` ) term ) \*                           |
| unary      | ( `!` \| `+` \| `-` ) unary \| call                                       |
| call       | primary ( `(` arguments ? `)` )\*                                         |
| arguments  | expression ( `,` expression )\*                                           |
| primary    | NUMBER \| STRING \| BOOLEAN \| `null` \| `(` expression `)` \| IDENTIFIER |

# Statements

| name        | value                                                                             |
| ----------- | --------------------------------------------------------------------------------- |
| program     | declaration \* EOF                                                                |
| declaration | varDecl \| statement                                                              |
| varDecl     | ( `const` \| `let` ) IDENTIFRIER ( `=` expression )? `;`                          |
| statement   | exprStmt \| ifStmt \| printStmt \| block \| whileStmt \| forStmt                  |
| whileStmt   | `while` `(` expression `)` statmemnt                                              |
| forStmt     | `for` `(` ( varDecl \| exprStmt \| `;` ) expression? `;` expression? `;` statment |
| ifStmt      | `if` `(` expression `)` statement ( `else` statement )?                           |
| block       | `{` declaration \* `}`                                                            |
| exprStmt    | expression `;`                                                                    |
| printStmt   | `print` expression `;`                                                            |
