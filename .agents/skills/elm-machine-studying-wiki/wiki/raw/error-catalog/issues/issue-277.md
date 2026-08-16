---
issue_number: 277
title: "^^^'s are misaligned when line contains emojis"
state: OPEN
author: "harrysarson"
created_at: "2018-10-16T09:35:51Z"
url: "https://github.com/elm/error-message-catalog/issues/277"
labels: ['presentation']
---

# Issue #277: ^^^'s are misaligned when line contains emojis

**State:** `OPEN` | **Author:** @harrysarson | **Source:** [https://github.com/elm/error-message-catalog/issues/277](https://github.com/elm/error-message-catalog/issues/277)

## Description

### SSCCE: https://ellie-app.com/3CZQLzL9fVKa1

```elm
module Main exposing (main)

x = ['🙈', '🙉', invalid]
```

The compiler gives an error in column 16 (which is correct) but the `^^^^`'s are misaligned.
Even when using a monospace font the emojis are wider than other characters which I believe causes this misalignment.

### Full error message:
```
Line 3, Column 16
I cannot find a `invalid` variable:

3| x = ['🙈', '🙉', invalid]
                  ^^^^^^^
These names seem close though:

    asin
    isNaN
    List.all
    abs

Hint: Read <https://elm-lang.org/0.19.0/imports> to see how `import`
declarations work in Elm.
```
