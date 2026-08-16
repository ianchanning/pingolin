---
issue_number: 356
title: "Bad unicode escape – bad suggestion :)"
state: OPEN
author: "lydell"
created_at: "2023-02-14T12:09:47Z"
url: "https://github.com/elm/error-message-catalog/issues/356"
labels: []
---

# Issue #356: Bad unicode escape – bad suggestion :)

**State:** `OPEN` | **Author:** @lydell | **Source:** [https://github.com/elm/error-message-catalog/issues/356](https://github.com/elm/error-message-catalog/issues/356)

## Description

`"\u{01}"` is invalid syntax. Elm suggests `"\u{001}"` instead, which is also invalid and funnily it suggests going back to `"\u{01}"` :)

```
> "\u{01}"
|
-- BAD UNICODE ESCAPE ----------------------------------------------------- REPL

Every code point needs at least four digits:

3|   "\u{01}"
      ^^^^^^
Try \u{001} instead?

> "\u{001}"
|
-- BAD UNICODE ESCAPE ----------------------------------------------------- REPL

Every code point needs at least four digits:

3|   "\u{001}"
      ^^^^^^^
Try \u{01} instead?
```

It gives a correct suggestion for `"\u{1}"`:

```
> "\u{1}"
|
-- BAD UNICODE ESCAPE ----------------------------------------------------- REPL

Every code point needs at least four digits:

3|   "\u{1}"
      ^^^^^
Try \u{0001} instead?
```
