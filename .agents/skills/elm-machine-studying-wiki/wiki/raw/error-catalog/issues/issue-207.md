---
issue_number: 207
title: "Confusing error for (\a -> a, ())"
state: OPEN
author: "drathier"
created_at: "2017-03-08T22:38:35Z"
url: "https://github.com/elm/error-message-catalog/issues/207"
labels: ['types']
---

# Issue #207: Confusing error for (\a -> a, ())

**State:** `OPEN` | **Author:** @drathier | **Source:** [https://github.com/elm/error-message-catalog/issues/207](https://github.com/elm/error-message-catalog/issues/207)

## Description

Missed a parenthesis around the tuple result of a lambda, which led to the compiler asking for one more argument. 

`(\a -> a, ())` vs `(\a -> (a, ()))`

```

-- TYPE MISMATCH ------------------------------------------- src/Test.elm

The 1st argument to function `map` is causing a mismatch.

24|             List.map ( \a -> a, () ) myList
                         ^^^^^^^^^^^^^^^
Function `map` is expecting the 1st argument to be:

    a -> ( b -> b, () )

But it is:

    ( b -> b, () )

Hint: It looks like a function needs 1 more argument.

Detected errors in 1 module.
```

where `myList` is a `List Int`. 
