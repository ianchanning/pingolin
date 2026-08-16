---
issue_number: 135
title: "Uses wrong `toString`"
state: CLOSED
author: "app/"
created_at: "2016-06-30T14:14:59Z"
url: "https://github.com/elm/error-message-catalog/issues/135"
labels: []
---

# Issue #135: Uses wrong `toString`

**State:** `CLOSED` | **Author:** @app/ | **Source:** [https://github.com/elm/error-message-catalog/issues/135](https://github.com/elm/error-message-catalog/issues/135)

## Description

I'm using [elm-integer](http://package.elm-lang.org/packages/javcasas/elm-integer/2.0.2). In my code, `toString integer` does `Basics.toString integer` rather than `Data.Integer.toString integer` (which is what I want), even though `integer` is a `Data.Integer`. Normally you get the error about "more than one possible `toString`, which one do you want?" but I guess because `Basics.toString` takes any type, it just uses that. Suggest uses function closest to its type.

