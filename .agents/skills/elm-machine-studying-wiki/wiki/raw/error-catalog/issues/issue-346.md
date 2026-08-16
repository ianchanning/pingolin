---
issue_number: 346
title: "there should be a hint when swapping arguments"
state: OPEN
author: "dullbananas"
created_at: "2021-03-08T20:34:43Z"
url: "https://github.com/elm/error-message-catalog/issues/346"
labels: []
---

# Issue #346: there should be a hint when swapping arguments

**State:** `OPEN` | **Author:** @dullbananas | **Source:** [https://github.com/elm/error-message-catalog/issues/346](https://github.com/elm/error-message-catalog/issues/346)

## Description

```
This argument is a list of type:

    List (Time.Zone -> Time.Posix -> Int)

But this function needs the 1st argument to be:

    List (Time.Posix -> Time.Zone -> b)
```
