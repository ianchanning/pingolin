---
issue_number: 257
title: "Should have a 'did you mean' sugguestion when typo in module import"
state: OPEN
author: "jessta"
created_at: "2018-04-23T01:35:00Z"
url: "https://github.com/elm/error-message-catalog/issues/257"
labels: []
---

# Issue #257: Should have a 'did you mean' sugguestion when typo in module import

**State:** `OPEN` | **Author:** @jessta | **Source:** [https://github.com/elm/error-message-catalog/issues/257](https://github.com/elm/error-message-catalog/issues/257)

## Description

Typos in module names should give a 'did you mean' suggestion.

Here the user has made a typo of `Websocket` instead of `WebSocket` the compiler suggesting they might have meant `WebSocket` would be more helpful. 

```
$elm-make ./src/Main.elm --output=main.js
I cannot find module 'Websocket'.

Module 'Update' is trying to import it.

Potential problems could be:
  * Misspelled the module name
  * Need to add a source directory or new dependency to elm-package.json
```
