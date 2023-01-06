# Expressions

| name       | value                                                                     |
| ---------- | ------------------------------------------------------------------------- |
| expression | literal \| unary \| binary \| grouping                                    |
| assignment | IDENTIFIER `=` assignment \| equality                                     |
| literal    | NUMBER \| STRING \| BOOLEAN \| NULL                                       |
| grouping   | `(` expression `)`                                                        |
| unary      | ( `-` \| `+` \| `!` ) expression                                          |
| binary     | expression operator expression                                            |
| operator   | `==` \| `!=` \| `<` \| `<=` \| `>` \| `>=` \| `+` \| `-` \| `*` \| `/`    |
| comparison | term ( ( `>` \| `>=` \| `<` \| `<=` ) term ) \*                           |
| unary      | ( `!` \| `+` \| `-` ) \| primary                                          |
| primary    | NUMBER \| STRING \| BOOLEAN \| `null` \| `(` expression `)` \| IDENTIFIER |

# Statements

| name        | value                                                    |
| ----------- | -------------------------------------------------------- |
| program     | declaration \* EOF                                       |
| declaration | varDecl \| statement                                     |
| varDecl     | ( `const` \| `let` ) IDENTIFRIER ( `=` expression )? `;` |
| statement   | exprStmt \| printStmt                                    |
| exprStmt    | expression `;`                                           |
| printStmt   | `print` expression `;`                                   |
