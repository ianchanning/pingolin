---
issue_number: 113
title: "Conflicting type variable bindings leads to contradictory error message"
state: CLOSED
author: "avh4"
created_at: "2016-04-23T01:08:29Z"
url: "https://github.com/elm/error-message-catalog/issues/113"
labels: ['types']
---

# Issue #113: Conflicting type variable bindings leads to contradictory error message

**State:** `CLOSED` | **Author:** @avh4 | **Source:** [https://github.com/elm/error-message-catalog/issues/113](https://github.com/elm/error-message-catalog/issues/113)

## Description

In 0.16: In the following, 

``` elm
type alias T a b c =
  { a : a, b : b, c : c }

f : T a b a -> ()
f _ = ()

x : T Int Float String -> ()
x = f
```

The error message is confusing and contradicts itself:

```
TYPE MISMATCH
The type annotation for `x` does not match its definition.

9| x : T Int Float String -> ()
The type annotation is saying:

    T Int Float Int -> ()

But I am inferring that the definition has this type:

    T Int Float Int -> ()
```

It shows the source code with the type annotation `T Int Float String -> ()`, and then states that the type annotation says `T Int Float Int -> ()`.

Instead, the error message should state "The type annotation is saying: `T Int Float String -> ()`"

