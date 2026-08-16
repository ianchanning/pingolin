---
issue_number: 354
title: "Debug.todo could report types of the holes"
state: OPEN
author: "Janiczek"
created_at: "2022-02-05T16:18:35Z"
url: "https://github.com/elm/error-message-catalog/issues/354"
labels: []
---

# Issue #354: Debug.todo could report types of the holes

**State:** `OPEN` | **Author:** @Janiczek | **Source:** [https://github.com/elm/error-message-catalog/issues/354](https://github.com/elm/error-message-catalog/issues/354)

## Description

This is inspired by Gleam: whenever you use their equivalent of `Debug.todo`, it tells you where the call was and what type it is expecting, which is quite nice:
<img width="642" alt="Screenshot 2022-02-05 at 17 10 14" src="https://user-images.githubusercontent.com/149425/152649467-39216a5c-cf15-4d90-b3ec-08f3e3da9c80.png">


Elm instead doesn't mention the specific calls to `Debug.todo` at all (nor their types):
```
-- DEBUG REMNANTS --------------------------------------------------------------

There are uses of the `Debug` module in the following modules:

    Main

But the --optimize flag only works if all `Debug` functions are removed!

Note: The issue is that --optimize strips out info needed by `Debug` functions.
Here are two examples:

    (1) It shortens record field names. This makes the generated JavaScript is
    smaller, but `Debug.toString` cannot know the real field names anymore.

    (2) Values like `type Height = Height Float` are unboxed. This reduces
    allocation, but it also means that `Debug.toString` cannot tell if it is
    looking at a `Height` or `Float` value.

There are a few other cases like that, and it will be much worse once we start
inlining code. That optimization could move `Debug.log` and `Debug.todo` calls,
resulting in unpredictable behavior. I hope that clarifies why this restriction
exists!
```
