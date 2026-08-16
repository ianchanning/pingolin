---
issue_number: 236
title: "Unclear/misleading error when missing type parameter in type definitions"
state: CLOSED
author: "gyzerok"
created_at: "2017-09-01T08:33:51Z"
url: "https://github.com/elm/error-message-catalog/issues/236"
labels: ['types']
---

# Issue #236: Unclear/misleading error when missing type parameter in type definitions

**State:** `CLOSED` | **Author:** @gyzerok | **Source:** [https://github.com/elm/error-message-catalog/issues/236](https://github.com/elm/error-message-catalog/issues/236)

## Description

### SSCCE

https://ellie-app.com/4bwZVb3bnPGa1/2

```elm
type Test a b c
    = A a
    | B b
    | C c


testAsString : Test String Int -> String
testAsString test =
    case test of
        A str ->
            str

        B int ->
            toString int

        C str ->
            str
```

### Actual error

```
Tag **Main.A** is causing problems in this pattern match.
The pattern matches things of type:

Test a b c

But the values it will actually be trying to match are:

Test String Int
```

### Expected error

The error is actually not in pattern match but in type definition. One forgot to specify extra type parameter.

I would expect to see something along the lines:

```
Type Test String Int is causing problems in this type definition.

42| testAsString : Test String Int -> String
                   ^^^^^^^^^^^^^^^
Type Test a b c was given 2 parameters:

testAsString : Test String Int -> String

But it expects 3:

testAsString : Test String Int c? -> String
```
