---
issue_number: 232
title: "Undefined Maybe type field in inbound port gives incorrect error message"
state: OPEN
author: "janwirth"
created_at: "2017-08-21T10:16:07Z"
url: "https://github.com/elm/error-message-catalog/issues/232"
labels: []
---

# Issue #232: Undefined Maybe type field in inbound port gives incorrect error message

**State:** `OPEN` | **Author:** @janwirth | **Source:** [https://github.com/elm/error-message-catalog/issues/232](https://github.com/elm/error-message-catalog/issues/232)

## Description

**Summary**
I have two ports: One outbound and one inbound. They accept the same type essentially.
The inbound port takes an array of that type.

Then inbound port was choking on the incoming data.

The fix was to provide null for any undefined field in geolocation or set geolocation to null if itself was undefined.
- However the error message gave me little support in figuring that out.
- Should the incoming port really choke in undefined maybe types?
- I think this possibly relates to https://github.com/elm-lang/core/issues/606

**The error message:**
```
Uncaught Error: Trying to send an unexpected type of value through port `items`:
I ran into the following problems at _[0].geolocation:

Expecting null but instead got: {"coords":{"accuracy":24,"latitude":47.5324616,"longitude":12.2500232},"timestamp":1503248041607}
Expecting an object with a field named `altitude` at _.coords but instead got: {"accuracy":24,"latitude":47.5324616,"longitude":12.2500232}

   (stacktrace from obfuscated code. I use the firebase SDK)
    at send (main.js:13268)
    at main.js:32923
    at main.js:26332
    at fc (main.js:26196)
    at bf (main.js:26261)
    at cf (main.js:26260)
    at Qg.g.Gb (main.js:26351)
    at Ag.g.wd (main.js:26315)
    at og.wd (main.js:26305)
    at Yf.Xf (main.js:26303)
```

**The Type signatures:**
```elm
type alias JsonItem = {
    description : String,
    image : String,
    price : Int,
    title : String,
    id: String,
    geolocation: Maybe Position
  }
-- JS-API morphic
type alias Position = {
    coords: Coordinates
  , timestamp: Int
}

type alias Coordinates =
  {
    accuracy : Float
  , altitude : Maybe Float
  , altitudeAccuracy : Maybe Float
  , heading : Maybe Float
  , latitude : Float
  , longitude : Float
  , speed : Maybe Float
  }

```

**The ports:**
```
port submit : JsonItem -> Cmd msg

port items : (List JsonItem -> msg) -> Sub msg
```

**Outbound data:**
```json
{
  "description": "oaerisneioanrstieoarnst",
  "image": "",
  "price": 0,
  "title": "",
  "id": "",
  "geolocation": {
    "coords": {
      "accuracy": 24,
      "altitude": null,
      "altitudeAccuracy": null,
      "heading": null,
      "latitude": 47.5324616,
      "longitude": 12.2500232,
      "speed": null
    },
    "timestamp": 1503248041607
  }
}
```

**Inbound data**
```json
[
  {
    "description": "oaerisneioanrstieoarnst",
    "geolocation": {
      "coords": {
        "accuracy": 24,
        "latitude": 47.5324616,
        "longitude": 12.2500232
      },
      "timestamp": 1503248041607
    },
    "id": "-Ks-ZCuJbk1Alu3EKKCk",
    "image": "",
    "price": 0,
    "title": ""
  }
]
```
