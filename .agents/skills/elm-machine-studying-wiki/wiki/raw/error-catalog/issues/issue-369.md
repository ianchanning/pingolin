---
issue_number: 369
title: "Permission Denied Error Due to Unset `ELM_HOME` Environment Variable in `Stuff` Module"
state: OPEN
author: "blackeuler"
created_at: "2023-10-30T03:19:00Z"
url: "https://github.com/elm/error-message-catalog/issues/369"
labels: ['CLI']
---

# Issue #369: Permission Denied Error Due to Unset `ELM_HOME` Environment Variable in `Stuff` Module

**State:** `OPEN` | **Author:** @blackeuler | **Source:** [https://github.com/elm/error-message-catalog/issues/369](https://github.com/elm/error-message-catalog/issues/369)

## Description


### Description

When running the Elm compiler without the `ELM_HOME` environment variable set, it defaults to using the the location of elm im assuming for storing data. In certain environments, the process may lack the necessary permissions to write to this directory, resulting in a `Permission Denied` error.

This issue stems from the `getElmHome` function within the `Stuff` module in the Elm compiler source code. Below is the relevant snippet from the `Stuff` module:

```haskell
getElmHome :: IO FilePath
getElmHome =
  do  maybeCustomHome <- Env.lookupEnv "ELM_HOME"
      case maybeCustomHome of
        Just customHome -> return customHome
        Nothing -> Dir.getAppUserDataDirectory "elm"
```

In the absence of the `ELM_HOME` environment variable, `getElmHome` defaults to using `AppUserDataDirectory`.

### Steps to Reproduce

1. Ensure the `ELM_HOME` environment variable is not set.
2. Run the Elm compiler command in an environment where the `AppUserDataDirectory` is not writable by the process.
3. Observe the `Permission Denied` error.



