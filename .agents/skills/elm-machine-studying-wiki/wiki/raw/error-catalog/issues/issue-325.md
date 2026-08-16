---
issue_number: 325
title: "Unclear message when elements in list produce non-homogeneous Html values"
state: OPEN
author: "ravicious"
created_at: "2019-12-09T18:48:31Z"
url: "https://github.com/elm/error-message-catalog/issues/325"
labels: []
---

# Issue #325: Unclear message when elements in list produce non-homogeneous Html values

**State:** `OPEN` | **Author:** @ravicious | **Source:** [https://github.com/elm/error-message-catalog/issues/325](https://github.com/elm/error-message-catalog/issues/325)

## Description

Today at the workshop at work I was showing Elm to a bunch of new people who were interested in the language. I was showing them how we can create more complex type values, basically changing `type Msg = Increase | Decrease | Reset` to `type Msg = Increase Int | Decrease Int | Reset`.

At that point, they already had a bunch of elements in the list with `onClick Decrease` and other messages.

I usually just tell them "Follow the error message", but this time the compiler gave us this:

```
-- TYPE MISMATCH --------------- /Users/rav/Projects/counter-elm/src/Main.elm


The 6th element of this list does not match all the previous elements:

48|         [ button [ type_ "button", onClick Decrease ] [ text "--" ]
49|         , button [ type_ "button", onClick Decrease ] [ text "-" ]
50|         , text (String.fromInt count)
51|         , button [ type_ "button", onClick Increase ] [ text "+" ]
52|         , button [ type_ "button", onClick Increase ] [ text "++" ]
53|>        , button [ type_ "button", onClick Reset ] [ text "Reset" ]
54|         ]

This `button` call produces:

    Html Msg

But all the previous elements in the list are:

    Html (Int -> Msg)

Hint: Everything in a list must be the same type of value. This way, we never
run into unexpected values partway through a List.map, List.foldl, etc. Read
<https://elm-lang.org/0.19.1/custom-types> to learn how to “mix” types.
```

We managed to fix that, but after they asked what it really means and why the error looks the way it does, I spent the next 30 minutes attempting to explain that. To be honest, I shouldn't have go that far into the details, as fully understanding the error requires deep knowledge of how Elm interfers types, how type variables resolve to concrete types and how the list of attributes interacts with the final value that `button` outputs.

Without my help, I think they'd be stuck at this a bit longer. Maybe if they already encountered an error that's a result of not supplying enough arguments to a function, then this message would be clearer. But I don't think it steers you clearly enough in that direction.

And I know that "fixing" this is hard as theoretically it could be that actually that 6th element is wrong! However, the two main problems with this error that is see are:

1. The error points at the last element as the problematic one, but it's actually the only `button` call that's correct.
2. There's no hint that maybe they forgot to pass more arguments to a function. I vagualy remember Elm showing this in simpler situations with missing arguments, but it's not shown here.

I see that #90 already improved the error message for non-homogenous lists a lot, I hope that we'll be able to improve it even more!

<details>
<summary>Full code that causes the error (Elm 0.19)</summary>

```elm
module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)


type alias Model =
    Int


type Msg
    = Increase Int
    | Decrease Int
    | Reset


main =
    Browser.sandbox
        { init = init
        , view = view
        , update = update
        }


init : Model
init =
    0


update : Msg -> Model -> Model
update msg model =
    case msg of
        Increase n ->
            model + n

        Decrease n ->
            model - n

        Reset ->
            init


view : Model -> Html Msg
view count =
    div []
        [ button [ type_ "button", onClick Decrease ] [ text "--" ]
        , button [ type_ "button", onClick Decrease ] [ text "-" ]
        , text (String.fromInt count)
        , button [ type_ "button", onClick Increase ] [ text "+" ]
        , button [ type_ "button", onClick Increase ] [ text "++" ]
        , button [ type_ "button", onClick Reset ] [ text "Reset" ]
        ]
```

</details>
