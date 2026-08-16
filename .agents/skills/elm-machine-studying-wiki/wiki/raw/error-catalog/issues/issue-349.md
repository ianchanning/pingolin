---
issue_number: 349
title: "Confusion between type name and variant name shadowing"
state: OPEN
author: "wolfadex"
created_at: "2021-05-20T21:59:23Z"
url: "https://github.com/elm/error-message-catalog/issues/349"
labels: []
---

# Issue #349: Confusion between type name and variant name shadowing

**State:** `OPEN` | **Author:** @wolfadex | **Source:** [https://github.com/elm/error-message-catalog/issues/349](https://github.com/elm/error-message-catalog/issues/349)

## Description

There are periodically users of Elm who write code like

```elm
type Change
    = Increment

type Increment
    = ByOne
    | ByTwo
```

and are confused that the **type** `Increment` doesn't correspond to the **variant** `Increment`. They don't realize that they actually need to write

```elm
type Change
    = Increment Increment

type Increment
    = ByOne
    | ByTwo
```
to get their intended result.

[real world example](https://ellie-app.com/ddJzNdqpN64a1) from May 20th, 2021
