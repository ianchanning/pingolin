---
issue_number: 87
title: "Disallow Type(..) in imports when no tags exported"
state: OPEN
author: "mgold"
created_at: "2016-02-22T23:51:37Z"
url: "https://github.com/elm/error-message-catalog/issues/87"
labels: ['naming']
---

# Issue #87: Disallow Type(..) in imports when no tags exported

**State:** `OPEN` | **Author:** @mgold | **Source:** [https://github.com/elm/error-message-catalog/issues/87](https://github.com/elm/error-message-catalog/issues/87)

## Description

Not an error, but a lack of one.

``` elm
module Definitions (Action) where

type Action = Increment | Decrement
```

In another file,

``` elm
import Definitions exposing (Action(..))

x = "dummy definition"
```

The compiler fails to tell me that none of `Action`'s tags are exported, so the `(..)` doesn't import anything. It's harmless as it is, but would be a nice error message.

