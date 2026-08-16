---
issue_number: 314
title: "When package.elm-lang.org is not accessible, `elm make` does not tell which dependencies it is trying to fetch"
state: OPEN
author: "HenkPoley"
created_at: "2019-10-25T10:14:05Z"
url: "https://github.com/elm/error-message-catalog/issues/314"
labels: []
---

# Issue #314: When package.elm-lang.org is not accessible, `elm make` does not tell which dependencies it is trying to fetch

**State:** `OPEN` | **Author:** @HenkPoley | **Source:** [https://github.com/elm/error-message-catalog/issues/314](https://github.com/elm/error-message-catalog/issues/314)

## Description

`elm make` does not tell which dependencies it is missing in the cache

----

When package.elm-lang.org is down, and you try to `elm make` from an elm.json with a package that is not cached on your machine, it will say:

```
>elm make
Dependencies ready!
-- TROUBLE VERIFYING DEPENDENCIES ------------------------------------- elm.json

I could not connect to https://package.elm-lang.org to get the latest list of
packages, and I was unable to verify your dependencies with the information I
have cached locally.

Are you able to connect to the internet? These dependencies may work once you
get access to the registry!

Note: If you changed your dependencies by hand, try to change them back! It is
much more reliable to add dependencies with elm install or the dependency
management tool in elm reactor.
```

Note that does _not_ say which dependency it was trying to fetch. 

For me specifically: This is kind of confusing a newcomer, when you *think* you already used _the_ json decoder, but this example that you are trying uses a _different_ json decoder that you haven't cached. 

Overall it would be less confusing if it could simply say "these and these new dependencies I'm trying to fetch, but I can't".

Edit, I think this was also observed behavior: You see `elm make` work in one directory, but not in the other.

----

Ref: https://github.com/elm/compiler/issues/2002#issuecomment-546289048
