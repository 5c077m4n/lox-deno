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
