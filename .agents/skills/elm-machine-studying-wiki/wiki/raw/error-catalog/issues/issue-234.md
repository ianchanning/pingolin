---
issue_number: 234
title: "Html.div expects both 2 and 3 arguments."
state: OPEN
author: "rtavenner"
created_at: "2017-08-23T20:59:07Z"
url: "https://github.com/elm/error-message-catalog/issues/234"
labels: ['types']
---

# Issue #234: Html.div expects both 2 and 3 arguments.

**State:** `OPEN` | **Author:** @rtavenner | **Source:** [https://github.com/elm/error-message-catalog/issues/234](https://github.com/elm/error-message-catalog/issues/234)

## Description

When I try to compile this code:

    import Html
    main = Html.div [] [] [] []

I get two errors:

    -- TYPE MISMATCH --------------------------------------------------------------- 
    
    Function `div` is expecting 3 arguments, but was given 4.
    
    2|        Html.div [] [] [] []
                                ^^
    Maybe you forgot some parentheses? Or a comma?
    
    -- TYPE MISMATCH --------------------------------------------------------------- 
    
    Function `div` is expecting 2 arguments, but was given 4.
    
    2|        Html.div [] [] [] []
                             ^^^^^
    Maybe you forgot some parentheses? Or a comma?

I should only get the second error.

