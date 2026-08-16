---
issue_number: 367
title: "bad error message when programmer does not know about unary -1 yet"
state: OPEN
author: "Golden-Phy"
created_at: "2024-05-26T19:13:57Z"
url: "https://github.com/elm/error-message-catalog/issues/367"
labels: ['parser']
---

# Issue #367: bad error message when programmer does not know about unary -1 yet

**State:** `OPEN` | **Author:** @Golden-Phy | **Source:** [https://github.com/elm/error-message-catalog/issues/367](https://github.com/elm/error-message-catalog/issues/367)

## Description

**Quick Summary:** Miss-formatting of an infix subtraction can lead to an interesting phenomena, where the first operand is interpreted as a function and the second as an argument, leading to the compiler saying that a number doesn't take that many arguments. Doing the same with + works fine though.
My assumption is that - is treated as unary operator, something that the + operator apparently doesn't support.


## SSCCE

```elm
module Main exposing (..)

import Browser
import Html exposing (Html, div, text)

-- MAIN
main =
  Browser.sandbox { init = init, update = update, view = view }

-- UPDATE
update : () -> Model -> Model
update _ model =
  model

-- MODEL
type alias Model = ()

init : Model
init = ()

-- VIEW
view : Model -> Html ()
view model =
    div [] [text (String.fromInt(1 -1))]
-- Example without whitespaces
--    div [] [text (String.fromInt(1-1))]
--    div [] [text (String.fromInt(1 - 1))]
--    div [] [text (String.fromInt(1 +1))]
-- Example illustrating the interpretation of the compiler (at least for me)
--    div [] [text (String.fromInt(1 -1 * 2))]
```

- **Elm:** Playground on https://elm-lang.org/try as of 26/5/2024
- **Browser:** Mozilla Firefox for Fedora 123.0 (64)
- **Operating System:** Fedora 39

## Additional Details

Compiler output:
```
TOO MANY ARGS
Jump to problem
This value is not a function, but it was given 1 argument.

24|     div [] [text (String.fromInt(1 -1))]

                                     ^
Are there any missing commas? Or missing parentheses?
```
