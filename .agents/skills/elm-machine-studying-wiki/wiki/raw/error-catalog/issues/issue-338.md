---
issue_number: 338
title: "Report of incorrect/extraneous fields should not suggest already present fields"
state: OPEN
author: "jfmengels"
created_at: "2020-05-16T14:54:06Z"
url: "https://github.com/elm/error-message-catalog/issues/338"
labels: []
---

# Issue #338: Report of incorrect/extraneous fields should not suggest already present fields

**State:** `OPEN` | **Author:** @jfmengels | **Source:** [https://github.com/elm/error-message-catalog/issues/338](https://github.com/elm/error-message-catalog/issues/338)

## Description

```elm
module Main exposing (a)

type alias A = { foo : ()}

a : A
a = { foo = (), foo2 = () }
```

The code above gives the following error:

```text
Something is off with the body of the `a` definition:

6| a = { foo = (), foo2 = () }
       ^^^^^^^^^^^^^^^^^^^^^^^
The body is a record of type:

    { foo : (), foo2 : () }

But the type annotation on `a` says it should be:

    A

Hint: Seems like a record field typo. Maybe foo2 should be foo?

Hint: Can more type annotations be added? Type annotations always help me give
more specific messages, 
```

The first hint suggests `foo2` should be `foo`. But we know we already have `foo` in the record, so this hint is not very helpful.

I suggest to remove the already present fields from the list of fields to suggest. If there are fields remaining, then we could suggest those instead (`Maybe foo2 should be abcd`). If there are none remaining, meaning that this field is an unexpected extraneous field, then we could suggest to remove it instead.

### Additional details

I often run into this problem with using (extensible) records as phantom types, like in the following example:

```elm
module Main exposing (..)

type Thing requirements = Thing

init : Thing { unrelated : () }
init = Thing

withFoo : Thing a -> Thing { a | hasCalledWithFoo : () }
withFoo _ = Thing

finalize : Thing { a | hasCalledWithFoo : () } -> ()
finalize _ = ()

-- Is OK
someThingThatWorks =
  init
  |> withFoo
  |> finalize
  

-- Is OK
someThingThatDoesNotWork =
  init
  -- |> withFoo
  |> finalize
```
([Ellie](https://ellie-app.com/8SndPcbnfsBa1))

This gives the following error message

```text
This function cannot handle the argument sent through the (|>) pipe:

23|   init
24|   -- |> withFoo
25|   |> finalize
         ^^^^^^^^
The argument is:

    Thing { unrelated : () }

But (|>) is piping it to a function that expects:

    Thing { a | hasCalledWithFoo : (), unrelated : () }

Hint: Seems like a record field typo. Maybe hasCalledWithFoo should be
unrelated?

Hint: Can more type annotations be added? Type annotations always help me give
more specific messages, and I think they could help a lot in this case!
```

This is not really helpful, because I already have `unrelated`. What I'd like to know as a user (or rather, what I'd like to convey to the user as the designer of the API), is that `hasCalledWithFoo` is missing and should be added (somehow).

### Unrelated note

The second hint does not really help here either, but I have no suggestion on how to improve this, and is not the point I wanted to raise here.
