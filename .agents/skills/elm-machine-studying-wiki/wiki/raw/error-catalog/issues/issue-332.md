---
issue_number: 332
title: "Difficulty understanding Type Mismatch error for beginner"
state: OPEN
author: "francois"
created_at: "2020-04-05T16:51:50Z"
url: "https://github.com/elm/error-message-catalog/issues/332"
labels: []
---

# Issue #332: Difficulty understanding Type Mismatch error for beginner

**State:** `OPEN` | **Author:** @francois | **Source:** [https://github.com/elm/error-message-catalog/issues/332](https://github.com/elm/error-message-catalog/issues/332)

## Description

Over on [Beginner thought process on type mismatch error](https://discourse.elm-lang.org/t/beginner-thought-process-on-type-mismatch-error/5415), I described how I had difficulty understanding a Type Mismatch error:

```
-- TYPE MISMATCH ------------ /Users/francois/Projects/elm/scoutges/src/Main.elm

Something is off with the body of the `searchView` definition:

111|>    row []
112|>        [ search []
113|>            { text = queryString model
114|>            , placeholder = Just (placeholder [] (text "Type your query..."))
115|>            , label = labelHidden "Search"
116|>            , onChange = \q -> SearchFor q
117|>            }
118|>        ]

This `row` call produces:

    Element Msg

But the type annotation on `searchView` says it should be:

    Element msg
```

[lydell](https://discourse.elm-lang.org/u/lydell) explained the message thusly:

> In the type annotation, you’ve said that this function can produce any type of message.
>
> But in the function body, I see that this function only ever will produce messages of a type called Msg!
>
> This means either:
>
> *    That you have a misleading type annotation. It says any message, but only produces Msg messages. If so, change the type annotation to Msg instead of msg!
> *    That you’ve accidentally used a specific message in this function, but you intended it to be generic. If so, replace SearchFor with something of a generic type!

The self-contained example is:

```elm
import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput)



-- MAIN


main =
    Browser.sandbox { init = init, update = update, view = view }



-- MODEL


type alias Model =
    { name : String
    }


init : Model
init =
    Model ""



-- UPDATE


type Msg
    = Name String


update : Msg -> Model -> Model
update msg model =
    case msg of
        Name name ->
            { model | name = name }



-- VIEW

-- ****************
-- Change msg to Msg and the compilation error goes away
-- ****************
view : Model -> Html msg
view model =
    div []
        [ viewInput "text" "Name" model.name Name
        ]


viewInput : String -> String -> String -> (String -> msg) -> Html msg
viewInput t p v toMsg =
    input [ type_ t, placeholder p, value v, onInput toMsg ] []
```
