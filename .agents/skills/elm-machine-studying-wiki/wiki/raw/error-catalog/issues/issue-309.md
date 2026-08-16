---
issue_number: 309
title: "Display a warning when no js is emitted"
state: OPEN
author: "sebsheep"
created_at: "2019-10-19T23:15:42Z"
url: "https://github.com/elm/error-message-catalog/issues/309"
labels: []
---

# Issue #309: Display a warning when no js is emitted

**State:** `OPEN` | **Author:** @sebsheep | **Source:** [https://github.com/elm/error-message-catalog/issues/309](https://github.com/elm/error-message-catalog/issues/309)

## Description

When compiling a valid but "useless" elm file like the following:

```elm
module A exposing (a)

a = 1
```

The compiler says `Success! Compiled 1 module.`. However, the emitted file is empty! I've been trapped multiple by searching what I was doing wrong. It would be nice to have to have a little warning like:
```
Success! Compiled 1 module.
WARNING: this module did not contain a main function, hence I did not emit a file.
```

