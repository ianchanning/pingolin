---
issue_number: 90
title: "Confusing messages for non-homogenous lists"
state: CLOSED
author: "evancz"
created_at: "2016-02-23T23:08:20Z"
url: "https://github.com/elm/error-message-catalog/issues/90"
labels: ['types']
---

# Issue #90: Confusing messages for non-homogenous lists

**State:** `CLOSED` | **Author:** @evancz | **Source:** [https://github.com/elm/error-message-catalog/issues/90](https://github.com/elm/error-message-catalog/issues/90)

## Description

I watched @christinecha get started with Elm, and she ran into a pretty confusing type error message. It's also one that beginners probably run into with a reasonably high probability.

**Program**

``` elm
import Html exposing (text, div, input)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput)

view string =
  div []
    [ input [ value string, onInput identity ]
    , div [] [ text string ]
    ]
```

**Result**

```
-- TYPE MISMATCH ------------------------------------------------------- tmp.elm

The 1st and 2nd elements are different types of values.

7|     [ input [ value string, onInput identity ]
8|>    , div [] [ text string ]
9|     ]

The 1st element has this type:

    List (Html.Html String) -> VirtualDom.Node String

But the 2nd is:

    VirtualDom.Node a

Hint: All elements should be the same type of value so that we can iterate
through the list without running into unexpected values.
```

The problems include:
- The error never says the word **list**. Crazy!
- It's weird that the 2nd element is emphasized with the `>` but then you see info about "the 1st element". May be better to say "The Nth element has type X, but all the ones before it have type Y"
- The two things are not parallel.
- The hint does not talk about union types.
- The fact that there is a missing argument is not hinted at. Would be useful to say, "maybe something is missing an argument?" at least.

