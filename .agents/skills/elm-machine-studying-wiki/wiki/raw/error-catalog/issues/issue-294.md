---
issue_number: 294
title: "Confusing error for wrong number of parameters in update"
state: CLOSED
author: "mpizenberg"
created_at: "2019-05-18T18:20:15Z"
url: "https://github.com/elm/error-message-catalog/issues/294"
labels: ['types']
---

# Issue #294: Confusing error for wrong number of parameters in update

**State:** `CLOSED` | **Author:** @mpizenberg | **Source:** [https://github.com/elm/error-message-catalog/issues/294](https://github.com/elm/error-message-catalog/issues/294)

## Description

Code with missing parameter in update:

```elm
module Main exposing (main)

main : Program () () ()
main =
    Platform.worker
        { init = \_ -> ( (), Cmd.none )
          -- should be \_ _ -> ...
        , update = \_ -> ( (), Cmd.none )
        , subscriptions = \_ -> Sub.none
        }
```

Error message:

```
Detected errors in 1 module.
-- TYPE MISMATCH ------------------------------ src/Main.elm

The 1st argument to `worker` is not what I expect:

 6|     Platform.worker
 7|>        { init = \_ -> ( (), Cmd.none )
 8|>        , update = \_ -> ( (), Cmd.none )
 9|>        , subscriptions = \_ -> Sub.none
10|>        }

This argument is a record of type:

    { init : flags -> ( (), Cmd msg1 )
    , subscriptions : () -> Sub msg1
    , update : msg1 -> ( (), Cmd msg )
    }

But `worker` needs the 1st argument to be:

    { init : flags -> ( (), Cmd msg1 )
    , subscriptions : () -> Sub msg1
    , update : msg1 -> ( (), Cmd msg1 )
    }
```
