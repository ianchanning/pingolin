---
issue_number: 290
title: "Bad Port message links to empty docs page"
state: CLOSED
author: "bburdette"
created_at: "2019-01-23T18:53:37Z"
url: "https://github.com/elm/error-message-catalog/issues/290"
labels: ['presentation']
---

# Issue #290: Bad Port message links to empty docs page

**State:** `CLOSED` | **Author:** @bburdette | **Source:** [https://github.com/elm/error-message-catalog/issues/290](https://github.com/elm/error-message-catalog/issues/290)

## Description

The [web page](https://elm-lang.org/0.19.0/ports) linked in this error is empty except for the word "Ports".


```
Detected errors in 1 module.                                         
[00] -- BAD PORT ------------------------------------------------------- src/Main.elm
[00] 
[00] You are declaring port `time` in a normal module.
[00] 
[00] 57| port time : Float -> Cmd msg
[00]          ^^^^
[00] It needs to be in a `port` module.
[00] 
[00] Hint: Ports are not a traditional FFI for calling JS functions directly. They
[00] need a different mindset! Read <https://elm-lang.org/0.19.0/ports> to learn how
[00] to use ports effectively.
```
