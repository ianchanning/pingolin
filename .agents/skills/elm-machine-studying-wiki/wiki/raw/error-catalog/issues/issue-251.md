---
issue_number: 251
title: "Missing else conditional gives whitespace error"
state: CLOSED
author: "stevensonmt"
created_at: "2018-01-18T20:15:19Z"
url: "https://github.com/elm/error-message-catalog/issues/251"
labels: ['parser']
---

# Issue #251: Missing else conditional gives whitespace error

**State:** `CLOSED` | **Author:** @stevensonmt | **Source:** [https://github.com/elm/error-message-catalog/issues/251](https://github.com/elm/error-message-catalog/issues/251)

## Description

```
view : Model -> Html Msg
view model =
  if subToggle then
    let
        angle =
          turns (Time.inMinutes model)

        handX =
          toString (50 + 40 * cos angle)

        handY =
          toString (50 + 40 * sin angle)
    in
       svg [ viewBox "0 0 100 100", width "300px" ]
       [ circle [ cx "50", cy "50", r "45", fill "#0B79CE" ] []
       , line [ x1 "50", y1 "50", x2 handX, y2 handY, stroke "#023963" ] []
       ]
```
This won't compile and complains of:
```
I need whitespace, but got stuck on what looks like a new declaration. You are
either missing some stuff in the declaration above or just need to add some
spaces here:


I am looking for one of the following things:

    whitespace
```
What it really needs is an `else` statement though.
