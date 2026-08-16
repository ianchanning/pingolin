---
issue_number: 330
title: "Vertical bar error message wrong"
state: OPEN
author: "adhedgehog"
created_at: "2020-02-22T11:02:15Z"
url: "https://github.com/elm/error-message-catalog/issues/330"
labels: []
---

# Issue #330: Vertical bar error message wrong

**State:** `OPEN` | **Author:** @adhedgehog | **Source:** [https://github.com/elm/error-message-catalog/issues/330](https://github.com/elm/error-message-catalog/issues/330)

## Description

Code:
``` elm
nameChange : String -> { name : String, age : Int } -> { name : String, age : Int }
nameChange newName person =
     person | name = newName 
```

Error message:
```
-- UNEXPECTED SYMBOL ---- 

I was not expecting this vertical bar:

116|      person | name = newName 
                 ^
Vertical bars should only appear in custom type declarations. Maybe you want || instead?
```

This custom type suggestion is misleading because in this case I'm trying to update a record. 

