---
issue_number: 259
title: "Misleading error message on incorrect number of type parameters"
state: CLOSED
author: "jhf"
created_at: "2018-06-25T11:43:52Z"
url: "https://github.com/elm/error-message-catalog/issues/259"
labels: []
---

# Issue #259: Misleading error message on incorrect number of type parameters

**State:** `CLOSED` | **Author:** @jhf | **Source:** [https://github.com/elm/error-message-catalog/issues/259](https://github.com/elm/error-message-catalog/issues/259)

## Description

I think that an obviosly incorrect application of type parameters - such as when the number of type parameters do not match the number of type parameters supported by the type - should have a better error message.

This is motivated by my recent experience onboarding some new people to Elm, and one of them managed to bury himself into a type error where I think the compiler could have done a much better job.
Simplified the user tried:
```
type alias Model = Maybe List String

a : Model
a = Just ["a"]

b : Maybe List String
b = Just ["b"]
```
But got no compiler warnings that `Maybe` only takes 1 type parameter - so `Maybe List String` isn't a valid constructable type.
Instead he got an error message he did not manage to decipher correctly, as the error message focuses on how the values fail to match the type but nothing suggests that on line 1 there is an impossible type.
Failing to grasp the difference between `Maybe List String` and `Maybe (List String)` is of course something one must learn, and I think the compiler can help in this regard.
```
Detected errors in 1 module.


-- TYPE MISMATCH ---------------------------------------------------------------

The definition of `a` does not match its type annotation.

4| a : Model
5|>a = Just ["a"]

The type annotation for `a` says it is a:

    Model

But the definition (shown above) is a:

    Maybe (List String)



-- TYPE MISMATCH ---------------------------------------------------------------

The definition of `b` does not match its type annotation.

7| b : Maybe List String
8|>b = Just ["b"]

The type annotation for `b` says it is a:

    Maybe List String

But the definition (shown above) is a:

    Maybe (List String)


```

I would have hoped for an error message more like:
```
Type `Maybe` is expecting 1 arguments, but was given 2.

1| type alias Model = Maybe List String
                            ^^^^^^^^^^^
Maybe you forgot some parentheses? Or a comma?
```

```
Type `Maybe` is expecting 1 arguments, but was given 2.

6| b : Maybe List String
             ^^^^^^^^^^^
Maybe you forgot some parentheses? Or a comma?
```

Once elm tackle too many type arguments, tackling too few would also be good.
So for the following code:
```
import Html exposing (text)

main =
  text (detect (Ok "a"))

detect : Result String -> String
detect result =
  case result of
    Ok s -> s
    
    Err _ ->
      "A Problem"
```
Has an issue where `Result` only has one type argument, but should have had two.
The error message is then not focusing on the place where the type is defined, but rather on the places where it is used:
```
Detected errors in 1 module.


-- TYPE MISMATCH ---------------------------------------------------------------

The argument to function `detect` is causing a mismatch.

5|         detect (Ok "a")
                   ^^^^^^
Function `detect` is expecting the argument to be:

    Result String

But it is:

    Result error String



-- TYPE MISMATCH ---------------------------------------------------------------

Tag `Result.Ok` is causing problems in this pattern match.

10|     Ok s -> s
        ^^^^
The pattern matches things of type:

    Result error value

But the values it will actually be trying to match are:

    Result String
```

I was hoping to get an easier to grasp error message, that focuses on right line:
```
Detected errors in 1 module.


-- TYPE MISMATCH ---------------------------------------------------------------

The argument to function `text` is causing a mismatch.

6| detect : Result String -> String
            ^^^^^^^^^^^^^
Type `Result` is expecting the argument to be:

    String a

But it is:

    String

Hint: It looks like a type needs 1 more argument.
```
