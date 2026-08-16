---
title: "Let's Be Mainstream! (Evan Czaplicki) (Transcript)"
category: "cat:philosophy"
source_url: "https://www.youtube.com/watch?v=oYk8CKH7OhE"
ingested_at: "2026-08-16"
key_concepts: "Pragmatism over type-theory purity, user-focused design, why Elm omits typeclasses/monads"
---

# Let's Be Mainstream! (Evan Czaplicki) - Talk Transcript

**Source Video:** [https://www.youtube.com/watch?v=oYk8CKH7OhE](https://www.youtube.com/watch?v=oYk8CKH7OhE)  
**Category:** `cat:philosophy` | **Ingested:** `2026-08-16`  
**Key Concepts:** Pragmatism over type-theory purity, user-focused design, why Elm omits typeclasses/monads

---

## Talk Transcript

[Applause] Hi. So, I'm I'm Evan Tuplici and depending on where you're from, you might say it different. Um, so I designed this programming language called Elm that's focused on front-end

programming. So doing stuff in browser, interactive applications, games, this kind of thing. Um, and so I'm sort of coming from a perspective of typed functional programming. And one thing I think about a lot is this question like

if typed functional programming is so great, how come nobody uses it? Um, and and I think this is a question that people sort of outside this community ask. And I think it's a reasonable question for them just like as a filter,

right? Like obscure things aren't always amazing. Um, and uh it's something that I don't think we ask within that community enough, right? Uh why is it that we don't have more uh users if if it is

true that we really are doing something really great? So, uh, the rough theory is that we're engaged in a decent amount of self-destructive behavior. Um, so I kind of want to talk about sort of, uh, how Elm sort of h how I think about

these things and how Elm tries to do do a better job, uh, dealing with those things. And I also I don't I don't want to be like a mean a mean guy. So I I tried to frame things in a positive way and not

like be be too mean or anything like this is all meant as a as a how can we do better kind of thing. So um for me uh I think it's valuable to sort of think about like the history of programming

in trying to figure out what's going to come next. So this one's actually the history of programming as seen from JavaScript. So, uh, if if you if you try to do a I tried to do a more realistic history, it just broke down. So, what

does history look like from from like JavaScript world? So, in the beginning there was assembly. Um, and it was and it was hard. Um, but somehow people wrote uh Super Mario in it, so that was pretty cool. Um, but

we got to this crisis point where things just like weren't working out anymore. So like along came C and now we have the structured programming approach and like okay that's not exactly how history went. Okay but this is as seen from D.

So C comes along and suddenly we're not doing this really low-level thing we're doing like a much higher level thing. Um and that's true for many many years and at a certain point we get to this other crisis point where it's like ah and Java

comes along and we're like oh great this is amazing. Um and uh eventually we get into JavaScript and these are sort of roughly arranged time-wise like it doesn't exactly line up timewise but from the

perspective of JavaScript you sort of say like well before us there was Java and before them there was C and it's kind of a true true enough uh in fact it's true from that perspective so it might as

well be true. Um, so when we look back the C and Java and JavaScript programmers can all look at assembly and be like, "Ah, it was a maintainability nightmare. I couldn't write this in a portable way. I couldn't

have people read this easily." Um, so we solved that when we went to C. And now the Java and JavaScript programs look back at C and they're like, "Ah, memory management. How could they even deal with that in that crazy language back in

the day?" Um, and so that sort of was the ingredients of this crisis point that that uh at least perceived uh how we got to Java. And when JavaScript looks at Java, they're like, how did people deal with all those freaking

types? Like, how can you get anything done at all? Um, and so I have a feeling that we're at another one of these crisis points where uh the issue again is is uh maintainability. So when you talk

to um companies that have let's say 50,000 or 100,000 lines of JavaScript, they're they're in this place where when they add a new feature, they're going to break three. So one way I think of it is like

Facebook used to say like uh move fast and break things. And I think it's sort of shifted to like move slow and and break things. Um, so what I'm getting at though is like at

a large enough scale, people are starting to see issues in practice. And that's not to say that there's that this isn't a valuable place to be, but we're starting to get these like rough spots. So the question you

might ask then is like, well, okay, so what's this next era going to be? What's the next part of this history? Um, and so maybe that's something functional. Maybe it's way crazier than we imagine and and it's a stackbased language or a

prologue, right? Like something insane happens. Um maybe types will be involved, maybe not. So like a lisp or ML, maybe it'll be something gradually typed. Um these are all viable in different

degrees, right? I add this prologue and stack base because, you know, uh these are small communities that people really love a lot and maybe they're great, right? Like they say they're great. Should I believe them? I

don't know. Um so for me, I think of well a typed functional language is going to address a lot of these issues. We can look back at history and say we got the memory management under control. you got all

those freaking types under control in the sense that uh if you can infer all that information, you can get a lot of the benefits without the like really heavy syntax that a lot of JavaScript programmers look at and they're like

ah so and then maintainability as well. So the problem with that is that in 1973 like ML like was introduced. Okay, so this is huh this is uh one year after C. C was 1972. Um but for some reason that didn't work

out. I I don't something mysterious happened. Um so we had another chance. 1990 standard ML came out. So this is actually five years before Java. Java's 1995. Um so we could have gone that route but for some reason it didn't

happen. Um and in 1996 we had Okamel. Uh this is one year after Java. It has objects. Like it's got it's got it all. Like what's the what's the problem? Um, so in all of these situations, we're sort of addressing the core concerns,

but in a way that for some reason didn't connect and didn't make it big. So when we think about what's going to happen next, I think it makes sense to ask who's going to be deciding what happens next. So, we've got this

massive chunk of front-end programmers, people who day-to-day are making web applications, making games, um, and we've got this tiny population of people using uh, type function languages. Now, this isn't to scale.

Okay, I think I don't know how small that red dot should be, but so to to I to try to put in perspective, um, J Oracle says that there are 10 million Java programmers. Um, and if I

try to do some estimation, I can say, okay, so maybe there are like 200,000 Scola programmers, m maybe maybe more, maybe less. And and then how many Haskell programmers are? So, so like we're talking about orders of magnitudes

difference here like it's a there the the number of jQuery users is like way huger than the the number of people who are doing these functional languages. Uh I think I don't know. Um so if this giant group of function front-end

programmers are going to be deciding we should understand what they want um in this next uh era of programming. So I think there are two sort of main axes that we can think about that are helpful here. So we have JavaScript and uh the

axis here are usable and what I mean by usable is the ability to use it. Um so so I sort of define that as like the time it takes to get from a novice level to actually a product that you can show your friends and be like hey check this

out. So I wanted to demo something real quick. So this is Google guys. I'm using JavaScript. Like the time from novice to getting something done was like it's unreal. It's crazy. Uh I don't think anything

has really matched that. And like if this was a competitive market, this would probably be like uh uh abuse of of market position that it's baked in in this way. But like it it's really really easy to get started here. And so if you

are doing some kind of uh let's say you want to get a web page out, maybe that's a five minute or an hourong process even for someone who's a total beginner. So that's a really amazing uh ability to use the the the language. Now the issue

people are having is about maintainability. Now I've got 50,000 lines. The company I made is is successful and we're we're we're getting new users. We're trying to add new features, but we're having trouble doing

that. So another point on this map is Java, right? So we have much more maintainability here, but the usability is down. And so this isn't this is more about like the time it would take to

start using Java is just longer. Um rather than five minutes or an hour, you're looking at something a little bit more. And that part of that's learning time, part of that's getting things installed, getting things set up. So

from the JavaScript programmer's perspective, like this is a no, this is a no-go. I mean, partly from the maintainability and usability, but also partly from an emotional sort of crazy standpoint where it's just like uh like

that's that's kind of the the the logic of this isn't viable. So, what we want is to get that maintainability and either keep the usability or even improve it a bit. And the direction people are taking here is gradual types.

You're seeing this coming out of uh Microsoft and Google like a lot of companies are betting in this direction. So you can keep the usability profile where when you start out it's very simple and as your thing grows you can

add types to it. What I don't know if people are thinking about is like what is the endgame here? Um when we have a JavaScript program that is fully typed like didn't we make Java again? I I I don't I don't know maybe not but there's

something here where I don't know if that's a quite a an exciting resolution. And I don't know if that's what will satisfy people but but it is addressing the main concern. We get this maintainability. Now what a lot of

JavaScript people don't realize is that this graph is actually way bigger. The you can be much less usable than than than anyone imagined. Um uh what's interesting though is you can actually be way more maintainable than than a lot

of people think about as well. So in the top right corner or top left corner we have ML family of language. This is a like Haskell and Okamel. So I can I can speak to my experience getting started with Haskell that led me to put it in

this corner. Um I'd say it was a good like year before I was like I'm good. I'm pretty good at this. Um and like it's just not that way in other languages. So when your setup takes uh a couple days and the learning process

takes months or uh years potentially to get to an expert level, it's making things really hard for people. So the important point here though is that the levels of maintainability that are available are

way higher than uh than people think about. So what I want to do is I want to get to this magic realm where we get that level of maintainability but we have something usable. we have something that like in an hour or in five minutes

people can get started with and be productive. Um so the question is how do we get from here to there? Okay, this is a trick. This isn't actually the thing we want to focus on. It doesn't make sense to try to move these languages to

this nice place because that means we're moving a really small set of users to a place that they generally don't necessarily want to go. uh in the sense that if you make a really nice front-end programming language for people who

don't do front-end programming I don't know so the thing you want to do is actually get JavaScript to this f this nice place um so when you focus on what a JavaScript programmer needs to get there you end up

making different design decisions um so this is kind of the shape of the world from sort of as I see So um the next thing to think about is what does this mean for designing Elm? So the broad category I I named this is

is like user focused design in Elm. So I know that I I am designing for people who are doing front-end work and they have specific issues that they need addressed and if we're able to address them the best then we'll win. If we're

if we aren't the best, I I maybe some random things will happen. But uh if we can do better, then we have a better chance. So the sort of key design principles here are uh first gradual learning. When you have a bunch of stuff

to get used to, it's good to have a really nice learning curve. So in JavaScript, you have this like you can start doing stuff really quickly. In Python, you have this. um in a lot of functional languages you don't on day

one you get smacked with a lot of details a lot of intense sounding stuff um and is it possible to make progress and be productive without learning all that on the first day so the second one is communication so maybe we have

something good but are we able to tell people that in a convincing way um I think right now we don't do well with that that that was that one I have a lot to say about Um finally we have we have culture. So so

uh what does the community like focus on? What do they find important? Um so you'll notice so far I haven't talked about anything strictly technical. Um this is all sort of community cultural. Um it touches on documentation. Um but

it's going to impact the technical decisions I make. Um and I think this is also stuff that can be designed. this is something that you can think about and do a better or worse job at. Um so the last two the one of the last points is

usage driven design. So based on these sort of foundational things how uh what does it mean to add a feature and finally we have uh tooling. So how can we do a really good job of making great tools? So okay let's get into this. So

gradual learning. So this is something where I think it needs to be designed into the language and libraries to really work. So you can design the language such that as someone gets started and gets productive slowly they

realize these concepts in a way that uh uh builds upon each other in a way that that works for works for people. So a nice example of this in Elm that came out recently is called start app. So, okay. So, this is a little start app

program. I have start and I give it a model, a way to view that model and a way to update that model. So, this is just a counter that I can increment and decrement. And the initial model is zero. I view it. So, I'm generating some

HTML here, a div. It's got a button. I say what the number is and then another button. And I have a way to update it. So I increment it sometimes and I decrement it sometimes. So someone can get started programming without

really doing any functional programming. Like this isn't that far off from something like coffee script. You can actually get something going in very little time without getting hit with a ton of crazy concepts. So I I had a I

visited the WWDC conference and met a guy who did a lot of Swift programming. So he opened up this program and just added a reset button and like in the first couple minutes like 2 minutes in

um and he like didn't really know what was going on but like he was able to add a feature and that's amazing right he didn't have to read a tutorial he didn't have to read a paper he just like looked at the pattern added a thing in and uh

added the feature he needed so that's a great kind of learning curve he's able to start doing and have the confidence to do stuff um and slowly fill in the gaps. Um so and I think this focus on gradual learning is a big part of why um

we're starting to see some education uses of Elm. So uh there's a class at Chicago that was taught in Elm and they did a mix of uh doing front-end stuff and doing some data structure stuff. But uh there's also one called McMaster

outreach. So this is a program for fourth through sixth graders or sorry fourth through eighth graders. So, this is a little uh this is a session they did. So, these are some kids who are writing in Elm's online editor and they

made Spider-Man. Someone has a question. I'm sure he got it though eventually. Um they also have a uh a hall of fame of stuff that people made. So, this is made by a sixth grader. This one's crazy. A fourth

grader made this. Like, how did he even watch the movie? So, so you you start to see like this is something that you can get up to speed with in a really nice way. So,

um the next topic is communication. So, this is something where I think we we can do a lot better. Um so, I want to do a little thought experiment. Um okay, you're going to hear six pitches trying to solve the same problem. And

essentially, you're a busy person. You know, maybe you just uh you're you're the you're a team lead. You just had your first kid. Things are going crazy. The project you're working on is is uh it's more people than you've managed

before. And you're looking around for the right right way to deal with that. So, you hear there's this JavaScript library for building user interfaces. Well, I use JavaScript. I need to build user interfaces. That sounds sounds

pretty good. Um you can write JavaScript the way you really want to. That's actually exactly how I want to write JavaScript. That sounds really good. Um um you can you can have a framework for creating ambitious web applications.

I actually I really love this one because it it like guilts you into it. It's like do you want to write an unambitious one? I don't I think that one's really well done. Um uh maybe you want HTML enhanced for web apps

exclamation point. Um that it's weaker. I don't know if I'd look into that one. Um, but maybe you want scalable, productive app development. Sounds kind of Java, but uh yeah, I could be into it. I could I I

could check that out. Or maybe you want an advanced purely functional Yeah, advanced purely functional programming language. It's like, well, do I want something advanced? Do I want something purely

functional? I have a lot of code that's not that. Is a programming language necessarily the solution to this thing? Um, so you're really not connecting with uh uh people who are looking at this thing at a fairly early stage. So people

who are just glancing through, they don't have time to spend six months learning about the different characteristics here and why it's a good idea. Like they're just going to look at this and say like I want to build user

interfaces that we we lost, you know, that that we missed the we missed the uh the person moved on. Um, so, so essentially the question is like how likely are you to explore the one that doesn't directly address your problem?

Like how often do you hear a pitch that doesn't make any sense to you and then when you look into it, it actually works, right? Um, so uh the general advice I have is be direct. Like you want to say exactly

what you're going to uh uh uh provide. So uh another way to say this is leave nothing to the imagination. You don't want someone making four mental jumps before they understand what you're saying. We want it to be an immediate uh

comprehension. So I have a couple examples here and I'm going to try to not keep it chill. Um so one word that we use a lot is pure function. So the way I'm going to do this is sort of deconstruct the word from a JavaScript

perspective and then provide a an alternative that I think is better. So pure function, I don't know what that is. Um it implies that they're impure functions. neither of these things are things that I have in my worldview as a

JavaScript programmer. Um, so at that point, some people will just move on and say that doesn't seem interesting. Some people will go to Wikipedia and look up what a pure function is and they'll say, "Okay, I guess that kind of makes

sense." Now, at that point, some people will say, "I don't know if that's really relevant to me." And move on. Some smaller fraction of people will say, "Um, okay, that might be interesting." And then they'll look at into more. But

so we we took so many jumps to get to someone potentially being interesting uh that we're losing a lot of people. Um so uh I have had a lot more success saying stateless function. Um JavaScript programmers have state. They know that

it often causes issue. What if you didn't have that state in a lot of your functions? Um, so it directly connects to something that happens day-to-day in your code and says, "Hey, what if you didn't have the problems that come from

that?" I don't know if that's the perfect term, but it's certainly an improved term, one that connects to how people use stuff. Another phrase that people say a lot is easy to reason about. Um, so my my mom, she likes to

review my work, so she actually like read my thesis before it was time to turn it in. And she came across this phrase, and she was like, "I don't think this is English. like I think you forgot some number of words.

Um easy to reason about. Like it it's not really clear what that's going to give me, right? Like was it hard to reason about? Like I'm a JavaScript programmer. I spend a lot of time reasoning about what my code does

because like weird stuff can happen. So another way to say this is it's easy to refactor. So just connect it directly to uh what's happening in your code. Uh do you have problems refactoring? Well,

what if it was easier? Um, and you can kind of get the take the inference steps and say the last one. Another one is safe. We like to talk about type people like to talk about safety, but safety is kind of boring, right? Like a safe

investment is like bonds. No one's no one's really like ah bonds. Yeah. Yeah. You should see my bond portfolio. It's been like 2% growth. It's it's amazing. Um, another I the image of like floaties, you know,

like like that's that's what I think of when I think of of safe. Um, and to connect it more to code, like when I write JavaScript code, I I don't think about it as safe or unsafe. It's not like it's going to punch me, you know,

it doesn't really connect with how I think about the code. So, we've been saying reliable um in the sense that uh, you know, you get runtime errors in JavaScript. So, what if you had a program that didn't do that? What if you

had the reliability uh that you want? Um so last one is monad. So so this is a term that I struggled with a lot. Uh I don't know how many people like go and say that but I would say it

was a good like six months to a year before I felt I really was like on board. not I won't say on board before I really understood what was going on there. Um and I think I didn't have a deep understanding for maybe a year or

two more after that. Um and when I finally did understand I was pretty upset that it wasn't actually a complex thing. Um so there's something about this term that it it asks you to think that it's

complicated, right? So my my experience learning it was like, oh, I I want to print something out. Uh, okay, I'll use a monad. Well, that needs category theory. So, should I buy a book on category theory? And like, I'm not

learning from a professor or from someone who's used Haskell a lot. Like, I'm just sort of going through like what would make sense? Here's a term that I don't know. Well, then I should learn what it is. Oh, it's dependent on this.

I should learn about that. Um, and yeah, a Haskell person would say, oh, you don't need to buy a book on category theory. Haskell is saying you should right like I need to know about monad. So there's a story I like to tell uh

that sort of reveals this in a way that doesn't actually connect to people's preconceived notions. So let's say there's a there's a person who uh they have an apple in each hand. They say I have an apple and I have an apple. How

many apples do I have total? Um and so you say to them well first you need to understand group theory. So there are four laws commutivity, associivity, identity, identity. Um, and so you can do all

these commutive operations. If you follow the laws, it's really cool. And they see that the the person is like, I have an apple here and I have an apple there. How many apples do I have? So okay. Okay, let's be more concrete.

So multiplication on integers is a is a group. uh rotation in 3D space around an axis is a group. Do do you get it? Um so when you put it in that in that framing, it sort of reveals that it's a

it's a crazy way to teach addition. Like there's a reason we don't take that route. And may maybe that route works for some percentage of people who are learning, but I'd say for a vast majority, let's say 95% of people,

saying two is is a better explanation, right? Um, so the point I'm making here isn't that this is a an unimportant concept, but it's one that we emphasize very very early, very very emphatically, uh, and

sometimes in a way that's actually confusing. So another aspect of this is often people say like the state monad the IO monad. It's a very weird thing because it makes the noun monad like it's a physical thing. Um it's like

saying oh you want to add numbers just use the addition group. Why would you say that? Just add them. Um so uh there are a lot of ways we can deal with this. The general thrust of it

is is you can essentially be very active using monatic things without ever talking about it. So uh in JavaScript for example the promises library has a a function called then. So I can say here's a thing I want to do and when

it's done then do this thing then do this other thing. Um so we found it's actually really effective to say callbacks. Um I I suspect people will be mad about this but uh so if we look at

um we have this and then function in a bunch of different libraries. So in maybe for example uh I can say uh here it is here it is try to turn it to an integer and then

turn it into a valid month. Okay, you can read it the first time through. It's not crazy. Do this and then do that. Um, and we don't have to talk about any concepts here. We just say, "Give us a maybe and give us a call back. If you're

successful, we'll keep going. If you're unsuccessful, we'll fail." So, you're able to get the core concept in a way that doesn't introduce any extra stuff. Um, and so as people start seeing this in different libraries, maybe they'll be

interested in the general pattern. But the point is, you don't have to understand the general pattern to be uh get up to speed and use this kind of thing. When somebody you want to tell something there's a general pattern

here, what do you call it? It's a little bit like you call it a monad. Of course, obviously the point is you don't have to do that on the first day, right? like when you want to know the general pattern of addition and multiplication

and rotation in 3D space around axis, you called it a group. That's what it is. But the point is you don't have to talk about that super early on. Um, okay. So then I have one last note

on communication which is about obvious names. I really like obvious names. I I was at Microsoft briefly and everything had a threeletter abbreviation. So there was a joke that like uh TL everything was a TLA threeletter abbreviation. So

they'd abbreviated the So in Elm we try to just like be very literal. So the tool for building things is Elm make. The tool for packaging things is Elm package. The tool for Elm HTML is or sorry the tool

for HTML is LHTML. Like c can anyone guess what elm markdown does? Like it helps you do markdown. So just like making it so there's no extra steps that you have to take uh is is a really important goal for me. Um okay, next is

culture. So this one I think was a a cool realization that I uh I was running a meetup in San Francisco and the setup was uh someone would do a talk, a couple people would show up, maybe like 20 25 people would show up and generally it

was a a pretty like elite group of people. So people who had PhDs about some sort of functional programming topic. Um so essentially when you do like there's a person talking and a bunch of people listening, you get like

a group of people who are relatively elite and you try to make them more elite. Um so I met this person who was running a meetup called games making games. And the way it was set up was as a hackathon. People show up, they pair

program together, they work on a concrete project. So they say today's focus is uh a sidescrolling game um and let's focus on that. And so I started trying that out for the Elm meetup in San Francisco and the makeup of the

attendees changed dramatically. Right? So it was people who were totally new to Elm, it was people who were interested in using it work, people who were making packages to do uh front-end work. So just by sort of changing the focus of

the meetup, you change the makeup of the community, right? So essentially by doing that I'm sending a message to people who are interested in using Elm in that Elm is interested in being used uh

as well. Um so I think that was actually a really interesting technique. Um, so another example of this this culture of like just uh getting out there and making stuff is there's a company called No Red Ink in San Francisco and they

recently started using Elm in production and essentially the way they got it started was an engineer decided like I'm going to do this and he did it. Like a lot of times uh you get blocked on on smaller issues. Um, but it's important

to sort of see like uh if you go if you decide to do it, it's not it's not that difficult. So, another one is time the time traveling debugger. A lot of people think I made this. It's which I didn't. So, if you haven't seen it before, um uh

ohun. So, you've got a little Mario here and he can hop around. Now, the interesting thing is that you can pause and go back in time. Um, and then you can change your program and like different things

happen. Um, and you can also track what's going on. So, uh, this was a guy named Llo Pandandy who was just interested in debugging. How can we do this in a really cool way and he decided to like go and give it a try. Um, and

when I first saw the demo, like I didn't really understand what he'd been talking about and then he showed me the thing and I was like, okay, this is a big deal. This is cool. Um and so this culture of just like go out there and

make something useful I think has been really valuable in that way. One final piece is uh a style guide. So a lot of people will say like oh those ML languages are hard to read. Um and what they're saying in fact is those people

who use ML languages write code that's hard to read. So it's not quite the same thing. not an inherent fact about an ML language or it's that there's a coding style that isn't super professional

that's very very common. So um as a quick example of this um we have two different ways. So the top is what I recommend and we took a lot of lessons from Python here actually. So um you can do certain layout things. So in this one

we always have two spaces between top level definitions. This is something that Python does. It lets you chunk functions in a much easier way. We also say always uh bring things down on a new line um so that you can sort of visually

see things in a nicer way. And the goal here is like how can we have code that is going to last for five years or 10 years that when you go do a blame on some change, you're going to actually point to something real. Um, and a lot

of code that I've seen on the internet in some languages looks more like this. It's much more compact. Uh, it's easier to fit on a slide for a uh a presentation and it's easier to fit in the two columns of a academic paper. Um,

but it has problems, right? So, if I ever need to add another case that's longer, do I move all of these? Do I leave them? If this case becomes really long, I have to move it down. But do I move all of them down? I'm just creating

a maintenance problem for myself that didn't need to exist. Um, and so part of what I want to to make a value of Elm is we're writing code for like real use in the in the world. And so we need to have a professional style.

Um the last point is I have a a guide for designing packages which is just a set of best practices but essentially how can we help people make really great stuff. Um okay so finally we'll get to a more technical aspect of this. So um

usage driven design. So what that means to me is start with the minimum viable solution something that will work and maybe it's not enough but maybe it will be we don't know and from there see if there are any concrete in issues in

practice if so bring that information back in and either update your solution make it a little bit uh uh more powerful. Um what's been interesting is that the minimal viable solutions often enough. So we have a couple of examples

of this um where we've gotten very nice results from keeping things simple. So one example of this is static signals. So if you're not super familiar with Elm, I don't know if this will make a ton of sense, but essentially values

flow through your program in a particular way. And in Elm, you can't reconfigure that flow. And so folks who had been working on FRP were very very skeptical. They're like, "How can you make

a interactive list, a dynamic list where there are stateful elements?" And so like, "How could you make a list of counters where you can add and remove counters?" Something like this. This is also in the time traveling

debugger, so you can go back. Um, but so how can we do something like that? And so I essentially made the wager of we could add something complicated or we could see if this actually can be solved with the minimal

solution. And so what ended up happening is this turned into the Elm architecture. So there's a nice pattern that you can use to structure your Elm programs that's gives you modularity. It gives you testability. It's very easy to

stamp out. Um, and we're starting to see it being sort of ported over to Closure Script and React code. Um, perhaps sometimes that's co-invention. Sometimes it's people saying, "Hey, I saw this cool thing. Let's do it here." Um, but

what that means is we're able to start with a very simple setup. So, this is similar to the counter that I was showing before. I have a model, oh, sorry, which is an integer. I have a way to increment it and decrement it, and I

have a way to view it. Now I've wrapped this up in a module so I can reuse it as many times as I want. So when I create a list of counters I just import counter um and then I use those functions. So I can initialize it. I can update it and I

can view it. And all of this is just reusing that code that I wrote before. So now when I add features to counter, this code doesn't need to know what's happening there. I just have a way to update it and view it. Um, so you get

this very nice modularity and I don't think we would have ended up with that solution had we started with what was the more complex thing that sort of was the generally agreed upon way of doing things. Another example of this that's I

I I already regret putting this in here. Um, so at this moment uh Elm doesn't have type classes. So this is something that's controversial for some people. So for JavaScript programmers, this is a feature. Uh people love this. Um for

HASLL programmers, this is a travesty. This is terrible. I can't believe it. Uh how could how's it even possible? Um so part of this is that uh a language exists over 20 or 30 years and uh when you release a feature is also part of

the feature, right? So if you add a feature in in the first year, the whole culture that grows around it is going to use that. If you add it in the 15th year, that whole community that you built will have a way of doing things

and you introduce an advanced feature for advanced users. So you can totally change that usage in practice by thinking about timing. So one interesting result that's come from this so far is how we do our JSON parsing.

Um, so, uh, this was something that we weren't really sure how it was going to look, but um, oops. So, this is, uh, how we represent our documentation on the documentation

website. So, I have, uh, documentation has name, comment, and then all the values and such. And the way we get that of JSON is with this decoder. So, I say, hey, there's a name field. It's a string. There's a comment field. It has

a string. There's a bunch of values and that's a list of val uh let's actually look at there's aliases and that's a list of alias. So let's look at what alias is. That's also a decoder and it has certain fields. They have certain

values. So you're able to sort of build up these JSON decoders in a really nice explicit way. And that's not tied to any particular type. I can make five of these for for uh documents. Maybe there are different uh eras of documents like

uh I changed the format at some point and I need to have a decoder for both of those. It makes that really simple. Um and you might say okay well I wouldn't I'd rather not write this code. So that doesn't actually need type classes. This

is something that you could perhaps generate based on the the type declaration. Um, so you find yourself in a situation where you actually end up with a pretty simple solution uh that you wouldn't have seen if you had a

fancier tool in your toolkit. Um, so the overall observation here is that uh simpler foundation produces simpler code in practice. Um, and that I think is a really valuable thing and if you're going to give away simplicity, you

better be doing it for a very good reason. That doesn't mean that you can't, but you should at least know what the trade-off is that you're making. So the final thing is tooling. Um so because we have sort of all these

invariants about uh typed functional language. So Elm for example is immutable. Uh we have managed effects. So effects aren't just happening arbitrarily. We can use that to create unique and delightful experiences. Stuff

that couldn't be created by some other project. So, so Elm is competing with languages like Dart or TypeScript where they have a team of 20 or 50 people and I can't compete

like even if even if someone's 10x that's 20 and 50x no one no one even no one even talks about that. So the way that you can be competitive is to design things that just can't be done in those languages at all. So one example of that

is a time travel debugger which we saw. Um, another example is automatic seat uh semantic versioning enforcement. So, this is something that I don't know if a lot of people know about. So, let's say a new version of ElmHL comes out and

it's a major change and you want to know what happened. So, we can run diff and it'll say, hey, these two things were added and we changed call span to take an int and row span to take an int. So what happened here is someone read the

spec more carefully than me and realized that in those particular cases you can't give four pixels or four percent you really have to give a number. Um so you can actually look what exactly changed and so this can be produced at any

point. So when someone's going to release a package we run this and say hey it looks like you added removed such and such and we can say exactly this is a major change this is a minor change this is a patch change and that means

every package that is released follows these rules. and maybe that's feasible in some languages, but if we're competing with JavaScript, this is a this is a really nice thing. And there are a lot of

uh fairly well-known cases in JavaScript where a big project will do a patch release or a minor release release that breaks a lot of stuff. And they say, well, it wasn't really that big a deal, so I didn't. But you violated everyone's

constraints and their builds are broken and they can't push to production. Um, so this rules that kind of case out. Um uh another thing that we did recently is friendly error messages. So sometimes people say

uh I don't like using these type languages. Those error messages are a pain. Um and the realization here is like maybe they are painful. Uh maybe maybe we can make them better in certain ways. Um so the way this ended up

looking is we tried to think about what would help the user the most. So on the left we have a little code snippet and on the right we have the error that is happening there. And so we get the little red underline uh list doesn't

expose nap. Um maybe you want one of these other things. So it's very explicit about what's going wrong there. Um another example of this is oh yeah this one's this one's great. Um the first argument to the function has an

unexpected type. Looks like the record is missing the field age. If you look at the program, we're giving Herman to is over 50 and trying to get his age, but he doesn't have an age. We so we've

directly identified in a way that a person can read what's going on in that program. Um, yeah. So, essentially by focusing on sort of the user experience of these error messages, we can get a lot a

better result. And so the hope here is this is a work in progress and the hope is that we can get to a point where these error messages actually start to feel good. We can get to a point where it's just helpful. Um I am writing a

program and it says hey check out this line. Uh something th this particular thing is going wrong here. Um and I think it's conceivable to change the relationship people have with a compiler from adversary to assistant. Right? So,

instead of the relationship being like, "Hey, check out this code." No. Uh, what if I mess with this? No. How about this other thing? No. Uh, okay. This? Yep. Uh, and then and then maybe it crashes anyway if you're if you're using Java

and you have a nouinter exception. Um, to something that's more like, uh, hey, here's this program. You should you should change this and avoid a crash that way. So I think that's a long-term process but I think we should think

about uh trying to move in that direction. Um another thing is the startup experience of using Elm. So I want people to like accidentally learn Elm if they come to the website. So I have all these uh examples and so like

the hope is that you can click on one and say I'm interested in that. Um and just see how that code's working directly. Um, and one nice thing here is that we have little hints so you can go read about what's going on there.

So if you want to know what a div is, you can go look at that. Um, I think that will start to turn into more advanced editors and ids and such. But having that experience really helps people get started in a quick way.

Um, this one will be interesting. So based on the design of Elm, we can be faster than JavaScript like from a like from a theoretical foundation. So this is a really huge engineering project, but this is something that uh if we're

able to achieve, we're this is a huge benefit. One thing JavaScript primers really love is performance. So when ASMJS came out, people are like, when are you going to be compiling to that? It's like ah you need a garbage

collector. Um, and then when when web assembly comes out, oh, okay, this how about, yeah, can you use that? It's like, oh, you need a garbage collector. Um, so I suspect we'll eventually have one and we'll be able to actually

deliver on that. But the message here is that like invariants are Elm's competitive advantage. If we can provide experiences that uh you can't get anywhere else that people haven't seen before that are delightful for people

then I think we have a much better chance of being the the next sort of chunk of of programming history. So that's sort of the outline of user focused design in Elm. Um and hopefully that's going to help us be mainstream.

Thanks. Any questions? Um something that people really like about um using JavaScript for building their um client applications is that they can use uh JavaScript on the client and the server and then get like these

um serverside rendered applications using the same logic. Um, is that is is having Elm run on the server a thing that that's I think it's likely to happen in the next release. So essentially I

wanted to focus on a clear niche before expanding out too far. Like I felt if you have a really broad focus, you're going to do a lot of things poorly. Um, but we're at a point now where I think we can start running on node. Um and the

long-term hope would be that just be running uh compiling to assembly and running much much faster that and having different sort of having better support for concurrency and parallelism and such but that's coming.

So there are different theories about uh what programming like adoption programming language adoption follows. Some people think that it's uh you know based on killer apps some people think it's based on features. What if it is

really entirely random? I I would say that observationally it does seem to be kind of random. Um, if that's the case, it's not going to hurt to to operate under a different

theory, right? So, trying real hard to think through what it might be. And if it does end up being random, this this won't hurt. Um but another part of this is that there's sort of different trajectories for languages that have

been successful. So you have the sort of big like languages from corporations and for a long time that was the only way you would have the resources to make a language. So like C and Java and such. Um but you also have sort of languages

that got started out of like some person working on it. Um so Ruby and Python are sort of examples of that. So I try to scala and closure as well. So I try to look at those to see what techniques might have been influential in in making

that in making that happen. But maybe it's random in which case like that's yeah uh how do you avoid the uh the the guidelines you you describe say whether um you you make these choices you know

say introduce a new concept or try to reuse the existing concepts and so on whether it is helpful or say gradual learning is is is does this work in only in San Francisco or would it work also in the communities elsewhere. So, how do

you know whether the the choice you made was was the right one? So, I feel like San Francisco is actually a more uh it's a tougher city for uh typed functional programming. Um it's I think it's true. Uh on the east coast you you have a lot

of it and part of that's because of the universities that like what the professor's particular loyalties are to. So on the east coast of the United States you get a lot of typed functional stuff. In Europe you get a lot. On the

west coast not really as much. So um I try to just ask people very aggressively what how things are going and like what their background is and and such but it's hard to I I would be surprised if there was an advantage in San Francisco.

That that's a place where the the thought experiment about having six different pitches. in San Francisco, it's like you have 80 different pitches and they all have a meet up tonight. Um, and you have to like you're just like I

don't know. So, it's it's it's uh San Francisco is tough. Oh. Uh, when's Elm going to have macros? Just just kidding. Um do you have any uh data on the or

some examples of the complexity of applications that are being built in Elm right now? Like what's the largest one like? So that's probably the folks at no red inc. So the particular part that they did in Elm um so it's helping

people learn grammar. So the example that they show is uh they're helping people learn passive voice and active voice and apparently people answer 2.5 million questions a day on that chunk of code. Um I don't know how huge that

codebase is but we're it's not like we've we've got like JavaScript scale tens of thousands hundreds of thousands of lines projects yet. Yeah. So a lot of the things that you mentioned seem to make a lot of sense.

um especially in the context of Elm. Um, but they also they're trade-offs with a lot of the of the the the decisions that you've made um that as I said make sense in the context of Elm, but you also seem to be

sort of suggesting to the general functional programming community. And I'm wondering whether um and some of those lessons I think we really should learn. Um, but I'm wondering whether it isn't. So, for

instance, losing the connection in our terminology with academia seems like it's a trade-off or not having type classes. Um, and I'm wondering whether instead of making those trade-offs, um, we can't just have Vue be the sort of,

you know, Elm be the gateway drug and so you do all those things and say, oh, go try out all all the other functional programming languages afterwards. Whether that's Yeah, I think that's plausible. Um I um the point I want to

make here isn't that all ML FM languages need to be making these decisions but starting from like who is your user exactly? How can I cater to them in particular? How can I me set up my messaging so people know what they're

getting themselves into? So my experience has been in some communities there's disagreement about like is this a research tool? Is this a way to make products? is this um and so that can be quite confusing but the answer might be

the actual user of that language is defined in a different way and for that user you need to think about different things so I wouldn't say like oh do all this stuff in hasll like I I don't think that's a a good idea does that kind of

what is uh what is the production usage of Elm right now are there any like real world large applications built with it so We have I know of three companies definitely that are using it. Um so one is this company in San Francisco, one is

uh called Circuit Hub and they're doing some diagram rendering it with it and there's a German company who's who's using for some internal tools but we haven't gotten a like a massive app written in it yet uh in production.

So you're working at prei. They're not using element production. Are they going to? They are going to. It's a more complicated story than I than maybe I want to share. Okay.

Um but essentially we're in the process of doing a rewrite from Flash to JavaScript. And uh when you're doing a big rewrite, lots of things are complicated um besides like the languages involved. So there there's

lots of factors there. And I I think uh it's going to be some more months, but I think it's it's going to happen. Any other questions? Phil has a question.

That's kind of an honor. Uh, one of the big factors in language adoption um and learning is familiarity, right? It's not just that it's easier to learn because of the context people know. So, what choices

did you made make in the design of Elm to make it familiar like something else, right? That's to a large extent why Java and JavaScript succeeded because they looked like the thing that came before them. So one I can give one example and

one counter example. Um so one example of trying to make things look familiar is uh we have a concept of tasks which looks very much like promises in JavaScript. And so you sort of have this onetoone mapping where hey you know

promises uh we've got task the API is quite similar um and that's filling the role of the IO monad without introducing that sort of uh conceptual world. Um, so an example where I I I think we're I don't really know what the

answer is, but so I I went with syntax highly inspired by Haskell and Okamel. Um, and for a lot of people they're like, "Ah, this is crazy." Um, and it's not clear to me what the right solution is there because if I look five years

down, um, it's the right choice how it is. Um, if I look at today, maybe there's some benefit to making things a little bit more familiar looking. So, I'll I'll share an interesting experience on on that. So, I I've had

people come up to me after talks and say, "Hey, that syntax looks a lot like Python. Was that an influence?" And I was like, "No, but I'm so happy that you think that." Um, so I think the style guide that we

set up for Elm is going to help a lot with the like perception of craziness. So for people who are coming from stuff like coffecript, it's not that wild in terms of syntax. So I I'm making a bet that uh we can get away with certain

things. Um especially if the overall message is like it's really important to uh make things easy to learn.
