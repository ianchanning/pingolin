---
issue_number: 335
title: "Naming error when tuple result on lambda has no parens"
state: OPEN
author: "reinux"
created_at: "2020-04-16T21:51:13Z"
url: "https://github.com/elm/error-message-catalog/issues/335"
labels: []
---

# Issue #335: Naming error when tuple result on lambda has no parens

**State:** `OPEN` | **Author:** @reinux | **Source:** [https://github.com/elm/error-message-catalog/issues/335](https://github.com/elm/error-message-catalog/issues/335)

## Description

This might be a mistake that's unique to people coming from OCaml/F#, but:

```
tasks |> List.map (\t -> t.id, t)
```

The mistake was in forgetting the brackets on the result tuple (F# doesn't require commas around tuples, as it uses semicolons for list comprehensions instead).

The error I get:

```
NAMING ERROR - I cannot find a `t` variable:
191|         |> List.map (\t -> t.id, t)
                                      ^
```

I'm not sure this would be easy to improve, since it can't be helped that the `->` operator has higher precedence than `,`.
