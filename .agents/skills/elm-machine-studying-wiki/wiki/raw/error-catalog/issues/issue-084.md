---
issue_number: 84
title: "Unexpected \"duplicate definition\" error"
state: OPEN
author: "Steve-OH"
created_at: "2016-02-11T14:42:32Z"
url: "https://github.com/elm/error-message-catalog/issues/84"
labels: ['naming']
---

# Issue #84: Unexpected "duplicate definition" error

**State:** `OPEN` | **Author:** @Steve-OH | **Source:** [https://github.com/elm/error-message-catalog/issues/84](https://github.com/elm/error-message-catalog/issues/84)

## Description

I originally filed this as [elm-lang/elm-compiler/issues/1284](/elm-lang/elm-compiler/issues/1284), but @mgold determined that it is WAD, so here it goes. In the following code:

```
type Foo
  = Bar Bar
  | Baz Baz

type alias Bar = List Int

type alias Baz = 
  { foo: Int
  , bar: Int
  }
```

Baz raises a "duplicate definition" error, while Bar does not. The error is specific to record type aliases.

There is a workaround:

```
type Foo
  = Bar Bar
  | Baz Baz

type alias Bar = List Int

type alias Baz' =
  { foo: Int
  , bar: Int
  }

type alias Baz = Baz'
```

