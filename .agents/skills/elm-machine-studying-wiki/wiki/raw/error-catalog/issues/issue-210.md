---
issue_number: 210
title: "Redundant pattern for Bool"
state: OPEN
author: "shishkin"
created_at: "2017-03-30T17:12:51Z"
url: "https://github.com/elm/error-message-catalog/issues/210"
labels: ['x-javascript']
---

# Issue #210: Redundant pattern for Bool

**State:** `OPEN` | **Author:** @shishkin | **Source:** [https://github.com/elm/error-message-catalog/issues/210](https://github.com/elm/error-message-catalog/issues/210)

## Description

I define a message type like this:

```
type Msg
    = SignedIn Bool
```

And then pattern match on it in update like this:

```
    case msg of
        SignedIn true ->
            ( 1, Cmd.none )

        SignedIn false ->
            ( -1, Cmd.none )
```

And get the following compiler error:

```
-- REDUNDANT PATTERN ---------------------------------------------- src/Main.elm

The following pattern is redundant. Remove it.

28|         SignedIn false ->
            ^^^^^^^^^^^^^^
Any value with this shape will be handled by a previous pattern.

```

As a newcomer to Elm I've made a mistake of writing `Bool` values in small case so that they're interpreted as variables. It would help newcomers to suggest a casing mistake instead when matching `Bool` values.
