---
issue_number: 192
title: "Floating comma instead floating point error message"
state: OPEN
author: "Rolograaf"
created_at: "2016-12-16T16:49:58Z"
url: "https://github.com/elm/error-message-catalog/issues/192"
labels: ['parser']
---

# Issue #192: Floating comma instead floating point error message

**State:** `OPEN` | **Author:** @Rolograaf | **Source:** [https://github.com/elm/error-message-catalog/issues/192](https://github.com/elm/error-message-catalog/issues/192)

## Description

As European I am used that Floats are noted with a comma instead a point, in programming usually the US way is used. However the error message is not very useful?

```
I ran into something unexpected when parsing your code!

3|   ceiling 9,32
              ^
I am looking for one of the following things:

    an expression
    an infix operator like (+)
    end of input
    whitespace
```
On request of @evancz  made into a new (and difficult to detect) error message request, see wrong place #168
