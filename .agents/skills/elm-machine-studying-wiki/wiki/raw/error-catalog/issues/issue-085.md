---
issue_number: 85
title: "Accidental list wrapping causes INFINITE TYPE \"weird self-referential type\" error"
state: OPEN
author: "davidmason"
created_at: "2016-02-15T02:20:08Z"
url: "https://github.com/elm/error-message-catalog/issues/85"
labels: ['no sscce']
---

# Issue #85: Accidental list wrapping causes INFINITE TYPE "weird self-referential type" error

**State:** `OPEN` | **Author:** @davidmason | **Source:** [https://github.com/elm/error-message-catalog/issues/85](https://github.com/elm/error-message-catalog/issues/85)

## Description

moved from from https://github.com/elm-lang/elm-compiler/issues/1208

Messing with the [binary tree example](http://elm-lang.org/examples/binary-tree), I accidentally used `[]` instead of `()` around a recursive call, and the error seems like it was way off. Reporting in case it can be made friendlier
## Code

``` elm
flatten : Tree a -> List a
flatten tree =
  case tree of
    Empty -> []
    Node v left right ->   (flatten left) ++ [v] ++ [flatten right]  -- oops, should have been (flatten right)
```
## Error output

```
INFINITE TYPE
I am inferring a weird self-referential type for `left`

154|     Node v left right ->   (flatten left) ++ [v] ++ [flatten right]
Here is my best effort at writing down the type. You will see ? and â^H^^ for parts
of the type that repeat something already printed out infinitely.

    Tree ?

Usually staring at the type is not so helpful in these cases, so definitely read
the debugging hints for ideas on how to figure this out:
<https://github.com/elm-lang/elm-compiler/blob/0.16.0/hints/infinite-type.md>
```

@newlandsvalley also noted that the same error happens when using cons by mistake to try to append lists. https://github.com/elm-lang/elm-compiler/issues/1208#issuecomment-178685076
## Hypothesis

It looks like both cases are accidental nesting of lists within lists: wrapping in `[]` or using cons instead of `++` would both accidentally give a nested list.

Perhaps there is a way to check, when there is a "weird self-referential type", whether some of the common causes are present.
### Cases identified so far

Where the following are each a return value in the function `flatten : Tree a -> List a`
- `(flatten left) ++ [v] ++ [flatten right]` - meant to use `(flatten right)`
- `(flatten left) :: v :: (flatten right)` - meant to use `++ [v] ++`
- `(flatten left) :: v :: (flatten right)` - meant to use `List.append (flatten left) (v :: flatten right)`

