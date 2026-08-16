---
issue_number: 364
title: "Pattern parser not hinting at missing comma"
state: OPEN
author: "Golden-Phy"
created_at: "2024-05-26T12:30:22Z"
url: "https://github.com/elm/error-message-catalog/issues/364"
labels: []
---

# Issue #364: Pattern parser not hinting at missing comma

**State:** `OPEN` | **Author:** @Golden-Phy | **Source:** [https://github.com/elm/error-message-catalog/issues/364](https://github.com/elm/error-message-catalog/issues/364)

## Description

**Quick Summary:** When destructuring  a tuple a missing comma will lead the parser to correctly complain at the next token, but the message fails to communicate that a comma (`,`) is also a valid continuation of the pattern. 


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
type alias Model = Int

init : Model
init = 3

-- VIEW
view : Model -> Html ()
view model =
    div [] [text (String.fromInt(factorial (model, 0)))]
    
factorial : (Int, Int) -> Int
factorial (i _) =
  if i <= 1 then 1 else i * (factorial (i - 1 , 1))
```

- **Elm:** Playground on https://elm-lang.org/try as of 26/5/2024
- **Browser:** Mozilla Firefox for Fedora 123.0 (64)
- **Operating System:** Fedora 39


## Additional Details

Compiler output:
```
UNFINISHED PARENTHESES
Jump to problem
I was partway through parsing a pattern, but I got stuck here:

27| factorial (i _) =

                 ^
I was expecting a closing parenthesis next, so try adding a ) to see if that
helps?
```
