# Structured Compiler Error Parsing for Autonomous Agents

## 1. The Sovereign Law
Autonomous coding agents achieve deterministic, zero-hallucination error recovery in Elm by invoking `elm make --report=json`, parsing structured compiler diagnostics into exact source file paths, precise AST `region` coordinates (start/end line and column), and structured `message` chunks, bypassing terminal ANSI escape code ambiguity.

## 2. The Trigger & Context
When automated agent loops or build scripts attempt to parse human-readable terminal output from `elm make`, they run into severe parsing friction:
- **ANSI Terminal Scraping Fragility:** Terminal outputs contain ANSI escape codes, horizontal separator bars (`-- TYPE MISMATCH -------------------`), and ASCII art tables that confuse automated regexes.
- **Ambiguous Error Regions:** Human error messages highlight code snippets visually, but extracting the exact `(startLine, startColumn)` to `(endLine, endColumn)` coordinates requires error-prone line counting.
- **Multiple Simultaneous Errors:** Scraping terminal text often only captures the first or last error in a multi-module build, blinding the agent to the full scope of compiler feedback.

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | Human Terminal Output (`elm make`) | Structured JSON Output (`elm make --report=json`) |
| :--- | :--- | :--- |
| **Intended Consumer** | Human eyes in a terminal with 80+ character width and ANSI colors. | Automated IDE plugins, language servers, CI/CD pipelines, and autonomous AI agents. |
| **Output Stream** | Formatted text sent to `stderr` / `stdout`. | Pure JSON string emitted to `stderr` on compilation failure. |
| **Error Coordinates** | Visual underlines (`^^^^`) and line numbers. | Explicit `region: { start: { line, column }, end: { line, column } }` objects. |
| **Error Classification** | Title header (e.g. `TYPE MISMATCH`, `NAMING ERROR`). | Machine-readable `title` field (e.g. `"TYPE MISMATCH"`, `"MISSING PATTERNS"`). |

---

## 4. The Elm JSON Error Schema

The JSON emitted by `elm make --report=json` conforms to two top-level schemas:

### 1. `compile-errors` (Source Code Compilation Failures)
```json
{
  "type": "compile-errors",
  "errors": [
    {
      "path": "/home/ian/Projects/pinboard-reorg/src/Main.elm",
      "name": "Main",
      "problems": [
        {
          "title": "TYPE MISMATCH",
          "region": {
            "start": { "line": 42, "column": 13 },
            "end": { "line": 42, "column": 25 }
          },
          "message": [
            "The 1st argument to `update` is not what I expect:\n\n42|   update ",
            { "bold": false, "underline": false, "color": "RED", "string": "IncrementMsg" },
            " model\n\nThis argument is a `String` but `update` needs a:\n\n    ",
            { "bold": true, "underline": false, "color": "YELLOW", "string": "Msg" }
          ]
        }
      ]
    }
  ]
}
```

### 2. `error` (Global / Configuration Failures, e.g. `elm.json` corruption)
```json
{
  "type": "error",
  "path": "/home/ian/Projects/pinboard-reorg/elm.json",
  "title": "CORRUPT ELM.JSON",
  "message": [
    "Your `elm.json` is missing the `elm-version` field."
  ]
}
```

---

## 5. The Pattern: Automated Agent Evaluation Loop

```elm
module ElmCompilerParser exposing
    ( CompileError
    , ErrorReport(..)
    , Problem
    , Region
    , decoder
    , flattenMessage
    )

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (required)

type ErrorReport
    = SourceErrors (List CompileError)
    | GlobalError { path : Maybe String, title : String, message : String }

type alias CompileError =
    { path : String
    , name : String
    , problems : List Problem
    }

type alias Problem =
    { title : String
    , region : Region
    , rawMessage : String
    }

type alias Region =
    { startLine : Int
    , startColumn : Int
    , endLine : Int
    , endColumn : Int
    }

decoder : Decoder ErrorReport
decoder =
    Decode.field "type" Decode.string
        |> Decode.andThen
            (\errType ->
                case errType of
                    "compile-errors" ->
                        Decode.map SourceErrors
                            (Decode.field "errors" (Decode.list compileErrorDecoder))

                    "error" ->
                        Decode.map GlobalError globalErrorDecoder

                    unknown ->
                        Decode.fail ("Unknown compiler error report type: " ++ unknown)
            )

compileErrorDecoder : Decoder CompileError
compileErrorDecoder =
    Decode.succeed CompileError
        |> required "path" Decode.string
        |> required "name" Decode.string
        |> required "problems" (Decode.list problemDecoder)

problemDecoder : Decoder Problem
problemDecoder =
    Decode.succeed Problem
        |> required "title" Decode.string
        |> required "region" regionDecoder
        |> required "message" (Decode.list messageChunkDecoder |> Decode.map String.concat)

regionDecoder : Decoder Region
regionDecoder =
    Decode.map4 Region
        (Decode.at [ "start", "line" ] Decode.int)
        (Decode.at [ "start", "column" ] Decode.int)
        (Decode.at [ "end", "line" ] Decode.int)
        (Decode.at [ "end", "column" ] Decode.int)

messageChunkDecoder : Decoder String
messageChunkDecoder =
    Decode.oneOf
        [ Decode.string
        , Decode.field "string" Decode.string
        ]

globalErrorDecoder : Decoder { path : Maybe String, title : String, message : String }
globalErrorDecoder =
    Decode.map3 (\p t m -> { path = p, title = t, message = m })
        (Decode.maybe (Decode.field "path" Decode.string))
        (Decode.field "title" Decode.string)
        (Decode.field "message" (Decode.list messageChunkDecoder |> Decode.map String.concat))

flattenMessage : List Problem -> String
flattenMessage problems =
    problems
        |> List.map (\p -> "[" ++ p.title ++ " L" ++ String.fromInt p.region.startLine ++ "] " ++ p.rawMessage)
        |> String.join "\n\n"
```
