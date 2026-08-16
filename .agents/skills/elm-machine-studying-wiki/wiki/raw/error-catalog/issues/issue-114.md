---
issue_number: 114
title: "Task.perform gives an unhelpful error message when the arguments are the wrong way around"
state: CLOSED
author: "ccapndave"
created_at: "2016-04-27T11:52:19Z"
url: "https://github.com/elm/error-message-catalog/issues/114"
labels: []
---

# Issue #114: Task.perform gives an unhelpful error message when the arguments are the wrong way around

**State:** `CLOSED` | **Author:** @ccapndave | **Source:** [https://github.com/elm/error-message-catalog/issues/114](https://github.com/elm/error-message-catalog/issues/114)

## Description

In 0.17:

```
import Task exposing (Task)
import Http

type Msg
  = LoadSuccess String
  | LoadError Http.Error


load : Task Http.Error String
load =
  Http.getString "http://blah"


cmd : Cmd Msg
cmd =
  Task.perform LoadSuccess LoadError load
```

The problem with this program is that `LoadSuccess` and `LoadError` should be the other way around, but the error message from the compiler is:

```
-- TYPE MISMATCH ---------------------------------------------------------------

The 3rd argument to function `perform` is causing a mismatch.

17│   Task.perform LoadSuccess LoadError load
                                         ^^^^
Function `perform` is expecting the 3rd argument to be:

    Task Http.Error String

But it is:

    Task Http.Error String

Hint: I always figure out the type of arguments from left to right. If an
argument is acceptable when I check it, I assume it is "correct" in subsequent
checks. So the problem may actually be in how previous arguments interact with
the 3rd.
```

