---
issue_number: 355
title: "Trying to use non-exposed constructors"
state: OPEN
author: "Janiczek"
created_at: "2022-11-08T21:39:06Z"
url: "https://github.com/elm/error-message-catalog/issues/355"
labels: []
---

# Issue #355: Trying to use non-exposed constructors

**State:** `OPEN` | **Author:** @Janiczek | **Source:** [https://github.com/elm/error-message-catalog/issues/355](https://github.com/elm/error-message-catalog/issues/355)

## Description

```elm
module File1 exposing (CustomType)


type CustomType
  = Foo
  | Bar
```

```elm
module File2 exposing (usage)

import File1 exposing (CustomType(..))


usage =
    Foo
```

This will currently get you:
```
-- NAMING ERROR -------------------------------------------------- src/File2.elm

I cannot find a `Foo` variant:

7|     Foo
       ^^^
These names seem close though:

    Ok
    EQ
    Err
    GT

Hint: Read <https://elm-lang.org/0.19.1/imports> to see how `import`
declarations work in Elm.
```
while it could give you something like
```
-- IMPORT ERROR -------------------------------------------------- src/File2.elm

You're trying to import the constructors of the `CustomType` type:

3| import File1 exposing (CustomType(..))
                                    ^^^^

The module File1 doesn't expose them though.
```
