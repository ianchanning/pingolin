---
issue_number: 98
title: "capitalisation typo"
state: CLOSED
author: "stiller"
created_at: "2016-03-16T09:20:20Z"
url: "https://github.com/elm/error-message-catalog/issues/98"
labels: ['parser']
---

# Issue #98: capitalisation typo

**State:** `CLOSED` | **Author:** @stiller | **Source:** [https://github.com/elm/error-message-catalog/issues/98](https://github.com/elm/error-message-catalog/issues/98)

## Description

In https://github.com/evancz/elm-architecture-tutorial/blob/master/examples/3/CounterList.elm#L39
I had accidentally typed `model.Counters` instead of `model.counters`, which resulted in this error:

```
The argument to function `start` is causing a mismatch.

5│   start
6│>    { model = init
7│>    , update = update
8│>    , view = view
9│>    }

Function `start` is expecting the argument to be:

    { ..., update : CounterList.Action -> { ... } -> { ... } }

But it is:

    { ...
    , update :
          CounterList.Action
          -> { a | ..., Counters : ... }
          -> { a | ..., Counters : ... }
    }
```

Which does hint that the error lies in the second field of the record, but perhaps it could be a bit more focussed. I wonder if `model.Counters ++ [ newCounter ]` is even valid syntax.

