---
issue_number: 110
title: "Better to assume type annotation is always correct"
state: CLOSED
author: "jinjor"
created_at: "2016-04-17T08:04:17Z"
url: "https://github.com/elm/error-message-catalog/issues/110"
labels: ['types']
---

# Issue #110: Better to assume type annotation is always correct

**State:** `CLOSED` | **Author:** @jinjor | **Source:** [https://github.com/elm/error-message-catalog/issues/110](https://github.com/elm/error-message-catalog/issues/110)

## Description

Sorry if you feel this is duplicated with others(e.g. #91 #70 ).

Here is a problematic case.

``` elm
import Html exposing (text)

main =
  text (toString buggy)

buggy : List Int -> List Float
buggy list =
  List.map (\i -> 1 / i) list
```

This code causes an error message.

```
-- TYPE MISMATCH ----------------------------------------------------- Main0.elm

The type annotation for `buggy` does not match its definition.

5│ buggy : List Int -> List Float
           ^^^^^^^^^^^^^^^^^^^^^^
The type annotation is saying:

    List Int -> List Float

But I am inferring that the definition has this type:

    List Float -> List Float

Hint: Elm does not automatically convert between Ints and Floats. Use `toFloat`
and `round` to do specific conversions.
<http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#toFloat>

Detected errors in 1 module.
```

Now compiler is saying "the type annotation you declared is incorrect", but The real cause of the mismatch is `(\i -> 1 / i)`. I always write type annotation first and then implement the logic to fit the correct type, and believe this is a good practice for making API roles clear.

Is there any case this way goes wrong?

