---
issue_number: 102
title: "No line number or example for whitespace expression in case expr"
state: CLOSED
author: "homburg"
created_at: "2016-03-23T16:58:47Z"
url: "https://github.com/elm/error-message-catalog/issues/102"
labels: ['parser']
---

# Issue #102: No line number or example for whitespace expression in case expr

**State:** `CLOSED` | **Author:** @homburg | **Source:** [https://github.com/elm/error-message-catalog/issues/102](https://github.com/elm/error-message-catalog/issues/102)

## Description

This code

``` elm
f : String -> String
f str =
    case str of 
        "" -> ""
        _ ->


```

produces and error without any line number or indication of place:

```
-- SYNTAX PROBLEM ----------------------------------------------------- Test.elm

I need whitespace, but got stuck on what looks like a new declaration. You are
either missing some stuff in the declaration above or just need to add some
spaces here:


I am looking for one of the following things:

    whitespace

Detected errors in 1 module.                                        
```

