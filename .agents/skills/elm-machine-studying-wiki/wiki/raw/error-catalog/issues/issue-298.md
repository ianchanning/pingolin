---
issue_number: 298
title: "Unhelpful compiler error message: \"and\" should suggest \"&&\""
state: OPEN
author: "skyqrose"
created_at: "2019-04-02T01:50:16Z"
url: "https://github.com/elm/error-message-catalog/issues/298"
labels: ['naming']
---

# Issue #298: Unhelpful compiler error message: "and" should suggest "&&"

**State:** `OPEN` | **Author:** @skyqrose | **Source:** [https://github.com/elm/error-message-catalog/issues/298](https://github.com/elm/error-message-catalog/issues/298)

## Description

**Quick Summary:**

When trying to compile code with  `and`, the compiler does not give any suggestion to use `&&` instead.

It gives this unhelpful error message:
```
naming error
Line 21, Column 12
I cannot find a `and` variable:

21|     , True and True
               ^^^
These names seem close though:

    abs
    tan
    acos
    asin

Hint: Read <https://elm-lang.org/0.19.0/imports> to see how `import`
declarations work in Elm.
```

Expected: there would be some hint to use `&&` instead. For example, when using `&` there is a helpful error message:
```
unknown operator
Line 22, Column 12
I do not recognize the (&) operator.

22|     , True & True
               ^
Is there an `import` and `exposing` entry for it? Maybe you want (&&) or (*)
instead?
```

An even better example is the excellent explanation given when trying to use `!=` instead of `/=`
```
unknown operator
Line 23, Column 12
Elm uses a different name for the “not equal” operator:

23|     , True != True
               ^^
Switch to (/=) instead.

Note: Our (/=) operator is supposed to look like a real “not equal” sign (≠). I
hope that history will remember (!=) as a weird and temporary choice.
```

Same goes for `|` suggesting `||`, but `or` giving an unhelpful error.

[Ellie showing these error messages](https://ellie-app.com/58DHFYvhsQ8a1)

- **Elm:** 0.19
- **Browser:** n/a
- **Operating System:** n/a
