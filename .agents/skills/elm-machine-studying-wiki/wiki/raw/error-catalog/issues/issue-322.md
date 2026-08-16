---
issue_number: 322
title: "Recursive calls in `let` fail cryptically when using arrays/records"
state: OPEN
author: "showell"
created_at: "2019-11-04T14:54:20Z"
url: "https://github.com/elm/error-message-catalog/issues/322"
labels: []
---

# Issue #322: Recursive calls in `let` fail cryptically when using arrays/records

**State:** `OPEN` | **Author:** @showell | **Source:** [https://github.com/elm/error-message-catalog/issues/322](https://github.com/elm/error-message-catalog/issues/322)

## Description

So the original motivation for this bug report was I using `Parser` to parse something akin to JSON.  Getting a minimal repro on that was difficult, so let's go to our old friend "factorial".

The below code works fine (the key thing to note is that `f` is inside the `let`):

```elm
factorial num =
    let
        f n =
            if n == 0 then
                1

            else
                n * f (n - 1)
    in
    f num
```

And this code works fine:

```elm
eval f x =
    f () x


func =
    { f =
        \n ->
            if n == 0 then
                1

            else
                n * eval (\_ -> func.f) (n - 1)
    }


factorial num =
    func.f num
```

This nearly identical code won't compile:

```elm
factorial num =
    let
        eval f x =
            f () x


        func =
            { f =
                \n ->
                    if n == 0 then
                        1

                    else
                        n * eval (\_ -> func.f) (n - 1)
            }
    in
    func.f num
```
The error is below.  It's misleading, because `func` is defined **indirectly** in terms of itself.  `func` doesn't directly call itself--it uses a lambda.  The error message should somehow suggest that recursive functions must be top-level (but it's more subtle than that--something about putting `func` in the record there is causing the error).

```
The `func` value is defined directly in terms of itself, causing an infinite
loop.

43|         func =
            ^^^^
Are you are trying to mutate a variable? Elm does not have mutation, so when I
see func defined in terms of func, I treat it as a recursive definition. Try
giving the new value a new name!

Maybe you DO want a recursive value? To define func we need to know what func
is, so let’s expand it. Wait, but now we need to know what func is, so let’s
expand it... This will keep going infinitely!

Hint: The root problem is often a typo in some variable name, but I recommend
reading <https://elm-lang.org/0.19.0/bad-recursion> for more detailed advice,
especially if you actually do need a recursive value.
Detected errors in 1 module.
```
