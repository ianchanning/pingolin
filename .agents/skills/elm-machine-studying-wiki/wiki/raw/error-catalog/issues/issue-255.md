---
issue_number: 255
title: "Record definition whitespace"
state: CLOSED
author: "snewell92"
created_at: "2018-03-11T20:55:25Z"
url: "https://github.com/elm/error-message-catalog/issues/255"
labels: ['parser']
---

# Issue #255: Record definition whitespace

**State:** `CLOSED` | **Author:** @snewell92 | **Source:** [https://github.com/elm/error-message-catalog/issues/255](https://github.com/elm/error-message-catalog/issues/255)

## Description

Consider the following elm program that does nothing but fail to compile:

```
type alias Stuff = {
    a : String,
    bananas : Int
}

myStuff : Stuff
myStuff = {
    a = "Hi",
    bananas = 5
}
```

Compiler error says:
```
I need whitespace, but got stuck on what looks like a new declaration. You are
either missing some stuff in the declaration above or just need to add some
spaces here:
```

This is definitely a correct error message ✔️, but it doesn't necessarily clearly explain _why_ to new comers (ie me), and in the spirit of improving the error messages I'd like to submit this reasoning:

In some areas in [the docs](http://elm-lang.org/docs/syntax) about records it would seem that records aren't indentation or white-space sensitive, but maybe the error message could give an example of a style-guide-conforming record definition, like this:

```
myStuff : Stuff
myStuff =
    { a = "Hi"
    , bananas = 5
    }
```

And perhaps a link, reference, or a short blurb on the reasoning about this, or maybe just something like "record definitions like this example one are definitively unambiguous, and sticking to it will ensure your program is readable by other elm programmers and quickly compilable"..? 😕 

❓ Idk, maybe it's a non issue, feel free to close since the existing error message does mention white-space, which is what is needed to change to clear the error, I just spent a few minute fighting the compiler on it though.

One thing that's interesting is the type alias definition compiles fine, but to get the record definition to work you just need to add at least one space on the last line.
