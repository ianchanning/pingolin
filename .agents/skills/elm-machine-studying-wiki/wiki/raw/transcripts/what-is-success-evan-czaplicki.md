---
title: "What is Success? (Evan Czaplicki) (Transcript)"
category: "cat:philosophy"
source_url: "https://www.youtube.com/watch?v=uGlzRt-FYto"
ingested_at: "2026-08-16"
key_concepts: "The long-term philosophy of Elm, community dynamics, API stability"
---

# What is Success? (Evan Czaplicki) - Talk Transcript

**Source Video:** [https://www.youtube.com/watch?v=uGlzRt-FYto](https://www.youtube.com/watch?v=uGlzRt-FYto)  
**Category:** `cat:philosophy` | **Ingested:** `2026-08-16`  
**Key Concepts:** The long-term philosophy of Elm, community dynamics, API stability

---

## Talk Transcript

right welcome everyone it's very exciting to be it the second film Europe I warn you I'm quite jet-lagged so I'm gonna do my best to be energetic but it's struggle okay so I've been working on an album for

about six or seven years now and one of the thing that you sort of get used to over time or it's just part of the job is people on the internet telling you things so I collected some that I remembered some is wrong is Evan killing

Elms momentum and when I first read I was like but I made it like this person nearly had a heart attack so a lot of people feel very mm strongly aggressively I'm not sure exactly how to say this but it's it's often hard to

deal with these sorts of interactions so on some level it's kind of funny right like Elm is wrong the the post is kind of like a carrot like a self-parody but it's not like it's so over-the-top angry that you're like is this a joke about

how angry people can be but anyway what ends up happening with these posts is like as time has gone on I kind of been used to it but a lot of people in the community end up engaging with these things so like with this one between

hacker news our programming in our Elm more than 300 comments and so if these are taking 5 minutes 10 minutes like this is a significant like amount of energy from people that could be towards like being with your family like there's

there's other things then this person's issues and with the is Evan killing a momentum now and had 94 comments on our Elm and I know that one in particular was stressful for some community members I was very heartened by people who serve

got what Elm is about but it's still very stressful to sort of deal with these kinds of situations so I think a lot about why these tough interactions happen in the first place and I have a bunch of theories about structural

reasons that the how the Internet is set up just sort of made for these sorts of things or like aggression like if you make someone mad and they try to process that information by telling the friend but then their friend gets mad and they

try to process that information by telling like you've essentially created a viral mechanism for like and but all those people have to get mad in the process so that's one way to go I actually wrote a big section of this

talk about that that was like no so we're gonna focus on like what is success so a lot of what's happening in these conversations is there's just a fundamental disagreement about what the goals are of the language or where it

should go and so it's not like you can necessarily see eye to eye or you're not necessarily gonna agree with any of these people but you can only to understand where they're coming from and understand why their value system is

different and maybe that's the best-case outcome it's like oh we think it has a different priority so once we start asking this question is like well is success being like Haskell is it monthly blogs and weekly YouTube videos is it

frequent releases so the rest of this talk is going to be explaining theories of success and like what kind of makes sense so theory one is it's just successes what it is in JavaScript so you got to maximize your stats you got

to have the most packages published you got to have the highest number of download counts you got to have all the github stars you got to have tons of blog posts and I don't strongly relate to these some of them are weird to me

right so one thing I notice on the NPM website as they say what can you make with seven hundred thousand building blocks and to me it's like it's like if you said what can you make with ten thousand kitchens

it's like eggs and I recently was hearing someone was like hey did you hear this project has more stars than that and I was like why are you telling me that right like like it's like my favorite comedian has fewer Twitter

followers than other comedians because he doesn't go on Twitter but he's still a very good comedian like it's it's like it's a very weird way to sort of organize how you think about things and second is we need frequent releases and

what's nice about this is you get these new features but the downside is you have a maintenance cost and so what's common in programming languages I had a slide that was just language after language of like timelines of releases

and I was like let's go through the tayo be index of most popular languages and see if any of them have had a two-year gap and like Java has big gaps si has like ten-year gaps javascript has a 10-year gap from es 3 to es 5 so it's

like is it a dead language now like how does this work so like when you look at languages that works one way when you look at packages it works different so I think one thing that people underestimate is like when Elm core

library changes or the compiler changes every single package in the whole ecosystem has to change and all the applications have to change so that's a lot of work to ask a whole community to do and it doesn't make sense to do that

lightly I don't think but if the root of a bunch of project is changing frequently all the other packages changing frequently becomes a proxy for their health because if they're not keeping up with the core of the

ecosystem then they're not maintained so a lot of these end up being proxies for a sustainability like if a bunch of people have put a star and github it probably means there's a bunch of people you can hire if there's a bunch

of packages published it's like well I guess people are doing things and if there's blog post coming out maybe there's a marketing budget so maybe there's a budget so rather than using proxies for sustainability why not just

have the values like sustainability maybe that's what success is like having a language that can survive and it will be immune to things going wrong so I think it's interesting to look at the history of Python so the creator of

Python wrote these two blog posts sort of outlining how the early stages well not really about the whole sort of lifecycle of Python when and so I'm sort of distilling it down so in 1991 he's working at a Research Institute in the

Netherlands and releases Python on alt sources the news group and things go along well and then in the summer of 1994 the news group was buzzing with a thread titled if we don't end C so what the other thing is like that's kind of

the same timeline of people started asking me about my bus hit ability I like so like I know you'd be dead but like what about me so in Guido's case he was invited to this National Institute of Standards of

Technology and I guess the idea was that things would be standardized I don't know if that's actually what happened I have a feeling the answers that the question is like what if so-and-so was hit by buses like it'd be bad like I

think that's the general answer but it's something something people worry about so after he goes there he ends up at another Research Institute this time in Virginia and he works there five years and then joins a company called be open

comm so this is in the.com boom and they're hanging a bunch of open-source people and I don't understand the business model and apparently it didn't work so when the bubble popped they went out of business and it sounds like it

was trouble and so he says luckily my team by now known as Python Labs was pretty hot and we were hired as a unit of creations one of the first companies to use Python so he joins then in 2001 now I don't know if this means that

they'd been using it for many years or companies started using it in that time range but the thing that's interesting to me is the team that was built around Python was a valuable asset so even if one company had trouble like having a

team of highly skilled people is a desirable thing so they ended up being fine and after that Python was used at Google he got hired there it's it's used a lot for configuration there and then at

Dropbox which is probably the biggest Python user in the world probably so I think this is interesting because it I think gives some lessons about Elms scenario so as it is Elm I work at Nord Inc and this is a company that does

education software so if there's a big tech crash well the money doesn't come from other tech companies it comes from schools so it'd have to be something with how schools work it's not really clear what that

would look like and it doesn't seem like it'd be strongly correlated with other things in the tech industry so it doesn't seem like it's in a risky situation but let's say something unforeseen happens there's a couple

paths one is like can we do something like Python labs there's a bunch of people who are now out of work they work well together to have a lot of skills they can come to a company and say hey do you like skills it seems like a good

pitch to me so this seems like a viable path another thing that we are did for a long time is doing a 50-50 arrangement where he'd do half the time on Python a half time on something else I could do that seems reasonable it's like the

Groot question here is like does do I have marketable skills and it's like I think so like I think I'm I don't know [Applause] and there's a bunch of other alternatives that I like less but there

are things of other projects who are experimenting with crowdfunding we have foundation that can do nonprofit stuff so there's a bunch of other paths here so this is one theory of success but I don't think it's so interesting because

I think we're sort of it's just there it's not a it's not a big deal so another theory might be a diverse community so again I'm going to look to Python I like Python how their communities developed so we'll see how

Python looks and how L might look so in Python they one strong Nisha's servers and scripts so this is software engineers another niche is scientific computing so you get a bunch of educators and

researchers and another niche is education so high school students college students my mom actually learned Python recently because she was like I want to learn Elm I was like just learn how just like but

I wanna be prepared I'm like so you can ask me things it's but so what's interesting about the these niches in Python is that they actually support each other in interesting ways so when educators and researchers

researchers used Python for scientific convenience a man it'd be cool if I could have my students know about this stuff and furthermore there's all these jobs out there so I'm actually like not messing up by teaching these students

just because there's a career path and then these students are educated they end up being software engineers some of them end up being educators and researchers so you get these strong feedback loops that make it a really

healthy ecosystem and so if you're into the TOB ranking of languages pythons number four on their above JavaScript and I think it's in large part because they have these strong sub communities that have different interests so my

question is we have user interfaces we have software engineers but could we do something similar and create these same kind of feedback loops and I think something that's important for Python is that it's very it's a very simple

language like in theory Ruby could be for scientific computing it could be for education but it's not and I think that is partly because of the difficulty of the language and in scientific computing how people who just want to get results

they don't want to be programmers so I think these are more plausible than they seem so with education there's a course of the University of Chicago now it's actually taught by Ravi who's on the board of the Elm Software Foundation so

the I don't know if there's like a plan that comes from this though like it seems that university professors are they do what they want and they make their own curriculum so there's not really a lot that can be done besides

hoping that people I had seems nice so and a lot of the work I'm going to be like I'm planning on doing is about making Elm like pleasant to use so how can we make our tooling better how can we make our error messages better and so

as that happens it improves life for software engineers it's going to make things easier for learning as well and so I hope that will sort of feed into this being a good choice to start out in programming another interesting use is

at McMaster University so they have a program called McMaster outreach where they teach fourth through eighth graders Elm so this is a student who made a little bird and that's that's helm code and it's like a pretty cool bird like

there's a little nostril anyway so they have a whole catalog of other things students have made and so I just took a quick selection I couldn't find everything I wanted there there's some very interesting things that students do

in all of these are animated in the actual slide shirt or like the show they have but they do interesting things where they overlap in really creative ways such that they have a square moving but it's in a larger shape so you can't

see it and it just looks like an eyes wink Annette kind of thing and what I found odd when I looked into more as they say we would like to have two hours with each class it sounds like two hours and

then the students just like make a bird it doesn't I don't know I think that's quite cool and so this overall project inspired some work I did on Elm Friday which something we do within no writing so those are just one day of work trying

to say how can we support these kinds of students to make these kinds of animations really well so that code is very old and not documented at all but if this is the kind of thing you're interested in I think there's a lot of

interesting stuff that can happen here that can really support this kind of usage of Elm so in my imagination of what Elm for a playground could have been if I could focus on it would be a website like the processing

network that has all these different examples and students can click around and see things copy/paste things and sort of put things together in a really interesting way I unfortunately couldn't focus on that there's a lot you know

people are like but what about WebSockets well there's lots of things to do you know so this one seems like a good thing if you are interested in that maybe if you have kids it's like I think this is a really interesting area for

ohm so scientific computing I think sounds way more unlikely but I think there's a foothold through data visualization so we've started to get some libraries that are pretty nice data visualizations so these are from a

palang charts library and I think if this was supplemented with like a CSV parser maybe there is one I didn't check ways to help doing statistics so like can we get p-values or better yet can we account for the possible misuse of

p-values if people want to do research papers that are up to the new standards and so I think there's a lot of work that can happen here and I don't know if this can ultimately work out but I think it'd be really interesting to look into

and I have a mention of this talk on storytelling that I gave here because it feels to me like somehow even if we have all the tools to make data visualization nice or a scientific competing nice it needs to be conveyed clearly and I'm not

sure how to do that yet so I think at this phase it'd be things that are interesting to look into so I think it'd be interesting to sort of see what happens with this definition of success but ultimately I'm not married to these

sort of things I think it'd be nice you know to have researchers as part of the community people who are interested in biology all these sort of different aspects I think could be really enriching and give

different perspectives so another theory is to have a healthy culture so to me this would mean an emphasis on design an emphasis on community and an emphasis on sharing results so what I mean by design is well a thing that people say about

Elm RI here is that it's designed for beginners but it's not I I designed it I was there so I know what people mean often they mean it's nice it's like beginner friendly and it's it's easy to learn but another set of people mean

that oh it's it's not sophisticated enough right so I think this is a compliment and an insult depending on the person so I want to say why I think this phrase is weird by just looking at a radio so let's look at it closer so

this is a pretty cool radio one of the things that's really interesting about it is that based on the design of the buttons you know how they should be used without really thinking about it like these are for pressing they're shaped

for thumbs and index fingers that means ones are for turning and they sort of flare out you can see that there's a part to grill and so when you just look at it you're like oh this is just a radio but it's

specifically designed so you know how to use it before you think about it's just like you just do the right thing so somehow the the instructions are in in the item itself so we could look at this radio and say yeah but it's inconsistent

you know you have all these things that are circles but those circles are shaped different than those circles and all the circles have to be shaped the same that's what consists and she is and this is a criticism

people make about languages from time to time I mean you can take the missing features it's like why I need a much more sophisticated radio for the kind of stuff that I'm doing can people say this about languages a lot and maybe it's

just like this isn't the radio for you there's other radios at the store but it's it's it's okay but so the thing I'm getting at is like I think those critiques are kind of missing the point and to me what's nice about this radio

is that it sort of gets at this idea that great design implies great communication like part of why this is a nice radio is that it communicates well and it doesn't communicate well to beginners it just communicates how to

use it in its own being so I can't make things as cool as that radio but I'm going to show some AP is that I try to do a good job but you know those dials you can't compete you can't compete so we're gonna look at HDPE and a module

that's gonna exist later called browser Dom so with HTTP I often proceed by starting with exploration so in this case it was exploring what exists in JavaScript said I needed to fully cover so we need to know about XML HTTP

requests we need to know that it can have an error and a timeout and you can load and if it gets loaded then all those things exist and one of them is that you can get all the response headers in which case is just a string

and you have to split it on new line with a carriage return and then you have to split on colons with a space and then you have to deal with if there are multiples which is permitted you have to decide you can have progress and you'd

think it'd be the amount loaded over the total but in fact the length computable has to be available before the event the loaded in total can be computed then you need to open the request and it needs to be true and it can fail

within a valid URL that's the kind of thing you find out later when someone tells you in a bug report that was how I found out about it you can send request headers you have response type you have with credentials you have timeout and

then with each of these you have questions about like okay so if I set the timeout to infinity or it's a negative one like what happens and are those things we need to worry about and then we can actually send the thing and

but what kind of things can we send well there's this other thing called form data so you end up finding out that there's like a lot going on and the presentation of this API isn't so pleasant in JavaScript and that's I

don't think that's a critique of JavaScript necessarily so one thing that's happening there is they're adding features as the needs of the domain are discovered right and so when you're on the very frontier of discovering how

things are going to be you don't have the luxury to be a designer and say who's going to need this like how's it going to fill with all these other things because you don't know what all those other things are yet so when I

come to it I have the benefit of it being done and so you can start to ask different questions and so when I the design I ended up with starts out very simply so you can get some URL and they'll give you back a string and the

goal of this API is to increasingly show you difficulty such that it builds on the previous stuff so when you get we're introducing here okay we have this idea of a decoder now and so instead of giving a string we're getting whatever

that was so we've introduced one new concept that's not too wild when we started with something that wasn't too wild I think it was a post okay well there's a body as well so again not adding too much and then later you get

two requests and so the idea is that by the time you get to post in the documentation you sort of this is actually quite complicated tight but because you've been going along you have the tools to

know what it means so it's not as cool as dials but you know I'm doing my best so the other case I think is interesting is something that I've been working on recently so I wanted to cover a JavaScript API

so there's scroll height client height and offset height you know what I mean so you want to know how tall was the whole thing how big is the hole that you get to look through and then like what about the borders too and this I had a

lot of trouble with this and I was like probably for like a day I was just like reading mdn Docs and I ended up with a big whiteboard and I just had drawn everything on the whiteboard and labeled everything the width and the height and

I had questions like what is a client like what if there's a client in a client I don't know I don't know or like Ken and off set have a height you know how tall is the euro I don't know so we had this drawing on the

whiteboard and so this is when we did our first attempt to do ap that would cover this stuff so the idea was you have your basic element and it might have padding and a border in a margin and there are these different aspects of

it that you might want to measure and so we were just staring at this whiteboard being like what are those like what are they called and so probably after like a half hour an hour we ended up with this is the content this is the visible

content and this is the visible content with borders and there's actually a fourth one called visible content with borders and margins it didn't really fit in the diagram cuz the name so long so I I cut it out but in designing it like

then the length of it I was like I am I am i failing right now so this was nice and we could have a function that got the size so we can say get the size of some ID for some boundaries so get the size of the whatever content or the

whatever visible content the thing that was annoying about this is that it didn't match with how you would get the size of the window right so window doesn't have borders or margins so you couldn't use the boundary there so you'd

have to have good visible content size and get content size and now you sort of have okay so these are function names but this one has an argument so maybe it just shouldn't have an argument there should be four of these and I just felt

like something has gone wrong in my understanding now in addition to these being bad we also had a bunch of things for getting the scroll position so get the scroll position for the overall page and then get the scold position of a

particular woman and and you have to set the scald position and then set this from position of elements in particular as well so I saw this and I was like I failed you know so I actually this this first exploration

happened like two years ago and I just was like I don't know well I'll come back to it so recently I came back to it and we came up with something cool and the idea is that we took idea from 3d graphics so in that context it's common

for there to be a scene and there's a viewport you looked into to that scene you can move the viewport around see different parts of the world so in this version of it our scene is the whole document and our viewport is the browser

window and the scene has a width and height the viewport has a width and height and the viewport also has an offset how far it is from the top-left corner and what was cool about this is that it works for elements as well so

say we have a little chat box in a window this chat box has the same characteristics so there's an overall scene and there's a viewport into it and then we have offset of where that viewport is so there's a way to talk

about the window and for individual elements in the same way and so we could say hey I want to get the viewport and you get all this information or hey I want to get the viewport of this particular element and you get all the

information and then when you want to set where the scroll is you can say whole set the viewport or set the viewport off so what was this we found a way to make it a lot simpler and have ideas that build upon each other a much

more clear way right so if you understand how this part works that's going to help you understand how it works and elements whereas in this design it was just kind of like everything is

bespoke let's say so these are some designs I I just thought were interesting that I've been working on recently but I think focusing on this kind of work over just like getting it out the door right because like in this

case I could have said okay well this works so it's fine but I think a lot of times you end up just sticking with that when you do that sort of thing and I have a hard time so if circling back because there's lots of stuff going on

so the second thing that I think is important is community and there's a lot of things this can mean so I don't mean knowing about em so it was like you can what what does it mean to be in the community and I don't think it's knowing

about alum I don't think it's like thinking Elm is nice or using them all the time I think it's helping each other like I think it's a relational thing it's not just something you have yourself and so there's a bunch of

places to do that for me in particular than meetups are great because being online is weird for me like on slack you end up getting a bunch of questions when maybe you just want to help someone with something cool but local meetups one

thing that I found particularly memorable is someone came and they'd never used that one before they just and they were gonna go through the guide but I was like okay but what is exciting what are you interested in they said I

want to make time the typing of the Dead so this is a game where you're you're a man with a keyboard like on a lanyard and you have a backpack that's it's a Dreamcast and it's got a very large battery and then zombies appear and they

have words on them and you have to type them to death so I thought that was a really cool idea and it's actually quite a hard beginner problem because if you're coming from an imperative background you say well I

have a string and then I have an index into that string and it's like okay well can we change it to a list of characters that we've typed already in the list of characters that we haven't typed but what about the case where you have a

zombie where the list of characters that you haven't typed is empty well that zombie shouldn't exist because it's been types to death so Cal Coney model that and so we ended up doing a lot of cool stuff just working together

on that and I think that at least for me that kind of relationships really like what I get excited about and he came back later and had a much fancier version going I was just like you could type that it was aam be to death and I

was like let's do with SVG we can have the zombies like it was cool all right and so another thing that I think is under appreciated is helping people who have no relationship to home so I was a mentor for google Summer of Code and the

mentors are invited to this mentor summit where mentors from all the different organizations come and just talk in a free fun way and one of the things I noticed is people from different organizations so if someone

had a server project they'd be like you know our servers are great but like the front end we have is terrible like it's not presenting our project well or like if people had a systems thing or like a eye thing like their community is made

of people who have those skills and they're missing all the other people who have the other skills but all the communities are that way and they all have a surplus of people looking to help in some way and

I think there's a big opportunity for working across communities that's not being taken advantage of at the moment and so one of the projects that I really remembered from this event was called public lab and they're trying to help

people learn about pollution in their area and so a lot of the users aren't technical people they're just people who don't want pollution in their water or on their land and so it seems like there's a lot of opportunity to help

with that kind of thing this one's just for me I don't think this is viable at all but I think Project Gutenberg is awesome and I really look like there's some books on there where I'm like everybody has to

read that book but when you go to Project Gutenberg I don't know if it's necessarily like inviting I don't know if you've been before but it seems like some something relatively simple could be done there and maybe more people end

up reading books that are public domain as a result I want to put the caveat on this one that like code is the easy part it's gonna be difficult to make these relationships and have this kind of stuff happen but I think it's really

interesting to think about how that could look if you come to your project not saying like man I want to do alum stuff but saying I want to help this and this is a tool I happen to use so another thing that I think is important

is sharing results so what is a result to me it's a concrete outcome so one that I saw recently I think we'll be hearing about I don't know was a 3d dye simulation another one was a editor a co-editor that was done all

in Elle and seeing that stuff is really at least to me really inspiring to see people doing interesting stuff and wanted to know how to do it and explore that kind of thing as well another thing that I think I'd really love to see this

and I for sure have no ability to produce it is an experience report like the following hey we're a consulting firm we have three projects that you in not Elm producing n bugs per month we have

to project in Allen producing and over to bugs per month time spent on bugs cost dollars per hour so this is saving us a lot of dollars on the home projects here all the caveat you should take into account about how the projects are

different all this kind of stuff and then you title it something it will do well on Hacker News but I think this is something that could be quite interesting and it's actually a really hard post to write because companies

that have already started using own often don't have - haven't tracked the data to recreate this after the fact so I encourage anyone who's seeing this and has the potential to actually track this kind of information I think this could

be a really interesting way to talk to not just programmers but people who make decisions for programmers and you're just like do you like a lot of dollars or like less dollars and I think that's a strong pitch for certain people and

organizations so another thing that I think is nice is doing announcements so if I was lucky enough to be announcing Elm 19 I could say hey there's this new version of alum out today it addresses some frustration that you have by by

introducing a technical insight and here's comprehensive overview of how it helps you so not just like what is technically different but like what affects you and how you do your work I also anticipated some of the hot takes

on hacker news so I tried to address those concerns so things are friendlier in the comments one I have not been able to figure out is I thought Elm was an email client why does it need a compiler it's like I just how many years

before it's like not funny another one that I don't know how to combat is speaking of elm there's this other project that's not Elm that I think is really cool full disclosure I made it the classic like high on Hacker

News comment and in this case I think it's important to give it a title that's like talking about how it impacts the person's like emotions in day to day life like so it might be a cool technical result but I think the more

important thing is what it means for the particular person so this talk on storytelling is all about how to do this kind of thing well and I suspect a bunch of people in here have projects that could have interesting announcements

that could be interesting to your broader community so things that I don't think of as sharing results or saying things to say things so there's pressure on me to be always saying everything that's going on

with helm development the trouble is that it's not always very interesting it's like still working and the other thing that's tricky about it is that some things are may or may not happen and that kind of thing doesn't get

translated well when you're doing these very quick updates so at some point in time I think like um this is going to be so easy it's going to fit all together nicely and then it just doesn't and to keep going you maybe have to cut that

feature that sort of thing and that creates a lot of it's like yeah but you said and all of this conversation is taking time that's like are we using our time wisely in a collective way like is this the best way for me to be

interacting to get good results is this the best way for community members to be spending their time so I think saying things to say things is like I understand wanting to have a presence and

no like you know about all these kinds of things but I think there's you can go too far the other thing is talking bad about other projects this one I think is just like no one comes out well and like having started this talk with people

talking bad about it is just like not nice you know like you don't have to like every project that's out there but that doesn't mean you have to go and make your life about that right like I have a friend who doesn't

like Kiwis and she she doesn't eat Kiwis it's pretty straightforward if she sees a Kiwi she doesn't eat it the end of it so I think these things combined can create a really interesting ecosystem and place to be so when I think about

what this means sort of in contrast with the JavaScript norms rather than having all these fast releases I'm interested in having releases that are worth great cost right like if I'm gonna impose work on everybody in the whole community I

don't want to be doing that every three months just like because it's exciting it's like I have like I work with a compiler it has switched to a six-month release cycle and I don't release packages but I still get people telling

me like hey you have to upgrade to the latest version that's like I released my binaries like it's but I now am in this maintenance loop because the person I depend on decides that I should be so having 700,000 packages I'm interested

in having 50 really nice packages so to go with the kitchen example it'd be like I want a knife that's really good and a fork a fork I don't know a pen that's good at something that makes more sense than a fork but I think

in in the programming I've done at least there's not infinite packages that end up depending on and what I really want to have is a really solid foundation to work from and so rather than saying well let's just ship it let's like get it out

there that's you know we're gonna grow the ecosystem I think it's more important to focus on like really really high quality stuff yeah instead of like being cool on Twitter just like there's local meetups that and having personal

relationships and like it's harder to do that kind of thing like maybe there's not a meet-up in your area but I think if the goal is to make it on the stronger ecosystem then that kind of hard work is what's really important

like if you burn someone on Twitter it's like gotcha you know like and rather than start seeking I think people should focus on projects they really care about and I don't think the growth potentials is high but I think that's gonna make a

healthier community so when we take a step back to me success is having a healthy culture and what's interesting about this is I think it feeds all these other theories of success so if we have a healthy culture I think that's going

to feed into having a diverse community in the sense that someone's going to come in try stuff out and they're gonna say wow like I really like using this library that I wasn't expecting to use like it wasn't hard when I thought it

would be or someone was really helpful and I think that's that's gonna be really nice and having a broader community I think is gonna help with sustainability I think we're good but we could be more good I guess I mean it's

it's a weird idea of if something sustainable and being more sustainable like it I don't but and I guess it helpfully I mean we'll probably get more github stars as time passes so if that's your thing then like

that'll help as well so they'll definitely be more posts that are like seeking conflict in a certain way and I hope if we focus on designing things well having a nice community and sharing our results it's it's not going to be

such a big deal that people have different opinions and it's hard to sort of come to agreement though so hopefully that's helpful in future conversations or features things you're interested in and if you're interested at all in the

ideas about data visualization scientific computing education please come talk to me about it if you're not interested in that stuff like I'm happy to talk as well like that is to meet everyone so yeah thank you for listening

thank you for coming down here excited [Music]
