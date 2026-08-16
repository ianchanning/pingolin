---
issue_number: 365
title: "Suboptimal error for mising function arguments"
state: OPEN
author: "Golden-Phy"
created_at: "2024-05-25T13:56:43Z"
url: "https://github.com/elm/error-message-catalog/issues/365"
labels: []
---

# Issue #365: Suboptimal error for mising function arguments

**State:** `OPEN` | **Author:** @Golden-Phy | **Source:** [https://github.com/elm/error-message-catalog/issues/365](https://github.com/elm/error-message-catalog/issues/365)

## Description

**Quick Summary:** The compiler brings up a type mismatch between _function x -> type_ and _type_ when trying to use the result of a partial function call. It does not give a hint that the user might want to apply the function to _x_ by giving it as a parameter.

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
type alias Model = Chain

type Chain 
  = Empty
  | Node Chain
init : Model
init = Node (Node Empty)

-- VIEW
view : Model -> Html ()
view model =
    div [] (render 
      model 
-- 2.      1
    )
    
    
render : Chain -> Int -> List (Html ())
render chain depth =
  case chain of
    Empty -> []
    Node subChain -> 
      (render 
        subChain 
-- 1.        (depth + 1)
      )
      ++ [div [] [text (String.fromInt depth)]]
```

- **Elm:** Playground on https://elm-lang.org/try as of 5/25/2024
- **Browser:** Mozilla Firefox for Fedora 123.0 (64)
- **Operating System:** Fedora Linux 39


## Additional Details

Compiler output:
```
TYPE MISMATCH
Jump to problem
The (++) operator cannot append this type of value:

38|>      (render 

39|>        subChain 

40| -- 1.        (depth + 1)

41|       )

42|       ++ [div [] [text (String.fromInt depth)]]

This `render` call produces:

    Int -> List (Html ())

But the (++) operator is only for appending List and String values. Maybe put
this value in [] to make it a list?

Hint: I only know how to append strings and lists.
```
