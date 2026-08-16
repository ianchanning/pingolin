---
issue_number: 263
title: "Which dependencies in elm.json are not compatible?"
state: OPEN
author: "francisdb"
created_at: "2018-08-22T19:27:26Z"
url: "https://github.com/elm/error-message-catalog/issues/263"
labels: []
---

# Issue #263: Which dependencies in elm.json are not compatible?

**State:** `OPEN` | **Author:** @francisdb | **Source:** [https://github.com/elm/error-message-catalog/issues/263](https://github.com/elm/error-message-catalog/issues/263)

## Description

I used `elm-upgrade` and ended up with this:
_(I did get a warning about missing 0.19 versions at some point)_

```
{
    ...
    "dependencies": {
        "direct": {
           ...
            "elm-community/random-extra": "2.0.0"
           ...
```
When doing a `elm make` I got the below message and had to add them one by one again to find the one that is not compatible

```
> elm make
-- INVALID PACKAGE DEPENDENCIES --------------------------------------- elm.json

The dependencies in your elm.json are not compatible.

Did you change them by hand? Try to change it back! It is much better to add
dependencies with elm install or the dependency management tool in elm reactor.

Please ask for help on the Elm slack <http://elmlang.herokuapp.com/> if you try
those paths and still cannot figure it out!
```

I guess there is a way to come up with the list of incompatible dependencies?
