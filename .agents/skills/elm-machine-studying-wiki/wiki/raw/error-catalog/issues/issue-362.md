---
issue_number: 362
title: "A silly mistake but the compiler wasn't helpful with `type` error"
state: OPEN
author: "badlydrawnrob"
created_at: "2024-09-06T13:51:36Z"
url: "https://github.com/elm/error-message-catalog/issues/362"
labels: []
---

# Issue #362: A silly mistake but the compiler wasn't helpful with `type` error

**State:** `OPEN` | **Author:** @badlydrawnrob | **Source:** [https://github.com/elm/error-message-catalog/issues/362](https://github.com/elm/error-message-catalog/issues/362)

## Description

**Quick Summary:** Working too late into the night and stupidly used a `type alias` in the model record (without any arguments). The compiler caught the bug but error wasn't so useful (as in, I didn't know where to look when trying to fix it). Right now if you're not careful you're going to run into errors when you accidentally add a `type` to a record in certain cases (see below). A simple "This constructor function has no arguments" would've helped. 

```elm
type SomeType
    = Nope | Yup Int

-- Throws a `I cannot find a `SomeType` variant:` error
{ test = SomeType }

-- Could silently fail (as it returns a function that takes an argument)
{ test = Yup }
```

Should some of these cases be disallowed?

## SSCCE

<img width="458" alt="Screenshot 2024-09-05 at 23 52 24" src="https://github.com/user-attachments/assets/4c07d867-5630-4915-93a8-000a6c629190">
<img width="569" alt="Screenshot 2024-09-05 at 23 52 08" src="https://github.com/user-attachments/assets/5ce2e8ae-ef52-47ff-a250-c2bdc1111097">


- **Elm:** 0.19.1
- **Browser:** n/a
- **Operating System:** MacOs Monterey 12.7.6


## Additional Details

I caveat this with the fact that the Elm compiler is a godsend and has caught and helped me fix so many silly mistakes! That's so important, I've dabbled with Purescript and the repl errors are so unhelpful.
