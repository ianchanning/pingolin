---
issue_number: 80
title: "Don't suggest Basics.something"
state: OPEN
author: "mgold"
created_at: "2016-01-21T14:05:18Z"
url: "https://github.com/elm/error-message-catalog/issues/80"
labels: ['naming']
---

# Issue #80: Don't suggest Basics.something

**State:** `OPEN` | **Author:** @mgold | **Source:** [https://github.com/elm/error-message-catalog/issues/80](https://github.com/elm/error-message-catalog/issues/80)

## Description

The program `x = po` generates the compiler error suggests

```
Maybe you want one of the following?

    pi
    Basics.pi
```

Because Basics is imported exposed everywhere, it's true that `Basics.pi` is in scope and valid. But, no one would every refer to it qualified. The compiler should remove these entries from the suggestions.

