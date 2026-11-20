<!-- glassbox:start -->
<!-- Generated from glassbox.json by the Glassbox hub (npm run readme -- catlandingclear). Edit glassbox.json, not this block. -->

<h1 align="center">CatLandingClear</h1>

<p align="center"><b>How does a falling cat land on its feet?</b><br>Let go of a cat upside down with no spin and it lands on its feet. Physics says its spin must stay at zero the whole way down. Both are true, and the trick is shape.</p>

<p align="center"><a href="https://glassbox.how/catlandingclear/"><b>▶ Play with it</b></a> &nbsp;·&nbsp; <a href="https://glassbox.how/e/catlandingclear/">Read the 60-second explainer</a></p>

<p align="center">
  <a href="https://glassbox.how/e/catlandingclear/"><img alt="Glassbox No. 251" src="https://img.shields.io/badge/Glassbox-No.%20251-8ef0ff"></a>
  <a href="https://glassbox.how/e/catlandingclear/"><img alt="Nature" src="https://img.shields.io/badge/field-Nature-a3e635"></a>
  <a href="LICENSE"><img alt="Code: MIT" src="https://img.shields.io/badge/code-MIT-3fb950"></a>
  <a href="LICENSE-CONTENT.md"><img alt="Content: CC BY 4.0" src="https://img.shields.io/badge/content-CC%20BY%204.0-ef9421"></a>
  <a href="#privacy"><img alt="Privacy: explained" src="https://img.shields.io/badge/privacy-explained-555"></a>
</p>

## In 60 seconds

1. **The puzzle.** A cat dropped upside down with no spin is upright within about a third of a second. With nothing to push on, its total angular momentum must stay at zero, so for a while the feat looked impossible.
2. **Shape, not spin.** A body that can change shape can end up facing a new way while its total spin stays zero. The cat's front and back halves turn in opposite directions, and how far each turns depends on its shape.
3. **Tuck and turn.** Tuck the front legs and stretch the back legs, then twist: the front turns a lot and the back a little. Swap the legs and twist back, and the whole cat keeps a net turn.
4. **Bend and twist.** Kane and Scher's 1969 model bends the cat at the waist and swings the bend round its body. The halves roll against each other and the body comes out turned over, with zero spin throughout.
5. **Knowing which way is up.** The inner ear's canals sense turning and its otoliths sense gravity; the eyes help. In lab studies kittens first show the reflex at about 3½ weeks and have mastered it by about 5 weeks.
6. **The landing, and beyond.** Legs out and back arched, the cat stops over a longer distance. Its top speed is often estimated at about 100 km/h. Astronauts, divers and robots use the same physics. Never drop a cat to test it.

## Words worth knowing

| Term | Meaning |
|---|---|
| **Angular momentum** | How much spin a body has. With no outside twist, it stays the same. |
| **Moment of inertia** | How hard something is to set turning about an axis. Mass far from the axis makes it larger. |
| **Righting reflex** | The automatic movement an animal makes to turn itself the right way up. |
| **Tuck and turn** | Pulling in the legs on one half and stretching them on the other, so the two halves turn by different angles. |
| **Bend and twist** | Bending at the waist and swinging the bend round the body, so the halves' rolls leave a net turn. |
| **Geometric phase** | A net change that depends only on the shape of a loop of movements, not on how fast it is made. |
| **Vestibular system** | The balance organs of the inner ear: three semicircular canals that sense turning and two otolith organs that sense gravity. |
| **Terminal velocity** | The steady speed at which air drag equals weight, so a falling body stops speeding up. |
| **Survivorship bias** | Drawing conclusions only from the cases that made it into the data, while the others are missing. |
| **Chronophotography** | A series of photographs taken at quick, regular intervals to study movement. |

## A short history

**From a Paris photograph in 1894 to robot dogs: three centuries of asking how a cat turns over on nothing.**

- **1870** · Maxwell's 'cat-turning' letter (James Clerk Maxwell, Trinity College, Cambridge)
- **1894** · Marey films a falling cat for the Academy (Étienne-Jules Marey, Paris, France)
- **1935** · Bend-and-twist model (G. G. J. Rademaker, J. W. G. ter Braak, Leiden)
- **1955** · Filming a falling cat at 1500 frames a second (Donald A. McDonald, United Kingdom (Physiological Society))
- **1969** · Kane and Scher's two-cylinder cat (Thomas R. Kane, M. P. Scher, Stanford University)
- **1979** · Air righting matures by five weeks (J. R. Villablanca, C. E. Olmstead, United States (Developmental Psychobiology))
- **1987** · High-rise syndrome in New York cats (W. O. Whitney, C. J. Mehlhaff, Animal Medical Center, New York)
- **1993** · Gauge theory of the falling cat (Richard Montgomery, UC Santa Cruz)

The full story, with 37 moments, charts, people and 43 sources: [glassbox.how/e/catlandingclear/history](https://glassbox.how/e/catlandingclear/history/). The data lives in [`history.json`](history.json).

## Privacy

This box has no accounts and no ads, and it ships its own fonts and libraries. When you run it yourself it sends nothing anywhere. On glassbox.how, the site's `/bar.js` also loads Glassbox's analytics: **Google Analytics** to count visits (it asks first in the EU, UK and Switzerland, and stays off when your browser sends Global Privacy Control or Do Not Track) and **ClickTrust** to detect bots.

It remembers a few things **in your own browser only**, and never sends them anywhere:

| Browser storage key | What it holds |
|---|---|
| `catlandingclear.v1` | Which chapters you have opened, your best quiz scores, and sound on or off. |

Exactly what each one sees is at [glassbox.how/privacy](https://glassbox.how/privacy/).

## Licences

- **Code:** [MIT](LICENSE). Use it, change it, ship it.
- **Explanations, text, images and videos** (`glassbox.json`, `glassbox/`): [CC BY 4.0](LICENSE-CONTENT.md). Credit “Glassbox, glassbox.how/e/catlandingclear”.
- **Third-party parts** keep their own licences: [three.js](https://threejs.org) (MIT), [Geist, Instrument Serif](https://openfontlicense.org) (SIL OFL 1.1).
- The Glassbox name and logo aren't covered by either licence. See the [terms](https://glassbox.how/terms/).

Found a mistake? [Open an issue](https://github.com/bdeeps/catlandingclear/issues). Corrections happen in public.
<!-- glassbox:end -->

## Run it

It's plain HTML, CSS and JavaScript. No build step and no dependencies. Run locally, it contacts no other website.

```bash
python3 -m http.server 8000
```

Three.js and the fonts ship in `vendor/` and `fonts/`, so it also works offline.

Then open http://localhost:8000.

## How it's built

| File | What |
|---|---|
| `index.html`, `css/app.css` | The page and its styles |
| `js/app.js`, `js/stage.js`, `js/ui.js`, `js/kit.js` | The shared Glassbox 3D engine: chapters, 3D stage, controls, quiz, video director |
| `js/chapters/*.js` | One file per chapter: the 3D model, controls, text, key terms, quiz and video scenes |
| `glassbox.json` | Title, question, explainer beats, key terms, browser storage and credits shown on glassbox.how |
| `reel` in each chapter | The storyboard the Glassbox studio records into short videos |
| `glassbox/` | The published video, slides, thumbnail and post copy |
| `fonts/`, `vendor/three/` | Self-hosted Geist and Instrument Serif (SIL OFL 1.1) and three.js (MIT) |
