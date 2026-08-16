---
issue_number: 146
title: "Expected and actual types identical"
state: CLOSED
author: "drathier"
created_at: "2016-07-29T21:25:12Z"
url: "https://github.com/elm/error-message-catalog/issues/146"
labels: []
---

# Issue #146: Expected and actual types identical

**State:** `CLOSED` | **Author:** @drathier | **Source:** [https://github.com/elm/error-message-catalog/issues/146](https://github.com/elm/error-message-catalog/issues/146)

## Description

I got this error message just now. Expected and actual types are equal as far as I can tell.

```
-- TYPE MISMATCH ----------------------------------------------------- noter.elm

The argument to function `insert` is causing a mismatch.

51|                                                   insert(model.maxid, newdoc, model.messages)}
                                                            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Function `insert` is expecting the argument to be:

    ( Int, Message, comparable )

But it is:

    ( Int, Message, comparable )

Hint: Only ints, floats, chars, strings, lists, and tuples are comparable.
```

Here's the complete source:

```
import Html exposing (Html, button, div, text, textarea, input, br, ul, li)
import Html.Attributes exposing (type', placeholder, width, height)
import Html.App as Html
import Html.Events exposing (onClick, onInput)
import Dict exposing (Dict, empty, get, insert)
import Maybe exposing (withDefault)
import List exposing (map)

main =
  Html.beginnerProgram
    { model = model
    , view = view
    , update = update
    }

type alias Model =
  { messages : (Dict Int Message)
  , current : Int
  , maxid : Int
  , search: Search
  }

type alias Message =
  { id : Int
  , value : String
  }

type alias Search =
  { results : List (Int, String)
  }

model : Model
model =
  { messages = empty
  , current = 0
  , maxid = 0
  , search = Search []
  }

-- UPDATE
type Msg
  = NewSearch
  | NewNote
  | ShowDocument Int

update : Msg -> Model -> Model
update msg model =
  case msg of
    NewNote ->
      let newdoc = Message model.maxid ""
      in {model|maxid = model.maxid+1, messages = insert(model.maxid newdoc model.messages)}

-- VIEW
view : Model -> Html Msg
view model =
  div []
    [ div [] [ text (toString model) ]
    , button [ onClick NewNote ] [ text "New note" ]
    , input [ type' "text", placeholder "search notes", onInput (\_ -> NewSearch) ] [ ]
    , br [] []
    , div [] [ searchResults model.search ]
    , textarea [] [ text (withDefault (Message -1 "missing") (get model.current model.messages)).value ]
    ]

searchResults search =
  ul [] (map (\(i, l) -> li [ onClick (ShowDocument i) ] [ text l ]) search.results)

```

at these versions:
    elm 0.17.1
    elm-lang/core 4.0.3
    elm-lang/html 1.1.0
    elm-lang/virtual-dom 1.1.0

