---
issue_number: 357
title: "argument order errors overwhelming."
state: OPEN
author: "sijmenvb"
created_at: "2023-10-04T23:22:39Z"
url: "https://github.com/elm/error-message-catalog/issues/357"
labels: []
---

# Issue #357: argument order errors overwhelming.

**State:** `OPEN` | **Author:** @sijmenvb | **Source:** [https://github.com/elm/error-message-catalog/issues/357](https://github.com/elm/error-message-catalog/issues/357)

## Description

for a simple expression such as 
`querry1 = String.repeat "Hi " 5`
I get two errors that manage to fill my entire screen they boil down to:
expected string got int
and expected int got string 
the problem here is obvious, I messed up the order of the arguments.
The hints I get are to use `String.fromInt` and `String.toInt`
But I would also expect a hint like:
```
Hint: maybe you meant the following order of arguments:
    String.repeat 5 "Hi " 
Since this is a valid expression.
```

In general I would expect such a suggestion every time changing the order of arguments would lead to a valid expression.

(in the compiler, just add all the argument's types to a list and then go trough the type of the function and put them in (and remove them (first in first out?) from that list) only if this succeeds give the hint.)

This would help parse these "dumb mistake" errors much easier and it would also be nice for library functions you don't use often since you can just give the arguments in any order and the compiler would tell you what (the/a) right order is. Why would I need to remember the correct order?
also, being able to copy paste the suggested code in is certainly quicker than moving arguments around manually.
