---
issue_number: 93
title: "importing a module from itself"
state: OPEN
author: "mgold"
created_at: "2016-03-03T04:46:05Z"
url: "https://github.com/elm/error-message-catalog/issues/93"
labels: ['naming']
---

# Issue #93: importing a module from itself

**State:** `OPEN` | **Author:** @mgold | **Source:** [https://github.com/elm/error-message-catalog/issues/93](https://github.com/elm/error-message-catalog/issues/93)

## Description

If you import a module from itself, say

``` elm
module Main where

import Main

x = 12
```

then you get this error:

```
Your dependencies form a cycle:

  ┌─────┐
  │     V
  │    Main
  └─────┘

You may need to move some values to a new module to get rid of the cycle.
```

I stared at this for ten minutes before figuring out what was going on. (I was splitting two modules and didn't rename the copy.) Probably comes up next to never, but an explicit check for this case would be nice.

