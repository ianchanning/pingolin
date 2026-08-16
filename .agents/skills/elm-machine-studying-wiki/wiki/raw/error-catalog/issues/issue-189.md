---
issue_number: 189
title: "Confusing error for Json.Decode.oneOf"
state: OPEN
author: "rtfeldman"
created_at: "2016-12-09T01:34:01Z"
url: "https://github.com/elm/error-message-catalog/issues/189"
labels: ['x-json']
---

# Issue #189: Confusing error for Json.Decode.oneOf

**State:** `OPEN` | **Author:** @rtfeldman | **Source:** [https://github.com/elm/error-message-catalog/issues/189](https://github.com/elm/error-message-catalog/issues/189)

## Description

This is a JSON decoding error message, not a compiler message.

Basically the decoder error looked like this: (apologies for the length, but length is essential to illustrating the problem)


```
Expecting an object with a field named `multipleChoiceOptions` but instead 
got:   { "_id": "584a0835c874a936428361f8", "index": 0, "guid": 
"1e93b8d7-598a-489e-8d17-f894da528bfe", "isActive": true, "balance": 
"$1,547.17", "picture": "http://placehold.it/32x32", "age": 33, "eyeColor": 
"brown", "name": "Hodge Hines", "gender": "male", "company": "ZORROMOP", 
"email": "hodgehines@zorromop.com", "phone": "+1 (850) 433-2727", "address": 
"250 Willow Street, Bowden, Kentucky, 166", "about": "Mollit eu qui ullamco 
laboris nostrud quis amet in velit. Consequat sit proident culpa sunt nisi nisi 
in Lorem Lorem non. Proident culpa do et exercitation ad esse Lorem in et 
aliquip reprehenderit laborum ipsum reprehenderit. Non exercitation nulla elit 
id cillum ullamco excepteur tempor excepteur nisi magna.\r\n", "registered": 
"2015-11-13T07:45:49 +08:00", "latitude": -23.182293, "longitude": 94.329584, 
"tags": [ "tempor", "ullamco", "laboris", "id", "consequat", "laboris", "magna" 
], "friends": [ { "id": 0, "name": "Anita Woods" }, { "id": 1, "name": "Leigh 
Stanley" }, { "id": 2, "name": "Trudy Larsen" } ], "greeting": "Hello, Hodge 
Hines! You have 6 unread messages.", "favoriteFruit": "apple" }, { "_id": 
"584a0835bc5745c24f438b9e", "index": 1, "guid": 
"91bd8f50-1acc-47cd-8956-df3eae22e6af", "isActive": true, "balance": 
"$3,632.78", "picture": "http://placehold.it/32x32", "age": 20, "eyeColor": 
"blue", "name": "Concetta Rutledge", "gender": "female", "company": "EVENTAGE", 
"email": "concettarutledge@eventage.com", "phone": "+1 (960) 590-3462", 
"address": "758 Ross Street, Gulf, Alabama, 7570", "about": "Quis elit magna 
voluptate amet ut esse ex ex nulla adipisicing. Officia deserunt aliqua fugiat 
incididunt aliqua consequat ullamco consectetur culpa sunt velit enim. Cillum 
nulla dolor qui mollit irure elit. Lorem sit ut aute velit. Ex irure culpa 
excepteur esse quis exercitation velit. Ut reprehenderit do culpa 
adipisicing.\r\n", "registered": "2014-01-29T06:13:50 +08:00", "latitude": 
-69.184856, "longitude": -171.654723, "tags": [ "dolore", "in", "sint", 
"excepteur", "velit", "cupidatat", "labore" ], "friends": [ { "id": 0, "name": 
"Becky Rojas" }, { "id": 1, "name": "Richard Hancock" }, { "id": 2, "name": 
"Williams Snyder" } ], "greeting": "Hello, Concetta Rutledge! You have 10 
unread messages.", "favoriteFruit": "banana" }, { "_id": 
"584a0835fb995e95db6f2387", "index": 2, "guid": 
"6e060a15-c931-459d-8c9d-45d163feffd4", "isActive": true, "balance": 
"$2,002.54", "picture": "http://placehold.it/32x32", "age": 36, "eyeColor": 
"brown", "name": "Wong Vargas", "gender": "male", "company": "EXODOC", "email": 
"wongvargas@exodoc.com", "phone": "+1 (884) 459-2223", "address": "397 Union 
Avenue, Neibert, Montana, 9442", "about": "Incididunt irure cupidatat magna 
culpa elit consectetur ea deserunt officia. Enim minim consequat esse pariatur 
elit. Laboris tempor sint consequat ullamco aliquip duis magna consectetur aute 
consectetur.\r\n", "registered": "2014-01-02T10:48:24 +08:00", "latitude": 
-10.790411, "longitude": 137.940633, "tags": [ "adipisicing", "qui", "ex", 
"do", "dolor", "eu", "proident" ], "friends": [ { "id": 0, "name": "Moody 
Salazar" }, { "id": 1, "name": "Drake Garcia" }, { "id": 2, "name": "Dodson 
Hernandez" } ], "greeting": "Hello, Wong Vargas! You have 1 unread messages.", 
"favoriteFruit": "strawberry" }, { "_id": "584a08351d89921032bc54f1", "index": 
3, "guid": "0ea4813e-974b-45d4-a662-323f7e775e22", "isActive": true, "balance": 
"$1,146.71", "picture": "http://placehold.it/32x32", "age": 29, "eyeColor": 
"brown", "name": "Alana Yang", "gender": "female", "company": "ONTALITY", 
"email": "alanayang@ontality.com", "phone": "+1 (842) 451-3273", "address": 
"338 Montrose Avenue, Axis, Washington, 8595", "about": "Lorem sint irure ea 
tempor laborum consectetur minim commodo amet proident. Aliqua esse minim 
ullamco sunt excepteur minim pariatur. Ea ullamco laborum nisi laborum esse 
ullamco velit. Pariatur aliquip ex cillum sint ut incididunt enim. Amet 
adipisicing ea fugiat nulla amet pariatur aliqua voluptate. Nisi dolor irure 
tempor sit.\r\n", "registered": "2015-01-08T10:10:01 +08:00", "latitude": 
4.266558, "longitude": -121.617405, "tags": [ "ut", "id", "culpa", "aute", 
"incididunt", "cillum", "dolor" ], "friends": [ { "id": 0, "name": "Joann 
Wilder" }, { "id": 1, "name": "Bethany Cruz" }, { "id": 2, "name": "Wilkerson 
Hendricks" } ], "greeting": "Hello, Alana Yang! You have 4 unread messages.", 
"favoriteFruit": "strawberry" }, { "_id": "584a0835541dca8aef39c79c", "index": 
4, "guid": "251cef6e-851a-4f41-ba7f-c7b71fd58528", "isActive": false, 
"balance": "$2,235.59", "picture": "http://placehold.it/32x32", "age": 24, 
"eyeColor": "green", "name": "Lesa Perkins", "gender": "female", "company": 
"PHOTOBIN", "email": "lesaperkins@photobin.com", "phone": "+1 (999) 540-2806", 
"address": "861 Clermont Avenue, Thermal, Minnesota, 4127", "about": "Esse 
pariatur do dolore eiusmod excepteur consequat ex nostrud labore ea amet quis. 
Ad quis velit do sunt do amet proident mollit ipsum eu dolore nisi incididunt 
reprehenderit. Ut quis proident aute commodo incididunt incididunt duis Lorem 
occaecat Lorem veniam aute aliquip irure.\r\n", "registered": 
"2014-09-26T09:35:55 +07:00", "latitude": 12.034645, "longitude": 101.748613, 
"tags": [ "nulla", "magna", "est", "velit", "ex", "labore", "proident" ], 
"friends": [ { "id": 0, "name": "Joan Mccall" }, { "id": 1, "name": "Merrill 
Vazquez" }, { "id": 2, "name": "Bernadine Camacho" } ], "greeting": "Hello, 
Lesa Perkins! You have 9 unread messages.", "favoriteFruit": "strawberry" }, { 
"_id": "584a08351ae10750cedb58ef", "index": 5, "guid": 
"edbdbf29-e554-46a2-be2f-80960e852403", "isActive": false, "balance": 
"$1,922.96", "picture": "http://placehold.it/32x32", "age": 28, "eyeColor": 
"blue", "name": "Keri Nichols", "gender": "female", "company": "SUPPORTAL", 
"email": "kerinichols@supportal.com", "phone": "+1 (982) 575-3536", "address": 
"467 Argyle Road, Crawfordsville, Georgia, 8326", "about": "Minim exercitation 
amet eiusmod officia id irure. Occaecat duis non id nostrud eu proident minim 
magna anim magna. Ea deserunt qui non occaecat Lorem velit eu amet nostrud 
veniam ipsum amet.\r\n", "registered": "2015-11-10T06:28:00 +08:00", 
"latitude": -86.133982, "longitude": -103.161058, "tags": [ "nostrud", 
"tempor", "adipisicing", "dolor", "duis", "eu", "minim" ], "friends": [ { "id": 
0, "name": "Reyna Hendrix" }, { "id": 1, "name": "Nina Santana" }, { "id": 2, 
"name": "Lamb Kirkland" } ], "greeting": "Hello, Keri Nichols! You have 5 
unread messages.", "favoriteFruit": "apple" }, { "_id": 
"584a0835db2e6130377ad554", "index": 6, "guid": 
"5fff34ec-e6da-48c0-b57c-079553a91e4d", "isActive": true, "balance": 
"$2,424.27", "picture": "http://placehold.it/32x32", "age": 28, "eyeColor": 
"green", "name": "Doreen Casey", "gender": "female", "company": "SYNKGEN", 
"email": "doreencasey@synkgen.com", "phone": "+1 (988) 475-2545", "address": 
"531 Calyer Street, Northchase, North Dakota, 6525", "about": "Veniam 
exercitation laboris voluptate incididunt qui nostrud Lorem. Aute ipsum nisi 
elit amet occaecat adipisicing quis nostrud esse ut adipisicing cillum amet. 
Lorem voluptate sit irure est deserunt laborum occaecat anim. Non dolore 
ullamco excepteur deserunt do id dolor velit.\r\n", "registered": 
"2015-10-12T10:38:21 +07:00", "latitude": -10.390687, "longitude": -116.863606, 
"tags": [ "voluptate", "aliqua", "incididunt", "laboris", "ullamco", "esse", 
"excepteur" ], "friends": [ { "id": 0, "name": "Carla Williams" }, { "id": 1, 
"name": "Reva Hubbard" }, { "id": 2, "name": "Reese Mack" } ], "greeting": 
"Hello, Doreen Casey! You have 2 unread messages.", "favoriteFruit":  "pear" } ]
Expecting an object with a field named `username` at 
_.outlineStructure.users.foo.bar[1] but instead got: 
{"ids":["4","5"],"things":[]}
```

This was a `oneOf` and they both failed.

The problem was that the error message was so long, I didn't even notice it was coming from a `oneOf` because the relevant clue was buried at the very end:

```
Expecting an object with a field named `username` at 
_.outlineStructure.users.foo.bar[1] but instead got: 
{"ids":["4","5"],"things":[]}
```

This led me to spend time chasing down the wrong problem, because it hadn't occurred to me that the `oneOf` decoder could have been involved. It seemed like the problem was that the server was consistently serializing the wrong data.

It seems like a good solution would be for `oneOf` to tag its error messages as such. For example, this would have saved me a good bit of time chasing down the wrong culprit:


```
A oneOf decoder tried 2 alternatives and got only failures. The failures were:

Alternative 1:

Expecting an object with a field named `multipleChoiceOptions` but instead 
got:   { "_id": "584a0835c874a936428361f8", "index": 0, "guid": 
"1e93b8d7-598a-489e-8d17-f894da528bfe", "isActive": true, "balance": 
"$1,547.17", "picture": "http://placehold.it/32x32", "age": 33, "eyeColor": 
"brown", "name": "Hodge Hines", "gender": "male", "company": "ZORROMOP", 
"email": "hodgehines@zorromop.com", "phone": "+1 (850) 433-2727", "address": 
"250 Willow Street, Bowden, Kentucky, 166", "about": "Mollit eu qui ullamco 
laboris nostrud quis amet in velit. Consequat sit proident culpa sunt nisi nisi 
in Lorem Lorem non. Proident culpa do et exercitation ad esse Lorem in et 
aliquip reprehenderit laborum ipsum reprehenderit. Non exercitation nulla elit 
id cillum ullamco excepteur tempor excepteur nisi magna.\r\n", "registered": 
"2015-11-13T07:45:49 +08:00", "latitude": -23.182293, "longitude": 94.329584, 
"tags": [ "tempor", "ullamco", "laboris", "id", "consequat", "laboris", "magna" 
], "friends": [ { "id": 0, "name": "Anita Woods" }, { "id": 1, "name": "Leigh 
Stanley" }, { "id": 2, "name": "Trudy Larsen" } ], "greeting": "Hello, Hodge 
Hines! You have 6 unread messages.", "favoriteFruit": "apple" }, { "_id": 
"584a0835bc5745c24f438b9e", "index": 1, "guid": 
"91bd8f50-1acc-47cd-8956-df3eae22e6af", "isActive": true, "balance": 
"$3,632.78", "picture": "http://placehold.it/32x32", "age": 20, "eyeColor": 
"blue", "name": "Concetta Rutledge", "gender": "female", "company": "EVENTAGE", 
"email": "concettarutledge@eventage.com", "phone": "+1 (960) 590-3462", 
"address": "758 Ross Street, Gulf, Alabama, 7570", "about": "Quis elit magna 
voluptate amet ut esse ex ex nulla adipisicing. Officia deserunt aliqua fugiat 
incididunt aliqua consequat ullamco consectetur culpa sunt velit enim. Cillum 
nulla dolor qui mollit irure elit. Lorem sit ut aute velit. Ex irure culpa 
excepteur esse quis exercitation velit. Ut reprehenderit do culpa 
adipisicing.\r\n", "registered": "2014-01-29T06:13:50 +08:00", "latitude": 
-69.184856, "longitude": -171.654723, "tags": [ "dolore", "in", "sint", 
"excepteur", "velit", "cupidatat", "labore" ], "friends": [ { "id": 0, "name": 
"Becky Rojas" }, { "id": 1, "name": "Richard Hancock" }, { "id": 2, "name": 
"Williams Snyder" } ], "greeting": "Hello, Concetta Rutledge! You have 10 
unread messages.", "favoriteFruit": "banana" }, { "_id": 
"584a0835fb995e95db6f2387", "index": 2, "guid": 
"6e060a15-c931-459d-8c9d-45d163feffd4", "isActive": true, "balance": 
"$2,002.54", "picture": "http://placehold.it/32x32", "age": 36, "eyeColor": 
"brown", "name": "Wong Vargas", "gender": "male", "company": "EXODOC", "email": 
"wongvargas@exodoc.com", "phone": "+1 (884) 459-2223", "address": "397 Union 
Avenue, Neibert, Montana, 9442", "about": "Incididunt irure cupidatat magna 
culpa elit consectetur ea deserunt officia. Enim minim consequat esse pariatur 
elit. Laboris tempor sint consequat ullamco aliquip duis magna consectetur aute 
consectetur.\r\n", "registered": "2014-01-02T10:48:24 +08:00", "latitude": 
-10.790411, "longitude": 137.940633, "tags": [ "adipisicing", "qui", "ex", 
"do", "dolor", "eu", "proident" ], "friends": [ { "id": 0, "name": "Moody 
Salazar" }, { "id": 1, "name": "Drake Garcia" }, { "id": 2, "name": "Dodson 
Hernandez" } ], "greeting": "Hello, Wong Vargas! You have 1 unread messages.", 
"favoriteFruit": "strawberry" }, { "_id": "584a08351d89921032bc54f1", "index": 
3, "guid": "0ea4813e-974b-45d4-a662-323f7e775e22", "isActive": true, "balance": 
"$1,146.71", "picture": "http://placehold.it/32x32", "age": 29, "eyeColor": 
"brown", "name": "Alana Yang", "gender": "female", "company": "ONTALITY", 
"email": "alanayang@ontality.com", "phone": "+1 (842) 451-3273", "address": 
"338 Montrose Avenue, Axis, Washington, 8595", "about": "Lorem sint irure ea 
tempor laborum consectetur minim commodo amet proident. Aliqua esse minim 
ullamco sunt excepteur minim pariatur. Ea ullamco laborum nisi laborum esse 
ullamco velit. Pariatur aliquip ex cillum sint ut incididunt enim. Amet 
adipisicing ea fugiat nulla amet pariatur aliqua voluptate. Nisi dolor irure 
tempor sit.\r\n", "registered": "2015-01-08T10:10:01 +08:00", "latitude": 
4.266558, "longitude": -121.617405, "tags": [ "ut", "id", "culpa", "aute", 
"incididunt", "cillum", "dolor" ], "friends": [ { "id": 0, "name": "Joann 
Wilder" }, { "id": 1, "name": "Bethany Cruz" }, { "id": 2, "name": "Wilkerson 
Hendricks" } ], "greeting": "Hello, Alana Yang! You have 4 unread messages.", 
"favoriteFruit": "strawberry" }, { "_id": "584a0835541dca8aef39c79c", "index": 
4, "guid": "251cef6e-851a-4f41-ba7f-c7b71fd58528", "isActive": false, 
"balance": "$2,235.59", "picture": "http://placehold.it/32x32", "age": 24, 
"eyeColor": "green", "name": "Lesa Perkins", "gender": "female", "company": 
"PHOTOBIN", "email": "lesaperkins@photobin.com", "phone": "+1 (999) 540-2806", 
"address": "861 Clermont Avenue, Thermal, Minnesota, 4127", "about": "Esse 
pariatur do dolore eiusmod excepteur consequat ex nostrud labore ea amet quis. 
Ad quis velit do sunt do amet proident mollit ipsum eu dolore nisi incididunt 
reprehenderit. Ut quis proident aute commodo incididunt incididunt duis Lorem 
occaecat Lorem veniam aute aliquip irure.\r\n", "registered": 
"2014-09-26T09:35:55 +07:00", "latitude": 12.034645, "longitude": 101.748613, 
"tags": [ "nulla", "magna", "est", "velit", "ex", "labore", "proident" ], 
"friends": [ { "id": 0, "name": "Joan Mccall" }, { "id": 1, "name": "Merrill 
Vazquez" }, { "id": 2, "name": "Bernadine Camacho" } ], "greeting": "Hello, 
Lesa Perkins! You have 9 unread messages.", "favoriteFruit": "strawberry" }, { 
"_id": "584a08351ae10750cedb58ef", "index": 5, "guid": 
"edbdbf29-e554-46a2-be2f-80960e852403", "isActive": false, "balance": 
"$1,922.96", "picture": "http://placehold.it/32x32", "age": 28, "eyeColor": 
"blue", "name": "Keri Nichols", "gender": "female", "company": "SUPPORTAL", 
"email": "kerinichols@supportal.com", "phone": "+1 (982) 575-3536", "address": 
"467 Argyle Road, Crawfordsville, Georgia, 8326", "about": "Minim exercitation 
amet eiusmod officia id irure. Occaecat duis non id nostrud eu proident minim 
magna anim magna. Ea deserunt qui non occaecat Lorem velit eu amet nostrud 
veniam ipsum amet.\r\n", "registered": "2015-11-10T06:28:00 +08:00", 
"latitude": -86.133982, "longitude": -103.161058, "tags": [ "nostrud", 
"tempor", "adipisicing", "dolor", "duis", "eu", "minim" ], "friends": [ { "id": 
0, "name": "Reyna Hendrix" }, { "id": 1, "name": "Nina Santana" }, { "id": 2, 
"name": "Lamb Kirkland" } ], "greeting": "Hello, Keri Nichols! You have 5 
unread messages.", "favoriteFruit": "apple" }, { "_id": 
"584a0835db2e6130377ad554", "index": 6, "guid": 
"5fff34ec-e6da-48c0-b57c-079553a91e4d", "isActive": true, "balance": 
"$2,424.27", "picture": "http://placehold.it/32x32", "age": 28, "eyeColor": 
"green", "name": "Doreen Casey", "gender": "female", "company": "SYNKGEN", 
"email": "doreencasey@synkgen.com", "phone": "+1 (988) 475-2545", "address": 
"531 Calyer Street, Northchase, North Dakota, 6525", "about": "Veniam 
exercitation laboris voluptate incididunt qui nostrud Lorem. Aute ipsum nisi 
elit amet occaecat adipisicing quis nostrud esse ut adipisicing cillum amet. 
Lorem voluptate sit irure est deserunt laborum occaecat anim. Non dolore 
ullamco excepteur deserunt do id dolor velit.\r\n", "registered": 
"2015-10-12T10:38:21 +07:00", "latitude": -10.390687, "longitude": -116.863606, 
"tags": [ "voluptate", "aliqua", "incididunt", "laboris", "ullamco", "esse", 
"excepteur" ], "friends": [ { "id": 0, "name": "Carla Williams" }, { "id": 1, 
"name": "Reva Hubbard" }, { "id": 2, "name": "Reese Mack" } ], "greeting": 
"Hello, Doreen Casey! You have 2 unread messages.", "favoriteFruit": "pear" } ]

Alternative 2:

Expecting an object with a field named `username` at 
_.outlineStructure.users.foo.bar[1] but instead got: 
{"ids":["4","5"],"things":[]}
```
