---
issue_number: 300
title: "Package name not matching github repo name produces misleading error"
state: OPEN
author: "tad-lispy"
created_at: "2019-03-01T17:37:12Z"
url: "https://github.com/elm/error-message-catalog/issues/300"
labels: []
---

# Issue #300: Package name not matching github repo name produces misleading error

**State:** `OPEN` | **Author:** @tad-lispy | **Source:** [https://github.com/elm/error-message-catalog/issues/300](https://github.com/elm/error-message-catalog/issues/300)

## Description

**Quick Summary:**

While publishing a package I made a mistake in the `name` field so it was not matching the address on GitHub. The error was:

```
  ✗ Version 1.0.0 is not tagged on GitHub!

-- NO TAG ----------------------------------------------------------------------

Packages must be tagged in git, but I cannot find a 1.0.0 tag.

These tags make it possible to find this specific version on GitHub.
To tag the most recent commit and push it to GitHub, run this:

   git tag -a 1.0.0 -m "new release"
   git push origin 1.0.0

The -m flag is for a helpful message. Try to make it more informative!
```

Which is very misleading.

## SSCCE

N/A


## Additional Details

I would suggest a message like that:

```
  ✗ No repository by name tad-lispy/springs on github.com.

-- NO REPOSITORY -----------------------------------------------------------------

I was looking for https://github.com/tad-lispy/springs.git, but it's not there! Packages must be published to GitHub before they can be published to packages.elm-lang.org.

Maybe there is a mistake in the elm.json file? Check out the name field.
```
