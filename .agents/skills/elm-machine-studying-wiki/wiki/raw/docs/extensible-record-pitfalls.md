---
title: "Extensible Record Pitfalls"
category: "cat:antipatterns"
source_url: "https://discourse.elm-lang.org/t/how-to-use-extensible-records-and-when-not-to/2478"
ingested_at: "2026-08-16"
key_concepts: "Why `{ a \| foo : String }` hurts compiler errors and type inference when overused"
---

# Extensible Record Pitfalls

**Source URL:** [https://discourse.elm-lang.org/t/how-to-use-extensible-records-and-when-not-to/2478](https://discourse.elm-lang.org/t/how-to-use-extensible-records-and-when-not-to/2478)  
**Category:** `cat:antipatterns` | **Ingested:** `2026-08-16`  
**Key Concepts:** Why `{ a \| foo : String }` hurts compiler errors and type inference when overused

---

#  [Elm time travelling debugger](/t/elm-time-travelling-debugger/2478)

[ Learn ](/c/learn/6)

[mrumkovskis](https://discourse.elm-lang.org/u/mrumkovskis) November 8, 2018, 3:06pm  1

Continuing the discussion from [Time travelling debugger with elm reactor 0.19](https://discourse.elm-lang.org/t/time-travelling-debugger-with-elm-reactor-0-19/2036/2):

Installed elm-live but cannot see time travelling debugger, the same with elm reactor. Is it available in some form for elm 0.19?  
Thanks.

[pdamoc](https://discourse.elm-lang.org/u/pdamoc) November 8, 2018, 3:26pm  2

Use `elm-live src/Main.elm -- --debug` to compile with the debugger on.

###  Related topics 

Topic |  | Replies | Views | Activity  
---|---|---|---|---  
[Time travelling debugger with elm reactor 0.19](https://discourse.elm-lang.org/t/time-travelling-debugger-with-elm-reactor-0-19/2036) [ Learn ](/c/learn/6) |  2 |  2294 |  September 24, 2018   
[Basic Elm/elm-ui/Parcel.js setup](https://discourse.elm-lang.org/t/basic-elm-elm-ui-parcel-js-setup/3486) [ Show and Tell ](/c/show-and-tell/5) |  4 |  2050 |  April 16, 2019   
[Debugging in a Rails environment](https://discourse.elm-lang.org/t/debugging-in-a-rails-environment/308) [ Learn ](/c/learn/6) |  2 |  846 |  December 20, 2017   
[Elm devTools - Interactive devTools for Elm!](https://discourse.elm-lang.org/t/elm-devtools-interactive-devtools-for-elm/2752) [ Request Feedback ](/c/request-feedback/7) |  11 |  5721 |  December 26, 2018   
[Elm Debugger Update](https://discourse.elm-lang.org/t/elm-debugger-update/4609) [ Show and Tell ](/c/show-and-tell/5) |  7 |  2324 |  November 9, 2019 

