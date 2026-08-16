---
issue_number: 317
title: "Confusing error when function that takes \"number\"s must take \"Int\"s"
state: OPEN
author: "harrysarson"
created_at: "2019-10-26T20:32:11Z"
url: "https://github.com/elm/error-message-catalog/issues/317"
labels: []
---

# Issue #317: Confusing error when function that takes "number"s must take "Int"s

**State:** `OPEN` | **Author:** @harrysarson | **Source:** [https://github.com/elm/error-message-catalog/issues/317](https://github.com/elm/error-message-catalog/issues/317)

## Description

I have a fairly complex function with type signature

```elm
approxSearchFolder : String -> Nonempty Int -> Int -> Char -> Trie a -> Maybe (ApproxSearchHelpResult Int a) -> Maybe (ApproxSearchHelpResult Int a)
```

as part of an elm program. When refactoring I changed the type signature to 

```elm
approxSearchFolder : String -> Nonempty number -> number -> Char -> Trie a -> Maybe (ApproxSearchHelpResult number a) -> Maybe (ApproxSearchHelpResult number a)
```

i.e. I replaced `Int` with `number`. All compiling well so far. 

I then changed one of the variables I pass to this function from an `Int` to a `Float`. The compiler works out that it is invalid to call this function with some arguments using a `number` as an `Int` and others using `number` as a `Float` and so gives an error.
The problem, is that the error is not very helpful. 

```
🚨  /home/harry/elm/welsh-whacker/src/Main.elm: Compilation failed
Compiling ...-- TYPE MISMATCH --------------------------------------------------- src/Lib.elm

The 3rd argument to `approxSearchFolder` is not what I expect:

68|                     (approxSearchFolder
69|                         word
70|                         currentRow
71|                         maxCost
                            ^^^^^^^
This `maxCost` value is a:

    number

But ``approxSearchFolder` needs the 3rd argument to be:

    Int

Hint: I always figure out the argument types from left to right. If an argument
is acceptable, I assume it is “correct” and move on. So the problem may actually
be in one of the previous arguments!

Hint: The `number` in your type annotation is saying that ints AND floats can
flow through, but your code is saying it specifically wants a `Int` value. Maybe
change your type annotation to be more specific? Maybe change the code to be
more general?

Read <https://elm-lang.org/0.19.1/type-annotations> for more advice!

Detected problems in 1 module.
```

Now, I had just refactored the type signature of `approxSearchFolder` so that the 3rd argument could be a number and yet the compiler was telling me that `approxSearchFolder`'s 3rd argument needed to be an `Int`. But I had just changed that! I spent quite a while trying to make sure that my file watcher was correctly recompiling my code assuming that it was showing an out of date compiler error.

A much more useful error would have been to inform me that the 2nd argument (`currentRow`) was a `Nonempty Int` and therefore, for this call of the function `number` **must** be `Int`.

Hope this is a helpful thing to catalogue. Thanks! 
