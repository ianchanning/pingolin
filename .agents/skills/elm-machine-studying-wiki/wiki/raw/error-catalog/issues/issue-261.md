---
issue_number: 261
title: "Forgot list brackets"
state: CLOSED
author: "bdukes"
created_at: "2018-07-26T15:09:37Z"
url: "https://github.com/elm/error-message-catalog/issues/261"
labels: ['parser']
---

# Issue #261: Forgot list brackets

**State:** `CLOSED` | **Author:** @bdukes | **Source:** [https://github.com/elm/error-message-catalog/issues/261](https://github.com/elm/error-message-catalog/issues/261)

## Description

This is from [an issue on Stackoverflow](https://stackoverflow.com/q/51540838/2688), which ended with the OP commenting "Elm errors are confusing", so I thought I'd check if the situation is improved with the parser changes in 0.19, and it seemed to be quite a bit worse (especially if I imagine a beginner's perspective).

## The Program
```
import Html exposing (..)
import Html.Attributes exposing (..)

main : Html a
main =
    span [ class "welcome-message" ] [ text "Hello, World!" ]
    , h1 [ class "headline" ] [ text "Hello" ]
```

## The 0.18 output
```
-- SYNTAX PROBLEM ------------------------------------------------ .\example.elm

I ran into something unexpected when parsing your code!

7|     , h1 [ class "headline" ] [ text "Hello" ]
       ^
I am looking for one of the following things:

    end of input
    whitespace

Detected errors in 1 module.
```

## The 0.19 output
```
Detected errors in 1 module.
-- PARSE ERROR --------------------------------------------------- .\example.elm

Something went wrong while parsing main's definition.

5| main =
6|     span [ class "welcome-message" ] [ text "Hellow, World!" ]
7|     , h1 [ class "headline" ] [ text "Hello" ]
       ^
I was expecting:

  - an argument, like `name` or `total`
  - an infix operator, like (+) or (==)
  - the rest of main's definition. Maybe you forgot some code? Or maybe the body
    of `main` needs to be indented?
```
