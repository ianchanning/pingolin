---
issue_number: 217
title: "SYNTAX PROBLEM  \"I ran into something unexpected when parsing your code!\"    an expression     whitespace"
state: CLOSED
author: "zzz6519003"
created_at: "2017-05-10T15:22:54Z"
url: "https://github.com/elm/error-message-catalog/issues/217"
labels: []
---

# Issue #217: SYNTAX PROBLEM  "I ran into something unexpected when parsing your code!"    an expression     whitespace

**State:** `CLOSED` | **Author:** @zzz6519003 | **Source:** [https://github.com/elm/error-message-catalog/issues/217](https://github.com/elm/error-message-catalog/issues/217)

## Description

Here is my code
```elm
import Graphics.Element exposing(..)
import Graphics.Collage exposing(..)
import Color exposing(..)
import Signal
import Text exposing(asText)
import Time exposing(every, second)
import Mouse
import Window

main = 
  Signal.map3 show Window.dimensions Mouse.isDown Mouse.position

up   = filled red (circle 24)
down = filled red (circle 44)

drawCircle : Int -> Int -> Bool -> Int -> Int -> Form
drawCircle w h d x y = 
  case d of 
    True  -> down
              |> moveX (normalizeX x w)
              |> moveY (normalizeY y h)
    False -> up
              |> moveX (normalizeX x w)
              |> moveY (normalizeY y h)

normalizeX : Int -> Int -> Float
normalizeX x w = 
  (minmax x w) - toFloat w / 2

normalizeY : Int -> Int -> Float
normalizeY y h = 
  0 - ((minmax y h) - toFloat h / 2)

minmax : Int -> Int -> Float
minmax a d = 
  if | a < 44 -> 44.0
     | a > d-44  -> toFloat (d - 44) 
     | otherwise -> toFloat a 

show : (Int,Int) -> Bool -> (Int,Int) -> Element
show (w,h) d (x,y) = collage w h 
                [ drawCircle w h d x y ]


```

Here is the error message:

```
I ran into something unexpected when parsing your code!

36|   if | a < 44 -> 44.0
I am looking for one of the following things:

    an expression
    whitespace


```


what should I do? :beer:
