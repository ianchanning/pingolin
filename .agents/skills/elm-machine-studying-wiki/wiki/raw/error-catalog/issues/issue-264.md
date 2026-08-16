---
issue_number: 264
title: "Wrong error message for json parsing in elm.json"
state: CLOSED
author: "danfishgold"
created_at: "2018-08-25T09:55:39Z"
url: "https://github.com/elm/error-message-catalog/issues/264"
labels: ['parser']
---

# Issue #264: Wrong error message for json parsing in elm.json

**State:** `CLOSED` | **Author:** @danfishgold | **Source:** [https://github.com/elm/error-message-catalog/issues/264](https://github.com/elm/error-message-catalog/issues/264)

## Description

### Description

When there's a parsing issue somewhere in `elm.json`, I get this error message when I run `elm make Main.elm`:

```
-- BAD JSON ----------------------------------------------------------- elm.json

Something went wrong while parsing your code.

1| {
  ^
I do not have any suggestions though!

Can you get it down to a <http://sscce.org> and share it at
<https://github.com/elm/error-message-catalog/issues>? That way we can figure
out how to give better advice!
```

I figured out eventually that I had an extra comma in my `direct` dependency list.

### SSCCE

1. `elm init`
2. Add a trailing comma somewhere in `elm.json`
3. `elm make Main.elm`

### Side Note

The prompt in the error message to add this issue here is 100% the reason I did it. It's wonderful!
