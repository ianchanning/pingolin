---
issue_number: 167
title: "omitted closing square bracket at end of classList list"
state: CLOSED
author: "FAQinghere"
created_at: "2016-09-30T07:00:03Z"
url: "https://github.com/elm/error-message-catalog/issues/167"
labels: ['parser', 'no sscce']
---

# Issue #167: omitted closing square bracket at end of classList list

**State:** `CLOSED` | **Author:** @FAQinghere | **Source:** [https://github.com/elm/error-message-catalog/issues/167](https://github.com/elm/error-message-catalog/issues/167)

## Description

In a view function, using classList from Html.Attributes, when a terminating square bracket is omitted from the end of the argument to classList, the following error is given:

```
-- SYNTAX PROBLEM ------------------------------------------ ./src/Layout.elm                                                                                

I need whitespace, but got stuck on what looks like a new declaration. You are                                                                                  
either missing some stuff in the declaration above or just need to add some                                                                                     
spaces here:                                                                                                                                                    


I am looking for one of the following things:                                                                                                                   

    whitespace 

```

