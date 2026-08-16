---
issue_number: 358
title: "No hint that you've defined a type that you're now confusing with another type"
state: OPEN
author: "app/"
created_at: "2023-10-19T12:19:55Z"
url: "https://github.com/elm/error-message-catalog/issues/358"
labels: []
---

# Issue #358: No hint that you've defined a type that you're now confusing with another type

**State:** `OPEN` | **Author:** @app/ | **Source:** [https://github.com/elm/error-message-catalog/issues/358](https://github.com/elm/error-message-catalog/issues/358)

## Description

```
   Detected problems in 1 module.
   -- TOO MANY ARGS ------------------------------------------------------ Main.elm

   The `Result` type needs 0 arguments, but I see 2 instead:

   64|     | ReadingUploaded (Result Http.Error ())
                              ^^^^^^^^^^^^^^^^^^^^
   Which are the extra ones? Maybe some parentheses are missing?
```
I was wondering what Result type is this that needs 0 arguments? Result.Result works. Turns out I'd forgotten I'd defined my own Result type (in Main.elm). It would have been helpful if it'd helped me to remember this (eg I'd been pointed to its definition).
