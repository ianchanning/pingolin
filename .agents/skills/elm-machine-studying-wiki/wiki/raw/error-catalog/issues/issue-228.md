---
issue_number: 228
title: "Non-descriptive error when encountering a typeclass mismatch"
state: OPEN
author: "JonathanFraser"
created_at: "2017-07-26T19:37:30Z"
url: "https://github.com/elm/error-message-catalog/issues/228"
labels: ['types']
---

# Issue #228: Non-descriptive error when encountering a typeclass mismatch

**State:** `OPEN` | **Author:** @JonathanFraser | **Source:** [https://github.com/elm/error-message-catalog/issues/228](https://github.com/elm/error-message-catalog/issues/228)

## Description

code: 
```
module Main exposing (..)

import Html exposing (Html, text)
import Json.Decode as Json
import Set exposing (Set)


main : Html a
main =
    text "Hello, World!"


type Selection
    = SelInt Int
    | SelStr String

decodePath : Json.Decoder (List Selection)
decodePath =
    Json.list <|
        Json.oneOf
            [ Json.string |> Json.map SelStr
            , Json.int |> Json.map SelInt
            ]


decodeFlag : Json.Value -> Set (List Selection)
decodeFlag s =
    --the error from this line is nonsensical
    Json.decodeValue (Json.list decodePath |> Json.map Set.fromList) s
        |> Result.withDefault Set.empty

```

The problem here is that the user is trying to define a Set of items which are not comparable. This is of course not allowed. However, the error message given does not provide any indication of that.
```
The right side of (|>) is causing a type mismatch.
(|>) is expecting the right side to be a:

Json.Decoder (List (List Selection)) -> a

But the right side is:

Json.Decoder (List (List Selection)) -> Json.Decoder (Set (List Selection))

Hint: With operators like (|>) I always check the left side first. If it seems
fine, I assume it is correct and check the right side. So the problem may be in
how the left and right arguments interact.
```

According to the error message the code appears to be correct.
