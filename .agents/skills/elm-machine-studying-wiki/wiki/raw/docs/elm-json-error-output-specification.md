---
title: "Elm JSON Error Output Specification"
category: "cat:compiler"
source_url: "https://github.com/elm/compiler/blob/master/compiler/src/Reporting/Doc.hs"
ingested_at: "2026-08-16"
key_concepts: "Parsing structured compiler errors for automated agent evaluation loops"
---

# Elm JSON Error Output Specification

**Source URL:** [https://github.com/elm/compiler/blob/master/compiler/src/Reporting/Doc.hs](https://github.com/elm/compiler/blob/master/compiler/src/Reporting/Doc.hs)  
**Category:** `cat:compiler` | **Ingested:** `2026-08-16`  
**Key Concepts:** Parsing structured compiler errors for automated agent evaluation loops

---

###  Uh oh! 

There was an error while loading. [Please reload this page]().

[ elm ](/elm) / **[compiler](/elm/compiler) ** Public

  * [ Notifications ](/login?return_to=%2Felm%2Fcompiler) You must be signed in to change notification settings
  * [ Fork 688 ](/login?return_to=%2Felm%2Fcompiler)
  * [ Star  7.9k ](/login?return_to=%2Felm%2Fcompiler)




[](/elm/compiler)

## FilesExpand file tree

main

/

# Doc.hs

Copy path

Blame

More file actions

Blame

More file actions

## Latest commit

## History

[History](/elm/compiler/commits/main/compiler/src/Reporting/Doc.hs)

[](/elm/compiler/commits/main/compiler/src/Reporting/Doc.hs)History

431 lines (315 loc) · 8.81 KB

main

/

# Doc.hs

Copy path

Top

## File metadata and controls

  * Code

  * Blame




431 lines (315 loc) · 8.81 KB

[Raw](https://github.com/elm/compiler/raw/refs/heads/main/compiler/src/Reporting/Doc.hs)

Copy raw file

Download raw file

Open symbols panel

Edit and raw actions

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

27

28

29

30

31

32

33

34

35

36

37

38

39

40

41

42

43

44

45

46

47

48

49

50

51

52

53

54

55

56

57

58

59

60

61

62

63

64

65

66

67

68

69

70

71

72

73

74

75

76

77

78

79

80

81

82

83

84

85

86

87

88

89

90

91

92

93

94

95

96

97

98

99

100

101

102

103

104

105

106

107

108

109

110

111

112

113

114

115

116

117

118

119

120

121

122

123

124

125

126

127

128

129

130

131

132

133

134

135

136

137

138

139

140

141

142

143

144

145

146

147

148

149

150

151

152

153

154

155

156

157

158

159

160

161

162

163

164

165

166

167

168

169

170

171

172

173

174

175

176

177

178

179

180

181

182

183

184

185

186

187

188

189

190

191

192

193

194

195

196

197

198

199

200

201

202

203

204

205

206

207

208

209

210

211

212

213

214

215

216

217

218

219

220

221

222

223

224

225

226

227

228

229

230

231

232

233

234

235

236

237

238

239

240

241

242

243

244

245

246

247

248

249

250

251

252

253

254

255

256

257

258

259

260

261

262

263

264

265

266

267

268

269

270

271

272

273

274

275

276

277

278

279

280

281

282

283

284

285

286

287

288

289

290

291

292

293

294

295

296

297

298

299

300

301

302

303

304

305

306

307

308

309

310

311

312

313

314

315

316

317

318

319

320

321

322

323

324

325

326

327

328

329

330

331

332

333

334

335

336

337

338

339

340

341

342

343

344

345

346

347

348

349

350

351

352

353

354

355

356

357

358

359

360

361

362

363

364

365

366

367

368

369

370

371

372

373

374

375

376

377

378

379

380

381

382

383

384

385

386

387

388

389

390

391

392

393

394

395

396

397

398

399

400

401

402

403

404

405

406

407

408

409

410

411

412

413

414

415

416

417

418

419

420

421

422

423

424

425

426

427

428

429

430

431

{-# LANGUAGE OverloadedStrings #-}

module Reporting.Doc

( P.Doc

, (P.<+>), (<>)

, P.align, P.cat, P.empty, P.fill, P.fillSep, P.hang

, P.hcat, P.hsep, P.indent, P.sep, P.vcat

, P.red, P.cyan, P.magenta, P.green, P.blue, P.black, P.yellow

, P.dullred, P.dullcyan, P.dullyellow

\--

, fromChars

, fromName

, fromVersion

, fromPackage

, fromInt

\--

, toAnsi

, toString

, toLine

\--

, encode

\--

, stack

, reflow

, commaSep

\--

, toSimpleNote

, toFancyNote

, toSimpleHint

, toFancyHint

\--

, link

, fancyLink

, reflowLink

, makeLink

, makeNakedLink

\--

, args

, moreArgs

, ordinal

, intToOrdinal

, cycle

)

where

import Prelude hiding (cycle)

import qualified Data.List as List

import qualified Data.Name as Name

import qualified System.Console.ANSI.Types as Ansi

import qualified System.Info as Info

import System.IO (Handle)

import qualified Text.PrettyPrint.ANSI.Leijen as P

import qualified Data.Index as Index

import qualified Elm.Package as Pkg

import qualified Elm.Version as V

import Json.Encode ((==>))

import qualified Json.Encode as E

import qualified Json.String as Json

\-- FROM

fromChars :: String -> P.Doc

fromChars =

P.text

fromName :: Name.Name -> P.Doc

fromName name =

P.text (Name.toChars name)

fromVersion :: V.Version -> P.Doc

fromVersion vsn =

P.text (V.toChars vsn)

fromPackage :: Pkg.Name -> P.Doc

fromPackage pkg =

P.text (Pkg.toChars pkg)

fromInt :: Int -> P.Doc

fromInt n =

P.text (show n)

\-- TO STRING

toAnsi :: Handle -> P.Doc -> IO ()

toAnsi handle doc =

P.displayIO handle (P.renderPretty 1 80 doc)

toString :: P.Doc -> String

toString doc =

P.displayS (P.renderPretty 1 80 (P.plain doc)) ""

toLine :: P.Doc -> String

toLine doc =

P.displayS (P.renderPretty 1 (div maxBound 2) (P.plain doc)) ""

\-- FORMATTING

stack :: [P.Doc] -> P.Doc

stack docs =

P.vcat (List.intersperse "" docs)

reflow :: String -> P.Doc

reflow paragraph =

P.fillSep (map P.text (words paragraph))

commaSep :: P.Doc -> (P.Doc -> P.Doc) -> [P.Doc] -> [P.Doc]

commaSep conjunction addStyle names =

case names of

[name] ->

[ addStyle name ]

[name1,name2] ->

[ addStyle name1, conjunction, addStyle name2 ]

_ ->

map (\name -> addStyle name <> ",") (init names)

++

[ conjunction

, addStyle (last names)

]

\-- NOTES

toSimpleNote :: String -> P.Doc

toSimpleNote message =

toFancyNote (map P.text (words message))

toFancyNote :: [P.Doc] -> P.Doc

toFancyNote chunks =

P.fillSep (P.underline "Note" <> ":" : chunks)

\-- HINTS

toSimpleHint :: String -> P.Doc

toSimpleHint message =

toFancyHint (map P.text (words message))

toFancyHint :: [P.Doc] -> P.Doc

toFancyHint chunks =

P.fillSep (P.underline "Hint" <> ":" : chunks)

\-- LINKS

link :: String -> String -> String -> String -> P.Doc

link word before fileName after =

P.fillSep $

(P.underline (P.text word) <> ":")

: map P.text (words before)

++ P.text (makeLink fileName)

: map P.text (words after)

fancyLink :: String -> [P.Doc] -> String -> [P.Doc] -> P.Doc

fancyLink word before fileName after =

P.fillSep $

(P.underline (P.text word) <> ":") : before ++ P.text (makeLink fileName) : after

makeLink :: [Char] -> [Char]

makeLink fileName =

"<https://elm-lang.org/" <> V.toChars V.compiler <> "/" <> fileName <> ">"

makeNakedLink :: [Char] -> [Char]

makeNakedLink fileName =

"https://elm-lang.org/" <> V.toChars V.compiler <> "/" <> fileName

reflowLink :: [Char] -> [Char] -> [Char] -> P.Doc

reflowLink before fileName after =

P.fillSep $

map P.text (words before)

++ P.text (makeLink fileName)

: map P.text (words after)

\-- HELPERS

args :: Int -> String

args n =

show n <> if n == 1 then " argument" else " arguments"

moreArgs :: Int -> String

moreArgs n =

show n <> " more" <> if n == 1 then " argument" else " arguments"

ordinal :: Index.ZeroBased -> String

ordinal index =

intToOrdinal (Index.toHuman index)

intToOrdinal :: Int -> String

intToOrdinal number =

let

remainder10 =

number `mod` 10

remainder100 =

number `mod` 100

ending

| remainder100 `elem` [11..13] = "th"

| remainder10 == 1 = "st"

| remainder10 == 2 = "nd"

| remainder10 == 3 = "rd"

| otherwise = "th"

in

show number <> ending

cycle :: Int -> Name.Name -> [Name.Name] -> P.Doc

cycle indent name names =

let

toLn n = cycleLn <> P.dullyellow (fromName n)

in

P.indent indent $ P.vcat $

cycleTop : List.intersperse cycleMid (toLn name : map toLn names) ++ [ cycleEnd ]

cycleTop, cycleLn, cycleMid, cycleEnd :: P.Doc

cycleTop = if isWindows then "+-----+" else "┌─────┐"

cycleLn = if isWindows then "| " else "│ "

cycleMid = if isWindows then "| |" else "│ ↓"

cycleEnd = if isWindows then "+-<\---+" else "└─────┘"

isWindows :: Bool

isWindows =

Info.os == "mingw32"

\-- JSON

encode :: P.Doc -> E.Value

encode doc =

E.array (toJsonHelp noStyle [] (P.renderPretty 1 80 doc))

data Style =

Style

{ _bold :: Bool

, _underline :: Bool

, _color :: Maybe Color

}

noStyle :: Style

noStyle =

Style False False Nothing

data Color

= Red

| RED

| Magenta

| MAGENTA

| Yellow

| YELLOW

| Green

| GREEN

| Cyan

| CYAN

| Blue

| BLUE

| Black

| BLACK

| White

| WHITE

toJsonHelp :: Style -> [String] -> P.SimpleDoc -> [E.Value]

toJsonHelp style revChunks simpleDoc =

case simpleDoc of

P.SFail ->

error $

"according to the main implementation, @SFail@ can not\

\ appear uncaught in a rendered @SimpleDoc@"

P.SEmpty ->

[ encodeChunks style revChunks ]

P.SChar char rest ->

toJsonHelp style ([char] : revChunks) rest

P.SText _ string rest ->

toJsonHelp style (string : revChunks) rest

P.SLine indent rest ->

toJsonHelp style (replicate indent ' ' : "\n" : revChunks) rest

P.SSGR sgrs rest ->

encodeChunks style revChunks : toJsonHelp (sgrToStyle sgrs style) [] rest

sgrToStyle :: [Ansi.SGR] -> Style -> Style

sgrToStyle sgrs style@(Style bold underline color) =

case sgrs of

[] ->

style

sgr : rest ->

sgrToStyle rest $

case sgr of

Ansi.Reset -> noStyle

Ansi.SetConsoleIntensity i -> Style (isBold i) underline color

Ansi.SetItalicized _ -> style

Ansi.SetUnderlining u -> Style bold (isUnderline u) color

Ansi.SetBlinkSpeed _ -> style

Ansi.SetVisible _ -> style

Ansi.SetSwapForegroundBackground _ -> style

Ansi.SetColor l i c -> Style bold underline (toColor l i c)

Ansi.SetRGBColor _ _ -> style

Ansi.SetPaletteColor _ _ -> style

Ansi.SetDefaultColor _ -> style

isBold :: Ansi.ConsoleIntensity -> Bool

isBold intensity =

case intensity of

Ansi.BoldIntensity -> True

Ansi.FaintIntensity -> False

Ansi.NormalIntensity -> False

isUnderline :: Ansi.Underlining -> Bool

isUnderline underlining =

case underlining of

Ansi.SingleUnderline -> True

Ansi.DoubleUnderline -> False

Ansi.NoUnderline -> False

toColor :: Ansi.ConsoleLayer -> Ansi.ColorIntensity -> Ansi.Color -> Maybe Color

toColor layer intensity color =

case layer of

Ansi.Background ->

Nothing

Ansi.Foreground ->

let

pick dull vivid =

case intensity of

Ansi.Dull -> dull

Ansi.Vivid -> vivid

in

Just $

case color of

Ansi.Red -> pick Red RED

Ansi.Magenta -> pick Magenta MAGENTA

Ansi.Yellow -> pick Yellow YELLOW

Ansi.Green -> pick Green GREEN

Ansi.Cyan -> pick Cyan CYAN

Ansi.Blue -> pick Blue BLUE

Ansi.White -> pick White WHITE

Ansi.Black -> pick Black BLACK

encodeChunks :: Style -> [String] -> E.Value

encodeChunks (Style bold underline color) revChunks =

let

chars = concat (reverse revChunks)

in

case color of

Nothing | not bold && not underline ->

E.chars chars

_ ->

E.object

[ "bold" ==> E.bool bold

, "underline" ==> E.bool underline

, "color" ==> maybe E.null encodeColor color

, "string" ==> E.chars chars

]

encodeColor :: Color -> E.Value

encodeColor color =

E.string $ Json.fromChars $

case color of

Red -> "red"

RED -> "RED"

Magenta -> "magenta"

MAGENTA -> "MAGENTA"

Yellow -> "yellow"

YELLOW -> "YELLOW"

Green -> "green"

GREEN -> "GREEN"

Cyan -> "cyan"

CYAN -> "CYAN"

Blue -> "blue"

BLUE -> "BLUE"

Black -> "black"

BLACK -> "BLACK"

White -> "white"

WHITE -> "WHITE"

