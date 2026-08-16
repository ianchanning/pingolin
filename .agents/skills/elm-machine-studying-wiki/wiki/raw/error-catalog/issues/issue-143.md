---
issue_number: 143
title: "Use `as` name rather than module name in NAMING ERROR message"
state: CLOSED
author: "app/"
created_at: "2016-07-24T19:43:33Z"
url: "https://github.com/elm/error-message-catalog/issues/143"
labels: ['no sscce', 'naming']
---

# Issue #143: Use `as` name rather than module name in NAMING ERROR message

**State:** `CLOSED` | **Author:** @app/ | **Source:** [https://github.com/elm/error-message-catalog/issues/143](https://github.com/elm/error-message-catalog/issues/143)

## Description

```
This usage of variable `toString` is ambiguous.

316|                 g (v `mul` (fromInt 10)) (denominator x) n (toString u ++ ".")
                                                                 ^^^^^^^^
Maybe you want one of the following?

    Basics.toString
    Data.Integer.toString

```

I've imported Data.Integer as `I` in this file so I would like it to say `I.toString` so I just write that in, otherwise I see this message and go off to write `Data.Integer.toString` and that's wrong

