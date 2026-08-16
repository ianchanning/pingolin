---
issue_number: 118
title: "You won't believe how he suggests improving the \"I cannot find module 'Html'\" message"
state: CLOSED
author: "ktec"
created_at: "2016-05-15T22:37:12Z"
url: "https://github.com/elm/error-message-catalog/issues/118"
labels: ['naming']
---

# Issue #118: You won't believe how he suggests improving the "I cannot find module 'Html'" message

**State:** `CLOSED` | **Author:** @ktec | **Source:** [https://github.com/elm/error-message-catalog/issues/118](https://github.com/elm/error-message-catalog/issues/118)

## Description

Hello!!

As a total newbie, I installed Elm, wrote this as my first app:

```
import Html exposing (text)
main = text "Hello World"
```

And then when I ran `elm make` I was presented with this:

```
I cannot find module 'Html'.

Module 'Main' is trying to import it.

Potential problems could be:
  * Misspelled the module name
  * Need to add a source directory or new dependency to elm-package.json
```

Being a total newbie, I didn't know that this meant nor what to do about it. So I searched the web for explanations and eventually asked in the slack channel. I was (very helpfully) informed that I needed to run:

```
elm-package install --yes elm-lang/html
```

And that fixed everything \o/

It would be great if the error message suggested something similar to the information I received in the slack channel, so that if someone else gets to that problem, they can continue without having to ask really dumb questions 😄 

It wasn't clear that using `import Html` should equate to installing `elm-lang/html` package.

thanks for reading....

