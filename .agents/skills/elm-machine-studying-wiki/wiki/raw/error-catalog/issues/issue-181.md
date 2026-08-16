---
issue_number: 181
title: "Errors about \"expected (something), got Maybe a\" could use hints"
state: OPEN
author: "Zacqary"
created_at: "2016-11-06T17:44:34Z"
url: "https://github.com/elm/error-message-catalog/issues/181"
labels: ['types', 'no sscce']
---

# Issue #181: Errors about "expected (something), got Maybe a" could use hints

**State:** `OPEN` | **Author:** @Zacqary | **Source:** [https://github.com/elm/error-message-catalog/issues/181](https://github.com/elm/error-message-catalog/issues/181)

## Description

I ran into an issue when I was trying to write an update of `Int -> Array.Array number > Array.Array number`

Basically it was to `Array.get` the element at an index, then increment the element at that index using Array.set. Problem was, `Array.get` returns `Maybe a`, and it took me a while to figure out that I needed to handle the case of whether or not the result of `Array.get` was `Just` a `number` or `Nothing`.

It might have been less frustrating if the compiler gave me a hint about how to handle expecting an explicit type, but actually getting a `Maybe`.

I'm typing this from my phone so I hope it's clear. I can clarify with some code samples later if needed.
