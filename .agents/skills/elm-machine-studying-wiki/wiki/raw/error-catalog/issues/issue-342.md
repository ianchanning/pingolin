---
issue_number: 342
title: "more informative Maybe error"
state: OPEN
author: "Hasimir0"
created_at: "2020-11-22T16:51:20Z"
url: "https://github.com/elm/error-message-catalog/issues/342"
labels: []
---

# Issue #342: more informative Maybe error

**State:** `OPEN` | **Author:** @Hasimir0 | **Source:** [https://github.com/elm/error-message-catalog/issues/342](https://github.com/elm/error-message-catalog/issues/342)

## Description

This is the first time I create an Issue... I hope I'm doing it right >_<

**Use case:**
the user passes to a function a Maybe type without explicitly/correctly declaring how to handle all alternatives (mostly the Nothing case).

___ ___ ___
In the model I have a {segment : Maybe Segment}

where...

type alias Segment =
    { kind : Int
    , detail : Int
    , openings : Int
    }
I have a function that goes like this...
revealSomeplace model =
    let
        thisSegment = model.segment
    in
    if thisSegment.kind < 4 then
       let
        passageText =
            case thisSegment.detail of
                1 -> "an ascending passage"
                2 -> "a descending passage"
                3 -> "a twisting passage"
                4 -> "a forking passage"
                5 -> "an unstable passage"
                6 -> "an obstructed passage"
                _ -> "error"
        in
            [passageText]

I get the error that thisSegment is of type Maybe.Maybe Segment but the fuction needs a record with a kind field.`
___ ___ ___


**Current error:**
the compiler tells me that I am passing a Maybe type but the compiler expects something different
this leads me to think that I have a type problem, some kind of mismatch
instead what I needed to do was to cover the Nothing case

**Suggestion:**
if the problem is that not all cases are covered... it would be nice if the compiler told me THAT, instead of insisting that there is some kind of type mismatch.
"it seems you are using a Maybe type but I can't find a definition of what happens in case of Nothing" 
