---
issue_number: 320
title: "Which error messages should exist?"
state: OPEN
author: "CSDUMMI"
created_at: "2019-10-31T20:26:17Z"
url: "https://github.com/elm/error-message-catalog/issues/320"
labels: []
---

# Issue #320: Which error messages should exist?

**State:** `OPEN` | **Author:** @CSDUMMI | **Source:** [https://github.com/elm/error-message-catalog/issues/320](https://github.com/elm/error-message-catalog/issues/320)

## Description

In many programs, you have many functions (init,update,view, etc.)
and especially using elm/browser, you first use these function's name and then define them:
```elm
main = Browser.sandbox { init = init, update = update, view = view }

-- MODEL
init = ...
-- UPDATE
update = ...
-- VIEW
view = ...
```

Now, how do you start programming?
One function, after the other, I'd think.
I got an example:  (this  is the entire file,
I didn't cut it off at the end)
```elm
module Main exposing (..)

import Browser

-- MAIN
main = Browser.sandbox { init = init, update = update, view = view }

-- MODEL
type alias Model = Int

init : Model
init = 0
-- UPDATE
type Msg
  = Inc
  | Dec

update : Msg -> Model -> Model
update msg model = case msg of
  Inc -> model +1

-- VIEW
```

Two things, that you'll notice: 
- The case ... of doesn't have enough branches
- view isn't defined.

## Which error would be most helpful for you?
If I simply compile this file I get:
```elm
Detected problems in 1 module.
-- NAMING ERROR --------------------------------------------------- src/Main.elm

I cannot find a `view` variable:

6| main = Browser.sandbox { init = init, update = update, view = view }
                                                                 ^^^^
These names seem close though:

    e
    min
    pi
    sin

Hint: Read <https://elm-lang.org/0.19.1/imports> to see how `import`
declarations work in Elm.

```
If I add a definition of view I get:
```elm
Detected problems in 1 module.
-- MISSING PATTERNS ----------------------------------------------- src/Main.elm

This `case` does not have branches for all possibilities:

21|>update msg model = case msg of
22|>  Inc -> model +1

Missing possibilities include:

    Dec

I would have to crash if I saw one of those. Add branches for them!

Hint: If you want to write the code for each branch later, use `Debug.todo` as a
placeholder. Read <https://elm-lang.org/0.19.1/missing-patterns> for more
guidance on this workflow.

```
I think, if both were shown, it would be more helpful
 
Thus I'd think, that the second one should at least printed, because it is more important for me, I know that view isn't defined yet, but I want to know what I forgot in update.
