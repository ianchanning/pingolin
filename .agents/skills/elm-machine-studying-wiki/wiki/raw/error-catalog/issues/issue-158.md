---
issue_number: 158
title: "*No* error given when importing the same module twice"
state: OPEN
author: "JohnBugner"
created_at: "2016-08-19T09:41:56Z"
url: "https://github.com/elm/error-message-catalog/issues/158"
labels: []
---

# Issue #158: *No* error given when importing the same module twice

**State:** `OPEN` | **Author:** @JohnBugner | **Source:** [https://github.com/elm/error-message-catalog/issues/158](https://github.com/elm/error-message-catalog/issues/158)

## Description

Note: This is probably related to: https://github.com/elm-lang/error-message-catalog/issues/157

Example:

```
import String
import String
```

There are two (you can have more also) imports of the exact same module (with or without `exposing`), yet the compiler doesn't complain. Why is this allowed? The days of having write an import with and without `exposing` are no more.

