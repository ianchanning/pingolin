---
issue_number: 344
title: "confusing error when running `elm install` on a read-only elm.json"
state: OPEN
author: "Zimmi48"
created_at: "2020-07-16T13:39:50Z"
url: "https://github.com/elm/error-message-catalog/issues/344"
labels: []
---

# Issue #344: confusing error when running `elm install` on a read-only elm.json

**State:** `OPEN` | **Author:** @Zimmi48 | **Source:** [https://github.com/elm/error-message-catalog/issues/344](https://github.com/elm/error-message-catalog/issues/344)

## Description

**Quick Summary:** message triggered by `elm install elm/json` on a freshly created elm-spa application.

## SSCCE

```
elm-spa init # Accept default values
cd my-elm-spa
elm install elm/json # Accept to move to direct dependencies
```

Gives the error:

```
I ran into something that bypassed the normal error reporting process!
extracted whatever information I could from the internal error:

>   /home/theo/my-elm-spa/elm.json: openBinaryFile: permission denied 
```

- **Elm:** 0.19.1
- **elm-spa:** version 5.0.2
- **Browser:** N/A
- **Operating System:** NixOS


## Additional Details

If this is not reproducible, this might be due to the way I installed Elm and elm-spa using Nix. I would appreciate if someone could tell me whether they can reproduce this issue using the most standard (npm) installation method.
