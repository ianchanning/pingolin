---
issue_number: 350
title: "Better error message when attempting Haskell-style pattern matching"
state: OPEN
author: "Gaelan"
created_at: "2021-04-04T00:12:00Z"
url: "https://github.com/elm/error-message-catalog/issues/350"
labels: ['parser']
---

# Issue #350: Better error message when attempting Haskell-style pattern matching

**State:** `OPEN` | **Author:** @Gaelan | **Source:** [https://github.com/elm/error-message-catalog/issues/350](https://github.com/elm/error-message-catalog/issues/350)

## Description

**Quick Summary:** When attempting to do Haskell-style pattern matching (multiple function declarations instead of one declaration with a `case`), the error message could be more helpful.

## SSCCE

```elm
-- It's debatable whether this function is a good idea, but that's besides the point.
expect : String -> Maybe a -> a
expect _ (Just x) = x
expect msg Nothing = Debug.todo msg
```

```
This file has multiple `expect` declarations. One here:

3| expect msg Nothing = Debug.todo msg
   ^^^^^^
And another one here:

2| expect _ (Just x) = x
   ^^^^^^
How can I know which one you want? Rename one of them!
```


- **Elm:** whatever's currently on https://elm-lang.org/try


## Additional Details

I learned Haskell before I learned Elm. Elm's similar enough that generally I can just write the same code I'd write in Haskell, and it works; when that's not the case, it's easy to get very confused (but you do know which one I want! they have distinct patterns!). Given that the mistake above is, I imagine, fairly common for (a certain type of) new Elm programmers, it'd be great if we got a more specific message, along the lines of "if you're trying to match on multiple patterns, use a single declaration and `case`" would be quite helpful.
