---
issue_number: 148
title: "Confusing message when trying to access a field that does not exist in model"
state: CLOSED
author: "gabriela-sartori"
created_at: "2016-08-01T20:19:38Z"
url: "https://github.com/elm/error-message-catalog/issues/148"
labels: []
---

# Issue #148: Confusing message when trying to access a field that does not exist in model

**State:** `CLOSED` | **Author:** @gabriela-sartori | **Source:** [https://github.com/elm/error-message-catalog/issues/148](https://github.com/elm/error-message-catalog/issues/148)

## Description

When I was teaching Elm to a friend, he accidentally tried to access a field "countt" that don't exist.
But he was not able to understand the error message!
Something like "Field `countt` seems to not exist in model" would be better!

```
import Html            exposing (..)
import Html.Attributes exposing (..)
import Html.Events     exposing (onClick)
import Html.App        exposing (beginnerProgram)

type Msg = Inc | Dec
type alias Model = { count : Int }

view : Model -> Html Msg
view model =
    div [] [ button [ onClick Inc ] [ text "+" ]
           , br [] []
           , text <| toString model.count
           , br [] []
           , button [ onClick Dec ] [ text "-" ]
           ]

update : Msg -> Model -> Model
update msg model =
    case msg of
        Inc ->
            { model | count = model.count + 1 }
        Dec ->
            { model | count = model.countt - 1 }

main : Program Never
main =
    beginnerProgram { model = Model 0, view = view, update = update }
```

![image](https://cloud.githubusercontent.com/assets/6143964/17307469/b5baca56-580b-11e6-977c-50462d40d7ba.png)

