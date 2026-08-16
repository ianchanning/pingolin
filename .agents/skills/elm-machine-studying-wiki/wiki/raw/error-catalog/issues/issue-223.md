---
issue_number: 223
title: "Whitespace before module definition - confusing error message "
state: OPEN
author: "tad-lispy"
created_at: "2017-06-23T12:32:34Z"
url: "https://github.com/elm/error-message-catalog/issues/223"
labels: ['x-misc']
---

# Issue #223: Whitespace before module definition - confusing error message 

**State:** `OPEN` | **Author:** @tad-lispy | **Source:** [https://github.com/elm/error-message-catalog/issues/223](https://github.com/elm/error-message-catalog/issues/223)

## Description

**What's happening**

Calling `elm-make` on a program that  imports a module with whitespace before the module definition prints error that suggest's the declared module name is `Main`. E.g.:

```
The module name is messed up for ././View.elm

    According to the file's name it should be View
    According to the source code it should be Main

Which is it?
```

**Steps to reproduce**

In Bash compatible shell type / paste:

```sh
#! /usr/bin/env bash

echo "
module Main exposing (main)

import View
" > Main.elm

echo "
 module View -- note space at the beggining
" > View.elm

elm-make ./Main.elm
```

**Expected result**

There should be at least a hint about a whitespace in a fashion similar to #21. Or maybe it should be a syntax error to have whitespace at the beginning of first non-empty line of the program? Or error not to have module name declared - that would fit with Elm's apparent preference for explicitness. Just some quick ideas :)

**Side notes**

Interestingly running `elm-make` on the offending module itself:

```sh
elm make View.elm
```

 gives a much better message:

```
-- SYNTAX PROBLEM ----------------------------------------------------- View.elm

I need a fresh line to start a new declaration. This means a new line that
starts with stuff, not with spaces or comments.

2|  module View
    ^
I am looking for one of the following things:

    whitespace

Detected errors in 1 module.
```
