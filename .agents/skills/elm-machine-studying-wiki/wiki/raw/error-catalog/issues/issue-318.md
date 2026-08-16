---
issue_number: 318
title: "Compiling an empty model gives unhelpful error message"
state: OPEN
author: "dasch"
created_at: "2019-10-28T14:12:38Z"
url: "https://github.com/elm/error-message-catalog/issues/318"
labels: []
---

# Issue #318: Compiling an empty model gives unhelpful error message

**State:** `OPEN` | **Author:** @dasch | **Source:** [https://github.com/elm/error-message-catalog/issues/318](https://github.com/elm/error-message-catalog/issues/318)

## Description

Elm version: 0.19.1.

Given this source:

```elm
module Main exposing (..)
```

When compiling with `elm make src/Hello.elm`, I get the following error message.

```
Detected problems in 1 module.
-- EMPTY MODULE --------------------------------------------- src/Hello.elm

I am trying to parse a declaration, but I am getting stuck here:

2|
   ^
When a line has no spaces at the beginning, I expect it to be a declaration like
one of these:

    greet : String -> String
    greet name =
      "Hello " ++ name ++ "!"

    type User = Anonymous | LoggedIn String

Try to make your declaration look like one of those? Or if this is not supposed
to be a declaration, try adding some spaces before it?
```

Coming from many other languages, you'd typically consider compiling an empty class or module after saving it, as a small step to check that things are working. Or even when learning Elm, wanting to add one line at a time.

How about either 1) not considering this an error at all, or 2), use a more helpful error message, e.g.

```
Detected problems in 1 module.
-- WEIRD DECLARATION --------------------------------------------- src/Hello.elm

Modules in Elm need at least one declaration, for example a function or type definition.

Try adding this to your module:

    greet : String -> String
    greet name =
      "Hello " ++ name ++ "!"

If you need help writing your first module, check out this tutorial: <https://guide.elm-lang.org/webapps/modules.html>.
```
