---
issue_number: 310
title: "Missing code location for unknown import"
state: OPEN
author: "lydell"
created_at: "2019-10-20T09:09:07Z"
url: "https://github.com/elm/error-message-catalog/issues/310"
labels: []
---

# Issue #310: Missing code location for unknown import

**State:** `OPEN` | **Author:** @lydell | **Source:** [https://github.com/elm/error-message-catalog/issues/310](https://github.com/elm/error-message-catalog/issues/310)

## Description

SSCCE:

```elm
module Main exposing (..)

import Missing


x = 1
```

Error:

```
-- UNKNOWN IMPORT ------------------------------------------------- src/Main.elm

The Main module has a bad import:

    import Missing

I cannot find that module! Is there a typo in the module name?

The "source-directories" field of your elm.json tells me to only look in the src
directory, but it is not there. Maybe it is in a package that is not installed
yet?
```

It’s nice that it shows me which import is causing problems, but unlike most other error messages it does not show the line number! I’d expect something more like this:

```
-- UNKNOWN IMPORT ------------------------------------------------- src/Main.elm

The Main module has a bad import:

3| import Missing
          ^^^^^^^

I cannot find that module! Is there a typo in the module name?

The "source-directories" field of your elm.json tells me to only look in the src
directory, but it is not there. Maybe it is in a package that is not installed
yet?
```

That would be more consistent, but most importantly it would allow the [language server](https://github.com/elm-tooling/elm-language-server) to underline the bad import rather than showing a generic error at the start of the file. See https://github.com/elm-tooling/elm-language-client-vscode/issues/41
