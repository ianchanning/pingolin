---
issue_number: 299
title: "Suggest longer names with same prefix on naming errors"
state: OPEN
author: "robx"
created_at: "2019-03-19T14:21:34Z"
url: "https://github.com/elm/error-message-catalog/issues/299"
labels: ['naming']
---

# Issue #299: Suggest longer names with same prefix on naming errors

**State:** `OPEN` | **Author:** @robx | **Source:** [https://github.com/elm/error-message-catalog/issues/299](https://github.com/elm/error-message-catalog/issues/299)

## Description

**Quick Summary:**

Elm generally does a great job suggesting alternate names when you've misspelled a word. I just came across a case where this could easily be improved:

I tried using `String.drop`, while `String.dropLeft` was what I needed.

```
-- NAMING ERROR ------------------------------------------------- src/Tweets.elm

I cannot find a `String.drop` variable:

285|                             [ Url.Builder.string "user_screen_name" <| "eq." ++ String.drop 1 author ]
                                                                                     ^^^^^^^^^^^
The `String` module does not expose a `drop` variable. These names seem close
though:

    String.map
    String.trim
    String.all
    String.any

Hint: Read <https://elm-lang.org/0.19.0/imports> to see how `import`
declarations work in Elm.
```

- **Elm:** 0.19.0
- **Browser:** irrelevant
- **Operating System:** macOS


