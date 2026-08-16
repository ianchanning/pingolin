---
issue_number: 82
title: "Typo between type annotation and definition gives bad message"
state: OPEN
author: "note89"
created_at: "2016-02-06T20:22:52Z"
url: "https://github.com/elm/error-message-catalog/issues/82"
labels: ['naming']
---

# Issue #82: Typo between type annotation and definition gives bad message

**State:** `OPEN` | **Author:** @note89 | **Source:** [https://github.com/elm/error-message-catalog/issues/82](https://github.com/elm/error-message-catalog/issues/82)

## Description

CODE:

```
module Main (..) where

import Html
import Time

clockSignal : Signal Time.Time
clockSingal =                                 /// <---- TYPO
  Time.every Time.second

messageSignal : Signal String
messageSignal =
  Signal.map toString clockSignal

view : String -> Html.Html
view message =
  Html.text message

main : Signal.Signal Html.Html
main =
  Signal.map view messageSignal
```

Error

```
Detected errors in 1 module.
-- MISSING DEFINITION ------------------------------------------------ Hello.elm

There is a type annotation for `clockSignal` but there is no corresponding
definition!

6│ clockSignal : Signal Time.Time
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Directly below the type annotation, put a definition like:

    clockSignal = 42

```

