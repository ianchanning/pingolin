---
issue_number: 149
title: "Misleading \"Based on its definition\""
state: CLOSED
author: "app/"
created_at: "2016-08-02T11:12:52Z"
url: "https://github.com/elm/error-message-catalog/issues/149"
labels: ['no sscce']
---

# Issue #149: Misleading "Based on its definition"

**State:** `CLOSED` | **Author:** @app/ | **Source:** [https://github.com/elm/error-message-catalog/issues/149](https://github.com/elm/error-message-catalog/issues/149)

## Description

I'm setting up for SVG: 

![problem](https://cloud.githubusercontent.com/assets/8081877/17326529/d7fcb310-58a9-11e6-9c71-843d9e827a06.png)

I've accidentally missed `.width` off `windowSize` in the `width` expression. I get this:

![error](https://cloud.githubusercontent.com/assets/8081877/17326555/0a1be8e8-58aa-11e6-93b3-28c70dbb89f4.png)

"Based on its definition" makes me go off looking at my model's definition, which is fine:

![screen shot 2016-08-02 at 12 11 01](https://cloud.githubusercontent.com/assets/8081877/17326598/3db30812-58aa-11e6-9bb2-975394234b81.png)

Spotted the missing `.width` by chance and program compiles. Suggest pointing towards it in the error message.

