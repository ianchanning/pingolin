---
issue_number: 333
title: "Decimals starting with `.` have confusing error message."
state: OPEN
author: "openorclose"
created_at: "2020-04-09T15:05:04Z"
url: "https://github.com/elm/error-message-catalog/issues/333"
labels: []
---

# Issue #333: Decimals starting with `.` have confusing error message.

**State:** `OPEN` | **Author:** @openorclose | **Source:** [https://github.com/elm/error-message-catalog/issues/333](https://github.com/elm/error-message-catalog/issues/333)

## Description

Ideally it would say that numbers cannot start with a decimal point!

```
-- EXPECTING RECORD ACCESSOR ---------------------------------------------- REPL

I am trying to parse a record accessor here:

3|   .123
      ^
Something like .name or .price that accesses a value from a record.

Note: Record field names must start with a lower case letter!
```
