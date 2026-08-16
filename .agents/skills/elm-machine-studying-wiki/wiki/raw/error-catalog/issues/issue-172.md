---
issue_number: 172
title: "No args port gives link to irrelevant page"
state: OPEN
author: "Ryan1729"
created_at: "2016-10-08T03:04:18Z"
url: "https://github.com/elm/error-message-catalog/issues/172"
labels: ['types']
---

# Issue #172: No args port gives link to irrelevant page

**State:** `OPEN` | **Author:** @Ryan1729 | **Source:** [https://github.com/elm/error-message-catalog/issues/172](https://github.com/elm/error-message-catalog/issues/172)

## Description

Compiling an elm file like this:

``` elm
port module Ports exposing (..)

port load : Cmd msg
```

gives the following error:

``` elm
-- PORT ERROR ----------------------------------------------------
././Ports.elm

Port `load` has an invalid type.

3| port load : Cmd msg
    ^^^^^^^^^^^^^^^^^^^
You are saying it should be:

    Platform.Cmd.Cmd msg

But you need to use the particular format described here:
<http://guide.elm-lang.org/effect_managers/>
```

but [http://guide.elm-lang.org/effect_managers/](http://guide.elm-lang.org/effect_managers/) doesn't have any info related to this error on it. I think it would be better if the error message linked to the [ports page of the guide](https://guide.elm-lang.org/interop/javascript.html) and if the possible type signatures were summarized in the error message. AFAICT only one argument ports are allowed so the error message could be something like this:

``` elm
-- PORT ERROR ----------------------------------------------------
././Ports.elm

Port `load` has an invalid type.

3| port load : Cmd msg
    ^^^^^^^^^^^^^^^^^^^
You are saying it should be:

    Platform.Cmd.Cmd msg

But it should be:
   a -> Platform.Cmd.Cmd msg

   where "a" can be converted to a Javascript value

See here for more info:
<https://guide.elm-lang.org/interop/javascript.html>
```

This issue also came up before on the [mailing list](https://groups.google.com/forum/#!topic/elm-discuss/BFS03hbiT6A)

Also, issues that a change like the one I described could fix have come up on this repo as well:
#134
#166

