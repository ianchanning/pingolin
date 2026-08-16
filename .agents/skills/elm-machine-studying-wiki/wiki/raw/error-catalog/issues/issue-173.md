---
issue_number: 173
title: "Port type error"
state: OPEN
author: "dbulic"
created_at: "2016-10-11T10:24:47Z"
url: "https://github.com/elm/error-message-catalog/issues/173"
labels: ['types']
---

# Issue #173: Port type error

**State:** `OPEN` | **Author:** @dbulic | **Source:** [https://github.com/elm/error-message-catalog/issues/173](https://github.com/elm/error-message-catalog/issues/173)

## Description

```
- PORT ERROR --------------------------------------------------------- Main.elm

Port `chartData` has an invalid type.

43| port chartData : Model -> Cmd Msg
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
You are saying it should be:

    Main.Model -> Platform.Cmd.Cmd Main.Msg

But you need to use the particular format described here:
<http://guide.elm-lang.org/effect_managers/>
```

Two problems:
1) That pages doesn't mention at all what's that "particular" format
2) I would prefer it to be an actual link

I would even more prefer to tell me how to rewrite that line - the only change needed seems to be

```
port chartData : Model -> Cmd msg
```

