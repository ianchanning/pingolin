---
issue_number: 288
title: "Confusing error message with type alias and incorrect list item type"
state: OPEN
author: "nonpop"
created_at: "2018-12-24T07:57:00Z"
url: "https://github.com/elm/error-message-catalog/issues/288"
labels: ['types']
---

# Issue #288: Confusing error message with type alias and incorrect list item type

**State:** `OPEN` | **Author:** @nonpop | **Source:** [https://github.com/elm/error-message-catalog/issues/288](https://github.com/elm/error-message-catalog/issues/288)

## Description

Trying to compile this module:
```elm
module SSCCE exposing (sscce)


type alias ListOfInts =
    List Int


sscce : ListOfInts -> ListOfInts
sscce list =
    "oops" :: list
```
gives the following error messages:
```
-- TYPE MISMATCH ------------------------------------------------- src/SSCCE.elm

Something is off with the body of the `sscce` definition:

10|     "oops" :: list
        ^^^^^^^^^^^^^^
The body is:

    List String

But the type annotation on `sscce` says it should be:

    ListOfInts

-- TYPE MISMATCH ------------------------------------------------- src/SSCCE.elm

The (::) operator can only add elements onto lists.

10|     "oops" :: list
                  ^^^^
This `list` value is a:

    ListOfInts

But (::) needs a List on the right.
```
 - The first message is a little confusing because it seems to claim that the body type checks as `List String`.
 - The second one is a lot confusing, because it claims that `ListOfInts` is not a list type. If you only see this error and not the first one you're going to have a hard time fixing it (speaking from experience; there it was not so clear that the new head was of incorrect type).
