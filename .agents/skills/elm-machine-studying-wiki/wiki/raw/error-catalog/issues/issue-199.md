---
issue_number: 199
title: "Redundancy error in case..of could be clearer"
state: OPEN
author: "ckoster22"
created_at: "2017-01-16T22:40:09Z"
url: "https://github.com/elm/error-message-catalog/issues/199"
labels: ['patterns', 'x-erlang']
---

# Issue #199: Redundancy error in case..of could be clearer

**State:** `OPEN` | **Author:** @ckoster22 | **Source:** [https://github.com/elm/error-message-catalog/issues/199](https://github.com/elm/error-message-catalog/issues/199)

## Description

This is a continuation from [this conversation](https://www.reddit.com/r/elm/comments/5o5p63/experiences_with_elm_on_a_small_production/dchopau/)

Consider the following SSCCE

```
import Html exposing (text)

a = "hello"

const1 = "test"

const2 = "hello"

main =
  let
    val =
      case a of
        const1 -> "test constant match"

        const2 -> "hello constant match"

        _ -> "no match"
  in
    text val
```

The error received is

```
The following pattern is redundant. Remove it.

16|         const2 -> "hello constant match"
            ^^^^^^
Any value with this shape will be handled by a previous pattern.
```

From a beginner's perspective, it would seem reasonable that I should be able to use a constant as a match expression in a `case..of`. However, this isn't valid and Elm interprets `const1` as matching anything and does the same for `const2`, hence the error mentioning redundant patterns.

What's going on here isn't obvious to a beginner. An error message describing that any lowercase name, such as `const2`, will match any pattern might help. There could be better ways of wording that though.
