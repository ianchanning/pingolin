---
issue_number: 218
title: "min is ambiguous: Basics -vs- Html.Attributes"
state: OPEN
author: "pdavidow"
created_at: "2017-05-10T16:04:26Z"
url: "https://github.com/elm/error-message-catalog/issues/218"
labels: ['no sscce']
---

# Issue #218: min is ambiguous: Basics -vs- Html.Attributes

**State:** `OPEN` | **Author:** @pdavidow | **Source:** [https://github.com/elm/error-message-catalog/issues/218](https://github.com/elm/error-message-catalog/issues/218)

## Description

**input [ type_ "number", min "1"] []**
gives error:
````
-- TYPE MISMATCH ------------------------------------------------------ Main.elm

The 1st and 2nd entries in this list are different types of values.

40|             [ type_ "number", min "1"]
                                  ^^^^^^^
The 1st entry has this type:

    Html.Attribute msg

But the 2nd is:

    String -> String

Hint: It looks like a function needs 1 more argument.
````

but should rather give something like shown for https://ellie-app.com/38VC4xWKLxMa1/0:
````
This usage of variable min is ambiguous.
Maybe you want one of the following?

Basics.min
Html.Attributes.min
````

Same problem for _max_.
