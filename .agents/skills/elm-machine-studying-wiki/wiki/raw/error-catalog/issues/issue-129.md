---
issue_number: 129
title: "Could help more with missing imports (even more basic)"
state: CLOSED
author: "app/"
created_at: "2016-06-18T14:37:06Z"
url: "https://github.com/elm/error-message-catalog/issues/129"
labels: ['naming']
---

# Issue #129: Could help more with missing imports (even more basic)

**State:** `CLOSED` | **Author:** @app/ | **Source:** [https://github.com/elm/error-message-catalog/issues/129](https://github.com/elm/error-message-catalog/issues/129)

## Description

```
-- NAMING ERROR ------------------------------------------------------- form.elm

Cannot find variable `String.length`.

16|         if model.password == "" || String.length model.password < 8 then
                                       ^^^^^^^^^^^^^
The qualifier `String` is not in scope. 

Detected errors in 1 module.                             
```

An even-more-basic version of https://github.com/elm-lang/error-message-catalog/issues/128. Could say "You may need to import String."

