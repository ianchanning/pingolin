---
issue_number: 83
title: "Misleading type error (with SSCCE)"
state: CLOSED
author: "jvoigtlaender"
created_at: "2016-02-08T06:44:34Z"
url: "https://github.com/elm/error-message-catalog/issues/83"
labels: ['types']
---

# Issue #83: Misleading type error (with SSCCE)

**State:** `CLOSED` | **Author:** @jvoigtlaender | **Source:** [https://github.com/elm/error-message-catalog/issues/83](https://github.com/elm/error-message-catalog/issues/83)

## Description

Update: Same in 0.17.

The following example appears in a comment in https://github.com/elm-lang/error-message-catalog/issues/71. That issue was labelled as `no sscce`, so I'm opening a new issue with the SSCCE right in the opening comment here.

The code

``` elm
test : List String -> List String
test list =
  let
    l = floor list
  in
    List.reverse list
```

gives the following error message in 0.16 (e.g., on http://elm-lang.org/try):

```
The argument to function `reverse` is causing a mismatch.
6|     List.reverse list

Function `reverse` is expecting the argument to be:

    List a

But it is:

    Float
```

That runs counter to the intention of the programmer, who annotated `list` to be a `List String`, and whose real error is actually the expression `floor list`, not the expression `List.reverse list`. In particular, from the 0.16 announcement, http://elm-lang.org/blog/compilers-as-assistants#expected-vs-actual, the programmer could expect help, not confusion, here.

The 0.15 error message for this same example was (according to http://share-elm.com/):

```
Type mismatch between the following types between lines 3 and 6:

        List String

        Float

    It is related to the following expression:

        let l = floor list in List.reverse list

Type mismatch between the following types on line 6, column 18 to 22:

        Float

        List a

    It is related to the following expression:

        list
```

That includes the expression, `floor list`, with the real problem, and it doesn't make a misleading judgement on what the type of `list` "is".

