# Parse, Don't Validate in Elm

## 1. The Sovereign Law
Transform unstructured or weakly-typed data into rich, invariant-enforcing domain types at application boundaries (decoders, form parsers, URL routers) so downstream functions receive type-level proofs of validity rather than primitive values requiring repeated validation.

## 2. The Trigger & Context
Developers frequently write boolean validator predicates that inspect data without refining its type:
```elm
-- Anti-pattern: Returns Bool, throwing away the proof of validation!
isValidEmail : String -> Bool
```

This triggers the **Shotgun Parsing Antipattern** and severe architectural decay:
- **Shotgun Parsing:** Validating inputs piecemeal across processing logic—throwing a cloud of `if` checks across views, updates, and helpers, hoping one of them catches bad data.
- **Boolean Blindness:** If `isValidEmail rawInput` evaluates to `True`, the variable remains a raw `String`. Downstream functions cannot know at compile time whether the string was validated or if an unvalidated string was accidentally passed.
- **Defensive Re-Validation Tax:** Because functions cannot trust raw `String` or `Int` inputs, every helper function must re-validate or guard against empty strings, negative numbers, or malformed data.
- **Silent Degradation via `Maybe.withDefault`:** Masking parse failures by falling back to empty strings (`""`) or default IDs (`0`), poisoning the model with invalid placeholder data.

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | "Validate" (Anti-Pattern) | "Parse" (Elm 0.19.1 Sovereign Pattern) |
| :--- | :--- | :--- |
| **Function Signature** | `validate : a -> Bool` (Throws away validation context). | `parse : a -> Result Error ValidatedType` (Captures proof in type system). |
| **Data Representation** | Passes primitive types (`String`, `Int`) throughout the system. | Passes opaque custom types (`Email`, `PositiveInt`, `NonEmptyString`). |
| **Proof Preservation** | Downstream functions must re-verify preconditions or assume safety. | Downstream functions accept `ValidatedType`, making invalid inputs impossible to compile. |
| **Failure Handling** | Silent fallbacks via `Maybe.withDefault ""` or default dummy records. | Explicit failure handling at the boundary, preserving precise error messages. |

---

## 4. The Pattern

### ❌ THE WRONG WAY: Boolean Validation with Primitive Strings

```elm
module AntiPattern.UserRegistration exposing (..)

-- ANTI-PATTERN: Validation returns Bool, leaving email as a raw String
isValidEmail : String -> Bool
isValidEmail email =
    String.contains "@" email && String.length email > 5

-- Downstream helper: Cannot verify at compile time if email was actually validated!
sendWelcomeEmail : String -> Cmd msg
sendWelcomeEmail email =
    -- Fragile: Relies entirely on developer discipline not to pass invalid strings
    if isValidEmail email then
        Debug.todo "Send email"

    else
        Cmd.none
```

---

### ✅ THE RIGHT WAY: Opaque Domain Types with Boundary Parsers

#### 1. The Opaque Type Module (`Email.elm`)
Exposes the type and parser, but hides the constructor. Once an `Email` exists, it is mathematically guaranteed to be valid.

```elm
module Email exposing
    ( Email
    , Error(..)
    , fromString
    , toString
    )

{-| Opaque type: Construction is ONLY possible via `fromString`. -}
type Email
    = Email String

type Error
    = Empty
    | MissingAtSign
    | DomainTooShort

fromString : String -> Result Error Email
fromString raw =
    let
        trimmed =
            String.trim raw
    in
    if String.isEmpty trimmed then
        Err Empty

    else if not (String.contains "@" trimmed) then
        Err MissingAtSign

    else if String.length trimmed < 6 then
        Err DomainTooShort

    else
        Ok (Email trimmed)

toString : Email -> String
toString (Email emailStr) =
    emailStr
```

#### 2. Downstream Consumption with Total Compiler Safety (`Mailer.elm`)
Functions that require a valid email accept `Email`, never raw `String`.

```elm
module Mailer exposing (sendWelcomeNotification)

import Email exposing (Email)
import Http
import Json.Encode as Encode

-- COMPILE-TIME GUARANTEE: Impossible to invoke with an invalid or unvalidated email!
sendWelcomeNotification : Email -> Cmd msg
sendWelcomeNotification email =
    Http.post
        { url = "/api/welcome"
        , body =
            Http.jsonBody <|
                Encode.object
                    [ ( "recipient", Encode.string (Email.toString email) )
                    ]
        , expect = Http.expectWhatever (\_ -> Debug.todo "Handle response")
        }
```

#### 3. Form Boundary Parser (`RegistrationForm.elm`)

```elm
module RegistrationForm exposing (Model, Msg(..), init, update, view)

import Email exposing (Email)
import Html exposing (Html, button, div, input, p, text)
import Html.Attributes exposing (placeholder, value)
import Html.Events exposing (onClick, onInput)

type alias Model =
    { rawInput : String
    , parsedEmail : Maybe (Result Email.Error Email)
    }

init : Model
init =
    { rawInput = ""
    , parsedEmail = Nothing
    }

type Msg
    = InputChanged String
    | SubmitClicked

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        InputChanged str ->
            ( { model | rawInput = str, parsedEmail = Nothing }, Cmd.none )

        SubmitClicked ->
            -- Parse at the boundary!
            ( { model | parsedEmail = Just (Email.fromString model.rawInput) }
            , Cmd.none
            )

view : Model -> Html Msg
view model =
    div []
        [ input [ placeholder "Enter email...", value model.rawInput, onInput InputChanged ] []
        , button [ onClick SubmitClicked ] [ text "Register" ]
        , case model.parsedEmail of
            Just (Ok validEmail) ->
                p [] [ text ("Valid email ready: " ++ Email.toString validEmail) ]

            Just (Err Email.Empty) ->
                p [] [ text "Email cannot be empty." ]

            Just (Err Email.MissingAtSign) ->
                p [] [ text "Email must contain an @ symbol." ]

            Just (Err Email.DomainTooShort) ->
                p [] [ text "Email domain is too short." ]

            Nothing ->
                text ""
        ]
```
