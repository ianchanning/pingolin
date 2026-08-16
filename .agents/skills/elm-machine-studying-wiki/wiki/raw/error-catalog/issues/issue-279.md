---
issue_number: 279
title: "Error message when miscapitalizing a boolean value could be clearer"
state: OPEN
author: "bowbahdoe"
created_at: "2018-10-19T00:35:29Z"
url: "https://github.com/elm/error-message-catalog/issues/279"
labels: ['naming']
---

# Issue #279: Error message when miscapitalizing a boolean value could be clearer

**State:** `OPEN` | **Author:** @bowbahdoe | **Source:** [https://github.com/elm/error-message-catalog/issues/279](https://github.com/elm/error-message-catalog/issues/279)

## Description

```
Naming Error
Line 36, Column 31
I cannot find a `false` variable:

36|   ( Model "cat" "waiting.gif" false
                                  ^^^^^
These names seem close though:

    value
    abs
    alt
    class

Hint: Read <https://elm-lang.org/0.19.0/imports> to see how `import`
declarations work in Elm.
```

This is the error message that you get as of 0.19.0 when you write `false` instead of `False`. This seems like it would be a common enough stumbling block to be more directly explained to the user. Something like "the boolean false is written with a capital "F" in Elm`.
