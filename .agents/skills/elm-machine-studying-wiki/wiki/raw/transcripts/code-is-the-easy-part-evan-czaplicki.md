---
title: "Code is the Easy Part (Evan Czaplicki) (Transcript)"
category: "cat:philosophy"
source_url: "https://www.youtube.com/watch?v=DSjbTC-hvqQ"
ingested_at: "2026-08-16"
key_concepts: "Communication, cognitive load in software maintenance, design over feature sprawl"
---

# Code is the Easy Part (Evan Czaplicki) - Talk Transcript

**Source Video:** [https://www.youtube.com/watch?v=DSjbTC-hvqQ](https://www.youtube.com/watch?v=DSjbTC-hvqQ)  
**Category:** `cat:philosophy` | **Ingested:** `2026-08-16`  
**Key Concepts:** Communication, cognitive load in software maintenance, design over feature sprawl

---

## Talk Transcript

okay yeah so I'm Evan I'm working at no ride Inc and we've got about I I heard almost 50,000 lines of elm code there um and looking for for more people to work on it um so it's rare that I get to talk to an audience where everyone knows

about Elm already so I wanted to take a chance to sort of talk about some Community stuff that isn't ever really appropriate in other places so I wanted to focus on two main questions one is what does collaboration

look like in this community um and two what's next for Elm so we'll so show some stuff that's going on um and we'll sort of come back to this idea of code is the easy part you know again and again we'll see you know it writing code

is important but there's all this other stuff that goes into it um and I want to start with the best advice I've ever gotten for working on this language um so when I started at Elm you know I'm just working on my own it's nice things

are going well um and sort of in the periphery there are these other projects that I know about sort of languages that are like hasle compiling a JavaScript you know and more of them come into being and at some point M comes out and

they're doing this uh virtual Dom rendering and it's really quick and it's actually faster than react and I'm like oh oh there's some competition out here there's some other people doing using the same kind of techniques um pure

script comes out and so I'm feeling kind of like oh gez like can I do it faster how can I be better and there's all these pressures of you know we need this feature or I think this is the most important but this person thinks other

things the most important how about we do them at the same it gets kind of crazy um so I had a chance to talk with Guido who made Python and he gave me this advice just do a good job now in some ways this advice is too vague to

be helpful okay but uh what he was saying is you know I was working on Python and when I started that in 1990 Pearl already existed and was pretty popular and after that we got Lua and we got Ruby sort of inspired by

closely related to Python and we have other projects like PHP Java JavaScript to some extent they're all kind of filling a similar Niche and if you look at them as technical artifacts they're pretty similar

so not only do they all exist but all these communities flourished so each of these Community was growing in the same time period and became something unique and interesting with its own community so what he's saying when he said just do

a good job is you know ultimately you can't control what's going to happen out here but you can make sure you're building something that people find delightful that's fun that's a great community and that's what you should be

focusing on um so one of the bigger take ways here is that Alternatives make each Community stronger right so if you imagine that the python and Ruby communities one of those languages stopped existing and they had to come

and become one Community like I don't know if everyone would get along well right you know people have a different philosophy about how code should work like what is beautiful code what's an approach to writing code what should a

library look like um and that we have two separate places for that means that people can sort of find their way to a community that matches how they feel and what they want to do um so when you get this cultural

sorting effect um and we see that in uh in Elm as well so if you go back a year or so on the mailing list you'll see a lot of people talking about type classes when are we going to have this in Elm we need this it's the most important thing

and a language came out that had different priorities and all the people who wanted that kind of feature start using this language and so now that's not to say one community a better choice than the other it just means we can all

experiment with a different philosophy and way of thinking and do well um another neat thing about this is that we're all learning from each other right so when om when I saw the tricks they were doing I was like oh we can use

you know we've we already had this single source of Truth pure view functions we can use this for HTML I didn't realize that um um and then you know over the course of some amount of time we can optimize it and make it

really fast and so when stuff like Redux comes out again this is another way where we can learn from each other where these communities build upon each other and people can find their way to something that works best for their

project or their perspective um so thinking about it in this way kind of lets us find some kind of interesting patterns so one of the things uh I notice as I look at other languages is there's a kind of different

kinds of organizational structure I was talking to someone yesterday who didn't realize like they were like what's the how do you can you make money on a program language and the answer is kind of just like no

um like it's been done with with like Matt mat lab it's like there's there are examples um but it's really really rare so usually a programming language sort of lives in some other institution um and so one of those is a top Tech firm

um so it's not you know it's not just a big building it's the the it's decorated with sacks of money okay um and so the the languages you see coming out of things like Java or JavaScript or

Swift or go or rust these are all coming out of these top Tech firms and when you look at them in this way you start to see some patterns so like if you think about what are the goals generally of these languages often it's uh support a

platform um so like with Java it's not necessarily like we want to make the most amazing language it's like we're sun and we want to sell some servers so it'd be good if people had an easy time writing servers um and with

JavaScript it's not we want to make the best language it's like well we really want this browser thing to work out because I like that people are searching on Google and they're going to Amazon and they spend time on Facebook and so

on some level it's just we want this platform to be nice um same with Swift We want people to make iOS apps and stuff um you can also notice some things about core team so in all of these things we have larger teams um I think

six is a low-end estimate but that's sort of the the bottom edge of things so yeah so if you think about JavaScript that's sort of an extreme case cuz Chrome team I believe is 60 people they're not all working on JavaScript VM

but let's say five of them are and then there's a team at Microsoft and Apple and Mozilla this adds up um so another home for programming languages is universities or research

institutes um so this is languages like hasco camel Scala and in these the goals are more research and explore it's you know there's no it matters the details right and it's not we want to make your day-to-day

better it's we have this idea that might make day-to-day better and we we want to explore that to see if it pans out um and these are smaller teams usually two to four um hasle I know a lot of the work on the popular compilers mainly

that size team um relatively stable group of people um okay so the last one is uh startup so examples of languages that live in sort of smaller companies are python Ruby and Elm so these don't have the sort of big

name it's Google python you know you don't get that that kind of branding boost which actually you know that's a big help uh marketing's hard if you just piggyback on uh Apple's marketing that'll help you out um but so the goals

here tend to be we want a nicer way to do X right the platform already exists so with python and Ruby it's it may be we're writing servers but we want to do it in a nicer way or we're writing scientific Computing code but we want it

to be nicer or we have all the C but we want to script it in this nice way um and it's the same with Elm we have all the we have this platform and we want to do it in a nicer way um and yeah the court team tends to be bdfl based uh

this stands for benevolent dictator for life it's kind of a python Community term um but the the point I'm trying to make is it tends to be there's a a core contributor that's sort of related to the project for the course of its life

um and so once you sort of have this way of categorizing the home of language you can start to ask some questions in a more sophisticated way so some people might say to me you know why there should be more people working on Elm

full-time like why aren't there more when are there going to be more and you can refine this to our bigger teams better right we actually can look at all these different projects and see you know what would you get for more

Engineers you know if you if you threw millions of dollars at the problem um and so my personal view is that not they're not really so I have uh two examples one is our error messages so this is a problem that's existed in sort

of typed functional languages for decades uh and you have these research institutions and Papers written over years and years and they're not matching the quality that we get so had we had that resource would we have gotten a

better result it didn't seem necessary um this is also a this is a new error message that'll be coming out in the in the next release um it now recognizes if you have missing argument or yeah you need an

extra argument um and also fast rendering so this is another thing where I recent I redid the virtual Dom uh render uh with 17 so if you're using 17 it's it's very fast congratulations

um uh and so I finally got these benchmarks out of to see how fast it was compared to other sort of rendering uh systems and we do really well and so this is up against teams that have six people or more um and who aren't making

a language necessarily like they don't have to wor like oh what's the package ecosystem like like they just don't work on npm you know um so again is more people really getting you a lot um another thing you can think about

when you're looking at things this way is the development timeline so uh I I read this quote or I read this on one of the mailing lists a while ago basically 13 years ago we started using Lua um because it was stable you know uh the

ecosystem was nice people were using it in production and if feels hard to make that case right now for Elm and so the root here is like I think Elm is cool and I want to use it but it's making a weird sort of Association right so it's

saying okay I want to I'm comparing Lua vers Elm and 13 years ago Lua was ready to use and 13 years have passed what's Elm been doing the whole time just sitting around it's sort of the suggestion here

um so the trick is that Lua came out in 1993 so the root of this is saying Lua after 10 years is more mature than Elm after 4 years which which is which is true and like that it's it's easy to think this

way when you're thinking about different program languages say well like well this is what's going on in this community we should have that as well in this other community it's like well it's not as simple as just doing the work

some of these things sort of develop over time in in a so somewhat predictable way so if we look at sort of different timelines of languages we can think of python so it was released in 1990 and the orange dot that's today 26

years later and we can look at the timeline for Elm 2012 initial release today four years later now notice it's aligned on release not on the present right and

when you think of things in this way you can start to do all sorts of stuff so maybe what are landmark things that happen but what I wanted to take from this was what is the look like over time so I got to get coffee and ask about

some of these details one of the things I learned was in 1995 five years in uh Guido is still primary contributor so that means people you know GitHub didn't exist then um so people might mail him a patch through

email and he would merge it in by hand if he thought it was nice but sort of the the culture around that was very different there was no expectation like I do a PR we get a quick response and there was no like oh is this team big

enough it's like well it's python in 1995 I I don't know how big like it's not python today right um another interesting thing was uh in 2000 they introduced the python enhancement proposal so this is sort of a

community-driven way to suggest changes to the language get feedback in a structured way now I think you know you could move this earlier but I think it would be a mistake in the sense that 10 years is enough time to sort of figure

out what is this language really about what is its character uh and not only does the Creator know that but a large community of people understand that such that you can say okay what what is the future of this language and people sort

of have an intuition of what would be true to that project so it's sort of once you start thinking this way you can sort of see there is a natural progression of communities and languages over time now I wanted to come to this

chart also because it's it's it's quite evocative right we've got 20 years of unknown okay so the rest of the talk is like what what what goes in there so finally we get to what does collaboration look like um and so the

core of it is uh socializing and using Elm right so a lot of people think if I want to be a part of this project it means writing code getting that code merged if the code doesn't get merged it's a failure and I think that's sort

of an unhealthy way to approach an open source project in general but in this particular Community I think these are sort of the core parts and often you want to be just cycling back and forth so what socialize what I mean is there

are all these places where people are talking about Elm using it uh or or or talking about questions they have what they've done thinking about ideas um and so you can go and check out like what are people up to maybe you'll find

something inspiring maybe you'll see something um that you can learn right so you see someone do something you've never done before maybe it's a good idea maybe it's a bad idea but you start to get that kind of exploration um what

problems come up do you see questions again and again are there things you can do to help maybe that's just working with someone individually um and so we're not writing code here but we are sort of building the fabric of a

community we're having those relationships and learning things together um there's also using Elm this one's more self-explanatory um but one way to approach this is like is there something

from JavaScript that you made that you want to try out an Elm or is there some project you're excited about that you want to see what it'll look like or is there something in in particular you want to learn and can you build a

project around that so I've definitely done that before I wanted to learn a language and my key is like okay I'm definitely confused about this concept so my whole Project's going to be centered around that so I have to

confront it um and so once you have this Loop you end up getting a lot out of it right so maybe you say hey I'm working on this neat thing someone gives you a nice idea you can work on that you get feedback or you see someone's confused

you write a blog post or example about it and you start to get these really nice sort of interactions and sort of experiences that that build a community now as you're going through this at some point you might get inspired it might

happen um and so uh one example of this is llo Pandy with time travel so he'd been using Elm uh sort of we would always talk about design stuff he has a great design sense and at some point uh he he sort of by chance saw this uh

Hacker News comment that was like oh this Elm thing seems nice but like what's the debugging situation if the debugger is bad it's worthless like it's all garbage and no one should ever consider it um and one way to respond to

that is to say well you know there's this type system and it's really nice and all this um but another way to respond is to say yeah the historically functional languages don't have good debuggers and what if what if we

addressed that concretely so he he took that full on um so what happened is you know by chance he saw this thing he got passionate about that and he happened to have the skill to sort of make it all work out and when these three things

align like projects can come from that um oh yeah so I wanted the show for people who don't know it's kind of like a old old thing now but this was like one of the early demos of this thing so you can have the thing

play and and this like to do this in a way that was reliable no one had done that before so that was pretty neat um another example is uh El webgl so this is John who again he had been

really active on Elm discuss always chipping in in in discussions with s insightful comments interesting uh information that added to things um and meanwhile using Elm for stuff he was interested in so making a tank game lots

of games um and on the side of that sort of thinking about how can I make this world building in 3D um and so that sort of came together and he was like you know what I bet I can do this in Elm and so started working on API we end up uh

sort of going through it to get it ends up getting part some parts merge into the compiler um quite a cool Library um so yeah so notice there's no like line from this first part socializing Museum to being inspired okay I've I've

represented the source of inspiration as a rainbow and a and a rabbit and a hat um something happens there's no recipe here as far as I know or at least that's a different talk um and so once you're inspired it's time to work and so that

means a particular thing right so a lot of times it's like when do we merge the code I got this code when do we merge it in and I think this is a weird way to think about it um and in particular I tend to batch work so this is just

something to know about the projects that I work on so typically maybe someone will open an issue and then there's some resolution and then some more issues open and there's some other resolutions and this

process keeps happening and I think for a lot of people they think of this this is the ideal way you know we have zero issues open we're responding to everything promptly great okay so I I don't I don't do it this way um so you

know we might get an issue and then we might get some more issues and then like the next week there might be some more issues and then like some more at this point like people are like freaking out you know people are crying in the

streets they're displaced from their homes by floods like the locusts have come um but this approach is really nice from the perspective of once we're at this point we can actually look at all those issues um and start to see some

Trends right so maybe we can say actually these people over here are all talking about a similar thing they sort of have slightly different goals they have different ideas of how to achieve that but fundamentally there might be a

solution that that address all those concerns um so when you do that analysis and design in a conscious way you can say okay I'm going to have this solution over here it's going to address most concerns and this other solution over

here is going to address these other concerns and then everything else are sorted by these two things now the time to closing the issue was longer but the end result I think is a much simpler uh result a much simpler

thing and so this is another thing to come back to like what is team size get you well it makes it easier to use the first technique um and a a lot of times people don't realize the process they have is influencing the API decisions

the design decisions they're making um so this is one way uh that that so for a lot of elm projects uh I think it's good to sort of hop around and let things sit such that when you come back you can make a coherent set of design decisions

that become a coherent release that makes a easier upgrade people understand what are the goals what things are new and it's not this sort of Peace meal now another thing to think about is we're making a platform right so if I change

core if I have a major release of the core libraries every month that's that's a bad idea right like that's going to mean every single library in the whole ecosystem is going to have to be like okay we have to make this little change

here and there um so from that perspective it's actually really nice to batch work as well so you can say okay here's this coherent set of changes a lot of things are nicer now the upgrade costs are low um so okay so this is

weird but this is how I do it um now because it's weird we got this guy called process bot now um and so he'll show up on issues that people open and just sort of explain what's up right like here's what it means to do a really

nice issue here's what to expect going forward this is how things are going to work um I really like process bot but maybe I just really like Bender item don't know uh okay so that is a weird way to

approach things but what is like a a way that sort of empirically tends to work out so one is say hi on elev right hi you know this is my name um I'm looking to do these kind of

things and get some feedback maybe someone's worked on a project like this before maybe a lot of people have and there's a bunch of information people can point you to maybe no one's ever worked on the project before because no

one ever thought of it or because people thought about it and then they were like this is a terrible idea um and so getting that feedback early on the process means you can be much more directed and it also means people can

coordinate around uh what you're up to right just knowing that these projects are in Flight means that you can sort of plan other things in the community to make things go smoother um from there you want to be designing and drafting so

like what Solutions exist and then which one's the simplest so when you first start it this might literature riew what are all the solutions to this that have ever been thought of in any language um which one

seems promising okay what are all the apis I could have that expose this functionality which one seems promising and see keep doing this exploration and then trying to find a simple thing and then from there just get feedback so

this is something that you see again and again in sort of cool contribution so El webg LM CSS was this way this was early uh library that Richard was working on sort of still learning how do I model my data in a cool way what's a nice API for

this um Elm test is this way Elm Auto completes this way Elm style animation which we'll hear more about today um and from here you just want to like cycle between these two things try something out try to make it simple see what

people think see if they can think of ways to make it better and then repeat this process and you'll slowly improve improve learn um and I I think this is sort of what it looks like to uh collaborate on things and so it's not

about the code right code is written here but that's the easy piece of it right it's you know I can write code that solves the problem but that that's sort of missing the point like there are there are always lots of solutions but

what's a good one what's one that people have tried out and they like what's one that people think is simple and fun so some examples of this are uh Elm format so this is again Aon I think we met at a elm Meetup in San Francisco

and so we would uh talk there um he was using Elm for stuff and at some point he was sort of inspired to try to work on some core tools and wanted to learn hey I'm interested in learning has better I'm interested in thinking about parsers

so I think this Elm format project would be good and so that's a i it's too it's too light I apologize um but there's this page of eling projects that's sort of a list of here's some project that seem relatively separate they don't need

a ton of coordination that would be cool for the community and I try to keep it updated but sometimes it it runs thin because people draw from it so Elm format was this way and then when it came to doing the work it was uh let's

uh you know how do we keep these parsers in sync how can I make this fast I have this performance bug you know a bunch more about has maybe there's some clue here so always about sort of getting feedback and collaborating um Elm test

is a similar way you know Richard uh definitely is in this socialize use Elm Loop in an extreme way um and at some point you know when you're writing tons and tons of lines of elm for work you're like well the testing isn't as nice as I

want it to be and if you're coming from Ruby or something like that you're like well I know what really nice testing is like and so he took that instead of saying like ah shuck that's a shame was like you know what I have the background

skills and the motivation to make this happen and so not only can we have something that's nicer I think we can have the best thing um so I'm I'm really excited about what's going to be happening with m test um but yeah so

that's sort of the shape of of collaboration so now yeah so I wanted to mention what's coming next so we sort of know the last couple releases about error messages about subscriptions and then it's like that's the end of history

and unless you're following elmd I I do status reports it's like it's just mystery and a forest of unknown past that so I wanted to give some insight not only into what's coming next but sort of what the process is to figuring

that out uh as we go forward for years and years and years so 18 I expect will be a debugger uh so I wanted to show a little bit of that um so yeah so remember llo 2013 doing time travel um in that time we've sort of learned

what makes things more useful or less useful so what we have here is a normal oh this is normal Elm reactor um but I have a development build that uh it will just compile things in sort of debug mode so it's using elake with a Das Das

debug the debug flag um and it just adds this little thing in the corner I don't know I don't know it's kind of small um but so I can say invent the universe uh bacon apple

pie I think that's the order and notice there's this little number that's been increasing here so if I click on this thing I see a debug Pane and over here I have the model of the whole application and over here I have the

whole history of messages so I can see uh everything that's happened and sort of run through that so I'm just pressing the arrow keys now so if I resume can you make it I can try I in that this is

early you never know how that's going to go I don't know if I can make the side Paine bigger actually just pretend you can see it okay that's the best I can

do so uh one one thing we can we can get an idea for here is if I check this you can sort of see in the model it changing from True to false I hope you can at least see it changing a little bit and I can select all and see

them all change and I can edit this guy invent the Multiverse I don't know this is a crazy pie now um but you see it changing in the in the particular entry um so this is this is pretty neat right so you you can sort

of introspect and as you navigate through you can see going back now that's nice I think from a learning perspective this is really cool right so we don't we haven't looked at the code for this at all but we kind of have an

idea of how it's working we know what the data looks like we know what it looks like when you uh do certain things and we see the messages um but what's really neat is we have this little import export feature so if I say export

I'm going to save this history of messages and then I can go to Firefox and again I'm in this same reactor and here's the same thing hello now here I say import and I want

that history and I've got it all here right so I can go back in [Applause] time yeah so this is pretty neat I'm excited for this um so the use

case I have in mind is you have someone who's working QA and they do this crazy sequence of events and they're like okay if you do all this then this UI element's two pixels off all right and so you get this report it's like I did

this thing it was in Internet Explorer whatever probably any of the I don't know um and I ended up with this problem instead of that they just export it send it to you and they're like look right the um so we'll see what else can come

from this I think a lot of a lot of cool things but I think having this sort of playability is going to be really nice for debugging um yeah so there's more we can do so this is

sort of an early draft still but you know uh let's let's let's let's talk about that so upcoming work one thing is uh work on code swapping so what we saw was just this import export um but to get it really that that's just a flag on

the compiler so if you're embedding things or doing things full screen you can get that little debug pain and track things in this way but if we get it integrated with reactor we can say okay someone saves code we can push that over

and save the history load the new code load the load that history and sort of be back so that that UI element that's two pixels off you can change your code save and then be like okay it's fixed now uh bug closed um so that'll be sort

of immediate um yeah so server side rendering I've done some work on that it seems straightforward but I don't trust what it looks like I don't know it seems fine I don't know I don't

know um but I I think that one will be cool I we'll see what happens um and past that it's the the next thing sort of Planned is improving packaging so there's a lot of things along these lines so one is can we make it so you

can cash stuff more easily if you have CI build or maybe you have a lot of proprietary code and you want that to be packages that's documented and people can search that just as easily as they can with public ones there's sort of

these more extreme needs and so I think there's a lot that can be done there it's sort of vague at this moment it's just like that needs some work uh and with the batching technique you know you go and look at what everyone wanted and

sort try to bring that together um so after that it's question mark question mark question mark um and so I wanted to sort of say how how will that get filled in so there are a lot of sort of topics that are ambiently interesting and

important and what pops out of them is sort of based on what the community needs what seems inspiring or interesting so one of them is platforms people are like I want Elm on my server I want Elm on my phones what about web

assembly that one is kind of a long-term thing right so you think from beginning of elm to now that's four years and it's like pretty good for front end stuff to think that we're going to be like a month and it's

running on servers and it's a great experience I think is a little crazy but there ideas that sort of set us up for thinking about these things that will pop up into this next slot um so part of working on packaging is sort of learning

more about different kinds of concurrency that could be interesting for our process Library so this sort of building in that sort of long-term idea into short-term projects another one is tool this section's a little thin now

but that's CU it's like debuggers happening a big entry from there has moved up um but one thing we can think about is doing type suggestions right so if your cursor at a certain point we can sort of say okay I think the type here

is going to be this and we have these function and values that can fit there so here are some things you might want to add um another one is sort of making a fancier repple so we have this way of navigating to

particular uh messages in our history what if at that particular frame you can say actually I want to take this model and mess with it a little bit and use this function and so you can get these kind of much more intense cool debugging

experiences maybe that's a terrible idea I don't know um and then there's a bunch of miscellaneous stuff that sort of pops in and out um so one is like documentation people are interested how do we write single page apps um I can

work on that maybe write some documentation or some sort of example and that will sort of pop into the process of what gets worked on um another thing another example is like the hddp library should probably be in

core that'd be good but that's going to need that's probably going to coincide with a big change to core so it wants to be a major release that's a good time to do a bunch of stuff on the HTTP library that would make it nicer because you're

doing this big change anyway um and like there are a bunch of fixes where it's like well this API and core could be a little bit nicer but it's going to require major bump it's so it's not to say that's not

important but it's just like that needs to fit into a broader thing so if there's for example this debugger is going to need a major change to core that's actually a great time to do a lot of these fix up issues because we're

going to need it anyway so yeah so that's sort of how to think about what's coming next so this finally brings us to the title of the talk um code is the easy part right so in all these things it it wasn't about

the sort of technical artifact um when it comes to thinking about communities it's about how do these not what's the technical artifact that people use but uh how what do we use it for what is our relationship with each other what what

what's fun and interesting um when it comes to collaboration it's not I wrote this code it's I got feedback I had this idea I learned this thing and sort of synthesizing all that uh and when it comes to what's coming next for it's not

this code just needs to be just written it's like what's a way oh wow I'm ahead of schedule um what's a way we can uh sorry it threw me um work on something that's not just an

improvement but something that maybe hasn't been done in programming languages before so people see and say oh wow like that's going to help me out or something that for me I'm just like this is really cool I'm excited to share

it for that's often a really good sign that like you're working on something that's that's going to be cool um so yeah so the big thing here is uh it's not about a technical artifact um and it's easy to think of that way we

have a compiler we have a language spec or something so that's a language it's that's the easy part right it's all about Community it's about working together um learning from each other finding out something exciting sharing

that excitement making something fun for your friends or your family or doing something at work that you're really excited about because it's going to make things easier um um and I think that's really what what Elm is all about and so

I'm excited for the rest of the talks today because I think we're going to see that kind of sort of community uh fun and excitement of learning um and I hope we'll see that for you know many years to come so thanks
