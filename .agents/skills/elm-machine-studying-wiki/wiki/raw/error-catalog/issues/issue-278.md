---
issue_number: 278
title: "Type mismatch reports same types (value is a Int -> Model but needs to be Int -> Model)"
state: CLOSED
author: "andybalaam"
created_at: "2018-10-18T11:15:19Z"
url: "https://github.com/elm/error-message-catalog/issues/278"
labels: ['types']
---

# Issue #278: Type mismatch reports same types (value is a Int -> Model but needs to be Int -> Model)

**State:** `CLOSED` | **Author:** @andybalaam | **Source:** [https://github.com/elm/error-message-catalog/issues/278](https://github.com/elm/error-message-catalog/issues/278)

## Description

```bash
$ elm --version
0.19.0
```

I am told there is a `TYPE MISMATCH`, but the types being reported are identical.

I've tried to reduce it to a small example:

src/SameType.elm:
```elm
module SameType exposing (..)

import Browser.Events as Events
import Json.Decode as D

type alias Model =
    { x : Int
    , y : Int
    }

makeModel : Int -> Int -> Model
makeModel x y =
    { x = x, y = y }

type Msg =
    MouseChange Model

mmDecoder : D.Decoder Msg
mmDecoder =
    D.map2
        (MouseChange << makeModel)
        (D.field "x" D.int)
        (D.field "y" D.int)

subscriptions : Model -> Sub Msg
subscriptions model =
    Events.onMouseMove mmDecoder
```

Here is the compile error:

```bash
$ elm make src/SameType.elm 
Detected errors in 1 module.                                         
-- TYPE MISMATCH ---------------------------------------------- src/SameType.elm

The 1st argument to `map2` is not what I expect:

25|     D.map2
26|>        (MouseChange << makeModel)
27|         (D.field "x" D.int)
28|         (D.field "y" D.int)

This argument is:

    Int -> Msg

But `map2` needs the 1st argument to be:

    Int -> value

-- TYPE MISMATCH ---------------------------------------------- src/SameType.elm

The right argument of (<<) is causing problems.

26|         (MouseChange << makeModel)
                            ^^^^^^^^^
This `makeModel` value is a:

    Int -> Model

But (<<) needs the right argument to be:

    Int -> Model

Hint: With operators like (<<) I always check the left side first. If it seems
fine, I assume it is correct and check the right side. So the problem may be in
how the left and right arguments interact!
```

Note that the two types (expected and actual) for the right argument of `<<` are both `Int -> Model`.
