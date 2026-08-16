---
issue_number: 262
title: "Error message not helping when pattern matching `Set.empty` in case expression"
state: OPEN
author: "digitalsatori"
created_at: "2018-08-02T08:06:49Z"
url: "https://github.com/elm/error-message-catalog/issues/262"
labels: ['parser']
---

# Issue #262: Error message not helping when pattern matching `Set.empty` in case expression

**State:** `OPEN` | **Author:** @digitalsatori | **Source:** [https://github.com/elm/error-message-catalog/issues/262](https://github.com/elm/error-message-catalog/issues/262)

## Description

The following code:

```
printUser users =
    case users of
        Set.empty ->
            text "Empty"
        _ ->
            text users
```
caused the syntax error below which is confusing:
```
-- SYNTAX PROBLEM --------------------------------------------------------------

I ran into something unexpected when parsing your code!

6|         Set.empty ->
               ^
I am looking for one of the following things:

    an upper case name
```

I will suggest @jessta 's answer to my question in the slack, which is much clearer and helpful:

> The pattern in `case..of` need to be literals, they can't be functions or variables.
> Set.empty is a function.
> 
> You probably want to use a
> `if..then..else` and `Set.isEmpty`, eg.
> `if Set.isEmpty users then text "empty" else text users`
