---
issue_number: 188
title: "foo : () String Float parses but gives confusing type mismatch"
state: OPEN
author: "rtfeldman"
created_at: "2016-12-09T00:58:58Z"
url: "https://github.com/elm/error-message-catalog/issues/188"
labels: ['types']
---

# Issue #188: foo : () String Float parses but gives confusing type mismatch

**State:** `OPEN` | **Author:** @rtfeldman | **Source:** [https://github.com/elm/error-message-catalog/issues/188](https://github.com/elm/error-message-catalog/issues/188)

## Description

I'd expect this to give me a parsing error:

```
foo : () String Float
foo =
    ( "foo", 3.2 )
```

Instead it parses and gives me a nonsensical type mismatch:

```
-- TYPE MISMATCH ---------------------------------------------------------------

The definition of `foo` does not match its type annotation.

 8| foo : () String Float
 9| foo =
10|>    ( "foo", 3.2 )

The type annotation for `foo` says it is a:

    ( String, Float )

But the definition (shown above) is a:

    ( String, Float )
```
