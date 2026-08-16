---
issue_number: 313
title: "Add line number next to File path separated by a \":\""
state: OPEN
author: "girishso"
created_at: "2019-10-22T00:44:21Z"
url: "https://github.com/elm/error-message-catalog/issues/313"
labels: ['presentation']
---

# Issue #313: Add line number next to File path separated by a ":"

**State:** `OPEN` | **Author:** @girishso | **Source:** [https://github.com/elm/error-message-catalog/issues/313](https://github.com/elm/error-message-catalog/issues/313)

## Description

This is a standard followed by Go, Ruby, Elixir and many others, allows Command+Click in  iTerm to directly open the file and jump to erroring line. A huge time saver.

To be specific

```
-- TYPE MISMATCH -------------------------------------------------- src/Main.elm

Something is off with the 2nd branch of this `if` expression:

746|                 messages err
                     ^^^^^^^^^^^^
This `messages` call produces:

    List Msg

But the type annotation on `messagesHelper` says it should be:

    Msg
```

First line should become
```
-- TYPE MISMATCH -------------------------------------------------- src/Main.elm:746
```

