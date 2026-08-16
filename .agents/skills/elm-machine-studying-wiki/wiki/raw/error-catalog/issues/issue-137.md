---
issue_number: 137
title: "Passing too few arguments "
state: CLOSED
author: "rtfeldman"
created_at: "2016-07-19T04:32:25Z"
url: "https://github.com/elm/error-message-catalog/issues/137"
labels: ['types']
---

# Issue #137: Passing too few arguments 

**State:** `CLOSED` | **Author:** @rtfeldman | **Source:** [https://github.com/elm/error-message-catalog/issues/137](https://github.com/elm/error-message-catalog/issues/137)

## Description

[SSCCE](http://sscce.org/) in elm-repl:

```
> import String
> "foo" ++ String.join "blah"
-- TYPE MISMATCH --------------------------------------------- repl-temp-000.elm
​
The right argument of (++) is causing a type mismatch.
​
4│   "foo" ++ String.join "blah"
              ^^^^^^^^^^^^^^^^^^
(++) is expecting the right argument to be a:
​
    String
​
But the right argument is:
​
    List String -> String
​
Hint: I always figure out the type of the left argument first and if it is
acceptable on its own, I assume it is "correct" in subsequent checks. So the
problem may actually be in how the left and right arguments interact.
```

It would be nice if this said:

```
Hint: Did you forget to pass an argument to String.join?
```

In general, any error of the form "expected `a` but got `b -> a`" seems like it could helpfully suggest "maybe you forgot an argument."

Similarly, it seems plausible that "expected `a` but got `c -> b > a`" could suggest two missing arguments.

