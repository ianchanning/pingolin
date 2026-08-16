---
issue_number: 142
title: "Missing : leads to error on first ->"
state: CLOSED
author: "aklaing"
created_at: "2016-07-24T17:12:03Z"
url: "https://github.com/elm/error-message-catalog/issues/142"
labels: ['parser']
---

# Issue #142: Missing : leads to error on first ->

**State:** `CLOSED` | **Author:** @aklaing | **Source:** [https://github.com/elm/error-message-catalog/issues/142](https://github.com/elm/error-message-catalog/issues/142)

## Description

I know this is ridiculously basic but ... I wrote some code similar to the following:

```
modifyAList Int -> List A -> List A
modifyAList i alist = <... deleted ...>
```

Clearly it is missing a colon before the type of the function.  I got the following error message:

```

I ran into something unexpected when parsing your code!

632| modifyAList Int -> List A -> List A
                     ^
I am looking for one of the following things:

    an equals sign '='
    whitespace

Detected errors in 1 module.
```

Just a note that we should modify the error message to include a colon as one of the things that may be missing, in keeping with the huge reputation Elm has for fantastic error messages.

