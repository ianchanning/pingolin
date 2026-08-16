---
title: "The Life of a File (Evan Czaplicki) (Transcript)"
category: "cat:philosophy"
source_url: "https://www.youtube.com/watch?v=XpDsk374LDE"
ingested_at: "2026-08-16"
key_concepts: "Why single-file TEA beats micro-components, when to split modules, data structures over abstractions"
---

# The Life of a File (Evan Czaplicki) - Talk Transcript

**Source Video:** [https://www.youtube.com/watch?v=XpDsk374LDE](https://www.youtube.com/watch?v=XpDsk374LDE)  
**Category:** `cat:philosophy` | **Ingested:** `2026-08-16`  
**Key Concepts:** Why single-file TEA beats micro-components, when to split modules, data structures over abstractions

---

## Talk Transcript

well welcome everyone I want to start just saying thanks to everyone for coming this is this is kind of crazy um I'm I'm Evan I made Elm and uh uh it's very exciting to be here um so I want to say thanks thanks one thanks for

folks uh thanks folks for coming thanks to Tebow and Guillaume for setting things up and then like thanks to everyone who is helping get the technology setup and then like this thank you is like out of proportion

right so like thank you to who who had the L have this tail I I I really appreciate that um but yeah so uh thanks everyone for coming and um

I want to emphasize sort of a question that uh that I that has sort of guided Elm for the last couple years uh which is how do I grow Elm code and so this is a question that somehow always sounds

topical so who remembers Elm before the elm architecture before them okay there are people there are people out there okay um so there was a time when that didn't exist and people would say how do I

write a program um and so we sort of observed okay maybe we can call this thing there's a model there's an update of you we saw that pattern and they were like okay that's cool how do I grow a gnome program I was

like okay uh so we had some more examples and showed okay you can reuse functions in this kind of way to help make a view and people were like okay cool but how do you grow an Elm program so I want to

take the next step in perhaps a a never-ending Journey and we're going to do that by tracing the life of a file so we'll see it start small and gradually

grow and then grow a bit more and eventually break off into two and I think as we go through this path it won't necessarily be surprising or difficult but I think it's hard to see

if you're coming from JavaScript so before we get started with the life of a file I want to start with some JavaScript folk knowledge that may be leading people astray so one thing that I see a lot is this

idea that like shorter files are are better so an extreme example of this is when I was doing the um uh The Benchmark comparison between react and a bunch of other Frameworks in Elm

the Ember one just had so many files I just didn't get it right like this is a greater than file and it just felt like this surely isn't the the easiest way um so when I see this this like thought

process it sort of feels bizarre to me um and so the way I can understand it is the contact is as the as the lines of code increases the probability of sneaky mutation approaches one like it's gonna happen if you're writing JavaScript code

so if you have a thousand lines of code there's going to be some object that accidentally gets shared and two people are going to be mutating it it's just gonna happen um so therefore for shorter files it

fills this very useful function another thing that people just know in JavaScript is uh you have to get the architecture right from the beginning or you're doomed it's just like not going

to work out for your project this you you like barely need a justification because like obviously I'm sure many of us have seen this hat play out in companies we either work for or people we know

um and the the justification behind it is like refactoring is very risky um sometimes it's cheaper to just rewrite the code and I think that accounts for some of the churn in JavaScript Frameworks people like well

this didn't work I could try to fix it but it'd be just as easy to try a different thing that maybe doesn't suck so we have these sort of intuitions and habits that are grown out of the actual

constraints of JavaScript and of the languages we use but in Elm the probability of sneaking mutation is zero if you have a thousand lines or ten thousand lines it's just like not possible that a value gets shared and

suddenly there's spooky action at a distance between these two chunks of code so this whole premise is gone and so I don't see how we can draw the same conclusion anymore similarly refactoring is cheap and

reliable like you have types to help you out the compiler is going to guide you through the process so you can end up changing 10 or 20 files and be pretty confident to end that things are fine so again this premise is gone and so this

idea that the architecture has to be right from the start doesn't really play out in practice so the big thing to note here is that the way elements design changes how you should grow a code base and we have a

lot of habits that come from like we don't even necessarily all know the justification of these things but we know like oh that file seems too long that's probably that like we have these senses that guide how we write code

um so the rest of the stock is sort of challenging these and providing a new way of seeing code that can help uh grow a program okay so the life of a file we might start out with a nice little

file let's say I uh and the blue is uh like the model let's say the data structure and then there's some logic and maybe this is uh I have a personal like reading list and I want to just keep track of the books that I'm

interested in and maybe I have two 200 lines of code I'm not crazy and so I add some features I want to be able to mark what the books as read or not and maybe I want to reorder them depending on if one starts to seem more

exciting and so now I have about 400 lines and I think a lot of folks at this point would be like like something's wrong there's a problem um that's generally not that's not how I

would approach programming an Elm it's not how things work in standard ml or a camel or Haskell it's just like having a file this long is pretty standard so if I go through the compiler like that's I'd say the average

um and so maybe add some more features um I can add annotations to each book of quotes that I really like things I want to remember um so now I have like 600 lines of code and it's like okay now it's truly it's a

not really I don't know uh I think you shouldn't like be too scared of a file growing long so this is something that will typically happen now at this point it's likely that I'll say you know what I think it'd be good to have the data

structure for like my library where I can reorder books and a data structure for books where is it read or not what are my notes and then I can start to organize my code around those two data structures

um so I can say okay Mark this book as read add this note and so the functions in my code start to organize around those data structures so anyway you discovered this better data structure

so the next step that may happen is we split around the data structure right so once we discover that there's this other way like chunk that we can grab onto that can become the heart of a nice module

um and so this is the typical process that I always follow is just basically until I find a data structure that I can split on and if I don't find it it's fine so I'd encourage folks to sort of play with

this in your own code and sort of if you're feeling uncomfortable like oh this seems like I have too much code here just like push into that feeling and like see if it actually

is warranted like is there actually a problem or is it just like a feeling that you have based on experiences in other languages okay so at this point this is basically just like an unsubstantiated claim

um let's see some more concrete examples right ones where the code is uh more uh elaborate than lines uh so okay so I want to look at two examples one is uh this sort of settings so you can imagine this is like the

settings you'd have in a Facebook or Twitter or Pinterest or whatever like do you get email notifications do you want video audio play do you want to use location these kinds of things

um and like you could just say no but they want to give you the option to say no um the other situation is uh checkbox is a bunch of fruits maybe I'm gonna uh

you're gonna get lunch and you're able to pick out which fruits you want then you can have that one so before we dig into this I want to sort of take a second to and ask people like what are the questions and concerns when you see

these two that that pop into your mind like when you think about how the code is probably going to look what pops into your mind okay yeah someone said oh oh [Music]

okay okay we're good we're good um someone said generic checkbox list um so yeah this idea of like how do we share like clearly we have check boxes here like sharing needs to happen Okay this it

trip I'm gonna I'm gonna proceed by showing how I would address these and then we'll see if that intuition plays out um so when I look at the settings the first question I ask is how do I model

this information right so do I use a record where I say there's email there's video there's location do I use a list of pairs where the string would be email notifications true uh autoplay false location false

do I choose a dictionary which would work similarly but now it's Unique on these things or do I do this other one that's uh I have a list of strings these are all the options so email autoplay location and then a set of which ones

are selected so this would just be email and we can think of more it's a good idea to get in the habit of just thinking what are all the possible ways I can represent this so at this point you want to say okay well which

one should I do so one trade-off here is this one gives us the benefit of types right so if we're messing around in our code and someone misspells email or misspells one of the things the compiler is going to

give us some help so that's nice and these other ones are extremely typed so if there's some misspelling it's sorry like things are going to go weird um another thing to think about is the order in this one is just determined by

The View so in my model in my record I can update however I want it can appear however I want it to appear in my code But ultimately in the view I'm going to say show the email show the notification show this and if our designer says okay

we actually want to move use location above because everyone wants to turn that off and no one can find it we get a lot of support tickets and like they're really mad at us so like look I I get that

just change it okay and then it becomes very easy in this world um with this one the order is stable but you can actually change it in the update right so we could in the same time we're upting a bull

from True to false we could just swap reverse the list and so suddenly the UI is totally different based on stuff that's happening in the update code so someone writing update code has to think about what was it that that Designer

said a while ago about support tickets this one orders dependent on the keys it's just like not a good idea and this one the order is stable again so it seems like we've got a pretty clear winner in this case so let's just

run let's run with this then okay so here's the initial version of it we can check stuff and we can this is kind of small but

we can see people messing with the record oops okay so when we look at the code can people see this okay okay

the model is what we talked about we have the record with our Boolean fields and the defaults you know everything needs to be true right we need autoplay to get that ad money we uh we need location on so that it can be location

specific advertising like hey I notice you're in the neighborhood of and we need the email so that they can notify you to log in and see the autoplay has and then in our update things are relatively straightforward

we have a way to toggle each of these things and if I mess up and say I want the models email it's like hey I think you have a typo so we're getting that benefit that we

wanted and finally we have a view um so we have a field set there's labels and each one contains a check box that's we say okay here's the email notifications one is it checked

here's the autoplay is it checked Etc now one of the things that you can do is say okay these actually are pretty much exactly the same so we can factor out some of this code

so I can say view check box uh message I don't know if it makes sense to start with the type but I like practice this so I know what it is but we can essentially chop out

this code which appears a bunch of times and fill in the blanks so checked is checked message description and then where's where did my mouse go

okay there it is and then we can say let's just replace all of these with the check box Okay so is it coach order not really um but if we are applying uh styles to

all of these in the same way now it's a lot easier we can do it in one place and be sure that it happens everywhere so this is a nice refactor given the current state of affairs so let's see if I did it right

yeah okay cool so we come back we have this going it's nice and so we get a new feature which is autoplay customizations right so instead of just auto play we want people to be able to choose should it play

audio by default and should it play on Wi-Fi only or will people allow it on on cellular data as well so when we go back the thing to look at is our model again so one way to deal with this is well

okay we have two new things so we have auto play audio and autoplay Wi-Fi it's I'm going to call it without Wi-Fi

I don't know because it helps me understand what the bull would be and then we can go and mess with our view um but this is kind of lame because we we we can do it that way and the designer will say well I want it to be

where if there's no video autoplay then you can't mess with the auto play settings right like you're not doing that so those should be disabled so suddenly we have this interaction between these three Fields where

we always have to check autoplay before we show this and that determines whether it's disabled so we're starting to get these dependencies so a better way to represent this would be to just actually model it uh directly

so autoplays offer on and if it's on there's audio or without so in this version of reality you can't mess with any of these options without pattern matching on on or off so

if you want to change them you have to say okay let me expand the autoplay if it's off oh I don't need to deal with it and that also means in your view you handle these two scenarios and you say okay is autoplay on in which case I can

show these things if it's off then I don't so it's sort of forcing any future user of this code base to understand that there's a dependency between these fields now we say okay we'll show this to the designer again but the thing is

if we turn things off we lose all of our options so like we want those to be preserved some users will toggle this a lot and it's annoying so what we can do is say Okay type Alias auto play settings

and then we can actually just have it on both but still force people to go through the on off check before you're doing any logic so and then this will play out

throughout the course of the code we can we can a way to approach this was well now we have this autoplay idea maybe we can start to write some helper functions to make it nice to work with so maybe we

can say toggle autoplay and it switches between on and off in a nice way and so as we create these helper functions we start to have functions that are all built around a data structure which is that pattern I was talking about so once

you start to see these kinds of chunks of code you get these units that can break out and make your code nicer okay so we have echoing so now we come to fruits and at this point the question asked

yourself is like do you think it's going to work out the same way so yeah so let's take a let's take a look so again we can choose between different data structures and I pick the same ones so record list of things

dictionary the list of options and which ones are selected so in this case our constraints are very different so we work at like fruit fruits.com I don't know

um and the fruit availability it's seasonal we want to bring you the freshest seasonal fruits for your region um and like maybe we're out of bananas today so we don't want to just let people say oh I definitely only want

bananas and it's like oh sorry you need here's a mango um if we use a record does that mean we would have to ship code every time availability changed in a particular region or

so that doesn't seem great but in all these others we can just load the options from the server that seems like a benefit from there one thing we might consider is well which of these will be easier to

just to use which one will the code come out nicer so in this case we'll probably use list.map to do an update we can scan through and say if it's this fruit then I'll toggle it or not with dictionary you can use update and

say okay I want to change this particular fruit and with this one we can use set insert and remove so we don't have to ever mess with this we can just say okay they want

to add this to their set of their selected set and they want to remove that one and again we have the ordering problems from before where like maybe our head of fruit marketing is like

we need to put bananas up at the top because that's like higher margin and that's what we're all about here at fruits.com um or maybe someone else is like well we really should put uh mangoes up at the

top think about the nutritional content it's like think about the bottom line so there might be some need to change this around perhaps dynamically so again dictionary isn't ideal for that kind of scenario

so let's let's go with this one where it'll be kind of nice to add and remove things to the selection and we can mess with the order quite easily okay so now we can go look at our fruit situation

which and then we can just select it's it's great and if we look at how this goes we have our fruit list which is very stable and then selected which is changing as we

mess with stuff so let's check out how this code works fruits okay so in our model we say we have two things the fruits that are available and the ones that are selected

and for our initial model we're just pre-populating with some fruits but you could load this from the server and our selected set is none or selected and then update logic pretty straightforward

if a fruit is selected add it to the selected set if it's deselected remove it from the selected set and then is this going to fit yeah Okay cool so in our view code we again have a field set

I don't okay you can see the mouse here we have our field set and then we're mapping over all the fruits and so when we do that we say okay I have a fruit is it in the selected fruit set if so it's checked and then we draw things in

a in a way that looks quite similar to what we saw in the previous example so it's a check box whether it's checked or not what the title is but the thing that's actually interesting

about this code isn't the shared part like the part that they have in common is like whatever seven lines it's like not very crazy and the chances that they're going to stay exactly the same between these two different trunks of

code is like very low so thinking like focusing on just this like oh I've seen a check box before somewhere like doesn't really give you a lot in terms of the structure of your program so at this point we have a pretty good

pretty good uh fruit sap going on fruits.com business is booming margins are good okay but a new feature comes along which is only two fruits can be selected we have all these folks out there who want

like three fruits six fruits even we don't have we don't have the distribution channels for that so we want to cap out at two fruits per person you know pick a favorite like pick a side

this is kind of a tricky situation we we have found ourselves in so we have this set and we kind of need to limit the size somehow oh oh there's one other constraint which is we need to check out a different

nope fruits one maybe okay I deleted a file that I should not have deleted but the thing that I wanted to show was uh we want to maintain the

order that they were selected so if I select Apple then apricot then banana I want the oldest thing to be the one that's forgotten so I want to keep the most recently selected as I um go through things

so with a set it's really hard to keep track of what was the order that things were added we can remove one of the things but we don't know which of the two it was so you'll get this very wonky Behavior so

at this point we can ask well maybe it'd be good to think about the data structure we're using so we want to choose two fruits in particular so maybe we say okay so I'm going to choose a string and a string

but what happens when nothing's selected right we need to account for zero selections one selections two selections so that's no good maybe we can say maybe string so all of these can be optionally

selected but there's this weird case where if one thing is collected we don't know if it's going to be the left or the right thing so this doesn't seem great either so maybe we can say okay there should be

this type 2 and it's either zero or one or two okay that's pretty nice you can imagine inserting into zero you go to one

inserting into two and then in two you maintain some order moving things along and that design seems okay but we know we know head of fruits marketing he's going to say okay well in tropical areas we can actually give them more

fruits so they're going to want a limit of three but in Iceland they only get half cucumbers there that's just the rule I don't know that is actually how it works so we're probably not going to be able

to just stick with two there may be some place where we need three or different limits so another way we could do this is just a list of string and then limit the size so essentially add to the front and take things drop things off the back

so I don't know it doesn't seem perfect like clearly you can just add 20 things to it but it sort of has potential so let's let's explore that route um so instead of this being empty this is empty list

um oops the cursor just like disappears anyway so when we select something we want to say list dot take two on the front of our selected list so

this is saying put the fruit on the front and then just take the front two so whatever else is there we'll drop it and then when we deselect we can say list dot filter the fruit should not any fruit that's

not the one we'd that's a lot of knots in one sentence we want to only keep fruits you get it who wants that fruit to be deselected and then in our checkbox code

we want to say and said list DOT number and I think that's everything except we don't need that anymore okay so let's see if I did this right hey as you can see it's maintaining the order that I click things so if I

don't know it's kind of hard to remember it it's easy if you go in order and you can see it's it's working nicely okay so we're maintaining our two fruits per person situation but when we come look back at our update code

it's getting it feels like trickier right and as we grow fruits.com like maybe someone won't realize the take two is not oh just to some fine Choice it's like head of fruits marketing decided that was too and you

can't change that stuff so we want to have some more security around this code so one way we can do that is to start to break out the particular stuff around that data structure so we we know there's this

selection list we can make a function that is along these lines so let's do it in the update part insert oops insert

list I'm going to leave off types for now just for Speed and then I can say here insert fruit and then I can also say remove fruit from the list

and we'll do it the same way so this code gets a bunch simpler as well remove fruit um and we can do the same thing with the checking for membership below now at this point it's sort of coalescing into

there's this kind of data structure that's specifically about maintaining just two things in in the list so I'm going to check for time to see how much live coding I should do okay well let's let's start to follow

this idea of like we're starting to recognize a data structure so let's try to break that out so I can say fruit list and I have this type Alias fruit

selected fruit so we're starting to see the the beginnings of a of a module like things that we can box off and put in their own place so I'm going to just skip ahead to a

version of this in a different module so the idea is we have this thing called a bounded set and yeah no I shouldn't skip ahead to this that was a bad idea so let's say okay we have this and we're

going to put it in a new module the selected fruit module supposing uh selected and then in our fruits module we can get rid of that

and we can import as selected fruits and then we just have to go through and make a couple changes here oh we'll come back to that selected fruit dot insert remove

Etc so this is also selected fruit we're kind of leaking details here okay let's see it okay check does this work selected fruits it's um

singular there's also a stray paren spelling it's it's nice that yeah oh geez what the heck [Applause]

just imagine there wasn't a compiler there purchase like well maybe that's wrong I don't know um okay so this is still working but we can kind of improve things by sort of uh

closing down this module right now we're exposing everything but we could do better by saying okay from the outside no one knows how a selected fruit is implemented it happens to be a list of string but no

one needs to know so we have to do a little bit of selected I have I'm disenchanted with this naming choice okay so now from the outside no one

knows how the particulars of this are implemented so let's just run it this is supposed to not work so we're using list.member on a selected fruit but we don't

actually know the implementation deals of that anymore and our selected we're saying it's a list but we don't have access to that information anymore so we need to add how do I make a empty and that would be selected fruit is

empty and then we need to test for membership and then we can just say list dot member oh it's still broken because I didn't actually change the broken code uh uh so here we say selected fruit is

and then member we say selected fruit type member cool so now now we've sort of hidden all these implementation details but we can do slightly better right so maybe we want

to make a guarantee about the size in this data structure so we can say we'll actually give the maximum size when we say it's empty or not and then in all these cases Max size so instead of taking 2 we take the max size

and instead of removing no we do keep this the same but we just have to keep the max size around and then here we don't care about the back size we just want to check we should have an error because we're

just calling empty without saying how big it should be 2. all right and then things should work again cool

so at this point we sort of taken all this complexity around maintaining that only two things reflected and put it in its own module so the benefits of this is that when I'm reading through my normal code all I

know is there's some way to select I can say how many and then I can insert and remove and these things will just work out nicely and I can check if something is a member of that so you can go like one level

crazier with this which like we shouldn't get into but you can so the idea was you could generalize it so that it's a list of anything not of strings or particular fruits and then everything works the same right you choose the size

you can insert things into it you can remove things from it you can check membership so all of these designs are possible and the question is which one is right for your situation right should you go

like all right I'm writing my own data structure that's generic in all sorts of things and I'm going to optimize it or is it like look it's just a list it's not a big deal like we're probably not going to get it wrong and so that

depends on what's likely to happen maybe at fruits.com you'd make one choice but if the new Fruit Stand startup S I don't know they they want to make different choices okay so the big lesson here is that

we started with two things that look basically the same and ended up with entirely different ways of approaching them that was all about the data structure right and it is true that they share check boxes but that's such a

small fraction of the actual difficult things that are going to happen in your code that it makes sense to emphasize the data structure instead so I wanna put a little extra emphasis on the um module right so I showed this bounded

set idea and it had there's a bounded set if it's empty you uh you can insert things into it you can remove things from it you can check membership now the most important part of this module is

the exposing line okay so I'm not exposing everything in this module and specifically I'm not exposing the implementation of bounded set so no one from outside can mess with the maximum size and as long as these

functions work things are going to work so I want to point out two little benefits that come from this so if you reduce the public API to your module if the implementation is hidden and if the public API works

the code works everywhere right so like if I try to break the break this code by messing with these functions and I can't do it anyone else who uses this code won't be able to do it either so this is actually

really nice for testing because it means you can test the public API very extensively and that doesn't mean you have to test every particular usage right using this data structure somewhere doesn't mean I can introduce

bugs into that data structure retroactively if it works it's going to work well um the other thing that's nice is you get easier refactoring so I can change how

things are implemented without worrying what's going to happen outside so and this happens in a couple ways one is say there's a insert help function that's doing some extra special stuff I know that it's not exposed outside so

I can mess with that the arguments add arguments change Shuffle things around and be sure that this is not going to have any effect in any other modules I'm not going to have to go hunt stuff down that's also nice because it means

I don't have to worry about if it's used in 10 different places across the code did they need it to work in a very particular way in each of those cases and am I covering all those cases I can just say oh it's not publicly exposed if

it works in this file it works so the other thing that you can do by creating modules in this way is maintain invariance so in our case that's only two fruits but generally speaking this means there are rules that cannot be

enforced entirely through data structure design so we had our two which is zero one or two but that wouldn't let us decide how many we want so we now have a data structure that can let us decide and by hiding all the details we can

still maintain that rule in a safe way even though we can't do it purely through data and one cool thing about finding a variants like this is that they're excellent for fuzz tests right so I know that whatever I do with this

if I say my bounded set has two things no matter how many times I call insert it should just have two things so it's a by thinking in this way you also set yourself up to write test that are nice and are checking the kinds of things

you're worried about so I want to add some warnings to this advice so first if you find yourself writing get and set right so we hid the max size but maybe someone's like well I want the max size I won't do a bad thing

with it okay this is a bad sign this is a bad sign when you have getting set so the whole point of having a module was that we were able to hide implementation details and say if you use this public

API it will work and inside you don't have to worry about that we tested it we know it's good Setters their whole point is to expose those details right so like you've done all this work

to put it in a module and we we went through that together I it was like it took too long and now you're going to give Setters that just totally defeat that entire exercise so just use a record if you

have data where you want people to have access rather than hiding the details then exposing Getters and Setters is like these details aren't hidden so don't do the work to to hide them so another way to say this is expose as

little as possible but no less right some things do need to be publicly available so this isn't this shouldn't just be like ah hide everything that's better the other thing is uh don't don't overdo

it um so I'd wait until I have a problem in practice and then solve that problem so the goal shouldn't be let's just write modules because modules help with this kind of stuff

um it should be hey I'm having trouble understanding this code I came back to it after a month and it seemed kind of confusing maybe I can find parts that I can make things nicer so if you find

yourself asking how do I make the sidebar reusable okay try to remember to ask yourself why right like are you gonna have multiple sidebars maybe not

um in which case like why would you do the work to do that um if you are going to have multiple ones uh a thing to think is are these cases the same or are they similar right if we're just talking about the HTML is

going to look similar but how it works behind the scenes is fundamentally different in both cases I think it's probably not a good idea to like try to get all into how do we share code between these two focus on the data

structure instead another thing that might happen is as you're growing your record you don't have any interesting types like you don't have that auto play thing where these fields are dependent on that field

and it's just a bunch of independent stuff if they're all independent there's no um if I just have fields that have no relationship to each other and I change one there's not a chance that there's

some bug elsewhere but if I do have that relationship that's a potential to start finding a data structure and do better modeling so I'd say like don't be afraid to just grow your record and try to find these uh connections and how things fit

together as opposed to preemptively like ah like I'm worried about the the this code so I'm just going to change it so yeah Justice there's premature optimization there's premature refactoring like you should it's a thing

uh it's fun right like it's like you get to play code golf at work um I don't I I don't think encourage uh employers should encourage that but people like to um okay so to take a step back we we saw

how to uh sort of how a file tends to grow right and if we focus on the data structures we end up with these nice categorizations where like when I'm searching through a code base even I say

Hey where's that stuff that's related to books it's probably in the module about books right as opposed to well there's this update subdirectory and all the update code is there and the book stuff isn't it's just like uh

it's related to books um so yeah so big lessons are focused on data structures and choose the best representation available so like actually think through as many cases you can and the other is build modules

around types and try to expose as little as possible but no less so yeah so I hope this will be a nice next advice in the how do I grow my Elm code and one of my goals was to um

to write this up so I actually started uh a book that is about functional programming in Elm and the goal of this book was essentially to write this talk so that people could read it online and it would

work out turns out it's very hard to write that whole live coding section uh so instead what I ended up with is some nice stuff about recursion and graphs it's fun hopefully I'll be able to

distill this down into another chapter that actually emphasizes these things in a way where you don't have to uh see the live talk um but yeah so that's um the life of a file thank you
