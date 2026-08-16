---
issue_number: 147
title: "Misleading error message when nested module is referred to in two ways"
state: OPEN
author: "gaborv"
created_at: "2016-08-01T12:43:49Z"
url: "https://github.com/elm/error-message-catalog/issues/147"
labels: []
---

# Issue #147: Misleading error message when nested module is referred to in two ways

**State:** `OPEN` | **Author:** @gaborv | **Source:** [https://github.com/elm/error-message-catalog/issues/147](https://github.com/elm/error-message-catalog/issues/147)

## Description

Sample: https://github.com/gaborv/ModuleNamingError

If you organize your code as follows:

```
/src
+-- BigModule
|   +-- Submodule.elm
|   +-- ...
+-- ModuleA.elm
+-- ModuleB.elm
```

`ModuleA.elm` says `import Submodule`
`ModuleB.elm` says `import BigModule.Submodule`

`BigModule/Submodule.elm` can declare `module BigModule.Submodule` or `module Submodule`, either one is correct but the compiler will complain that the file's name and the source code does not match:
#### When you declare it as BigModule.Submodule

```
for .\./src/BigModule\Submodule.elm

    According to the file's name it should be Submodule
    According to the source code it should be BigModule.Submodule
```
#### When you declare it as Submodule

```
for .\./src/BigModule\Submodule.elm

    According to the file's name it should be BigModule.Submodule
    According to the source code it should be Submodule
```

A good message, in my opinion, would accept whatever is declared in `Submodule.elm` (if it is valid), and would point the developer to eiher `ModuleA.elm` or `ModuleB.elm` stating that one of them is trying to import a module which does not exist.

