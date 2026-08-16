---
issue_number: 247
title: "Nullable Json decode error message"
state: CLOSED
author: "saleemjaffer"
created_at: "2017-12-13T07:41:45Z"
url: "https://github.com/elm/error-message-catalog/issues/247"
labels: ['no sscce']
---

# Issue #247: Nullable Json decode error message

**State:** `CLOSED` | **Author:** @saleemjaffer | **Source:** [https://github.com/elm/error-message-catalog/issues/247](https://github.com/elm/error-message-catalog/issues/247)

## Description

I have a JSON where the value for a key is be nullable. The value for this key is a complex-ish JSON object. If the value is an incorrect JSON, the decoder fails and the compiler just complains saying `The value is expected to be null but it is ...`. It is hard to figure out what actually is wrong since the JSON is complex. Can we get a better error message for this?

I use Json.Decode.nullable to decode this nullable JSON.
