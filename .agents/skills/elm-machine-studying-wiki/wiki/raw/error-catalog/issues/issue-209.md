---
issue_number: 209
title: "It would be helpful if --warn notified of unused arguments in functions"
state: OPEN
author: "steatopygous"
created_at: "2017-03-28T21:28:01Z"
url: "https://github.com/elm/error-message-catalog/issues/209"
labels: []
---

# Issue #209: It would be helpful if --warn notified of unused arguments in functions

**State:** `OPEN` | **Author:** @steatopygous | **Source:** [https://github.com/elm/error-message-catalog/issues/209](https://github.com/elm/error-message-catalog/issues/209)

## Description

Consider this code

    module UnusedArguments exposing (..)

    import Html exposing (Html, text)

    main : Html msg
    main =
          text (f "Hello" " world!")

    f : String -> String -> String -> String
        f a b c =
            a ++ b

Notice how function f has three arguments, but only two are used.  The compiler error message is

    -- TYPE MISMATCH ------------------------------------------------------ Main.elm

    The argument to function `text` is causing a mismatch.

    7|     text (f "Hello" " world!")
             ^^^^^^^^^^^^^^^^^^^
    Function `text` is expecting the argument to be:

        String

    But it is:

        String -> String

    Hint: It looks like a function needs 1 more argument.

    Detected errors in 1 module.

which definitely made sense, once I understood what it was telling me.

However, I spent ages staring at a similar piece of code, not understanding what it was telling me.  What had happened was that when writing the function, I'd originally thought I was going to need the extra parameter, but ended up not, and forgot to get rid of it.

I think the reason was that the error message is talking about the argument to text, so I was looking at the return type of the called function and saying to myself "but, it DOES return String".

Given that the argument c is not referenced at all in the function body, it is quite likely that's the root cause of the issue.

Like unused imports, unused arguments are "unhygienic", so perhaps the --warn option could notify the developer that this is perhaps unintended.  Maybe it should even be the default behaviour, even without --warn.

I think it would definitely help anyone who's starting out with Elm, particularly if they're new to functional programming and type inference, as I am.

