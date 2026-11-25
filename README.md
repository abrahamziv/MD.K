# MD.K

A study web app for practicing biochemistry for the medical exam. Hebrew UI, English terms, same as the exam.
Works on phone, iPad and laptop. No build step, no server: plain HTML/CSS/JS.

## Games
| Game | What it does |
|---|---|
| Multiple choice (`js/games/mcq.js`) | Structure → name, name → structure, or mixed. Look-alike distractors. |
| Drag & drop (`js/games/dragdrop.js`) | Match names to structures (or reverse). Touch drag, mouse drag, or tap-then-tap. |

Shared features: colour hints (off by default), topic filter, round length, "review mistakes",
weighted practice (missed cards come back more often), progress saved in the browser (localStorage).

## Project layout
```
index.html                      entry point; lists all script files
css/style.css                   all styling (light + dark)
js/core.js                      registries, progress, sampling, distractors
js/render.js                    structure data -> SVG
js/app.js                       screens: home, play, summary, browse
js/decks/functional-groups.js   deck 1 (24 functional groups, after Lehninger Fig. 1-16)
js/games/mcq.js                 game: multiple choice
js/games/dragdrop.js            game: drag & drop
```

## Adding a new deck
1. Copy `js/decks/functional-groups.js` to `js/decks/<new-deck>.js`.
2. Change `id`, `title`, `subtitle`, `cats` and the `items`.
3. Add `<script src="js/decks/<new-deck>.js"></script>` in `index.html` under "decks".

A deck tab appears on the home screen automatically.

### Item format
```js
{ id: 'ester', name: 'Ester', cat: 'O', confuse: ['thioester', 'anhydride'],
  s: {                       // structure
    a: [[0,0,'R1'], [1,0,'C'], [2,0,'O'], [3,0,'R2'], [1,1,'O']],   // atoms: x, y, label, charge?
    b: [[0,1], [1,2], [2,3], [1,4,2]],                               // bonds: from, to, order?
    h: [1,2,4]                                                       // atoms inside the hint box
  } }
```
- Coordinates are in bond lengths; y points down. Labels like `R1` render as R¹. Charge: `'+'` or `'−'`.
- `cat` sets the hint colour: C (grey), O (red), N (blue), S (yellow), P (orange).
- `confuse` lists look-alike items used as wrong answers.

## Adding a new game
Create `js/games/<game>.js`:
```js
MDK.registerGame({ id: 'my-game', title: 'שם המשחק', start(stage, ctx) {
  // ctx: deck, items, n, dir ('s2n' | 'n2s' | 'mix'), setProgress(i, total), record(item, ok), onDone(results)
  return { stop() {} };
}});
```
Then add its `<script>` tag in `index.html`. It shows up in the game picker.

## Run locally
Open `index.html` in a browser. That's it.
