---
issue_number: 242
title: "Record type suggestion causes crash"
state: OPEN
author: "MarkDBlackwell"
created_at: "2017-09-30T13:54:39Z"
url: "https://github.com/elm/error-message-catalog/issues/242"
labels: ['types', 'x-record']
---

# Issue #242: Record type suggestion causes crash

**State:** `OPEN` | **Author:** @MarkDBlackwell | **Source:** [https://github.com/elm/error-message-catalog/issues/242](https://github.com/elm/error-message-catalog/issues/242)

## Description

Elm's documentation (located [here](https://github.com/elm-lang/elm-lang.org/blame/5624d9ed9f54a8a53f98dac41f826e0fe420b45f/src/pages/docs/syntax.elm#L169)) at [elm-lang.org/docs/syntax#records](http://elm-lang.org/docs/syntax#records) says:

##### Records

```elm
dist {x,y} =                    -- pattern matching on fields
  sqrt (x^2 + y^2)
```

Now, in order to come up with a difficult or obscure portion of a type signature, I (usually) ask the Elm compiler to generate said portion. Often, I start with the obviously-wrong type of String, and let the compiler suggest what belongs in there.

BTW, generally (I suppose), if we comment out the entire type signature instead, then we withhold some helpful clues from the Elm compiler. So my code was:

```elm
type alias Artist =
    String

type alias Title =
    String

type alias SongComplex =
    { artist : Artist
    , title : Title
    , timestamp : String
    }

type alias SongSimple =
    { artist : Artist
    , title : Title
    }

song2SongSimple : String -> SongSimple
song2SongSimple { artist, title } =
    SongSimple
        artist
        title
```

Elm's error message was:

```
-- TYPE MISMATCH ------------------------------------------ [filename]

This record is causing problems in this pattern match.

188| song2SongSimple { artist, title } =
                       ^^^^^^^^^^^^^^^^^
The pattern matches things of type:

    String

But the values it will actually be trying to match are:

    { c | artist : a, title : b }
```

Therefore, in my code, I replaced `String` with the suggestion from the Elm compiler:

```elm
song2SongSimple : { c | artist : a, title : b } -> SongSimple
song2SongSimple { artist, title } =
    SongSimple
        artist
        title
```

Then Elm's error message was:

```
Processing multiple files...
[                                                  ] - 0 / 1elm-make.exe: It looks like something went wrong with the type inference algorithm.

Unable to generalize a type variable. It is not unranked.

Please create a minimal example that triggers this problem and report it to
<https://github.com/elm-lang/elm-compiler/issues>
elm-make.exe: thread blocked indefinitely in an MVar operation
```

BTW, I'm running Elm .18 on Git for Windows:

```bash
$ elm --version
0.18.0

$ bash --version
GNU bash, version 4.3.46(2)-release (i686-pc-msys)
Copyright (C) 2013 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
```

Later, after some experimentation in `elm-repl`, I tried commenting out the entire type signature. From the better, resulting Elm compiler suggestion, I learned that the portion (of the full type signature) replacing `String` actually should be:

```elm
{ a | artist : Artist, title : Title }
```

So, for fresh, Elm-newby minds such as mine, perhaps the Elm compiler's suggestion to replace `String`—appearing under the text, "But the values it will actually be trying to match are"—shouldn't be `{ c | artist : a, title : b }`, but instead should be:

```elm
{ a | artist : String, title : String }
```
