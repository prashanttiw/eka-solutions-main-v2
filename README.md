# EKA Solution

The marketing site for EKA Solution — a software engineering company that runs two
tracks: client platforms (product and platform engineering, AI systems, cloud
reliability, product design) and three products we operate ourselves.

Multi-page. React 19 on Vite 8, React Router 7, Tailwind v4, Three.js for the hero globe.

## Running it

```bash
npm install
npm run dev
```

| Script            | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Vite dev server with HMR                      |
| `npm run build`   | Production build into `dist/`                 |
| `npm run preview` | Serve the built output locally                |
| `npm run lint`    | oxlint over the source                        |

## How the site is put together

This was one 22,000px scroll of nineteen sections until recently. The *order* of those
sections was the argument, and it still is — the routes are in the same sequence, and
every page ends with a link to the next one, so reading straight through gives the same
document it always did. What changed is that a visitor who came for one of the four
questions no longer has to scroll past the other three.

| Route       | Sections                                        | Answers                |
| ----------- | ----------------------------------------------- | ---------------------- |
| `/`         | hero, dual track, contents                      | who are you            |
| `/about`    | about, point of view                            | who are you            |
| `/services` | services, products, industries                  | what are you selling   |
| `/playbook` | playbook, engineering standards, engagement     | can you actually do it |
| `/work`     | case studies, the work book, testimonials       | can you actually do it |
| `/team`     | founders, founding 25                           | how do I start         |
| `/careers`  | roles, terms, the application                   | how do I start         |
| `/contact`  | intake, FAQ                                     | how do I start         |

The table of contents is declared once in [`src/site.js`](src/site.js). The navbar, the
footer, the home page's index, the breadcrumbs, the previous/next links and the per-page
`<title>` all read from it, so the order lives in one file rather than in five that have
to be kept in step by hand.

Every page but the home page is a lazy chunk. On one scroll that was not possible — the
whole document had to be in the first bundle because all of it was the first screen's
page. Now the project book's flip engine, the case studies and the application form only
arrive if someone goes to look at them.

`vercel.json` rewrites every path to `index.html`; without it a hard refresh on `/work`
is a 404 from the CDN rather than a route.

### The careers application

The hiring card on `/careers` turns over onto the application rather than sending a
candidate to the sales intake at the bottom of the page. Clicking a role, or the button
under the process, flips it — and because both faces of a flip card have to be absolutely
positioned, the stage's height is measured off whichever face is showing and written as an
inline style. The card therefore grows into the form on the same curve as the turn, with a
small overshoot, and the roles list gives up its width as the form takes it.

The form itself is four steps, and the CV is asked for first: the largest single cause of
abandonment on job forms is being made to retype a work history that is already in the
file the applicant just attached. Drafts are kept in `localStorage`; files are not, and
the confirmation says so.

## Design system

Two rules hold the visual language together, and most of the stylesheet exists to enforce
them:

- **Cream paper, one blue ink scale.** `--ink`, `--ink-soft` and the divider tokens are
  defined once in the theme block at the top of [`src/index.css`](src/index.css). Nothing
  below the hero uses black.
- **The hero is the only dark field.** It is also the only place the site takes colour —
  a glow needs somewhere dark to glow into.

Reach the hero globe and the footer mountain through CSS variables only. Both are tuned
against reference frames and are easy to break from the outside.

### Shared primitives

| Component        | Role                                                        |
| ---------------- | ----------------------------------------------------------- |
| `Reveal`         | Scroll-in animation with a variant vocabulary and stagger    |
| `SectionHeading` | The eyebrow / headline / standfirst block every section opens with |
| `TiltCard`       | Pointer-tracked rotation with a specular that follows it     |
| `CountUp`        | Numbers that count up once, with crawler-safe markup         |
| `ChromeObject`   | The two silver renders, placed as edge decoration            |
| `InkPlate`       | Procedural blue-ink field sketches, seeded per project       |
| `InkLattice`     | The paper counterpart to the hero globe — wireframe solids in 2D canvas |
| `PageHeader`     | The masthead every page but the home page opens with        |
| `PageNav`        | Previous / next, which is what keeps the reading order alive |
| `FlipCard`       | Two faces on one Y axis, with the stage height measured off the live one |

`InkLattice` is deliberately 2D canvas rather than a second Three.js scene. Two WebGL
contexts fighting for the same GPU, on pages whose actual job is to be read, is the wrong
trade — a wireframe drawn in the body ink holds sixty frames anywhere and costs about four
kilobytes.

Motion below the hero goes through one rAF-batched scroll listener
([`src/lib/scrollDriver.js`](src/lib/scrollDriver.js)) rather than a listener per layer.
The hero keeps its own, because it drives a WebGL render loop that cannot share a
schedule.

## Asset pipeline

Source images live in `scripts/source/` and are committed; the web-ready output in
`public/assets/` is generated from them with [sharp](https://sharp.pixelplumbing.com):

```bash
node scripts/build-objects.mjs   # chrome renders -> trimmed WebP
node scripts/build-photos.mjs    # photography -> sized, optimised
node scripts/build-mountain.mjs  # footer mountain engraving
```

## Deploying

Vercel, zero-config — it detects Vite, runs `npm run build` and serves `dist/`.
