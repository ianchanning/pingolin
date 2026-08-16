---
issue_number: 116
title: "[0.17-rc2] Module declaration with `where`"
state: CLOSED
author: "Janiczek"
created_at: "2016-05-06T10:43:48Z"
url: "https://github.com/elm/error-message-catalog/issues/116"
labels: []
---

# Issue #116: [0.17-rc2] Module declaration with `where`

**State:** `CLOSED` | **Author:** @Janiczek | **Source:** [https://github.com/elm/error-message-catalog/issues/116](https://github.com/elm/error-message-catalog/issues/116)

## Description

Elm gives a nice error message if you try to do:

``` elm
module App (..) where
x = 1
```

```
-- SYNTAX PROBLEM ------------------------------------------------ ./src/App.elm

I ran into something unexpected when parsing your code!

1│ module App (..) where
              ^
I am looking for one of the following things:

    something like `exposing (..)` which replaced `where` in 0.17
    whitespace
```

But if you just add the `exposing` and don't remove `where` (which I did, as I only skimmed through the error message), then you get:

``` elm
module App exposing (..) where
x = 1
```

```
-- SYNTAX PROBLEM ------------------------------------------------ ./src/App.elm

I need a fresh line to start a new declaration. This means a new line that
starts with stuff, not with spaces or comments.

1│ module App exposing (..) where
                            ^
I am looking for one of the following things:

    whitespace
```

It's already kind of understandable, but the message could be nicer - from the top of my head something like

```
The `where` is not needed anymore at the end of a module declaration since 0.17.
```

