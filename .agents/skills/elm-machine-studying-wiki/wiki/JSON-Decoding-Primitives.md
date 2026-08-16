# JSON Decoding Primitives & Encoding

## 1. The Sovereign Law
JSON decoding in Elm is an explicit, total transformation from untyped wire strings to strongly-typed Elm data structures: wire formats are decoupled from domain models through composable primitive decoders (`string`, `int`, `float`, `bool`), path selectors (`field`, `at`), and combinators (`map`..`map8`), guaranteeing that malformed server payloads are quarantined at the boundary with structured error diagnostics.

## 2. The Trigger & Context
Developers arriving from JavaScript (`JSON.parse`) or TypeScript often expect automatic deserialization or runtime type casting. When confronted with Elm's explicit decoders, common stumbling blocks emerge:
- **Blind `Decode.maybe` Usage:** Wrapping a field decoder in `Decode.maybe` to handle optional fields. If the server sends an integer instead of a string, or renames a required key, `Decode.maybe` silently swallows the error and yields `Nothing`, masking backend schema drift.
- **`Decode.nullable` vs. `Decode.maybe` Confusion:** `nullable decoder` specifically matches JSON `null` or a valid decoded value; it fails loudly if the type is wrong or the key is absent. `maybe decoder` catches *any* failure.
- **Nested Field Navigation Friction:** Using multiple chained calls instead of `Decode.at [ "data", "user", "profile" ] Decode.string`.
- **The 8-Field Limit of `map8`:** Attempting to decode records with more than 8 fields using standard library `mapN` functions before discovering pipeline decoders.

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | JavaScript / TypeScript Intuition | Elm 0.19.1 Sovereign Semantics |
| :--- | :--- | :--- |
| **Parsing Mechanism** | `JSON.parse(str)` returns an untyped `any` or casted interface. | `Decode.decodeString decoder jsonString` returns `Result Decode.Error a`. Pure, safe, and exhaustive. |
| **Field Mapping** | Frontend property names must match JSON key names 1:1. | Decoders decouple wire format from domain models: JSON key `"created_at"` can map cleanly into a domain record field `createdAt : Posix`. |
| **Schema Validation** | Validated post-parse or left to runtime luck; missing fields result in `undefined is not a function`. | The decoder is the validator. If a single field fails, the entire decode operation fails cleanly with a human-readable diff. |
| **Serialization** | `JSON.stringify(obj)` dumps object memory directly. | `Json.Encode.object` builds explicit JSON ASTs (`Encode.Value`), preventing internal fields from leaking across the wire. |

---

## 4. The Pattern

### ❌ THE WRONG WAY: Swallowing Errors with `Decode.maybe` (Anti-Pattern)

```elm
module AntiPattern.JsonSwallow exposing (..)

import Json.Decode as Decode exposing (Decoder)

type alias BrokenUser =
    { id : Int
    , bio : Maybe String
    }

-- ANTI-PATTERN: Using maybe for everything swallows backend schema breaks
userDecoderBad : Decoder BrokenUser
userDecoderBad =
    Decode.map2 BrokenUser
        -- If backend renames "id" to "user_id", this silently yields a decode error,
        -- but if wrapped in maybe, it silently produces default corrupted state!
        (Decode.field "id" Decode.int)
        (Decode.maybe (Decode.field "bio" Decode.string))
```

---

### ✅ THE RIGHT WAY: Explicit Primitive Decoders & Encoders

#### 1. Composable Record Decoders (`User.elm`)

```elm
module User exposing
    ( User
    , decoder
    , encode
    , listDecoder
    )

import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode

type alias User =
    { id : Int
    , name : String
    , email : String
    , bio : Maybe String -- Explicitly nullable in JSON
    , isActive : Bool
    , avatarUrl : String
    }

-- Precise combinator using Decode.map6 (up to map8 in elm/json)
decoder : Decoder User
decoder =
    Decode.map6 User
        (Decode.field "id" Decode.int)
        (Decode.field "name" Decode.string)
        (Decode.field "email" Decode.string)
        (Decode.field "bio" (Decode.nullable Decode.string))
        (Decode.field "is_active" Decode.bool)
        (Decode.at [ "metadata", "profile", "avatar_url" ] Decode.string)

-- Composing list decoders seamlessly
listDecoder : Decoder (List User)
listDecoder =
    Decode.field "users" (Decode.list decoder)

-- 2. Explicit JSON Encoding (Model -> Wire)
encode : User -> Encode.Value
encode user =
    Encode.object
        [ ( "id", Encode.int user.id )
        , ( "name", Encode.string user.name )
        , ( "email", Encode.string user.email )
        , ( "bio"
          , case user.bio of
                Just text ->
                    Encode.string text

                Nothing ->
                    Encode.null
          )
        , ( "is_active", Encode.bool user.isActive )
        , ( "metadata"
          , Encode.object
                [ ( "profile"
                  , Encode.object [ ( "avatar_url", Encode.string user.avatarUrl ) ]
                  )
                ]
          )
        ]
```

#### 2. Running the Decoder & Inspecting Errors

```elm
module Main exposing (decodePayload)

import Json.Decode as Decode
import User exposing (User)

decodePayload : String -> Result String User
decodePayload rawJson =
    case Decode.decodeString User.decoder rawJson of
        Ok user ->
            Ok user

        Err error ->
            -- Decode.errorToString provides visual ASCII tree diff of exact failure point
            Err (Decode.errorToString error)
```
