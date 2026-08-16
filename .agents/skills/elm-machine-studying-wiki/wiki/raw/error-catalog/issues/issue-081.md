---
issue_number: 81
title: "\"inferring a weird self-referential type when\" missing whitespace"
state: OPEN
author: "note89"
created_at: "2016-01-29T19:26:10Z"
url: "https://github.com/elm/error-message-catalog/issues/81"
labels: ['types']
---

# Issue #81: "inferring a weird self-referential type when" missing whitespace

**State:** `OPEN` | **Author:** @note89 | **Source:** [https://github.com/elm/error-message-catalog/issues/81](https://github.com/elm/error-message-catalog/issues/81)

## Description

```
module Spaceship where

import Graphics.Element exposing (..)
import Graphics.Collage exposing (..)
import Color exposing (..)

import Keyboard
import Window
import Time


-- MODEL

type alias Model =
  { position: Int,
    powerLevel: Int,
    isFiring: Bool
  }


initialShip : Model
initialShip =
  { position = 0,
    powerLevel = 10,
    isFiring = False
  }


-- UPDATE

type Action = NoOp | Left | Right | Fire Bool

update : Action -> Model -> Model
update action ship =
  case action of
    NoOp ->
      ship
    Left ->
      { ship | position = ship.position - 1 }
    Right ->
      { ship | position = ship.position + 1 }
    Fire fireing ->
      let
        newPowerLevel=
          -- HERE IS THE ERROR, missing whitespace
          if fireing then ship.powerLevel -1 else ship.powerLevel
      in
        { ship |
            isFiring = fireing,
            powerLevel = newPowerLevel
      }



-- VIEW

drawGame : Float -> Float -> Form
drawGame w h =
  rect w h
    |> filled gray


drawShip : Float -> Model -> Form
drawShip gameHeight ship =
  let
    shipColor =
      if ship.isFiring then red else blue
  in
    ngon 3 30
      |> filled shipColor
      |> rotate (degrees 90)
      |> move ((toFloat ship.position), (50 - gameHeight / 2))
      |> alpha ((toFloat ship.powerLevel) / 10)


view : (Int, Int) -> Model -> Element
view (w, h) ship =
  let
    (w', h') = (toFloat w, toFloat h)
  in
    collage w h
      [ drawGame w' h',
        drawShip h' ship,
        toForm (show ship)
      ]


-- SIGNALS

direction : Signal Action
direction =
  let
    x = Signal.map .x Keyboard.arrows
    delta = Time.fps 30

    toAction n =
      case n of
        -1 -> Left
        0  -> NoOp
        1  -> Right
        _  -> NoOp

    actions = Signal.map toAction x
  in
    Signal.sampleOn delta actions


model : Signal Model
model =
  Signal.foldp update initialShip direction


main : Signal Element
main =
  Signal.map2 view Window.dimensions model

```

Gives the following error 

```
Detected errors in 1 module.
-- INFINITE TYPE ------------------------------------------- SingnalExamples.elm

I am inferring a weird self-referential type for `newPowerLevel`

44│         newPowerLevel=
            ^^^^^^^^^^^^^
Here is my best effort at writing down the type. You will see ? and ∞ for parts
of the type that repeat something already printed out infinitely.

    ?

Usually staring at the type is not so helpful in these cases, so definitely read
the debugging hints for ideas on how to figure this out:
<https://github.com/elm-lang/elm-compiler/blob/0.16.0/hints/infinite-type.md>
```

the same error occurs if instead of `-1` we type `42` `"foo"` `True` 
It would be very useful to get some type error instead. 

