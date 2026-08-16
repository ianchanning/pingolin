---
issue_number: 351
title: "Two multiline comments without code between them trigger a parsing error "
state: OPEN
author: "pdamoc"
created_at: "2021-02-18T18:51:41Z"
url: "https://github.com/elm/error-message-catalog/issues/351"
labels: []
---

# Issue #351: Two multiline comments without code between them trigger a parsing error 

**State:** `OPEN` | **Author:** @pdamoc | **Source:** [https://github.com/elm/error-message-catalog/issues/351](https://github.com/elm/error-message-catalog/issues/351)

## Description

## SSCCE

```elm
module Error exposing (..)

import Dict


{-| Foo
-}


{-| Foo
-}
x =
    1
```

- **Elm:** 0.19.1
- **Operating System:** mac


## Additional Details

The actual compiler error starts with `I am getting stuck because this line starts with the { symbol:` 

This was triggered by commenting out a function that had documentation comments above while bellow it there were other functions with documentation comments.  The code looked more like this:

```elm 
{-| Foo
-}
-- addOne : number -> number
-- addOne arg =
--    arg + 1 

{-| Foo
-} 
```

In the SSCCE, if `import Dict` is removed, the error goes away. 

If both `import Dict` and `x =1` are removed the another parser error is displayed with the parser getting stuck on the last empty line. 
