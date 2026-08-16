---
issue_number: 340
title: "Using `Maybe` instead of `Just`"
state: OPEN
author: "danfishgold"
created_at: "2020-08-11T08:15:51Z"
url: "https://github.com/elm/error-message-catalog/issues/340"
labels: []
---

# Issue #340: Using `Maybe` instead of `Just`

**State:** `OPEN` | **Author:** @danfishgold | **Source:** [https://github.com/elm/error-message-catalog/issues/340](https://github.com/elm/error-message-catalog/issues/340)

## Description

Something that I've seen a couple of times with beginners is writing `Maybe 123` instead of `Just 123`. Currently (0.19.1) when you write that in the repl (or when you use `Maybe` outside of type definitions), this is the error you get:

```
> Maybe 123
-- NAMING ERROR ----------------------------------------------------------- REPL

I cannot find a `Maybe` variant:

3|   Maybe 123
     ^^^^^
These names seem close though:

    False
    True
    Maybe.Just
    EQ

Hint: Read <https://elm-lang.org/0.19.1/imports> to see how `import`
declarations work in Elm.
```

This could be a great opportunity to mention the difference between `Maybe` and `Just`
(and more generally the difference between type variables and associated data)
