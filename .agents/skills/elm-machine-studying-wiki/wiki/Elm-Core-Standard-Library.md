# Elm Core Standard Library & Collection Disciplines

## 1. The Sovereign Law
The `elm/core` standard library is built entirely on total, immutable, pure data structures: collection operations never throw runtime exceptions, `Dict` keys are strictly restricted to `comparable` primitives (`Int`, `Float`, `Char`, `String`, and tuples thereof), and list construction demands $O(1)$ prepending (`::`) over $O(N)$ concatenation (`++`).

## 2. The Trigger & Context
Developers accustomed to standard JavaScript arrays, mutable HashMaps, or Python dictionaries frequently hit performance or compiler barriers:
- **The Non-Comparable `Dict` Key Trap:** Attempting to use a custom type (`type UserId = UserId Int`) or a record as a key in `Dict.Dict UserId String`. The compiler halts with: *"The type `UserId` is not comparable."*
- **Quadratic List Append Bottleneck ($O(N^2)$):** Iteratively appending items to the end of a list (`items ++ [ newItem ]`) inside recursive loops instead of prepending (`newItem :: items`) and reversing once at the end.
- **Partial Function Fallacy:** Expecting an unsafe index lookup like `list[0]`. In Elm, `List.head` returns `Maybe a`, forcing exhaustive handling of empty collections.
- **Misunderstanding `Task` vs `Cmd`:** A `Task err a` is a composable description of an asynchronous effect that can fail or succeed. It must be converted into a `Cmd msg` via `Task.attempt` (if failure is possible) or `Task.perform` (if `Task Never a`).

---

## 3. Developer Intent vs. Elm Semantics

| Dimension | JavaScript / Python Primitives | Elm 0.19.1 `elm/core` Semantics |
| :--- | :--- | :--- |
| **Dictionary Keys** | Any object, custom class, or hashable structure. | Strictly `comparable` primitives (`String`, `Int`, `Float`, `Char`, and tuples of comparables). Custom types must be serialized to comparable keys (`String` or `Int`). |
| **Index Access** | `arr[i]` returns `undefined` if out of bounds (silent bug). | Total functions: `List.head : List a -> Maybe a`, `Array.get : Int -> Array a -> Maybe a`. |
| **List Performance** | Dynamic arrays with $O(1)$ push. | Singly-linked immutable lists: `item :: list` is $O(1)$ allocation; `list ++ [ item ]` is $O(N)$ copy. |
| **Error Handling** | `try / catch` statements and thrown runtime exceptions. | Algebraic `Result error value` and `Maybe value`. Every possibility is explicitly checked by the type system. |

---

## 4. The Pattern

### ❌ THE WRONG WAY: Non-Comparable Dicts & $O(N^2)$ List Appends

```elm
module AntiPattern.CoreCollections exposing (..)

import Dict exposing (Dict)

type TagId = TagId Int

-- COMPILER ERROR: TagId is not comparable!
-- badDict : Dict TagId String
-- badDict = Dict.empty

-- ANTI-PATTERN: Quadratic list append in recursion
buildListBad : Int -> List Int -> List Int
buildListBad n acc =
    if n <= 0 then
        acc
    else
        -- O(N) copy on every iteration -> O(N^2) total runtime!
        buildListBad (n - 1) (acc ++ [ n ])
```

---

### ✅ THE RIGHT WAY: Idiomatic Dicts, Efficient Lists & Total Operations

#### 1. Comparable Key Serialization with Opaque Types (`TagDict.elm`)

```elm
module TagDict exposing (TagDict, TagId, empty, get, insert, tagIdFromString)

import Dict exposing (Dict)

type TagId
    = TagId String -- Opaque custom type

tagIdFromString : String -> TagId
tagIdFromString =
    TagId

type alias TagDict v =
    Dict String v -- Store internally as comparable String

empty : TagDict v
empty =
    Dict.empty

insert : TagId -> v -> TagDict v -> TagDict v
insert (TagId idStr) val dict =
    Dict.insert idStr val dict

get : TagId -> TagDict v -> Maybe v
get (TagId idStr) dict =
    Dict.get idStr dict
```

#### 2. High-Performance $O(1)$ List Construction & Safe Traversal (`FastList.elm`)

```elm
module FastList exposing (buildSequence, safeFirstElement)

-- O(1) Prepend and single O(N) reverse -> O(N) total runtime
buildSequence : Int -> List Int
buildSequence maxCount =
    buildHelper maxCount []
        |> List.reverse

buildHelper : Int -> List Int -> List Int
buildHelper n acc =
    if n <= 0 then
        acc

    else
        -- O(1) cons
        buildHelper (n - 1) (n :: acc)

-- Safe total deconstruction with fallback
safeFirstElement : List String -> String
safeFirstElement items =
    items
        |> List.head
        |> Maybe.withDefault "Default Item"
```

#### 3. Pure Task Sequencing with Zero Failure (`TimeHelper.elm`)

```elm
module TimeHelper exposing (getCurrentTimeCmd)

import Task
import Time

type Msg
    = CurrentTimeReceived Time.Posix

-- Task.perform can ONLY be used on Tasks whose error type is `Never`
getCurrentTimeCmd : Cmd Msg
getCurrentTimeCmd =
    Time.now
        |> Task.perform CurrentTimeReceived
```
