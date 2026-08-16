---
issue_number: 224
title: "Debug.log with one argument should maybe emit a warning that it won't execute the side effect"
state: OPEN
author: "MainShayne233"
created_at: "2017-07-02T05:25:30Z"
url: "https://github.com/elm/error-message-catalog/issues/224"
labels: []
---

# Issue #224: Debug.log with one argument should maybe emit a warning that it won't execute the side effect

**State:** `OPEN` | **Author:** @MainShayne233 | **Source:** [https://github.com/elm/error-message-catalog/issues/224](https://github.com/elm/error-message-catalog/issues/224)

## Description

When some does something like:
```elm
let
    _ = Debug.log "Hello Elm!"
in
    ...
```
They might expect that either they will side effect of "Hello Elm!" showing up in their browser console, or that it would throw a compiler error/warning, but nothing happens at all.

Not sure what the best solution for this is, or if one is even warranted, but I, an Elm beginner, spent an trying to figure out what was wrong, and definitely would have appreciated some sort of warning.
