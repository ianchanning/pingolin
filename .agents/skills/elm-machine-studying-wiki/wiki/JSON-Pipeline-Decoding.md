# JSON Pipeline & Dependent Decoding

## 1. The Sovereign Law
Construct arbitrarily sized, highly structured, or conditionally dependent JSON decoders using the Pipeline pattern (`Json.Decode.Pipeline`) and monadic sequencing (`Decode.andThen`), transcending the standard library `map8` arity limit and enforcing domain invariants directly during the decoding phase via `Decode.fail`.

## 2. The Trigger & Context
When decoding real-world production APIs, developers encounter scenarios that exceed simple `mapN` primitives:
- **The >8 Field Record Limit:** Elm's `elm/json` library only provides `map` through `map8`. Attempting to decode a 15-field record with standard `mapN` forces developers to nest artificial sub-records or chain awkward tuple transformations.
- **Dependent / Tagged Union Decoding:** When the schema of a JSON payload depends on a type discriminator field (e.g. `{"type": "bookmark", "url": "..."}` vs `{"type": "note", "content": "..."}`), static `mapN` cannot branch dynamically.
- **In-Band Domain Validation:** When fields must satisfy domain constraints (e.g. non-empty string, positive integer, known enum variant), decoding a raw primitive and validating later forces downstream code to handle invalid intermediate states.
- **Distinguishing Missing vs Null Keys:** `optional` in `Json.Decode.Pipeline` cleanly handles missing keys or `null` values by falling back to a default value without swallowing syntax errors.

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | Standard `elm/json` (`mapN`) | Pipeline & `andThen` Decoding |
| :--- | :--- | :--- |
| **Record Size** | Strictly capped at 8 fields per record. | Unlimited fields chained cleanly via `succeed RecordType \|> required ... \|> optional ...`. |
| **Optional Fields** | Must manually combine `field` with `maybe` or `nullable`. | `optional "key" decoder defaultValue` handles both missing keys and `null` values cleanly. |
| **Polymorphic Branching** | Limited to `oneOf` trial-and-error parsing across all possible shapes. | `Decode.field "type" Decode.string |> Decode.andThen tagDecoder` branches deterministically with zero redundant parsing. |
| **Validation Point** | Decode into loose model, then run post-decode validation checks in `update`. | Parse and validate in one step using `Decode.andThen (\val -> if isValid val then succeed val else fail "Error")`. |

---

## 4. The Pattern

### ❌ THE WRONG WAY: Nested `map8` Workarounds & Loose Post-Validation

```elm
module AntiPattern.HugeRecord exposing (..)

import Json.Decode as Decode exposing (Decoder)

type alias HugeRecord =
    { f1 : String, f2 : String, f3 : String, f4 : String
    , f5 : String, f6 : String, f7 : String, f8 : String
    , f9 : String, f10 : String
    }

-- ANTI-PATTERN: Breaking records into arbitrary tuples to fit into map2 / map8
hugeDecoderBad : Decoder HugeRecord
hugeDecoderBad =
    Decode.map2
        (\( f1, f2, f3, f4, f5, f6, f7, f8 ) ( f9, f10 ) ->
            HugeRecord f1 f2 f3 f4 f5 f6 f7 f8 f9 f10
        )
        (Decode.map8 Tuple8
            (Decode.field "f1" Decode.string)
            (Decode.field "f2" Decode.string)
            (Decode.field "f3" Decode.string)
            (Decode.field "f4" Decode.string)
            (Decode.field "f5" Decode.string)
            (Decode.field "f6" Decode.string)
            (Decode.field "f7" Decode.string)
            (Decode.field "f8" Decode.string)
        )
        (Decode.map2 Tuple2
            (Decode.field "f9" Decode.string)
            (Decode.field "f10" Decode.string)
        )
```

---

### ✅ THE RIGHT WAY: Pipeline Decoders & Dependent `andThen` Validation

#### 1. Large Record Pipeline (`Bookmark.elm`)

```elm
module Bookmark exposing (Bookmark, decoder)

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (hardcoded, optional, required, requiredAt)

type alias Bookmark =
    { id : Int
    , href : String
    , description : String
    , extended : String
    , tags : List String
    , time : String
    , shared : Bool
    , toRead : Bool
    , revision : Int
    , author : String
    }

-- Unlimited fields composed linearly using Pipeline syntax
decoder : Decoder Bookmark
decoder =
    Decode.succeed Bookmark
        |> required "id" Decode.int
        |> required "href" Decode.string
        |> required "description" Decode.string
        |> optional "extended" Decode.string ""
        |> required "tags" (Decode.string |> Decode.map (String.split " " >> List.filter (not << String.isEmpty)))
        |> required "time" Decode.string
        |> optional "shared" Decode.bool True
        |> optional "toread" Decode.bool False
        |> hardcoded 1 -- Set default internal revision counter
        |> requiredAt [ "meta", "author" ] Decode.string
```

#### 2. Dependent & Custom Validation Decoding (`FeedItem.elm`)

```elm
module FeedItem exposing (FeedItem(..), decoder)

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (required)

type FeedItem
    = BookmarkItem { url : String, title : String }
    | NoteItem { title : String, body : String }
    | SystemAlert { level : String, message : String }

-- Step 1: Read the discriminator tag and branch via andThen
decoder : Decoder FeedItem
decoder =
    Decode.field "type" Decode.string
        |> Decode.andThen decoderForType

-- Step 2: Deterministic decoding based on discriminator
decoderForType : String -> Decoder FeedItem
decoderForType itemType =
    case itemType of
        "bookmark" ->
            Decode.succeed (\url title -> BookmarkItem { url = url, title = title })
                |> required "url" validatedUrlDecoder
                |> required "title" Decode.string

        "note" ->
            Decode.succeed (\title body -> NoteItem { title = title, body = body })
                |> required "title" Decode.string
                |> required "body" Decode.string

        "alert" ->
            Decode.succeed (\lvl msg -> SystemAlert { level = lvl, message = msg })
                |> required "level" Decode.string
                |> required "message" Decode.string

        unknown ->
            Decode.fail ("Unknown feed item type discriminator: '" ++ unknown ++ "'")

-- Step 3: Custom in-band domain validation using Decode.fail
validatedUrlDecoder : Decoder String
validatedUrlDecoder =
    Decode.string
        |> Decode.andThen
            (\str ->
                if String.startsWith "http://" str || String.startsWith "https://" str then
                    Decode.succeed str

                else
                    Decode.fail ("URL must begin with http:// or https://, but received: " ++ str)
            )
```
