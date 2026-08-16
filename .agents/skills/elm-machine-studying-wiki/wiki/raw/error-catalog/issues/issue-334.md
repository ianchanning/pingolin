---
issue_number: 334
title: "Confusing error when attempting to install a pre-0.19 package"
state: OPEN
author: "sentience"
created_at: "2020-04-16T05:12:05Z"
url: "https://github.com/elm/error-message-catalog/issues/334"
labels: []
---

# Issue #334: Confusing error when attempting to install a pre-0.19 package

**State:** `OPEN` | **Author:** @sentience | **Source:** [https://github.com/elm/error-message-catalog/issues/334](https://github.com/elm/error-message-catalog/issues/334)

## Description

Intending to install [elm-community/list-extra](https://package.elm-lang.org/packages/elm-community/list-extra/latest), I mistakenly typed:

```
elm install elm-community/elm-list-extra
```

…which refers to the obsolete [elm-community/elm-list-extra](https://github.com/elm-community/elm-list-extra) repo.

The error this produced was confusing:

```
-- PROBLEM SOLVING PACKAGE CONSTRAINTS -----------------------------------------

I need the elm.json of elm-community/elm-list-extra 2.0.0 to help me search for
a set of compatible packages, but I ran into corrupted information from:

    https://package.elm-lang.org/packages/elm-community/elm-list-extra/2.0.0/elm.json

Is something weird with your internet connection. We have gotten reports that
schools, businesses, airports, etc. sometimes intercept requests and add things
to the body or change its contents entirely. Could that be the problem?
```

The JSON data in question does not appear to be corrupted.

The error should probably have told me that I was attempting to install an obsolete package name/version, because the package registry claims the package in question is only compatible with Elm 0.18.0.
