---
issue_number: 125
title: "misleading type annotation error message"
state: CLOSED
author: "arnehormann"
created_at: "2016-06-09T10:23:34Z"
url: "https://github.com/elm/error-message-catalog/issues/125"
labels: ['types']
---

# Issue #125: misleading type annotation error message

**State:** `CLOSED` | **Author:** @arnehormann | **Source:** [https://github.com/elm/error-message-catalog/issues/125](https://github.com/elm/error-message-catalog/issues/125)

## Description

Copied and shortened from https://github.com/elm-lang/elm-compiler/issues/1410:

Taking `Bug.elm` with Elm 0.17

``` elm
import Html exposing (..)
import Html.App exposing (beginnerProgram)

main =
  beginnerProgram
    { model = {key = "", value = ""}
    , view = view
    , update = (\_ u -> u)
    }

type alias Model =
  { key: String
  , value: String
  }

view : Model -> Html msg
view m =
  div
    []
    [ strong [] [m.key]
    , text (": " ++ m.value)
    ]
```

I get this error on `elm-make Bug.elm --output=bug.html`:

```
-- TYPE MISMATCH ------------------------------------------------------- Bug.elm

The type annotation for `view` does not match its definition.

16| view : Model -> Html msg
           ^^^^^^^^^^^^^^^^^
The type annotation is saying:

    { ..., key : String } -> Html a

But I am inferring that the definition has this type:

    { ..., key : VirtualDom.Node a } -> Html a

Detected errors in 1 module.
```

The cause is `strong [] [m.key]`, it should be `strong [] [text [m.key]]`.

Though the compiler knows all intended types, it says the annotation in `view` is wrong and does not point to the wrong argument for `strong`.

