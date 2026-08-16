---
issue_number: 233
title: "\"I cannot find module X\": it would be nice to show the client module’s file path"
state: OPEN
author: "gurdiga"
created_at: "2017-08-22T06:39:38Z"
url: "https://github.com/elm/error-message-catalog/issues/233"
labels: ['no sscce']
---

# Issue #233: "I cannot find module X": it would be nice to show the client module’s file path

**State:** `OPEN` | **Author:** @gurdiga | **Source:** [https://github.com/elm/error-message-catalog/issues/233](https://github.com/elm/error-message-catalog/issues/233)

## Description

I’m moving files around a bit, in this particular case it’s `DocumentScanat` that got moved, and this is the compilation error I get from a client module: 😶 
```
    ~/src/xo.elm ɀ  elm make --warn src/Main.elm --output dist/Main.js
I cannot find module 'DocumentScanat'.

Module 'Dosar.Temei.CerereCreditor.ContractCreditBancar' is trying to import it.

Potential problems could be:
  * Misspelled the module name
  * Need to add a source directory or new dependency to elm-package.json
    ~/src/xo.elm ɀ  
```
I surely know where to find the file for `Dosar.Temei.CerereCreditor.ContractCreditBancar` but it would be nice to have its file path copy/paste-able as I do for most other compilation errors. 🤓 

What do you guys think? 🤔 
