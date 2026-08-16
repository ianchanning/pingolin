---
issue_number: 72
title: "Error message only mentions one of the two type arguments"
state: OPEN
author: "Apanatshka"
created_at: "2015-12-09T10:43:24Z"
url: "https://github.com/elm/error-message-catalog/issues/72"
labels: ['types', 'no sscce']
---

# Issue #72: Error message only mentions one of the two type arguments

**State:** `OPEN` | **Author:** @Apanatshka | **Source:** [https://github.com/elm/error-message-catalog/issues/72](https://github.com/elm/error-message-catalog/issues/72)

## Description

I grabbed this example from a [SO question](https://stackoverflow.com/questions/34166132/how-do-i-merge-signals-of-nested-tagged-types):

``` elm
type WindowUpdate = Resize (Int, Int)

type DataUpdate = TagFilter Model.Tag

type Update update data = WindowUpdate update data
                        | DataUpdate update data
                        | NoOp

updates : Signal.Mailbox (Update update data)
updates = Signal.mailbox NoOp

appModel : Signal Model
appModel =
  let
    applicationUpdates = Signal.mergeMany
                       [ updates.signal

                       ]
  in
    Signal.foldp update Model.defaultModel applicationUpdates

windowUpdate : WindowUpdate -> Model -> Model
windowUpdate update model =
    let resizeWidth = \windowModel newWidth -> { windowModel | width = newWidth }
    in
      case update of
        Resize (w, _) -> { model | window = (resizeWidth model.window w) }

update : Update -> Model -> Model
update u model =
  case u of
    WindowUpdate wu data -> windowUpdate (wu data)  model
    DataUpdate du data  -> model
    otherwise       -> model
```

Note how the `update` function doesn't mention the type arguments to `Update`. The compiler gives the error:

```
— TYPE MISMATCH —————————————————————— ./app/Updates.elm

The 3rd argument to function `foldp` is causing a mismatch.

36│     Signal.foldp update Model.defaultModel applicationUpdates
                                               ^^^^^^^^^^^^^^^^^^
Function `foldp` is expecting the 3rd argument to be:

    Signal (Update a)

But it is:

    Signal Update

Hint: I always figure out the type of arguments from left to right. If an
argument is acceptable when I check it, I assume it is "correct" in subsequent checks. So the problem may actually be in how previous arguments interact with the 3rd.
```

Note how the error message speaks of `Signal (Update a)`, I'd expect `Signal (Update a b)`...

**TODO:** Minimise the example. (Will do this later if nobody beats me to it)

