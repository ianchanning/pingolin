---
issue_number: 260
title: "Pattern matching type mismatch error could be more helpful"
state: CLOSED
author: "gyzerok"
created_at: "2018-06-25T11:48:57Z"
url: "https://github.com/elm/error-message-catalog/issues/260"
labels: ['types']
---

# Issue #260: Pattern matching type mismatch error could be more helpful

**State:** `CLOSED` | **Author:** @gyzerok | **Source:** [https://github.com/elm/error-message-catalog/issues/260](https://github.com/elm/error-message-catalog/issues/260)

## Description

After one year of writing Elm for production I've noticed that this error is the most difficult to debug for me.

Currently Elm promotes the idea of flatter module structure. It also means having bigger `update` function with many cases. When you have a type mismatch between cases, compiler will tell you, that there is mismatch between N and N+1 case. In the bigger cases it's impossible to say from the quick glance which one is N.

Following is a small example. Of course in this specific case one can find error pretty fast. But in the real app bodies of the cases would contain somewhat big pieces of business logic. Then you are usually stuck trying to look into cases and sometimes even counting them to realize which one is N and which one is N+1.

```elm
type Test
    = Foo
    | Bar
    | Baz
    | Hello
    | World


test : Test -> String
test x =
    case x of
        Foo ->
            "foo"

        Bar ->
            "bar"

        Baz ->
            42

        Hello ->
            "hello"

        World ->
            "world"
```

```
The 2nd and 3rd branches of this `case` produce different types of values.

The 2nd branch has this type:

    String

But the 3rd is:

    number

Hint: All branches in a `case` must have the same type. So no matter which one
we take, we always get back the same type of value.
```

Instead the error could specify match itself and point out the line numbers. For example:

```
The 2nd and 3rd branches of this `case` produce different types of values.

The 2nd branch 

15|        Bar ->

has this type:

    String

But the 3rd

18|        Baz ->

has this type:

    number

Hint: All branches in a `case` must have the same type. So no matter which one
we take, we always get back the same type of value.
```
