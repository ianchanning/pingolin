---
issue_number: 196
title: "SSCCE for line number of declaration in missing whitespace scenario"
state: CLOSED
author: "brunogirin"
created_at: "2016-12-30T10:31:52Z"
url: "https://github.com/elm/error-message-catalog/issues/196"
labels: ['parser']
---

# Issue #196: SSCCE for line number of declaration in missing whitespace scenario

**State:** `CLOSED` | **Author:** @brunogirin | **Source:** [https://github.com/elm/error-message-catalog/issues/196](https://github.com/elm/error-message-catalog/issues/196)

## Description

As described in issue #164, the compiler does not provide a line number when some syntax errors occur, in particular when it encounters missing closing brackets. When compiling the attached file, the compiler provides the following message:

```
$ elm make WhitespaceSscce.elm 
-- SYNTAX PROBLEM ------------------------------------------ WhitespaceSscce.elm

I need whitespace, but got stuck on what looks like a new declaration. You are
either missing some stuff in the declaration above or just need to add some
spaces here:


I am looking for one of the following things:

    whitespace

Detected errors in 1 module.                                        
```

Although the problem is obvious in the attached example, it can be very difficult to find the offending line in a complex module so it would help enormously if the compiler could provide the line number where the error was found or the line number where the declaration that it was trying to parse is.

[WhitespaceSscce.zip](https://github.com/elm-lang/error-message-catalog/files/678524/WhitespaceSscce.zip)


