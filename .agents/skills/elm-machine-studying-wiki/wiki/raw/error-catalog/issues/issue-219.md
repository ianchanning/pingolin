---
issue_number: 219
title: "Importing union tag as a type"
state: OPEN
author: "mgold"
created_at: "2017-05-14T19:26:40Z"
url: "https://github.com/elm/error-message-catalog/issues/219"
labels: ['naming']
---

# Issue #219: Importing union tag as a type

**State:** `OPEN` | **Author:** @mgold | **Source:** [https://github.com/elm/error-message-catalog/issues/219](https://github.com/elm/error-message-catalog/issues/219)

## Description

If I try to import a union tag as if it was a type, I'm told the module doesn't expose it.

SSCCE. Option.elm:
```elm
module Option exposing (Option(Some, None))

type Option a
    = Some a
    | None
```

Import statement in another file:
```elm
import Option exposing (Option, None)
```

The correct syntax is of course `import Option exposing (Option(None))`, but the incorrect version produces:

```
-- NAMING ERROR --------------------------------------------------- Main.elm

Module `Option` does not expose `None`

3| import Option exposing (Option, None)
```

Ideally, the compiler would recognize what I'm trying to do and suggest `import Option exposing (Option, None)` (or perhaps with `Some` in there, or both). But it would be an improvement if it said "the type `None`", which would be a clue.

