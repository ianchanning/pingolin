---
issue_number: 150
title: "*No* error given when the base module's name doesn't match its file name."
state: OPEN
author: "JohnBugner"
created_at: "2016-08-02T21:05:10Z"
url: "https://github.com/elm/error-message-catalog/issues/150"
labels: ['naming']
---

# Issue #150: *No* error given when the base module's name doesn't match its file name.

**State:** `OPEN` | **Author:** @JohnBugner | **Source:** [https://github.com/elm/error-message-catalog/issues/150](https://github.com/elm/error-message-catalog/issues/150)

## Description

When I compile a file with elm-make, or run it with elm-reactor, the base file's (usually Main.elm) name given in the module declaration doesn't have to match its file name, as long as the name given in the module declaration starts with a capital letter.

Examples:
(a)
file name : Main.elm
module name : Main
result : No error is given, just as it should be.

(b)
file name : Main.elm
module name : NotMain
result : **_No error is given, but one should be.**_

(c)
file name : Main.elm
module name : notMain
result : An error is given, just as it should be.

A sidenote : Any modules imported by the base module are _not_ affected by this (lack of) error in example (b). Only the base module is affected.

