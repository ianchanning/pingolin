---
issue_number: 291
title: "Confusing error message when constructing a line-charts axis"
state: OPEN
author: "dbrgn"
created_at: "2019-03-19T20:16:25Z"
url: "https://github.com/elm/error-message-catalog/issues/291"
labels: ['types']
---

# Issue #291: Confusing error message when constructing a line-charts axis

**State:** `OPEN` | **Author:** @dbrgn | **Source:** [https://github.com/elm/error-message-catalog/issues/291](https://github.com/elm/error-message-catalog/issues/291)

## Description

(Sorry if the terminology is sometimes a bit off, I'm still quite new to Elm.)

With the line-charts library and this module:

```elm
module Testcase exposing (makeAxis)

import LineChart.Axis as Axis
import LineChart.Axis.Line as AxisLine
import LineChart.Axis.Range as Range
import LineChart.Axis.Ticks as Ticks
import LineChart.Axis.Title as Title
import Time


type alias Measurement =
    { id : Int
    , sensorId : Maybe Int
    , temperature : Float
    , createdAt : Time.Posix
    }


makeAxis : Axis.Config Measurement msg
makeAxis =
    Axis.custom
        { title = Title.default ""
        , variable = Just << Time.posixToMillis << .createdAt
        , pixels = 500
        , range = Range.padded 20 20
        , axisLine = AxisLine.none
        , ticks = Ticks.time Time.utc 10
        }
```

...I get this error message:

![img](https://tmp.dbrgn.ch/screenshots/screenshot-20190319210824-qt_o141e.png)

It took me quite long to find out that the problem was that `Time.posixToMillis` returns an integer while the value should be a float. Changing the line to `variable = Just << toFloat << Time.posixToMillis << .createdAt` helped.

Issues:

- The `Title.config msg` value belonging to the `title` field in the record is yellow. Why? It doesn't seem to have anything to do with the problem.
- The `variable` value returns a `Maybe Int`. That's indicated in the error message. But it doesn't show that the expected value would be `Maybe Float`. Instead it shows some strange message related to `Time.Posix` and the `createdAt` field.

And not related to the error message:

- [These](https://package.elm-lang.org/packages/terezka/line-charts/latest/LineChart-Axis#custom) are the docs for `Axis.custom`. Is there a way for me to find out what type the `variable` field should have? Maybe the source definition could be linked to from the docs? In this case the declaration of the [`Properties`](https://github.com/terezka/line-charts/blob/1b69e1beaff880b0b1e347cfb798efff0dc58b81/src/LineChart/Axis.elm#L164-L177) type alias would have helped.
