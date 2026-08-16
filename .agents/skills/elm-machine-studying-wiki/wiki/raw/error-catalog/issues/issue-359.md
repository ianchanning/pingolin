---
issue_number: 359
title: "No `-- comments` above module: isn't so clear for a beginner?"
state: OPEN
author: "badlydrawnrob"
created_at: "2024-01-07T18:38:34Z"
url: "https://github.com/elm/error-message-catalog/issues/359"
labels: []
---

# Issue #359: No `-- comments` above module: isn't so clear for a beginner?

**State:** `OPEN` | **Author:** @badlydrawnrob | **Source:** [https://github.com/elm/error-message-catalog/issues/359](https://github.com/elm/error-message-catalog/issues/359)

## Description

It took me a while to find out why this error message was complaining, working my way through [Elm In Action](https://livebook.manning.com/book/elm-in-action/chapter-2):

```terminal
-- RESERVED WORD  /elm-in-action/02/src/PhotoGroove.elm

I was not expecting to run into the `module` keyword here:

21| module PhotoGroove exposing (main)
    ^^^^^^
It is a reserved word. Try changing the name to something else?
```

Also took me a while [to find this thread comment](https://github.com/elm/compiler/issues/1311#issuecomment-198569901) on **no comments allowed above the `module`** statement:

```elm
{-| Beginning our Elm app:
    Photo Groove!
-}

-- #1
module PhotoGroove exposing (main)
```

I don't think Python or Racket lang have this restriction and it may not be clear enough for complete beginners that it isn't allowed. I'm used to doing this in HTML/CSS also!

So please make the error message more helpful, and introduce documenting guidelines in the [Elm guide](https://guide.elm-lang.org) on modules etc, I couldn't find [this document](https://package.elm-lang.org/help/documentation-format) easily:

> The module documentation comes after the module declaration, but before the imports. This is so the first thing in the file is the module name and the second is how to use it.

Perhaps that could be worded a little better? `"comments must be written after the module declaration" or something.

Thanks.
