---
issue_number: 154
title: "Assume type annotations are correct"
state: CLOSED
author: "evancz"
created_at: "2016-08-10T04:00:48Z"
url: "https://github.com/elm/error-message-catalog/issues/154"
labels: ['types', 'meta']
---

# Issue #154: Assume type annotations are correct

**State:** `CLOSED` | **Author:** @evancz | **Source:** [https://github.com/elm/error-message-catalog/issues/154](https://github.com/elm/error-message-catalog/issues/154)

## Description

## Description

Lots of folks would prefer that we assume type annotations are correct. Take the following declaration for example:

``` elm
add : Int -> Int -> Int
add x y = ...
```

Right now, the compiler figures out the types of `x` and `y` based on usage, then sees if it matches the annotation.

Forcing the compiler to treat `x` and `y` as integers before solving for `..` is actually much trickier than it sounds. Besides some tricky technical details, you'd want the error message to say "We only think it's an `Int` because of the type annotation" which is nontrivial to track.
## Evidence

The point here is to aggregate issues that are asking for this in various forms:
- #28 - interesting one. Illustrates that we should also trust the return type.
- #140 - directly suggesting this change
- #148 - misspelled field manifesting as type annotation problem
- #125 - simple `view` annotation is not trusted, hiding much nicer message
- #70 - simple `view` annotation is not trusted, hiding much nicer message
- #83 - bad usage in `let` leads to error on correct usage in body

