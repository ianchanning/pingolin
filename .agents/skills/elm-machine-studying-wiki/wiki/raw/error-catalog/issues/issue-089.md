---
issue_number: 89
title: "import Lorem exposing (ipsum, sit) as Amet"
state: OPEN
author: "mgold"
created_at: "2016-02-23T03:45:23Z"
url: "https://github.com/elm/error-message-catalog/issues/89"
labels: ['parser']
---

# Issue #89: import Lorem exposing (ipsum, sit) as Amet

**State:** `OPEN` | **Author:** @mgold | **Source:** [https://github.com/elm/error-message-catalog/issues/89](https://github.com/elm/error-message-catalog/issues/89)

## Description

The following works fine:

``` elm
import Graphics.Element as Elem exposing (Element, show)
```

The following is an error:

``` elm
import Graphics.Element exposing (Element, show) as Elem
```

I'm actually okay with this being disallowed, one less thing to vary needlessly and the list of exposed items should be last. However, the error message is very generic:

> I need a fresh line to start a new declaration. This means a new line that starts with stuff, not with spaces or comments.

It would be nice if the compiler specifically looked for this mistake and suggested a fix.

> This import has an `as`-clause after an `exposing`-clause. The order needs to be switched.

Or maybe that's too detailed, but it's an idea.

