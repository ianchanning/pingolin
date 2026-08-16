---
issue_number: 304
title: "elm make \"can't find file\" that's there"
state: OPEN
author: "app/"
created_at: "2019-10-12T11:13:25Z"
url: "https://github.com/elm/error-message-catalog/issues/304"
labels: []
---

# Issue #304: elm make "can't find file" that's there

**State:** `OPEN` | **Author:** @app/ | **Source:** [https://github.com/elm/error-message-catalog/issues/304](https://github.com/elm/error-message-catalog/issues/304)

## Description

```
$ ls
Main.elm
$ elm make Main.elm
-- FILE NOT FOUND --------------------------------------------------------------

You want me to compile this file:

    Main.elm

I cannot find it though! Is there a typo?
```

I suspect the cause of this problem is not using elm make from a directory with elm.json in it (that resolved the issue for me). If that's so, this hint would be useful in the error message.
