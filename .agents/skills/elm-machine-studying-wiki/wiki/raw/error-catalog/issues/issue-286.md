---
issue_number: 286
title: "Port in file without module header"
state: CLOSED
author: "01mf02"
created_at: "2018-12-11T10:19:07Z"
url: "https://github.com/elm/error-message-catalog/issues/286"
labels: ['parser']
---

# Issue #286: Port in file without module header

**State:** `CLOSED` | **Author:** @01mf02 | **Source:** [https://github.com/elm/error-message-catalog/issues/286](https://github.com/elm/error-message-catalog/issues/286)

## Description

When a port is defined and used in an Elm file without a module header, the Elm compiler says no variable with the name of the port can be found. I would have expected the compiler to point out that a header line `port module ...` has to be added in order to use ports in the file.

~~~ elm
import Browser
import Html exposing (Html, div)



-- MAIN

main =
  Browser.element
    { init = init
    , update = update
    , view = view
    , subscriptions = subscriptions
    }



-- PORTS


port myPort : Cmd msg


-- MODEL

type alias Model = ()

init : () -> (Model, Cmd Msg)
init _ =
  ( ()
  , myPort
  )



-- UPDATE

type alias Msg = ()

update : Msg -> Model -> (Model, Cmd Msg)
update msg model = (model, Cmd.none)

-- VIEW

view : Model -> Html Msg
view model =
  div [] [ ]

subscriptions model =
  Sub.none
~~~

The error message:

~~~
Detected errors in 1 module.                                         
-- NAMING ERROR --------------------------------------------------- src/test.elm

I cannot find a `myPort` variable:

31|   , myPort
        ^^^^^^
These names seem close though:

    floor
    not
    sqrt
    xor

Hint: Read <https://elm-lang.org/0.19.0/imports> to see how `import`
declarations work in Elm.
~~~

P.S.: Thanks for the otherwise awesome error messages in Elm! :)
