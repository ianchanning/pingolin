---
title: "Elm SPA RealWorld Example App"
category: "cat:tea"
source_url: "https://github.com/rtfeldman/elm-spa-example"
ingested_at: "2026-08-16"
key_concepts: "Canonical production SPA layout: page modules, shared session state, global `Viewer`"
---

# Elm SPA RealWorld Example App

**Source URL:** [https://github.com/rtfeldman/elm-spa-example](https://github.com/rtfeldman/elm-spa-example)  
**Category:** `cat:tea` | **Ingested:** `2026-08-16`  
**Key Concepts:** Canonical production SPA layout: page modules, shared session state, global `Viewer`

---

[ rtfeldman ](/rtfeldman) / **[elm-spa-example](/rtfeldman/elm-spa-example) ** Public

  * [ Notifications ](/login?return_to=%2Frtfeldman%2Felm-spa-example) You must be signed in to change notification settings
  * [ Fork 516 ](/login?return_to=%2Frtfeldman%2Felm-spa-example)
  * [ Star  3.3k ](/login?return_to=%2Frtfeldman%2Felm-spa-example)




[](/rtfeldman/elm-spa-example)

master

[Branches](/rtfeldman/elm-spa-example/branches)[Tags](/rtfeldman/elm-spa-example/tags)

[](/rtfeldman/elm-spa-example/branches)[](/rtfeldman/elm-spa-example/tags)

Go to file

Code

Open more actions menu

## Folders and files

Name| Name| Last commit message| Last commit date  
---|---|---|---  
  
## Latest commit

## History

[75 Commits](/rtfeldman/elm-spa-example/commits/master/)[](/rtfeldman/elm-spa-example/commits/master/)75 Commits  
[assets](/rtfeldman/elm-spa-example/tree/master/assets "assets")| [assets](/rtfeldman/elm-spa-example/tree/master/assets "assets")|  |   
[src](/rtfeldman/elm-spa-example/tree/master/src "src")| [src](/rtfeldman/elm-spa-example/tree/master/src "src")|  |   
[tests](/rtfeldman/elm-spa-example/tree/master/tests "tests")| [tests](/rtfeldman/elm-spa-example/tree/master/tests "tests")|  |   
[.gitignore](/rtfeldman/elm-spa-example/blob/master/.gitignore ".gitignore")| [.gitignore](/rtfeldman/elm-spa-example/blob/master/.gitignore ".gitignore")|  |   
[.travis.yml](/rtfeldman/elm-spa-example/blob/master/.travis.yml ".travis.yml")| [.travis.yml](/rtfeldman/elm-spa-example/blob/master/.travis.yml ".travis.yml")|  |   
[LICENSE](/rtfeldman/elm-spa-example/blob/master/LICENSE "LICENSE")| [LICENSE](/rtfeldman/elm-spa-example/blob/master/LICENSE "LICENSE")|  |   
[README.md](/rtfeldman/elm-spa-example/blob/master/README.md "README.md")| [README.md](/rtfeldman/elm-spa-example/blob/master/README.md "README.md")|  |   
[elm.json](/rtfeldman/elm-spa-example/blob/master/elm.json "elm.json")| [elm.json](/rtfeldman/elm-spa-example/blob/master/elm.json "elm.json")|  |   
[index.html](/rtfeldman/elm-spa-example/blob/master/index.html "index.html")| [index.html](/rtfeldman/elm-spa-example/blob/master/index.html "index.html")|  |   
View all files  
  
## Repository files navigation

# [![RealWorld Example App](https://cloud.githubusercontent.com/assets/556934/25448178/3e7dc5c0-2a7d-11e7-8069-06da5169dae6.png)](https://cloud.githubusercontent.com/assets/556934/25448178/3e7dc5c0-2a7d-11e7-8069-06da5169dae6.png)

👉 I gave [a talk](https://www.youtube.com/watch?v=x1FU3e0sT1I) to explain the principles I used to build this. I highly recommend watching it!

> [Elm](http://elm-lang.org) codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.

### [Demo](https://elm-spa-example.netlify.com/) [RealWorld](https://github.com/gothinkster/realworld)

This codebase was created to demonstrate a fully fledged fullstack application built with [Elm](http://elm-lang.org) including CRUD operations, authentication, routing, pagination, and more.

For more information on how this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.

# How it works

Check out [the full writeup](https://dev.to/rtfeldman/tour-of-an-open-source-elm-spa)!

# Building

I decided not to include a build script, since all you need for a development build is the `elm` executable, and all you need on top of that for production is Uglify.

## Development Build

[Install Elm](https://guide.elm-lang.org/install.html) (e.g. with `npm install --global elm`), then from the root project directory, run this:
    
    
    $ elm make src/Main.elm --output elm.js
    

If you want to include the time-traveling debugger, add `--debug` like so:
    
    
    $ elm make src/Main.elm --output elm.js --debug
    

To view the site in a browser, bring up `index.html` from any local HTTP server, for example [`http-server`](https://www.npmjs.com/package/http-server).

## Production Build

This is a two-step process. First we compile `elm.js` using `elm make` with `--optimize`, and then we Uglify the result.

#### Step 1
    
    
    $ elm make src/Main.elm --output elm.js --optimize
    

This [generates production-optimized JS](https://elm-lang.org/blog/small-assets-without-the-headache) that is ready to be minified further using Uglify.

#### Step 2

(Make sure you have [Uglify](http://lisperator.net/uglifyjs/) installed first, e.g. with `npm install --global uglify-js`)
    
    
    $ uglifyjs elm.js --compress 'pure_funcs="F2,F3,F4,F5,F6,F7,F8,F9,A2,A3,A4,A5,A6,A7,A8,A9",pure_getters=true,keep_fargs=false,unsafe_comps=true,unsafe=true,passes=2' --output=elm.js && uglifyjs elm.js --mangle --output=elm.js
    

This one lengthy command (make sure to scroll horizontally to get all of it if you're copy/pasting!) runs `uglifyjs` twice - first with `--compress` and then again with `--mangle`.

> It's necessary to run Uglify twice if you use the `pure_funcs` flag, because if you enable both `--compress` and `--mangle` at the same time, the `pure_funcs` argument will have no effect; Uglify will mangle the names first and then not recognize them when it encounters those functions later.

## About

A Single Page Application written in Elm

[dev.to/rtfeldman/tour-of-an-open-source-elm-spa](https://dev.to/rtfeldman/tour-of-an-open-source-elm-spa)

### Resources

Readme

MIT license

[Activity](/rtfeldman/elm-spa-example/activity)

### Stars

**3.3k** stars

### Watchers

**78** watching

### Forks

[**516** forks](/rtfeldman/elm-spa-example/forks)

[Report repository](/contact/report-content?content_url=https%3A%2F%2Fgithub.com%2Frtfeldman%2Felm-spa-example&report=rtfeldman+%28user%29)

## Releases

## Packages

## Used by

## Contributors

## Languages

