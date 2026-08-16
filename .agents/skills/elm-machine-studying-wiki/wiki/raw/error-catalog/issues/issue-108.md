---
issue_number: 108
title: "Functions in Inferred Tuple Type Annotations"
state: CLOSED
author: "rtfeldman"
created_at: "2016-04-10T05:02:48Z"
url: "https://github.com/elm/error-message-catalog/issues/108"
labels: []
---

# Issue #108: Functions in Inferred Tuple Type Annotations

**State:** `CLOSED` | **Author:** @rtfeldman | **Source:** [https://github.com/elm/error-message-catalog/issues/108](https://github.com/elm/error-message-catalog/issues/108)

## Description

If I put this in elm-repl 0.16, I get the following result:

```
> uncurry << fst
<function> : ( a -> b -> c, d ) -> ( a, b ) -> c
```

I misread the first tuple as `( a -> b -> ( c, d ) )` instead of the intended `( (a -> b -> c), d )`.

Having parentheses around the function, as shown in the latter type above, would make this clearer.

