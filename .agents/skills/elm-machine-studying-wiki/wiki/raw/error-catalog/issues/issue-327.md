---
issue_number: 327
title: "unlear (?) error messages when working with tuples"
state: OPEN
author: "benkoshy"
created_at: "2020-01-09T22:03:26Z"
url: "https://github.com/elm/error-message-catalog/issues/327"
labels: []
---

# Issue #327: unlear (?) error messages when working with tuples

**State:** `OPEN` | **Author:** @benkoshy | **Source:** [https://github.com/elm/error-message-catalog/issues/327](https://github.com/elm/error-message-catalog/issues/327)

## Description

https://package.elm-lang.org/packages/elm-lang/core/latest/Tuple

### My perspective

* Relatively new Elm user. 

```elm
The 1st argument to `second` is not what I expect:

653|         y = second getDimensions(difficulty)            
                        ^^^^^^^^^^^^^
This `getDimensions` value is a:

    Difficulty -> ( Int, Int )
-- getDimensions takes a dimension and returns a tuple

But `second` needs the 1st argument to be:

    ( a, b -> c )

-- but the error message is a little confusing.
```

I suspect the problem is that we are inputting a "difficulty" and returning a tuple, instead of straight away getting a tuple (without a function which takes a 'difficulty' parameter. The compiler message leaves me a little non-plussed.

My two cents.

