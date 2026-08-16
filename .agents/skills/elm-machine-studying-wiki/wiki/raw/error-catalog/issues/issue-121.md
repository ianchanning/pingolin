---
issue_number: 121
title: "Infix operators must be at the top level"
state: CLOSED
author: "szabba"
created_at: "2016-05-19T05:13:38Z"
url: "https://github.com/elm/error-message-catalog/issues/121"
labels: ['parser']
---

# Issue #121: Infix operators must be at the top level

**State:** `CLOSED` | **Author:** @szabba | **Source:** [https://github.com/elm/error-message-catalog/issues/121](https://github.com/elm/error-message-catalog/issues/121)

## Description

When I try this on http://elm-lang.org/try :

``` elm
import Html

main =
    let
        (-) = ()
    in
        Html.text ""
```

I get a clear (for me) enough error that explains what's the problem

```
elm-make: can only define infix operators at the top level
elm-make: thread blocked indefinitely in an MVar operation
```

but
1. It doesn't look like the great messages Elm usually spoils us with.
2. It's followed by a message about MVars that's likely to confuse most people seeing it
3. Not everyone necessarily knows what "infix" means.

