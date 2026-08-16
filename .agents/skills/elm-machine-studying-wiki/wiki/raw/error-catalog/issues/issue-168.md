---
issue_number: 168
title: "Extra comma"
state: CLOSED
author: "thomasballinger"
created_at: "2016-10-01T02:12:42Z"
url: "https://github.com/elm/error-message-catalog/issues/168"
labels: ['parser']
---

# Issue #168: Extra comma

**State:** `CLOSED` | **Author:** @thomasballinger | **Source:** [https://github.com/elm/error-message-catalog/issues/168](https://github.com/elm/error-message-catalog/issues/168)

## Description

Elm-format and the Elm community's preference for commas at the beginning of lines sometimes trips me up because I'm in the habit of putting commas at the end of lines. I've been momentarily confused by something like this a few times:

```
type alias Drag =
    { start : Position,
    , current : Position
    , clipId : Integer
    }

-- SYNTAX PROBLEM ----------------------------------------------------- Main.elm

I ran into something unexpected when parsing your code!

61|     , current : Position,
        ^
I am looking for one of the following things:

    a lower case name
    whitespace
```

I wonder if this is command enough and specific enough to merit a suggestion for what the problem might be. The syntax highlighting I use has Types and commas the same color, so I often miss a trailing comma I put somewhere by habit.

