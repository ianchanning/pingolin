---
title: "Making Impossible States Impossible (Richard Feldman) (Transcript)"
category: "cat:types"
source_url: "https://www.youtube.com/watch?v=IcgmSRJHu_8"
ingested_at: "2026-08-16"
key_concepts: "Custom Types replacing booleans/flags, domain modeling, structural validation"
---

# Making Impossible States Impossible (Richard Feldman) - Talk Transcript

**Source Video:** [https://www.youtube.com/watch?v=IcgmSRJHu_8](https://www.youtube.com/watch?v=IcgmSRJHu_8)  
**Category:** `cat:types` | **Ingested:** `2026-08-16`  
**Key Concepts:** Custom Types replacing booleans/flags, domain modeling, structural validation

---

## Talk Transcript

uh so real quick before we get started um I just wanted to give the the uh the organizers if we could a real quick round of a standing ovation cuz seriously I mean like speaking of impossible things

somehow this is the first conference they've organized and the the number of times I've had my mind blown throughout the day I just keep saying like sure glad I don't have to follow that talk sure I don't have to follow that talk

and then like Murphy was my last hope and then of course his was mind-blowing too so really there's just the quality level here has just been unbelievable and I am so thrilled to be a part of this community and just like everybody

here is amazing um so this last talk uh it's the last Talk of the day and uh this is going to be a little bit more chill we don't have like a crazy demo um hopefully though this is going to be something practical something where you

can walk away with less of a whoo and more of a so that's what we're going for here making impossible States impossible so um I'd like to start off by just sort of establishing I think this is just a good rule for any speaker really is just

establishing that the speaker is a reasonable sensible person uh so of course I want to talk about the CSS pre-process right as decided to make um best way to demonstrate that um so LM CSS uh if you're not familiar with it we

saw a very tiny bit of it uh with Jessica's talk earlier uh but the basic idea is that you write Elm code uh in in order to generate either a CSS file or inline Styles things like that and it's designed to look sort of like a CSS file

might look so you have body except instead of that being a CSS declaration it's going to be an Elm function call that's going to compile to a CSS declaration got some proper underneath it padding men with overflow X things

like that and uh one of the goals of elm CSS is to only generate valid Styles sheets we want to make sure that if we're going to be generating this CSS it's something valid something that the browser will accept and if it's not

possible to generate that then we should give you an error either at compile time or there's a validation step things like that um so the CSS spec is something that I've gotten a lot more familiar with in the course of this undertaking

and um believe it or not there are a lot of ways to generate invalid Styles sheets there actually there are actually a ton of them and one of the ones that surprised me most was when I was going through the Section on at rules so uh at

rules include things like at media at font face other things that start with at symbols hence the name and um the three in particular that that surprised me the most were at charet at import and at namespace quick show of hands how

many people have used all three of these okay so this is safe to say a Dusty corner of the spec so let's just go over the some real quick rules there might be some surprises in here so charet must be the first character of

your stylesheet and multiples are disallowed by the first character what I mean is if you say at charset and there is so much as a new line in front of that invalid Styles sheet right there it's got to be the very first character

of your stylesheet and you can't declare more than one at once uh import must be done before any at namespace declarations at also before any uh style declarations but of course it has to be after charet because charet can only be

the first character so if you got a charet got to be first then import and then namespace has to be after import which has to be after charet but before any style declarations so all these rules uh put together mean that this is

thankfully a valid stylesheet so we've got Char at first very first character of the stylesheet couple of imports couple of name spaces and then your style declarations would all go after that but the important thing is that

according to the spec these things have to be grouped this way that's the only way to get a valid CSS stylesheet that actually use all these so here is sort of the my first intuition for how I would Port this into Elm CSS I've been

going with this theme of like it should sort of look like and feel like writing a normal stylesheet so I'd sort of just get rid of the at signs and just uh instead just have function call you have charet import okay import is a reserved

keyword in Elm so I can't just name the function import I got a little underscore in there to work around that Nam space no problem and then body as the first of your Styles and just go on from there okay cool but if you look at

this and you think about the types here these all have to be the same type because they're in a list so in this case these would be declarations which implies that if you want you could Shuffle these all around you could write

your style first and then alternate between namespace and import and then have two Char sets at the end you could write that and it would compile but our goal is to only generate valid stylesheets this if we translate it sort

of naively from what the user has written into a CSS file is not going to be a valid stylesheet this is breaking actually all the rules that we just covered literal all um okay so uh then I was like oh well I I have this problem I

will come up with a solution for it and the solution I came up with was validate and sort so first of all give a validation error if there are multiple Char sets I mean there's no getting around that if you define multiple Char

sets it's going to compile because they're both declarations but I can at least in the validation step say hey sorry this is not a valid stylesheet and then for sorting I can just sort of fix the out of ordering problems I can just

say oh well I'll just put Char set first when I'm spitting it out and then I'll emit the import and then emit the name space and then emit the Styles and uh we're all good obviously uh I then need to write a ton of tests for this because

there are so many different ways in which you could get this wrong you could have uh import and and namespace interchange like that you could have multiple chars set I mean just all over the place all sorts of problems you

could have um so then uh after coming up with this plan of attack I thought I would run this design um by one of my co-workers who's better at making apis than I am um his name's Evan um if you'd like to work with us by the way we're

hiring um and uh and essentially he gave me a really interesting piece of advice that was sort of a perspective I hadn't really considered here which was uh what if you just make representing invalid Styles sheets impossible like what if

you just made it so the data model actually can't hold on to an invalid Styles sheet like that it's like huh so put another way it's kind of like okay so I'd been representing these things as just this list of declarations but like

who says that's the best data model CSS like I'm I'm going to do this just because CSS did it if CSS told me to jump off a bridge what I do well probably I'd get the positioning wrong I'd forget to clear a float so like the

bridge would not be able to anyway um but the point is like is that the best data model to represent this given all these rules that I know about probably not so we kind of talked about it and where we ended up with was this so

essentially hey charet what if that were just a separate thing it were just a maybe string right you can have zero or one Char sets that's that's one of the rules so maybe it's pretty good for that you can have zero or one things there

makes sense um Imports and Nam spaces and declarations cannot be intermingled you can't alternate between them they have to be one contiguous chunk one contiguous chunk one contiguous chunk so why would they be the same type actually

having them be the same type is like an antifeature um you would much rather have them be incompatible type so that you can't actually represent having them intermingled it's not possible it wouldn't type check so having them be

different things like this means that now generating a valid Styles she is a piece of cake we just go through and say hey charet is there nothing okay do nothing is there they're adjust great that's the first character of our

stylesheet Imports great just list them name spaces list them declarations list them done that's going to be valid it's going to satisfy all of those rules every time in other words this code right here this problematic thing which

if I naively generated it just doesn't compile anymore which means that there's a lot less to test because there's a lot less that can go wrong in fact if I actually tried to write a test for that code the test wouldn't

compile so one of my inter takeaways from this is like you know tests are good tests are good but impossible is better it's just like if I can't even test it then awesome I don't have even less to worry

about um another thing that surprised me was that a clearer data model can actually lead to a clearer API like one of the things that was confusing about that broken example was that it kind of looked fine like if I read through it

I'm like oh yeah the these like look pretty familiar to me but actually they were just broken in really non-obvious ways so if you end up with a different API that sort of forces you to call things and pass things in a certain way

it can sort of suggest to you as the user of that API the proper way to represent your data the proper way to implement things that will lead to a valid stylesheet on the other side so the next logical question is H can we

use this approach in applications in other words uh what if we're not dealing with a library like LM CSS can we just make impossible model States impossible to represent what might that get us so I'm just going to

walk through a quick example here um a survey app so we just have prompts and responses so essentially we're talking about a series of things where you got a prompt something like what was the best part about elmon and then just a little

text field for a response we'll just have a series of those right in a row asking the user questions and then Gathering their responses as a text input so this might be a model that we might use to represent this just have a

list of prompts and then a list of responses which are going to be maybe strings because the user may or may not have entered them yet and as they go through and respond those will go from a series of nothings to a series of

adjusts until you're all done you've worked your way through all the proms so this is one way we could do it uh we could look at this and and we could write something out like uh that would satisfy this so uh here would be some

prompts uh first what is your favorite elcon memory second is this the real life third is this just fantasy CAU in okay anyway um so uh responses might include all the crowd Surfers weren't they amazing I I really enjoyed the

crowd Surfers earlier um so that would be the first response to favorite elmon memory uh and then nothing nothing because I haven't answered the other two questions yet so this would be our model but there's a problem with this

model this right here is a completely invalid State we have no prompts whatsoever and yet the user has responded Yes what does that mean this should be impossible if this ever if we ever end up in this model state that

means we had some business logic that broke somehow not exactly clear on how but somehow something went wrong so if this should be impossible why should we permit it why why should we allow this impossible state it seems like it would

be better if we could make this impossible such that when we write the code that leads to this state we get a compiler error so the compiler is telling us oh um maybe you should think a little bit harder about this it seems

like this is going to do a bad thing because otherwise we're going to end up debugging this working backwards stepping through to try and figure out how it got in this state much better to find out up front at compile time that

you wrote something that's not going to make sense so can we make this actually impossible sure here's a very straightforward way to do that so instead of having two lists we just have two Fields inside a record and then make

a list of those so now we have one response per prompt you actually cannot have a prompt without a corresponding response you cannot have a response without a corresponding prompt they just go together which makes sense because

these are coupled every single prompt is supposed to have a response cool okay so that was pretty easy let's let's uh make it a little bit fancier so let's say we want to add question navigation this is a new feature for our survey app so we

want to be able to go forward and to go back so instead of just answering the question sequentially maybe you can say oh you know what I want to skip this one uh this one's kind of hard tricky uh I'll come back to it later or maybe you

say oh I just realized I want to go back and edit one of my previous answers so navigating back and forth through these questions okay so we might uh pull out at this point the history from our model because maybe our model's got some other

stuff going on it and we'd say okay we're just going to focus on the history portion of this and now we have a new piece of information so we've got a list of questions just like before each one with the both the respon response and

the prompt but additionally we also have the current question that we're just going to keep track of and we can move that back and forth to indicate where you are which current question you are within the list of all the

questions so here's an example let's say we've got some pastry related survey so we've got a list of questions we've got a cake related question a pie related question some cookies related questions and the current one is pi indicating

that we are in the middle of that series of questions and the current one that's going to be displayed to the user is the one about pi okay cool um here's a state that should be impossible that this current data model

permits we have no questions whatsoever and yet somehow the user is answering some mysterious P related question how did we end up here once again this is some mystery bug we're going to have to figure out how things got in this

state wouldn't it be better if we could make it impossible just say we can't have zero questions that doesn't a survey with zero questions is useless um make sure that we have at least one question in the survey if we're going to

have the user be able to interact with it so here's a quick way to do that uh switch from having questions be a list of questions to having it be the first question which stands alone and then the other questions which is a list so you

can conceptualize this as what you do in a pattern match when you're splitting up a list you say oh we have to have at least a first thing that's got to be a question no matter what we need to have at least one of those that's mandatory

but then we also might have some more after that so you can also think about this in terms of how you would get back back to the original data model which is to say cons the first one onto the others that would give you one

contiguous list but importantly in terms of the data model you always have at least one so uh the way that this would translate into our actual model is we would have first which is just a question then others which is a list of

questions with their powers combined they give us um Captain plan some some some sort of list of questions and then we still have the the current question down below cool so now uh using our previous

example we can say first equals cake others equals pi and cookies so this is essentially the same list of three questions so cake is the first question Pi is the second question cookies is the third question and we are currently on

Pi importantly having zero questions is now impossible okay but what if the current question is not one of the available questions that's another bug we can currently have with this data model

right what about this so the first one's cake second one's pie third one's cookies but the current one is ice cream which is not one of our questions we don't have that anywhere in our list so the user on it they're about to answer

it and once they've answered it who knows what's going to happen again this should be impossible can we make it impossible yes we can by using what's called a zip list so I'm going to channel Tessa Kelly here and introduce a

new data structure so the basic idea here is that we store three things we store all the previous questions we store the current question and then we store the remaining questions so here's an example of how this might look so

we'd say previous we're going to have k cake and pie so that's question one and question two question three is going to be cookies which is the current question and then question four is going to be ice cream which is the remaining one now

in order to put this together we would do previous and then the current and then the remaining just stick all those together and that would give us our Master list of everything so importantly having a

current question that is not an available question is now impossible there's no way to represent that and we can demonstrate this by demonstrating how also it's impossible to have zero questions if worst comes to worst if

this is sort of as empty as it possibly can get that means we have nothing in the previous space we have nothing in the remaining space we still have current and in fact current lines up with something in our list because

current is expressed in terms of part of our list so now we've made it completely impossible to end up with any of those invalid states that we had earlier sweet okay but let's talk about the upgrade experience which is Burrito related in

ways we will later see it's actually not I just like pictures of cats there's nothing deep here um okay so the upgrade experience so here are sort of the the Essential Elements of our current API so

we've got this history record which the user can access in order to read things off of it and maybe render the current history and then uh we've got a couple of different things that we want to be able to do we want to be able to say go

back in history so it takes a history and then just steps it back one moves current backup position forward does the opposite moves current forward position answer for when the user types in their answer and you know hits submit we need

to record that change the the maybe to adjust um and finally in it something just just say hey here's the uh the current one that's going to be the first one in the list and here's any remaining ones and then just generate for me a

history based on that okay so far so good these are sort of the Essential Elements okay here's the problem though when we upgraded our internal representation and made it more robust in the process of doing that we actually

changed the structure of our record we removed that questions field and replaced it with previous and remaining we went from this list plus current value to a zip list which is more reliable but it's still different so

what if we had some code that used this it was actually referencing history do questions directly like what if our existing code is doing this well in that case it's going to be a breaking change it's going to break that code because

questions does not exist anymore it's not a thing okay but the thing is like ideally everything will continue to work the same way just with the more robust internal implementation right I mean all

we're trying to do here is just make things better under the hood there's no real reason that this needed to be a breaking change so can we make it so that depending on certain implementation

details is impossible can we make it so that anyone who's using our API doesn't have to worry about getting broken when we upgrade yeah we totally can so uh here's a great technique for doing that just

make a single Constructor Union type instead of a type Alias so this is basically the same thing as what we had before except instead of type Alias history we're just saying type history equals and then we're giving it just one

Constructor called history um and in inside of that is the record that we had before the same thing the zip list previous current remaining so all we're doing is just wrapping it in a union type that has one Constructor now this

does mean that working with this thing takes a little bit more effort so for example when we're implementing back now we have to start off by destructuring the data back out of that history so one way we could do this is with a case so

we say case history of and then there's only one pattern match on because it's only got one Constructor and while we're at it we can additionally pattern match on the uh the contents to that record to pull those out okay cool now we can work

with it we can Implement back okay cool um FYI there's a simpler way to do this or or I guess a more concise way which is actually if you have a union type with just one Constructor you can destructure right there in the argument

just like bam history previous current remaining done so if you're going to use this technique I recommend doing it this way tends to be pretty nice okay so then up at the top of our file if we can imagine this theoretical

file that we've written here um we're going to be exposing most likely history and its Constructors that's that history and then in parentheses dot dot saying not only expose the history type but also expose histories all of its

Constructors which in this case is an entire uh Pantheon of one Constructor okay so we're exposing history and we're exposing its Constructors which means that people who are using our API uh can access both of those but what if instead

we just didn't do that last part what if we exposed history the type so people can use it in type annotations but we did not expose history The Constructor we didn't expose any Constructors whatsoever we just said okay here's the

history type if you want to write out a type annotation that includes history go for it have at it no problem but if you want access to what's inside there if you want to pattern match on it you want to run a case expression on it um sorry

but you can't you don't have access to that internal to our own module we can always do that because we've defined it right here in our own module but other modules no I'm afraid they're just not going to have access to that okay but

then like how do they do the equivalent of history. questions how do they get I don't know why this is a picture of a anyway I don't how do you get access to questions how do you figure out what's inside of there if we have not given you

direct access like you had before the answer is we can just expose specific functions that let them access data in a way where we now have control over the upgrade experience so remember back in the day we said history. questions we

say oh cool here is uh the history um give me the history and I will give you back back a list of questions ask give me uh the the current uh give me the history and ask me for the current question I will give you back the

current question now with either of the internal representations that we've done we can implement this function and actually if you think about it on the upgrade path this is a little bit nicer because this way it's going to be a lot

more common to want to get that list of questions in order to render all of them or to render links to all of them things like that having to work with the zip list is probably going to be an inconvenience for the end user what

they'd rather get is something simple like this internally it's important for it to be a zip list so that we can prevent any bad States from happening but as far as the API consumers concerned doesn't need to be a problem

but now by exposing these we can make it so that when there's a new implementation out of the hood there are no breaking changes nice so the upgrade experience is better but the end user doesn't have to know that we improve

things under the hood okay one last thing to add so let's add a status bar to this thing so what do I mean by a status bar what I mean is like when you're editing one of these surveys up at the top after you make your question

it's like hey question created cool and there's a trumpet um so here's uh how we might introduce this to our model so we'll pretend we have the other history stuff going on in the model somewhere but let's just focus on the status part

so status would be a maybe string so if it's nothing don't display anything if there's just a string in there then display a little yellow bar probably that says hey you created something good job okay uh you might also want to use

use this for question deleted let's say you delete a question we want to say oh uh well done you've deleted this question but it's a it's a pretty nice modern convenience when you delete something to include in the status

message like an undo button so you can uh get it back you say oh whoops I misclicked uh give me that back please but if we want to offer this functionality if we want to have the undo button in addition to the status

message um we need somehow to know what to undo too we need to store the survey question that they just deleted so we can put it back if they want to so here's one way we could do that we could start with our status that's a maybe

string and then we could introduce a question to restore which is a maybe question that will store the the information to restore so here's an example of just question created so you'd say status equals just question

created so that's no problem there's nothing to restore at that point because the user didn't delete anything so we just leave that at nothing on the flip side we might have a just question deleted for the status and then question

to restore would be just and then the the question that they deleted what about this though what if status is nothing but we somehow have something to restore what does that mean that seems like again something went wrong

somewhere we had we've got a bug on our logic um this should be impossible how do we fix this well in this case it's actually pretty straightforward just replace our two Mayes with one tailored Union type that's specific to our domain

it's specific to our application what we're doing it's just a very concise way to model all the different possibilities so it's either no status or you've just got a text status which holds a string or you've got a deleted status which has

the string that we want to display as well as the question to restore if the user deletes it so to sum up some things to consider number one uh do we want two May or do we want a tailored Union type so a lot of the time when I start off

with a maybe it's all well and good and my instinct especially coming from a JavaScript background is just to add another maybe in there very often when I've taken another second to think about it I'm like oh actually there's going to

be some combination of those two maybe that's not going to do what I want it it'll actually be better if I switch from one maybe to a union type instead of adding a second maybe and this gets more and more true as the application

gets bigger another thing to consider is do we want two separate lists like we talked about at the beginning or do we want one list with two Fields per element so again if you're thinking about introducing a second list think

about well is that the right place for that data or do we actually want to enrich each element within the existing list that we have to prevent synchronization problems and finally can we revise our

implementation without breaking users builds this is something that you sort of have to think about up front once you've exposed the implementation people are relying on it it's too late to avoid a breaking change so this is one of

those things that if you want to do a good job with it it's important to hide things by default and think about this ahead of time when you're releasing your first release so if it's possible to represent

states that should be impossible please at least consider making the possible impossible thanks very much
