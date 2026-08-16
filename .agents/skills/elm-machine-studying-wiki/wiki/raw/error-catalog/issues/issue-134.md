---
issue_number: 134
title: "Invalid ports direct to a page that doesn't help"
state: OPEN
author: "mgold"
created_at: "2016-06-26T15:47:16Z"
url: "https://github.com/elm/error-message-catalog/issues/134"
labels: ['types', 'no sscce']
---

# Issue #134: Invalid ports direct to a page that doesn't help

**State:** `OPEN` | **Author:** @mgold | **Source:** [https://github.com/elm/error-message-catalog/issues/134](https://github.com/elm/error-message-catalog/issues/134)

## Description

On Slack, a fellow reports having a module like this:

``` elm
port module Main exposing (..)

-- SNIP

port decrypted : (String -> Msg) -> Sub Msg
```

When the file is compiled:

``` elm
$ elm-make Main.elm —output elm.js
-- PORT ERROR --------------------------------------------------------- Main.elm

Port `decrypted` has an invalid type.

67| port decrypted : (String -> Msg) -> Sub Msg
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
You are saying it should be:

    (String -> Main.Msg) -> Platform.Sub.Sub Main.Msg

But you need to use the particular format described here:
<http://guide.elm-lang.org/effect_managers/>
```

The immediate issue is that `Msg` should not be capitalized (#45) but if you go to the guide page on effect managers, it doesn't tell you what the format is. Either documentation needs to be written on that format, or the link should go where the documentation is. (Since the page linked to seems to be for effect manager authors, it sounds like the latter is more appropriate.)

