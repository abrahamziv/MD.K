/* Cache-busting for GitHub Pages: appends ?v=<content hash> to every local script/stylesheet in index.html,
   so a browser can never mix a fresh index.html with stale cached JS/CSS.
   Run `npm run stamp` after changing any file (a test fails if you forget). Use --check to verify only. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.join(__dirname, '..'), file = path.join(root, 'index.html');
const hash = p => crypto.createHash('sha1').update(fs.readFileSync(path.join(root, p))).digest('hex').slice(0, 8);
const html = fs.readFileSync(file, 'utf8');
const out = html.replace(/(<script src|<link rel="stylesheet" href)="((?:js|css)\/[^"?]+)(?:\?v=\w+)?"/g, (m, tag, p) => `${tag}="${p}?v=${hash(p)}"`);
if (process.argv.includes('--check')) { if (out !== html) { console.error('index.html stamps are stale: run `npm run stamp`'); process.exit(1); } }
else { fs.writeFileSync(file, out); console.log(out === html ? 'stamps already current' : 'index.html re-stamped'); }
