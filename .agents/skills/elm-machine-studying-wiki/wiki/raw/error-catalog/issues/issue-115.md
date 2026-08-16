---
issue_number: 115
title: "Confusing message, inference beats annotation?"
state: CLOSED
author: "glenjamin"
created_at: "2016-05-02T19:13:02Z"
url: "https://github.com/elm/error-message-catalog/issues/115"
labels: []
---

# Issue #115: Confusing message, inference beats annotation?

**State:** `CLOSED` | **Author:** @glenjamin | **Source:** [https://github.com/elm/error-message-catalog/issues/115](https://github.com/elm/error-message-catalog/issues/115)

## Description

Hello, sorry if this is a dupe - I'm brand new to elm so I'm not quite sure what terms to use when searching.

I was changing the elm architecture part 3 to include the ID of each counter on the page, when I made a mistake:

``` elm
viewCounter : Signal.Address Action -> ( ID, Counter.Model ) -> Html
viewCounter address ( id, model ) =
  div
    []
    [ (text id)
    , Counter.view (Signal.forwardTo address (Modify id)) model
    ]
```

The mistake is that I've failed to convert the `id` param into the string needed by `text`.

However, the build error is:

```
-- TYPE MISMATCH ------------------------------------------- ././CounterList.elm

The argument to function `Modify` is causing a mismatch.

96│                                               Modify id)
                                                         ^^
Function `Modify` is expecting the argument to be:

    Int

But it is:

    String

Detected errors in 1 module.
```

Whereas I'd expect to get the error against the `text` call.

