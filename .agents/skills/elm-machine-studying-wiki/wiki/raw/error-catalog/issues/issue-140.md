---
issue_number: 140
title: "Assume type annotation is always correct"
state: CLOSED
author: "jinjor"
created_at: "2016-07-20T06:12:01Z"
url: "https://github.com/elm/error-message-catalog/issues/140"
labels: ['types']
---

# Issue #140: Assume type annotation is always correct

**State:** `CLOSED` | **Author:** @jinjor | **Source:** [https://github.com/elm/error-message-catalog/issues/140](https://github.com/elm/error-message-catalog/issues/140)

## Description

(This issue has been moved from #110 to clarify the problem)

Here is a problematic case.

``` elm
import Html exposing (text)

main =
  text (toString transform)

transform : List Int -> List Float
transform list =
  List.map (\i -> 1 / i) list
```

This code produces an error message.

```
-- TYPE MISMATCH ----------------------------------------------------- Main0.elm

The implementation of `transform` does not match its type annotation.

5│ transform : List Int -> List Float
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

The real cause of the mismatch is `(\i -> 1 / i)`. Now compiler is assuming `(\i -> 1 / i)` is `Float -> Float` and then `list` is `List Float`, but I'm sure `list` is `List Int` and `i` is an `Int`. I think this is a bit confusing and feel strange that "inference is stronger than annotation". I expect compiler to "assume type annotation is always correct".

In this case, I expect some message like following.

```
-- TYPE MISMATCH ---------------------------------------------------------------

The right argument of (/) is causing a type mismatch.

7|     1 / i
            ^
(/) is expecting the right argument to be a:

    Float

But the right argument is:

    Int
```

Here is a comparison between Elm and Flow (sorry, example is another one). Flow's message is closer to my expectation.
![type-inferrence-elm-vs-flow](https://cloud.githubusercontent.com/assets/2568148/16976348/20345ae6-4e89-11e6-90da-8dcd3b44e4cc.png)

