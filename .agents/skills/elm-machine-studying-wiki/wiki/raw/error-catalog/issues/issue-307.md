---
issue_number: 307
title: "Confusing message for `UNEXPECTED CAPITAL LETTER`"
state: OPEN
author: "jfmengels"
created_at: "2019-10-18T18:10:15Z"
url: "https://github.com/elm/error-message-catalog/issues/307"
labels: []
---

# Issue #307: Confusing message for `UNEXPECTED CAPITAL LETTER`

**State:** `OPEN` | **Author:** @jfmengels | **Source:** [https://github.com/elm/error-message-catalog/issues/307](https://github.com/elm/error-message-catalog/issues/307)

## Description

I saw the following error message with Elm 0.19.1.

```
-- UNEXPECTED CAPITAL LETTER -------------------------------------- src/Main.elm

Declarations always start with a lower-case letter, so I am getting stuck here:

3| ToFullName : Student -> String
   ^
Try a name like toFullName instead?

Note: Here are a couple valid declarations for reference:

    greet : String -> String
    greet name =
      "Hello " ++ name ++ "!"

    type User = Anonymous | LoggedIn String

Notice that they always start with a lower-case letter. Capitalization matters!
```

I think the association of showing a type with a upper-case letter and the sentence `Notice that they always start with a lower-case letter` is a bit confusing. As in "what do you mean they always start with a lower-case letter? You showed me an example of one with an upper-case letter."
