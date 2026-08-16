---
issue_number: 302
title: "Unclear hint for parsing errors involving incorrect arity in complex types."
state: OPEN
author: "jmbromley"
created_at: "2019-08-30T11:08:47Z"
url: "https://github.com/elm/error-message-catalog/issues/302"
labels: ['types']
---

# Issue #302: Unclear hint for parsing errors involving incorrect arity in complex types.

**State:** `OPEN` | **Author:** @jmbromley | **Source:** [https://github.com/elm/error-message-catalog/issues/302](https://github.com/elm/error-message-catalog/issues/302)

## Description

In Elm 0.19.1 the hint provided when the inferred type doesn't match the arity of the type annotation is:

> Hint: It looks like it takes too many arguments. I see 1 extra.

However, when this occurs within a complex type (e.g. as one of the type parameters) this hint isn't too helpful and could even be confusing.

For example, when using the `Url.Parser` library, the following incorrect code (reduced from the real world problem at https://discourse.elm-lang.org/t/cryptic-type-error-with-url-parser/2214):

```
module MyParser exposing (..)

import Url.Parser exposing ((</>))


myParser : Url.Parser.Parser (String -> String) String
myParser =
    Url.Parser.string </> Url.Parser.string

```

triggers the error:


> Something is off with the body of the `myParser` definition:
>
> 8|     Url.Parser.string </> Url.Parser.string
>        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> The body is:
>
>     Url.Parser.Parser (String -> String -> String) String
>
> But the type annotation on `myParser` says it should be:
>
>     Url.Parser.Parser (String -> String) String
>
> Hint: It looks like it takes too many arguments. I see 1 extra.

But this hint is potentially confusing to the user who may not understand the Url.Parser library that well.  In complex cases like this a more directed hint may be more useful, although it is difficult to know exactly what such a hint would look like!

The best I can come up with would be something like:

> Hint: The type parameters to `myParser` don't match what I was expecting.  Maybe you used the wrong function in creating it?  Or maybe one of those functions required an extra argument?


