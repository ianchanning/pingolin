---
issue_number: 363
title: "Bad function signature leads to 'EXPECTING DEFINITION'"
state: OPEN
author: "Golden-Phy"
created_at: "2024-05-26T11:53:16Z"
url: "https://github.com/elm/error-message-catalog/issues/363"
labels: []
---

# Issue #363: Bad function signature leads to 'EXPECTING DEFINITION'

**State:** `OPEN` | **Author:** @Golden-Phy | **Source:** [https://github.com/elm/error-message-catalog/issues/363](https://github.com/elm/error-message-catalog/issues/363)

## Description

**Quick Summary:** Missing parenthesis of tuples in the type signature of a function,  seemingly lead the parser to assume that something is between the signature and definition, instead of raising a syntax error or type mismatch.

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
    div [] [text (Tuple.first (factorial model))]
    
factorial : Int -> String, Int
factorial i=
  if i <= 1 then ("1", 1) else 
    let 
      val = i * (Tuple.second (factorial (i - 1)))
    in
      (String.fromInt val, val)
```

- **Elm:** Playground on https://elm-lang.org/try as of 26/5/2024
- **Browser:** Mozilla Firefox for Fedora 123.0 (64)
- **Operating System:** Fedora 39


## Additional Details

Compiler output:
```
EXPECTING DEFINITION
Jump to problem
I just saw the type annotation for `factorial` so I was expecting to see its
definition here:

26| factorial : Int -> String, Int

                             ^
Type annotations always appear directly above the relevant definition, without
anything else in between. (Not even doc comments!)

Here is a valid definition (with a type annotation) for reference:

    greet : String -> String
    greet name =
      "Hello " ++ name ++ "!"

The top line (called a "type annotation") is optional. You can leave it off if
you want. As you get more comfortable with Elm and as your project grows, it
becomes more and more valuable to add them though! They work great as
compiler-verified documentation, and they often improve error messages!
```
