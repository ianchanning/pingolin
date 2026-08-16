---
issue_number: 138
title: "Trying to define function members in records"
state: CLOSED
author: "ianmackenzie"
created_at: "2016-07-19T10:23:15Z"
url: "https://github.com/elm/error-message-catalog/issues/138"
labels: ['parser']
---

# Issue #138: Trying to define function members in records

**State:** `CLOSED` | **Author:** @ianmackenzie | **Source:** [https://github.com/elm/error-message-catalog/issues/138](https://github.com/elm/error-message-catalog/issues/138)

## Description

In the REPL:

``` elm
q = { foo = \x -> x + 1 }
```

is fine but

``` elm
r = { foo x = x + 1 }
```

gives

```
-- SYNTAX PROBLEM -------------------------------------------- repl-temp-000.elm

I ran into something unexpected when parsing your code!

3|   r = { foo x = x + 1 }
       ^
I am looking for one of the following things:

    end of input
    whitespace
```

The ideal error message would presumably be a caret pointing at the first `x` saying `expected '='` or something like that (unless this syntax becomes valid in a future version of Elm, which would be nifty!)

