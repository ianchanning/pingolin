---
issue_number: 371
title: "Confusing wording on syntax error"
state: OPEN
author: "tankorsmash"
created_at: "2021-07-26T03:00:01Z"
url: "https://github.com/elm/error-message-catalog/issues/371"
labels: ['parser']
---

# Issue #371: Confusing wording on syntax error

**State:** `OPEN` | **Author:** @tankorsmash | **Source:** [https://github.com/elm/error-message-catalog/issues/371](https://github.com/elm/error-message-catalog/issues/371)

## Description

https://github.com/elm/compiler/blob/770071accf791e8171440709effe71e78a9ab37c/compiler/src/Reporting/Error/Syntax.hs#L5081

>Only the :: symbol that works in patterns. It is useful if you are pattern
matching on lists, trying to get the first element off the front. Did you want
that instead?

A [rough ellie example ](https://ellie-app.com/dQc8VbrhpwWa1)that demonstrates the error:

```
I ran into the -> symbol unexpectedly in this pattern:

51|                 (String -> Result Decode.Error String) asd -> "Funnnccc"
                            ^^
Only the :: symbol that works in patterns. It is useful if you are pattern
matching on lists, trying to get the first element off the front. Did you want
that instead?
```

I'm new to Elm so maybe it's obvious with more knowledge, but it seems to be telling me that only the `::` symbol works in patterns. I'm not clear on what it should be trying to tell me though.
