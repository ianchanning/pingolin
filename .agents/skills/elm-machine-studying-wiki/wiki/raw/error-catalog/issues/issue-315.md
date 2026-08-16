---
issue_number: 315
title: "Adding a plus sign to numbers is not explicit about pluses not being allowed"
state: OPEN
author: "ChristophP"
created_at: "2019-10-25T20:54:46Z"
url: "https://github.com/elm/error-message-catalog/issues/315"
labels: []
---

# Issue #315: Adding a plus sign to numbers is not explicit about pluses not being allowed

**State:** `OPEN` | **Author:** @ChristophP | **Source:** [https://github.com/elm/error-message-catalog/issues/315](https://github.com/elm/error-message-catalog/issues/315)

## Description

```
---- Elm 0.19.1 ----------------------------------------------------------------
Say :help for help and :exit to exit! More at <https://elm-lang.org/0.19.1/repl>
--------------------------------------------------------------------------------
> +1
|   
-- MISSING EXPRESSION ----------------------------------------------------- REPL

I am partway through parsing the `repl_input_value_` definition, but I got stuck
here:

2| repl_input_value_ =
3|   +1
     ^
I was expecting to see an expression like 42 or "hello". Once there is something
there, I can probably give a more specific hint!

Note: This can also happen if run into reserved words like `let` or `as`
unexpectedly. Or if I run into operators in unexpected spots. Point is, there
are a couple ways I can get confused and give sort of weird advice!
```
The confusing part is that the compiler complains about a missing expression rather than saying that the `plus` is the problem here. Lots of languages permit adding a plus sign in front of a number. Some ppl might intuitively write something like `if up then +1 else -1` and run into this error. Would be nicer to say that `+` sign are not allowed in Elm then to say `Missing Expression`.
