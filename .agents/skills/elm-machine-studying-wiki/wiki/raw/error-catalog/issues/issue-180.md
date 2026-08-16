---
issue_number: 180
title: "Incorrect naming error message"
state: OPEN
author: "rtfeldman"
created_at: "2016-11-03T06:12:25Z"
url: "https://github.com/elm/error-message-catalog/issues/180"
labels: ['naming']
---

# Issue #180: Incorrect naming error message

**State:** `OPEN` | **Author:** @rtfeldman | **Source:** [https://github.com/elm/error-message-catalog/issues/180](https://github.com/elm/error-message-catalog/issues/180)

## Description

This is a bug in 0.18, which I was also able to reproduce in 0.17.

SSCCE:

### Main.elm
```elm
module Main exposing (..)

import Other

foo : Other.Bar
foo = ()
```

### Other.elm
```elm
module Other exposing (..)

asdf = ""
```

To reproduce, put these two files in the same directory, then:

```
elm-make --output=/dev/null --yes Main.elm
```

You get this error:

```
-- NAMING ERROR ------------------------------------------------------- Main.elm

Cannot find type `Other.Bar`.

6| foo : Other.Bar
         ^^^^^^^^^
No module called `Other` has been imported.

Detected errors in 1 module.
```

This is not true. `Other` has been imported, it just doesn't expose anything called `Bar`.

This should be the "`Other` does not expose a value called `Bar`" error message that usually shows up in situations like these.
