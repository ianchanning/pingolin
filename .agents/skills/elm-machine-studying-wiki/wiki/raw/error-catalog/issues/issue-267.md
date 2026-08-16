---
issue_number: 267
title: "Reactor gives cryptic error on malformed Elm application"
state: OPEN
author: "MartinSStewart"
created_at: "2018-08-29T17:31:50Z"
url: "https://github.com/elm/error-message-catalog/issues/267"
labels: []
---

# Issue #267: Reactor gives cryptic error on malformed Elm application

**State:** `OPEN` | **Author:** @MartinSStewart | **Source:** [https://github.com/elm/error-message-catalog/issues/267](https://github.com/elm/error-message-catalog/issues/267)

## Description


Steps to reproduce:
1. Download [program.zip](https://github.com/elm/error-message-catalog/files/2333122/program.zip).  Alternatively, run `elm init` and add a src/Main.elm file containing
```
module Main exposing (..)

a = 5
```
2. Run `elm reactor` and open src/Main.elm
3. Note that elm reactor displays a blank page for a while before showing the text 
```
A web handler threw an exception. Details:
thread killed
```

Expected behavior: 
Since elm.json states this is an application, this program should result in a compile error.


Note that I've only tested this on Windows with Chrome.
