/* Loads the browser scripts into a Node vm sandbox so they can be tested without a browser. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');

function loadMDK() {
  const mem = {};
  const sandbox = {
    localStorage: { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } },
    console, Math, Date, JSON
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  // same order as index.html: every script tag except app.js (needs a DOM)
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1].split('?')[0]).filter(s => !s.endsWith('app.js'));
  for (const s of srcs) vm.runInContext(fs.readFileSync(path.join(root, s), 'utf8'), sandbox, { filename: s });
  return { MDK: sandbox.MDK, mem, srcs };
}
module.exports = { loadMDK, root };
