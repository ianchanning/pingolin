---
issue_number: 248
title: "Confusing error with misplaced negation operator / missing operand"
state: CLOSED
author: "robx"
created_at: "2017-12-29T21:33:21Z"
url: "https://github.com/elm/error-message-catalog/issues/248"
labels: ['parser']
---

# Issue #248: Confusing error with misplaced negation operator / missing operand

**State:** `CLOSED` | **Author:** @robx | **Source:** [https://github.com/elm/error-message-catalog/issues/248](https://github.com/elm/error-message-catalog/issues/248)

## Description

```
x =
   [ 1
   , 2
   , 4-
   ]
```

Compiler output:

```
I ran into something unexpected when parsing your code!
184│    [ 1
          ^
I am looking for one of the following things:
    a closing brace ']'
    whitespace
```

