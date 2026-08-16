---
issue_number: 198
title: "Possibly improve hints for type mismatches due to incorrect function/variable used"
state: OPEN
author: "ScrimpyCat"
created_at: "2017-01-06T01:44:17Z"
url: "https://github.com/elm/error-message-catalog/issues/198"
labels: ['types']
---

# Issue #198: Possibly improve hints for type mismatches due to incorrect function/variable used

**State:** `OPEN` | **Author:** @ScrimpyCat | **Source:** [https://github.com/elm/error-message-catalog/issues/198](https://github.com/elm/error-message-catalog/issues/198)

## Description

Just came across this scenario where I have two similarly named functions.

*  `getSuggestions : String -> Cmd Msg` - which makes an Http.send request. 
* `decodeSuggestions : Json.Decode.Decoder { ingredients : List String, cuisines : List String }` - which decodes the JSON response from that send request.

I accidentally used the `getSuggestions` as my expected HTTP result. e.g. `Http.expectJson getSuggestions`. 

Doing this the compiler gave me the following error message: 

```
Detected errors in 1 module.
==================================== ERRORS ====================================



-- TYPE MISMATCH ---------------------------------------- ./src/Search/State.elm

The argument to function `expectJson` is causing a mismatch.

56|                            Http.expectJson getSuggestions
                                               ^^^^^^^^^^^^^^
Function `expectJson` is expecting the argument to be:

    Json.Decode.Decoder a

But it is:

    String -> Cmd Msg

Hint: It looks like a function needs 1 more argument.
```

Now I probably should've picked up that the wrong function was being used, but as I'm sure some of you have experienced before, you see partially what you expected (in my case that I was using the functions with "suggestions" in its name) and so it looks correct to you (are oblivious to the fact it's the wrong thing). So then I spent the next while looking at the types, referring back to the docs, and back at my code just puzzled why it wasn't working. Only to finally realise it's the wrong function name.

So for dummies like myself, I thought couldn't this type of situation be improved? Like how the compiler will give you suggestions if you misspelt a variable/function/type. I think it should be possible, though maybe it'll lead to more confusing errors? But basically would it be possible for the compiler to infer or at least assume what the most likely case would be given our intentions. To achieve this I think you could look at the types and weight what is the more likely scenario.

For instance in the case given above the `getSuggestions` function returns the result of the `Http.send` function. I've provided explicit type declarations for both the `getSuggestions` and `decodeSuggestions` functions. So the likelihood that I was meaning to pass a `Json.Decode.Decoder a` to `Http.expectJson` is very likely, while the likelihood that I wanted to pass the result `String -> Cmd Msg` is rather unlikely (as all the code before it in that current function would be wrong, you'd have to assume it's either wrong or I was missing some other function/operation).

So based of that knowing that it's likely the `getSuggestions` function was not intended to be used, it could then look for functions/variables that do return the expected result (`Json.Decode.Decoder a `) with the given arguments (in this case none) and find what the closest cases would be (`getSuggestions` is quite close to `decodeSuggestions`). Then display a hint (similar to the misspelling hint) with the likely alternatives.

Even if I had correctly called `getSuggestions` (so I'd be passing a `Cmd Msg` instead to `Http.expectJson`) you could still infer that the other case is more likely, although in this scenario you would likely check for functions that accept one `String` argument (as the likelihood of calling the wrong function and passing in the wrong arguments is probably less likely). In which case it would look for alternative functions that accept those arguments but returns the correct result which in this case it wouldn't find (or well it probably would find some from the Json.Decode module though the function names would not be similar). Potentially you could have it treat an ambiguous case like this by looking for other functions with the expected return but non-compatible arguments (and so assume it's all wrong). But I'm not sure how likely that scenario would be.

I think this might fall under the issue https://github.com/elm-lang/error-message-catalog/issues/191 ? Anyway not sure if this idea would be the way to go, as (aside from it being quite involved to handle) it might end up making the errors even more confusing.
