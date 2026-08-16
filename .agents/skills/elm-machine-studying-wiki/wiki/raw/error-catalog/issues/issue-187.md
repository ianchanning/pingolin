---
issue_number: 187
title: "Confusing type annotation error"
state: OPEN
author: "marcosh"
created_at: "2016-12-07T10:17:32Z"
url: "https://github.com/elm/error-message-catalog/issues/187"
labels: ['types']
---

# Issue #187: Confusing type annotation error

**State:** `OPEN` | **Author:** @marcosh | **Source:** [https://github.com/elm/error-message-catalog/issues/187](https://github.com/elm/error-message-catalog/issues/187)

## Description

If I am importing two modules that expose the same type

    import A exposing (T)
    import B exposing (T)

and I'm using `A.T` where I am declaring instead a `B.T`, the compiler will return a message like

```
The type annotation says it is a:
    
    T

But the definition is a:

    T
```

It would be much more helpful if it would explicitely mention `A` and `B`.

You could see an example of this error [here](https://runelm.io/c/beu)




