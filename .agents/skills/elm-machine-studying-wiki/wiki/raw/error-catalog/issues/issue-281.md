---
issue_number: 281
title: "Unused assignment, either in let assignments or unused args "
state: OPEN
author: "mattiasw2"
created_at: "2018-11-17T16:01:48Z"
url: "https://github.com/elm/error-message-catalog/issues/281"
labels: ['naming']
---

# Issue #281: Unused assignment, either in let assignments or unused args 

**State:** `OPEN` | **Author:** @mattiasw2 | **Source:** [https://github.com/elm/error-message-catalog/issues/281](https://github.com/elm/error-message-catalog/issues/281)

## Description

In elm 0.19 you can easily write code like

```elm
  let
      model =
      model2 = { model | ...}
  in
     (model, ....)
```

where the last part should have referered to model2. No compiler warning is generated (or am I missing a flag?)

If the compiler would warn for unused variables like model2, the problem is trivial to detect. 

Many language would not generate the warning if the variable starts with underscore, so the pattern

```elm
let _ = Debug.log "foo" bar in
```

would still work.

I notice there was some talk about this in 2015, but no specific issue created. 
