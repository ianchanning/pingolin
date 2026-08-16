---
issue_number: 139
title: "Provide special error hint when \"variable name\" `as` is used?"
state: CLOSED
author: "jvoigtlaender"
created_at: "2016-07-19T11:50:19Z"
url: "https://github.com/elm/error-message-catalog/issues/139"
labels: ['parser']
---

# Issue #139: Provide special error hint when "variable name" `as` is used?

**State:** `CLOSED` | **Author:** @jvoigtlaender | **Source:** [https://github.com/elm/error-message-catalog/issues/139](https://github.com/elm/error-message-catalog/issues/139)

## Description

``` elm
cons a as = a :: as
```

```
I ran into something unexpected when parsing your code!

6| cons a as = a :: as
          ^
I am looking for one of the following things:

    an equals sign '='
    whitespace 
```

It would be so much nicer if the compiler told the user that the problem is that `as` was read as a keyword, not as a variable name.

