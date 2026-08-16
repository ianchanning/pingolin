---
issue_number: 326
title: "When given argument of wrong type, error message is sometimes overzealous in its assumptions about the correct type."
state: OPEN
author: "jmbromley"
created_at: "2020-01-04T15:06:40Z"
url: "https://github.com/elm/error-message-catalog/issues/326"
labels: []
---

# Issue #326: When given argument of wrong type, error message is sometimes overzealous in its assumptions about the correct type.

**State:** `OPEN` | **Author:** @jmbromley | **Source:** [https://github.com/elm/error-message-catalog/issues/326](https://github.com/elm/error-message-catalog/issues/326)

## Description

If presented with a type error caused by a type of the form `(a -> a)` which would be partially, but _not completely_ fixed by replacing it with a type of form `a`, then the compiler error message assumes that this is correct, even when it does not fix all remaining errors within the expression.  This can be an incorrect assumption and lead to confusing error messages for the user.

As an example, in the following code:
```elm
module Main exposing (faultyEncode)

import Dict
import Json.Encode


faultyEncode : Dict.Dict String { a : String, b : String } -> Json.Encode.Value
faultyEncode dictionary =
    let
        recordEncoder a b =
            Json.Encode.object
                [ ( "a", Json.Encode.string a )
                , ( "b", Json.Encode.string b )
                ]
    in
    Json.Encode.dict identity recordEncoder dictionary
```
the user has incorrectly written `recordEncoder a b = ...` instead of `recordEncoder { a, b } = ...`.  This results in the error message:
```
TYPE MISMATCH: The 2nd argument to `dict` is not what I expect:

16|     Json.Encode.dict identity recordEncoder dictionary
                                  ^^^^^^^^^^^^^
This `recordEncoder` value is a:

    String -> String -> Json.Encode.Value

But `dict` needs the 2nd argument to be:

    String -> Json.Encode.Value

Hint: I always figure out the argument types from left to right. If an argument
is acceptable, I assume it is “correct” and move on. So the problem may actually
be in one of the previous arguments!

Hint: It looks like it takes too many arguments. I see 1 extra.
```
when in fact the 2nd argument actually needs to be of type `{ a : String, b : String } -> Json.Encode.Value`.
