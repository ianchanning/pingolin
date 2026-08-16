---
issue_number: 165
title: "Typo checker for type aliases using built-in types"
state: OPEN
author: "ckoster22"
created_at: "2016-09-25T00:20:10Z"
url: "https://github.com/elm/error-message-catalog/issues/165"
labels: ['types']
---

# Issue #165: Typo checker for type aliases using built-in types

**State:** `OPEN` | **Author:** @ckoster22 | **Source:** [https://github.com/elm/error-message-catalog/issues/165](https://github.com/elm/error-message-catalog/issues/165)

## Description

Here's a SSCCE that demonstrates the error when pasted into http://elm-lang.org/try

```
import Html exposing (text)


type alias Model =
  { someNum : int }

model : Model
model = 
  { someNum = 42 }

main =
  toString model |> text
```

The error I get is:

```
Detected errors in 1 module.

-- UNBOUND TYPE VARIABLES ------------------------------------------------------

Type alias `Model` must declare its use of type variable int

5|>type alias Model =
6|>  { someNum : int }

You probably need to change the declaration like this:

type alias Model int = ...

Here's why. Imagine one `Model` where `int` is an Int and another where it is a
Bool. When we explicitly list the type variables, the type checker can see that
they are actually different types.
```

Given that I know that the Elm compiler is capable of doing typo checking, I would expect that the compiler sees I'm trying to declare `someNum` as an `int`, which is a typo of `Int`, a type that is known to the compiler.

I would expect something like this:

```
Detected errors in 1 module.


-- CHANGEME ---------------------------------------------------------------

`int` is not a recognized type.

5|   { someNum : int }
                 ^^^
Based on its usage, `someNum` has this type:

    { someNum : Int }

But you are trying to use it as:

    { someNum : int }

Hint: I compared int with known types and found some potential typos.

    Int <-> int
```

