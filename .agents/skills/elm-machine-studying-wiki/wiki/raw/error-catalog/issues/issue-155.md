---
issue_number: 155
title: "Include operator name with \"binary operations\" hint"
state: CLOSED
author: "rtfeldman"
created_at: "2016-08-11T01:51:21Z"
url: "https://github.com/elm/error-message-catalog/issues/155"
labels: []
---

# Issue #155: Include operator name with "binary operations" hint

**State:** `CLOSED` | **Author:** @rtfeldman | **Source:** [https://github.com/elm/error-message-catalog/issues/155](https://github.com/elm/error-message-catalog/issues/155)

## Description

(Splitting this out from https://github.com/elm-lang/error-message-catalog/issues/131#issuecomment-238742578 as its own issue.)

```
point1 = { x = 3 // 1, y = 4 }
point2 = { x = 3.0, y = 4 }

foo = { point = point1 } == { point = point2 }
```

The hint currently says:

```
With binary operations, I always figure out the left side first.
```

I remember being confused by this the first few times I encountered it; I think beginners may not realize what "binary operations" refers to by itself.

Suggestion to make it clear what "binary operations" refers to:

```
With binary operations like `==` I always figure out the left side first.
```

