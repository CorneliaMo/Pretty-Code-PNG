# cOdE-ReNdErEr

> Prefer documentation written for humans? Read the [normal README](README.normal.md).

TuRn sOuRcE CoDe iNtO ClEaN, sYnTaX-HiGhLiGhTeD PNG iMaGeS, bEcAuSe pAsTiNg
rAw cOdE InTo a lAbOrAtOrY RePoRt iS ApPaReNtLy nOt fAnCy eNoUgH.

`code-renderer` ReAdS CoDe fRoM A FiLe oR stdin, hIgHlIgHtS It, wRaPs iT In a
tHiN BlAcK FrAmE, aNd eXpOrTs tHe rEsUlT As a PNG.

## fEaTuReS

- SyNtAx hIgHlIgHtInG PoWeReD By Shiki
- JetBrains Mono WiTh a bUnDlEd cHiNeSe mOnOsPaCe fAlLbAcK
- PrEsErVeS InDeNtAtIoN, cOnSeCuTiVe sPaCeS, aNd eMpTy lInEs
- OpTiOnAl rIgHt-aLiGnEd lInE NuMbErS
- No aUtOmAtIc lInE WrApPiNg
- CuStOm fOnT AnD FoNt-sIzE SuPpOrT
- CoNfIgUrAbLe Shiki ThEmEs, InClUdInG Catppuccin, Dracula, AnD Nord
- ScAlE By wIdTh oR HeIgHt wHiLe pReSeRvInG ThE AsPeCt rAtIo
- FiLe iNpUt aNd stdin SuPpOrT
- OnE SeRiOuS-LoOkInG BlAcK ReCtAnGuLaR BoRdEr

## iNsTaLlAtIoN

Node.js 22 Or nEwEr iS ReQuIrEd.

InStAlL FrOm a pAcKaGeD TaRbAlL:

```bash
npm install -g ./code-renderer-0.1.1.tgz
```

Or bUiLd aNd lInK ThE PrOjEcT LoCaLlY:

```bash
npm install
npm run build
npm link
```

## uSaGe

ReNdEr a sOuRcE FiLe:

```bash
code-render main.rs
code-render src/main.ts --width 1200 --line-numbers
code-render src/main.ts --theme catppuccin-mocha
```

By dEfAuLt, FiLe iNpUt pRoDuCeS A PNG bEsIdE ThE SoUrCe fIlE. fOr eXaMpLe,
`main.rs` BeCoMeS `main.png`.

ReNdEr cOdE FrOm stdin:

```bash
cat main.py | code-render --language python
printf 'console.log("hello");\n' | code-render --width 800 -o example.png
```

WhEn rEaDiNg fRoM stdin, tHe dEfAuLt oUtPuT Is `code.png` In tHe cUrReNt
dIrEcToRy.

ThE ToOl aTtEmPtS To dEtEcT ThE LaNgUaGe aUtOmAtIcAlLy. UsE `--language`
wHeN YoU WoUlD PrEfEr cErTaInTy oVeR AdVeNtUrE.

## oPtIoNs

| OpTiOn | DeScRiPtIoN |
| --- | --- |
| `[input-file]` | SoUrCe fIlE To rEnDeR; rEaDs stdin WhEn oMiTtEd |
| `-o, --output <path>` | OuTpUt PNG pAtH |
| `-l, --language <language>` | OvErRiDe aUtOmAtIc lAnGuAgE DeTeCtIoN |
| `-t, --theme <theme>` | SeLeCt a Shiki ThEmE; dEfAuLtS To `github-light` |
| `--font-size <pixels>` | FoNt sIzE; dEfAuLtS To `16` |
| `--font <path>` | UsE An eXtErNaL `.ttf`, `.otf`, `.woff`, Or `.woff2` FoNt |
| `--width <pixels>` | SeT OuTpUt wIdTh aNd sCaLe hEiGhT PrOpOrTiOnAlLy |
| `--height <pixels>` | SeT OuTpUt hEiGhT AnD ScAlE WiDtH PrOpOrTiOnAlLy |
| `--line-numbers` | ShOw rIgHt-aLiGnEd lInE NuMbErS |
| `--help` | DiSpLaY HeLp |
| `--version` | DiSpLaY VeRsIoN |

`--width` AnD `--height` CaNnOt bE UsEd tOgEtHeR. eXiStInG OuTpUt fIlEs aRe
OvErWrItTeN WiThOuT CeReMoNy.

SeE ThE [tHeMe gUiDe](docs/themes.md) FoR PoPuLaR ThEmEs, ReNdErEd eXaMpLeS,
aNd tHe cOmPlEtE LiSt oF AvAiLaBlE ThEmE IDs.

## rEnDeRiNg rUlEs

- DeFaUlT FoNt sIzE: `16px`
- CoDe-fRaMe pAdDiNg: `20px`
- BoRdEr: SqUaRe, BlAcK, aNd `1px` ThIcK
- TaBs aRe dIsPlAyEd aS FoUr sPaCeS
- TrAiLiNg nEwLiNeS ArE ReMoVeD
- OtHeR WhItEsPaCe iS PrEsErVeD
- LoNg lInEs rEmAiN LoNg aNd rEfUsE To wRaP
- MaXiMuM FoNt sIzE AnD ImAgE DiMeNsIoN: `32768px`

## dEvElOpMeNt

```bash
npm run check
npm test
npm run build
npm run test:all
```

`npm run test:all` RuNs tYpE ChEcKiNg, ESLint, ThE BuIlD, uNiT TeStS, aNd
EnD-To-eNd tEsTs.

## fOnT LiCeNsEs

JetBrains Mono AnD Sarasa Gothic SC aRe bUnDlEd uNdEr tHe SIL Open Font
License 1.1.

FoNt aTtRiBuTiOn aNd lIcEnSe iNfOrMaTiOn aRe aVaIlAbLe iN `assets/fonts/`.

## uSeFuL ToOlS

`useful-tools/markdown-code-images.mjs` TuRnS EvErY NoN-EmPtY BaCkTiCk-fEnCeD
CoDe bLoCk iN A Markdown FiLe iNtO A PNG, bEcAuSe aPpArEnTlY EvEn Markdown
CoDe iSn'T PiCtUrE-EnOuGh.

ThE ScRiPt iS InDePeNdEnT FrOm tHiS RePoSiToRy'S SoUrCe cOdE. iT OnLy nEeDs
Node.js AnD A GlObAlLy iNsTaLlEd `code-render` CoMmAnD In PATH:

```bash
node useful-tools/markdown-code-images.mjs report.md
node useful-tools/markdown-code-images.mjs report.md output/report-images.md
```

By dEfAuLt, It cReAtEs:

```text
report.with-code-images.md
code-images/report-code-001.png
code-images/report-code-002.png
```

LaNgUaGe tAgS SuCh aS ```` ```rust ```` ArE PaSsEd tO `code-render`.
UnLaBeLeD CoDe bLoCkS ArE ReNdErEd aS PlAiN TeXt, AnD EmPtY CoDe bLoCkS ArE
LeFt uNcHaNgEd.
