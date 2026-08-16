---
issue_number: 235
title: "Cannot find module Svg (\"elm-lang/virtual-dom\" not added automatically)"
state: CLOSED
author: "MBing"
created_at: "2017-08-26T20:46:27Z"
url: "https://github.com/elm/error-message-catalog/issues/235"
labels: []
---

# Issue #235: Cannot find module Svg ("elm-lang/virtual-dom" not added automatically)

**State:** `CLOSED` | **Author:** @MBing | **Source:** [https://github.com/elm/error-message-catalog/issues/235](https://github.com/elm/error-message-catalog/issues/235)

## Description

Great work on Elm and all the tools and documentation, it's really well done and pushing functional programming on the frontend in a great way forward. 
Unfortunately since I am just starting I ran into a problem while trying an online example locally.

When trying to run this example:
https://guide.elm-lang.org/architecture/effects/time.html

I ran the `elm-package install` command and it gave me back the `elm-stuff` dir & `elm-package.json` file which looks like this:

```javascript
{
    "version": "1.0.0",
    "summary": "helpful summary of your project, less than 80 characters",
    "repository": "https://github.com/user/project.git",
    "license": "BSD3",
    "source-directories": [
        "."
    ],
    "exposed-modules": [],
    "dependencies": {
        "elm-lang/core": "5.1.1 <= v < 6.0.0",
        "elm-lang/html": "2.0.0 <= v < 3.0.0"
    },
    "elm-version": "0.18.0 <= v < 0.19.0"
}
```

When checking the [Svg package use here](http://package.elm-lang.org/packages/elm-lang/svg/latest
) I see that Svg is built on `elm-lang/virtual-dom`. So I assume this should be added as a dependency as well after running `elm-package install`. When running `elm-reactor` and going to my `localhost:8000` I get the following error:
<img width="628" alt="elm svg error" src="https://user-images.githubusercontent.com/2140223/29744959-822fbcaa-8aaf-11e7-91ca-9c746ec1dbfc.png">

I have tried to update the `elm-package.json` to (which also did not resolve the issue):
```javascript
{
    "version": "1.0.0",
    "summary": "helpful summary of your project, less than 80 characters",
    "repository": "https://github.com/user/project.git",
    "license": "BSD3",
    "source-directories": [
        "."
    ],
    "exposed-modules": [],
    "dependencies": {
        "elm-lang/core": "5.1.1 <= v < 6.0.0",
        "elm-lang/html": "2.0.0 <= v < 3.0.0",
        "elm-lang/virtual-dom": "2.0.4 <= v < 3.0.0"
    },
    "elm-version": "0.18.0 <= v < 0.19.0"
}
```
My question here is, what am I doing wrong and what can I do to fix this? 
Thank you! :) 
