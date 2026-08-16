---
issue_number: 200
title: "undefined variables gives issue about single quotes"
state: CLOSED
author: "alok"
created_at: "2017-01-21T08:16:37Z"
url: "https://github.com/elm/error-message-catalog/issues/200"
labels: []
---

# Issue #200: undefined variables gives issue about single quotes

**State:** `CLOSED` | **Author:** @alok | **Source:** [https://github.com/elm/error-message-catalog/issues/200](https://github.com/elm/error-message-catalog/issues/200)

## Description

I open `elm-repl` and run the following code:

```elm
-- not defined
s
```

and get the error message:


```
Ran into a single quote in a variable name. This was removed in 0.18!

9|   , section, nav, article, aside, header, footer, address, main', body
                                                                  ^
Change it to a number or an underscore, like main_ or main1

Or better yet, choose a more descriptive name!
```

It should first tell me that the variable is undefined.
