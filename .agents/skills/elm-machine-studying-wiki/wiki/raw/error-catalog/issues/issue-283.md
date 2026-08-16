---
issue_number: 283
title: "Hint for `Did you forget to wrap [] around?` is a bit confusing."
state: CLOSED
author: "ChristophP"
created_at: "2018-07-01T07:27:45Z"
url: "https://github.com/elm/error-message-catalog/issues/283"
labels: ['types']
---

# Issue #283: Hint for `Did you forget to wrap [] around?` is a bit confusing.

**State:** `CLOSED` | **Author:** @ChristophP | **Source:** [https://github.com/elm/error-message-catalog/issues/283](https://github.com/elm/error-message-catalog/issues/283)

## Description

When trying to initiate a `Browser.application` with incorrect arguments, it shows a hint that says: `Did you forget to wrap [] around it?`. In the SSCCE the view should have a  `{ ...,  body: List (Html msg)}` instead of `{ ..., body: Html msg}`. Also the definitions for `UrlRequest` and `urlChange` are wrong.  Probably the compiler is trying to say that a list should be used. But the hint is a bit a confusing because many things are wrong here and it just says wrap a `[]` around it without saying around what.
SSCCE:
```elm
module Main exposing (..)

import Browser
import Html exposing (..)
import Tuple exposing (pair)
import Url


main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        , onUrlRequest = LinkClicked
        , onUrlChange = UrlChange
        }


type alias Model = {}

init env flags key = pair {} Cmd.none

view model =
    { title = "My app"
    , body = Html.h2 [] [ text "Elm 19" ]
    }

type Msg = LinkClicked Url.Url | UrlChange

update msg model = pair model Cmd.none
```
Produces this Error Msg
```elm
The 1st argument to `application` is not what I expect:

10|     Browser.application
11|>        { init = init
12|>        , view = view
13|>        , update = update
14|>        , subscriptions = \_ -> Sub.none
15|>        , onUrlRequest = LinkClicked
16|>        , onUrlChange = UrlChange
17|>        }

This argument is a record of type:

    { init : flags -> Url.Url -> Browser.Navigation.Key -> ( {}, Cmd msg1 )
    , onUrlChange : Msg
    , onUrlRequest : Url.Url -> Msg
    , subscriptions : {} -> Sub msg1
    , update : msg1 -> {} -> ( {}, Cmd msg1 )
    , view : {} -> { body : Html msg, title : String }
    }

But `application` needs the 1st argument to be:

    { init : flags -> Url.Url -> Browser.Navigation.Key -> ( {}, Cmd msg1 )
    , onUrlChange : Url.Url -> msg1
    , onUrlRequest : Browser.UrlRequest -> msg1
    , subscriptions : {} -> Sub msg1
    , update : msg1 -> {} -> ( {}, Cmd msg1 )
    , view : {} -> Browser.Document msg1
    }

Hint: Did you forget to add [] around it?
```
