---
issue_number: 372
title: "Malformed record modify `{ key | }` creates EXTRA COMMA error"
state: OPEN
author: "jfine2358"
created_at: "2021-03-15T10:52:04Z"
url: "https://github.com/elm/error-message-catalog/issues/372"
labels: ['parser']
---

# Issue #372: Malformed record modify `{ key | }` creates EXTRA COMMA error

**State:** `OPEN` | **Author:** @jfine2358 | **Source:** [https://github.com/elm/error-message-catalog/issues/372](https://github.com/elm/error-message-catalog/issues/372)

## Description

**Quick Summary:** Malformed record modify `{ key | }` creates EXTRA COMMA error.


## SSCCE

```elm
$ elm repl
---- Elm 0.19.1 ----------------------------------------------------------------
> { key | }
-- EXTRA COMMA ------------------------------------------------------------ REPL
I am partway through parsing a record, but I got stuck here:
3|   { key | }
             ^
Trailing commas are not allowed in records.
```
There is no comma, let alone an extra comma. The error message could be improved. (I suspect that allowing `{ key | } ` would be contrary to Elm practice.)

- **Elm:** 0.19
- **Browser:** None
- **Operating System:** Not relevant (Linux).

## Additional Details

I suspect that `{key |` puts the compiler into a `prev_token = Comma` state.
