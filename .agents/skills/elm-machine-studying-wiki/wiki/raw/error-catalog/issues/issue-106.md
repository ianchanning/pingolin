---
issue_number: 106
title: "Naming error didn't suggest missing dot between module name and function"
state: OPEN
author: "note89"
created_at: "2016-04-01T09:26:48Z"
url: "https://github.com/elm/error-message-catalog/issues/106"
labels: ['naming']
---

# Issue #106: Naming error didn't suggest missing dot between module name and function

**State:** `OPEN` | **Author:** @note89 | **Source:** [https://github.com/elm/error-message-catalog/issues/106](https://github.com/elm/error-message-catalog/issues/106)

## Description

```
module Main (..) where

import Html exposing (Html)
import Mouse


view : Int -> Html
view count =
  Html.text (toString count)

countSignal : Signal Int
countSignal =
  Signalmap (always 1) Mouse.clicks

main : Signal.Signal Html
main =
  Signal.map view countSignal
```

gives error 

```
Detected errors in 1 module.
-- NAMING ERROR ------------------------------------------------------- Main.elm

Cannot find variable `Signalmap`

13│   Signalmap (always 1) Mouse.clicks
      ^^^^^^^^^
```

Which is a pretty good error but would be cool if it also said. 
`did you mean Signal.map ?`

