---
issue_number: 343
title: "Improve error when using type alias instead of type"
state: OPEN
author: "dullbananas"
created_at: "2020-07-31T22:08:24Z"
url: "https://github.com/elm/error-message-catalog/issues/343"
labels: []
---

# Issue #343: Improve error when using type alias instead of type

**State:** `OPEN` | **Author:** @dullbananas | **Source:** [https://github.com/elm/error-message-catalog/issues/343](https://github.com/elm/error-message-catalog/issues/343)

## Description

```elm
type alias Type
    = A
    | B
```

the error could be improved:

```
I ran into an unexpected symbol:

17|     | B

I was not expecting to see a | here. Try deleting it? Maybe I can give a better hint from there?
```
