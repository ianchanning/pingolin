---
issue_number: 245
title: "Possible improvement for misuse of (::) operator"
state: OPEN
author: "gamebox"
created_at: "2017-11-25T18:31:52Z"
url: "https://github.com/elm/error-message-catalog/issues/245"
labels: ['types']
---

# Issue #245: Possible improvement for misuse of (::) operator

**State:** `OPEN` | **Author:** @gamebox | **Source:** [https://github.com/elm/error-message-catalog/issues/245](https://github.com/elm/error-message-catalog/issues/245)

## Description

When getting started, a user may incorrectly use the (::) operator like List.append, trying to join two lists.  The error messaging is very vague, and may cause as much confusion as it diffuses.  See the following SSCCE:

[See on ellie](https://ellie-app.com/fcZKrtHHLa1/0)

Maybe when we see a situation where a function or operator is of the shape:

a -> Collection a -> Collection a

And the left side is Collection a, we can emit an error like

> This operator looks to be looking for a single element of type a for the left side, but you are passing a Collection of type a.
> 
> Either the left side should be:
> 
> a
> 
> Or the right side should be:
> 
>  Collection (Collection a)

Is this possible, or does it make sense?
