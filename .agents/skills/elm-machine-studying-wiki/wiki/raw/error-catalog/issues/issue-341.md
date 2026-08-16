---
issue_number: 341
title: "Error message for UNKNOWN EXPORT "
state: OPEN
author: "mokshasoft"
created_at: "2020-11-05T16:37:46Z"
url: "https://github.com/elm/error-message-catalog/issues/341"
labels: []
---

# Issue #341: Error message for UNKNOWN EXPORT 

**State:** `OPEN` | **Author:** @mokshasoft | **Source:** [https://github.com/elm/error-message-catalog/issues/341](https://github.com/elm/error-message-catalog/issues/341)

## Description

I propose to add line number to this error message. I guess I didn't read the message that good, so it confused me for some time not to find exactly where the problem is. And sometimes some files have longer headers and then it is also good to just be able to jump to the correct line.

```
-- UNKNOWN EXPORT ---------- File.elm
  
You are trying to expose a type named `X` but I cannot find its definition.

Maybe you want Y instead?
```
