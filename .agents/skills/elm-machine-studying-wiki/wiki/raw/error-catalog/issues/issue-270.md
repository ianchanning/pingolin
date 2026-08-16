---
issue_number: 270
title: "Confusing hint when record field type is a list"
state: CLOSED
author: "sentience"
created_at: "2018-09-08T04:29:17Z"
url: "https://github.com/elm/error-message-catalog/issues/270"
labels: ['types']
---

# Issue #270: Confusing hint when record field type is a list

**State:** `CLOSED` | **Author:** @sentience | **Source:** [https://github.com/elm/error-message-catalog/issues/270](https://github.com/elm/error-message-catalog/issues/270)

## Description

**SSCCE:** https://ellie-app.com/3gZsGj7pdnLa1

```elm
module Main exposing (main)

import Browser
import Html exposing (Html, button, div, text)


view : () -> Browser.Document ()
view model =
    { title = "Hello"
    , body = text "hello" }


main : Program () () ()
main =
    Browser.document
        { init = \_ -> ((), Cmd.none)
        , view = view
        , update = \_ _ -> ((), Cmd.none)
        , subscriptions = \_ -> Sub.none
        }
```

When the compiler expects a record with a field of type `List a`, but it gets a record with a field of type `a`, it displays the following hint:

```
Hint: Did you forget to add [] around it?
```

This is confusing, because it is unclear what “it” refers to. Something like this might be better:

```
Hint: Did you forget to add [] around the value of the the `body` field?
```
