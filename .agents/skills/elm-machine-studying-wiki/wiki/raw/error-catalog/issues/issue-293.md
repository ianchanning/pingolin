---
issue_number: 293
title: "\"This argument is a record of type\" with two identical types"
state: CLOSED
author: "gilesbowkett"
created_at: "2019-05-05T18:18:00Z"
url: "https://github.com/elm/error-message-catalog/issues/293"
labels: ['types']
---

# Issue #293: "This argument is a record of type" with two identical types

**State:** `CLOSED` | **Author:** @gilesbowkett | **Source:** [https://github.com/elm/error-message-catalog/issues/293](https://github.com/elm/error-message-catalog/issues/293)

## Description

Hi — I'm getting an error message where Elm tells me I gave it X when it was expecting Y.

Problem is, X and Y are identical.

```
The 1st argument to `element` is not what I expect:

51|   Browser.element
52|>    {
53|>      init = always init,
54|>      view = view,
55|>      update = update,
56|>      subscriptions = subscriptions
57|>    }

This argument is a record of type:

    { init : flags -> ( Model, Cmd Message )
    , subscriptions : Model -> Sub Message
    , update : Message -> Model -> ( Model, Cmd Message )
    , view : Model -> Html Message
    }

But `element` needs the 1st argument to be:

    { init : flags -> ( Model, Cmd Message )
    , subscriptions : Model -> Sub Message
    , update : Message -> Model -> ( Model, Cmd Message )
    , view : Model -> Html Message
    }
```

It is actually super easy to fix the problem, but the fix has no very obvious connection to the error message, at least not for me (did a bunch of work with Elm in 2016, have only played with it here and there since).

Here's the program which triggered the error for me:

```elm
module Main exposing (..)

import Browser
import Html exposing (Html, text)

-- MODEL

type alias TermFrequency =
  {
    term : String,
    freq : Int
  }

type alias Model =
  {
  }

-- INIT

init : (List TermFrequency) -> (Model, Cmd Message)
init termFrequencies =
  (Model, Cmd.none)

-- VIEW

view : Model -> Html Message
view model =
     text "Hello Elm!"

-- MESSAGE

type Message
  = None

-- UPDATE

update : Message -> Model -> (Model, Cmd Message)
update message model =
  (model, Cmd.none)

-- SUBSCRIPTIONS

subscriptions : Model -> Sub Message
subscriptions model =
  Sub.none

-- MAIN

main : Program (List TermFrequency) Model Message
main =
  Browser.element
    {
      init = always init,
      view = view,
      update = update,
      subscriptions = subscriptions
    }
```

Changing `init = always init` to `init = init` gets rid of the error.

Thanks!
