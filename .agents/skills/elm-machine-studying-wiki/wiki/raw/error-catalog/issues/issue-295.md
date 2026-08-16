---
issue_number: 295
title: "Bug in compiler message with Url.Parser.Query's"
state: CLOSED
author: "harrysarson"
created_at: "2019-07-01T16:56:59Z"
url: "https://github.com/elm/error-message-catalog/issues/295"
labels: ['types']
---

# Issue #295: Bug in compiler message with Url.Parser.Query's

**State:** `CLOSED` | **Author:** @harrysarson | **Source:** [https://github.com/elm/error-message-catalog/issues/295](https://github.com/elm/error-message-catalog/issues/295)

## Description

Ellie: https://ellie-app.com/5XXvfxwZ2Pya1

```elm
module Main exposing (..)

import Url
import Url.Parser exposing ((<?>))
import Url.Parser.Query

type UrlThings
    = Input String
    | Town String
    | Empty
    

parser : Url.Parser.Parser (Maybe UrlThings -> a) a
parser =
    (Url.Parser.oneOf [ Url.Parser.top, Url.Parser.s "welsh-whacker" ]
        <?> (Url.Parser.Query.string "input" |> Url.Parser.Query.map (Maybe.map Input))
        <?> (Url.Parser.Query.string "town" |> Url.Parser.Query.map (Maybe.map Town))
        )
```

```
Something is off with the body of the `parser` definition:

15|>    (Url.Parser.oneOf [ Url.Parser.top, Url.Parser.s "welsh-whacker" ]
16|>        <?> (Url.Parser.Query.string "input" |> Url.Parser.Query.map (Maybe.map Input))
17|>        <?> (Url.Parser.Query.string "town" |> Url.Parser.Query.map (Maybe.map Town))

The body is:

    Url.Parser.Parser (Maybe UrlThings -> a) a

But the type annotation on `parser` says it should be:

    Url.Parser.Parser (Maybe UrlThings -> a) a
```
