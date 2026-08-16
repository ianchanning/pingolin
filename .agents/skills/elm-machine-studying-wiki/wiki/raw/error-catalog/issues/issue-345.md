---
issue_number: 345
title: "Elm repl gives bad error messages for incorrect capitaliztion"
state: OPEN
author: "YourFin"
created_at: "2020-07-07T07:16:11Z"
url: "https://github.com/elm/error-message-catalog/issues/345"
labels: []
---

# Issue #345: Elm repl gives bad error messages for incorrect capitaliztion

**State:** `OPEN` | **Author:** @YourFin | **Source:** [https://github.com/elm/error-message-catalog/issues/345](https://github.com/elm/error-message-catalog/issues/345)

## Description

**Quick Summary:** When capitalizing a value name in source file, the compiler gives a useful error message that suggests the same name in lower case. The repl, however, does not


## SSCCE
Given Test.elm defined as following:

```elm
module Test exposing (..)

Foo = 12
```

If I try to compile Test.elm, I get the following error message:

    -- UNEXPECTED CAPITAL LETTER ------------------------------------------ Test.elm
    
    Declarations always start with a lower-case letter, so I am getting stuck here:
    
    3| Foo = 12
       ^
    Try a name like foo instead?
    
    Note: Here are a couple valid declarations for reference:
    
        greet : String -> String
        greet name =
          "Hello " ++ name ++ "!"
    
        type User = Anonymous | LoggedIn String
    
    Notice that they always start with a lower-case letter. Capitalization matters!

Which is amazing. Trying the same thing directly on the repl, however, gives this result:

    > Foo = 12
    |
    -- UNEXPECTED EQUALS ------------------------------------------------------ REPL
    I was not expecting to see this equals sign:

    3|   Foo = 12
            ^
            Maybe you want == instead? To check if two values are equal?
            
        Note: I may be getting confused by your indentation. I think I am still parsing
            the `repl_input_value_` definition. Is this supposed to be part of a definition
            after that? If so, the problem may be a bit before the equals sign. I need all
            definitions to be indented exactly the same amount, so the problem may be that
            this new definition has too many spaces in front of it.

Which is not only confusing, and wrong advice, but I have to hit the enter key twice in order for the error to appear, which is confusing. I'm not sure how easy this would be to rectify, but I do know that it would be very confusing to a new programmer who doesn't understand that 

1. The pipe means that more input is needed to evaluate the input
1. Therefore the first line has something wrong, as that one line looks like it should parse and evaluate on its own

- **Elm:** 0.19.1
- **Browser:** Firefox 77.0.1
- **Operating System:** Nixos 20.04

## Additional Details

It also appears that part of some of the repl internals leak with the "I think I am still parsing
the `repl_input_value_` definition." line. 

I also admit that I only briefly looked at the relevant source, but it appears that this is a result of switching on the type of the parser output in [attemptDeclOrExpr](https://github.com/elm/compiler/blob/c4a81fcde7efe9199c0037d1810c08b32ebb7d08/terminal/src/Repl.hs#L328), rather than "running the compiler directly like on a source file" (I'm talking out of my ass here). Maybe this could be fixed by just verifying that the first token isn't capitalized when parsing a Parser.Declaration.Value? 

I could be totally off track with that though.
