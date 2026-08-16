---
issue_number: 190
title: "Compiler doesn't catch partially redundant case..of branch"
state: OPEN
author: "ckoster22"
created_at: "2016-12-10T16:19:52Z"
url: "https://github.com/elm/error-message-catalog/issues/190"
labels: []
---

# Issue #190: Compiler doesn't catch partially redundant case..of branch

**State:** `OPEN` | **Author:** @ckoster22 | **Source:** [https://github.com/elm/error-message-catalog/issues/190](https://github.com/elm/error-message-catalog/issues/190)

## Description

I noticed this when pattern matching with Maybes. Here's a SSCCE.

```
import Html exposing (beginnerProgram, div, button, text)
import Html.Events exposing (onClick)


main =
  beginnerProgram { model = 0, view = view, update = update }


view model =
  div []
    [ button [ onClick Decrement ] [ text "-" ]
    , div [] [ text (toString model) ]
    , button [ onClick (Increment Nothing) ] [ text "+" ]
    , button [ onClick (Increment (Just 3)) ] [ text "Add 3" ]
    ]


type Msg = Increment (Maybe Int) | Decrement


update msg model =
  case msg of
    Increment (Just num) ->
      model + num
      
    Increment maybeNum ->
      handleModelUpdateWithMaybe model maybeNum

    Decrement ->
      model - 1


handleModelUpdateWithMaybe : Int -> Maybe Int -> Int
handleModelUpdateWithMaybe model maybeNum =
  model + (Maybe.withDefault 1 maybeNum)
```

The second branch could only match on `Increment Nothing` since the first `Increment (Just num)` branch takes care of the Just case.

I'd expect an error from the compiler, such as:

```
-- REDUNDANT PATTERN -----------------------------------------------------------

The following pattern is redundant.

28|     Increment maybeNum ->
        ^^^^^^^^^^^^^^^^^^

This branch could only match on

    Increment Nothing

But you're saying it could match on

    Increment (Maybe Int)

Other branches were found that make the above branch redundant.

25|    Increment (Just num) ->
                 ^^^^^^^^^^
```
