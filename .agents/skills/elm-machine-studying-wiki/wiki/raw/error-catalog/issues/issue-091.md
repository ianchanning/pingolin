---
issue_number: 91
title: "Report line that is the source of type inference when type mismatch occurs"
state: OPEN
author: "machuga"
created_at: "2016-02-27T02:14:52Z"
url: "https://github.com/elm/error-message-catalog/issues/91"
labels: ['no sscce']
---

# Issue #91: Report line that is the source of type inference when type mismatch occurs

**State:** `OPEN` | **Author:** @machuga | **Source:** [https://github.com/elm/error-message-catalog/issues/91](https://github.com/elm/error-message-catalog/issues/91)

## Description

If someone has a better recommended title for this issue I'd appreciate it!

I recently stumbled across this issue with the following example:

``` elm
import Html exposing (..)
import Html.Events exposing (onClick)
import StartApp.Simple as StartApp

type ConnectionStatus = Connected | Disconnected
type alias Model = { connection : ConnectionStatus }

main = StartApp.start { model = model, view = view, update = update }

model : Model
model = { connection = Disconnected }

view : Signal.Address ConnectionStatus -> Model -> Html.Html
view address model =
  div []
    [ button [ onClick address Connected ] [ text "Connect" ]
    , text model.connection
    ]

update action model =
  case action of
    Connected ->
      { model | connection = Connected }
    Disconnected ->
      { model | connection = Disconnected }
```

The key lines will be the annotation for `view` and the `text` node attempting to use `model.connection` as a string without using `toString`.  With the code in this state, the compiler will report: 

```
Detected errors in 1 module.
-- TYPE MISMATCH ------------------------------------------------------ Main.elm

The type annotation for `view` does not match its definition.

13│ view : Signal.Address ConnectionStatus -> Model -> Html.Html
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
The type annotation is saying:

    Signal.Address ConnectionStatus -> { connection : ConnectionStatus } -> Html

But I am inferring that the definition has this type:

    Signal.Address ConnectionStatus -> { connection : String } -> Html
```

If we remove the view annotation, letting the compiler infer it, we get 

```
Detected errors in 1 module.
-- TYPE MISMATCH ------------------------------------------------------ Main.elm

The argument to function `start` is causing a mismatch.

8│        StartApp.start { model = model, view = view, update = update }
                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Function `start` is expecting the argument to be:

    { ...
    , view :
          Signal.Address ConnectionStatus
          -> { connection : ConnectionStatus }
          -> Html
    }

But it is:

    { ...
    , view : Signal.Address ConnectionStatus -> { connection : String } -> Html
    }
```

The takeaway is that neither version will report that the `text` function is attempting to use an enum value as a string.  I'm not sure if this is a library-level concern, or if the compiler has the ability to detect that the `String` usage is not correct where it is invoked.  Since `Html.text` accepts a string it seemed like the compiler knows this is the one in violation and may be able to report the violating usage.

