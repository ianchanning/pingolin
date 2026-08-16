---
issue_number: 361
title: "Issue with extensible records and unit type"
state: OPEN
author: "JonathanLorimer"
created_at: "2023-10-26T21:36:02Z"
url: "https://github.com/elm/error-message-catalog/issues/361"
labels: []
---

# Issue #361: Issue with extensible records and unit type

**State:** `OPEN` | **Author:** @JonathanLorimer | **Source:** [https://github.com/elm/error-message-catalog/issues/361](https://github.com/elm/error-message-catalog/issues/361)

## Description

**Quick Summary:**  I got a very confusing error when I applied an extensible record to a unit type. Obviously this is wrong, but better compiler info about where the error is would be great!

## SSCCE

```elm
module Issue exposing (..)

type alias ExtRec a =
    { a | foo : Int }

type alias Model = ()

f : ExtRec Model
f = Debug.todo "implement"
```

- **Elm:** 0.19.1
- **Browser:** Not in browser
- **Operating System:** NixOS 23.11.20230830.a63a64b (Tapir) x86_64


## Additional Details
<details open>
<summary>Full error message</summary>
<pre><code>
Compiling ...+-------------------------------------------------------------------------------
|  Corrupt File: /path/to/repo/elm-stuff/0.19.1/Issue.elmi
|   Byte Offset: 0
|       Message: not enough bytes
|
| Please report this to https://github.com/elm/compiler/issues
| Trying to continue anyway.
+-------------------------------------------------------------------------------

elm: Used toAnnotation on a type that is not well-formed
CallStack (from HasCallStack):
  error, called at compiler/src/Type/Type.hs:413:21 in main:Type.Type

-- ERROR -----------------------------------------------------------------------

I ran into something that bypassed the normal error reporting process! I
extracted whatever information I could from the internal error:

>   thread blocked indefinitely in an MVar operation

These errors are usually pretty confusing, so start by asking around on one of
forums listed at https://elm-lang.org/community to see if anyone can get you
unstuck quickly.

-- REQUEST ---------------------------------------------------------------------

If you are feeling up to it, please try to get your code down to the smallest
version that still triggers this message. Ideally in a single Main.elm and
elm.json file.

From there open a NEW issue at https://github.com/elm/compiler/issues with your
reduced example pasted in directly. (Not a link to a repo or gist!) Do not worry
about if someone else saw something similar. More examples is better!

This kind of error is usually tied up in larger architectural choices that are
hard to change, so even when we have a couple good examples, it can take some
time to resolve in a solid way.elm: thread blocked indefinitely in an MVar operation
</code></pre>
</details>
