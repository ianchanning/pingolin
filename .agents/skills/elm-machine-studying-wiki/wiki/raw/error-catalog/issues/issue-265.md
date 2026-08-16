---
issue_number: 265
title: "Error message regarding function type missing \"to\""
state: CLOSED
author: "tilmans"
created_at: "2018-08-25T20:00:58Z"
url: "https://github.com/elm/error-message-catalog/issues/265"
labels: ['types', 'no sscce', 'presentation']
---

# Issue #265: Error message regarding function type missing "to"

**State:** `CLOSED` | **Author:** @tilmans | **Source:** [https://github.com/elm/error-message-catalog/issues/265](https://github.com/elm/error-message-catalog/issues/265)

## Description

I would expect: "... But (|>) is piping it **to** a function that expects..."

```
-- TYPE MISMATCH ----------------------------------------------- src/GeoJson.elm

This function cannot handle the argument sent through the (|>) pipe:

314|         coordinates
315|             |> List.map Json.float
316|             |> Json.list
                    ^^^^^^^^^
The argument is:

    List Json.Value

But (|>) is piping it a function that expects:

    a -> Json.Value
```


