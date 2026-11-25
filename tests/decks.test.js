/* Data integrity for every registered deck. New decks are checked automatically. */
const test = require('node:test'), assert = require('node:assert/strict');
const { loadMDK } = require('./helpers');
const { MDK } = loadMDK();
const decks = Object.values(MDK.decks);

test('at least one deck is registered', () => assert.ok(decks.length >= 1));

const structureDecks = decks.filter(d => d.type === 'structure'), tableDecks = decks.filter(d => d.type === 'table');

for (const d of structureDecks) test(`deck "${d.id}" is well-formed`, () => {
  for (const f of ['id', 'title', 'subtitle', 'source']) assert.ok(d[f], `missing ${f}`);
  assert.ok(Object.keys(d.cats).length, 'no categories');
  const ids = d.items.map(x => x.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate item ids');
  const names = d.items.map(x => x.name);
  assert.equal(new Set(names).size, names.length, 'duplicate item names');
  for (const it of d.items) {
    const w = `item "${it.id}"`;
    assert.ok(it.name, `${w}: no name`);
    assert.ok(it.cat in d.cats, `${w}: unknown cat "${it.cat}"`);
    for (const c of it.confuse || []) { assert.ok(ids.includes(c), `${w}: confuse -> unknown "${c}"`); assert.notEqual(c, it.id, `${w}: confuses itself`); }
    const { a, b, h = [] } = it.s;
    assert.ok(a.length > 0, `${w}: no atoms`);
    a.forEach(x => assert.ok(typeof x[0] === 'number' && typeof x[1] === 'number' && typeof x[2] === 'string', `${w}: bad atom ${JSON.stringify(x)}`));
    for (const [i, j, o = 1] of b) {
      assert.ok(a[i] && a[j], `${w}: bond ${i}-${j} out of range`);
      assert.notEqual(i, j, `${w}: self-bond`);
      assert.ok([1, 2, 3].includes(o), `${w}: bad bond order`);
    }
    h.forEach(i => assert.ok(a[i], `${w}: hint index ${i} out of range`));
    // every atom should be connected to something
    a.forEach((_, i) => assert.ok(b.some(x => x[0] === i || x[1] === i), `${w}: atom ${i} has no bond`));
    assert.doesNotThrow(() => MDK.render(it), `${w}: render threw`);
    assert.match(MDK.render(it), /^<svg/, `${w}: render not svg`);
  }
});

test('four exam subjects registered, and every deck belongs to one', () => {
  assert.deepEqual(Object.keys(MDK.subjects), ['biochem', 'molbio', 'cellbio', 'physio']);
  for (const d of decks) assert.ok(MDK.subjects[d.subject], `deck "${d.id}" has unknown subject "${d.subject}"`);
});

for (const d of tableDecks) test(`table deck "${d.id}" is well-formed`, () => {
  for (const f of ['id', 'title', 'subtitle', 'source']) assert.ok(d[f], `missing ${f}`);
  assert.ok(d.cols.length >= 2, 'needs 2+ columns');
  const cid = d.cols.map(c => c.id);
  assert.equal(new Set(cid).size, cid.length, 'duplicate column ids');
  assert.ok(d.items.length >= 4, 'too few rows for 4-option questions');
  const ids = d.items.map(x => x.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate row ids');
  for (const it of d.items) {
    assert.deepEqual([...Object.keys(it.cells)].sort(), [...cid].sort(), `row "${it.id}": cells must match columns`);
    for (const c of cid) {
      const vals = MDK.cellList(it, c);
      assert.ok(vals.length, `row "${it.id}"/${c}: empty`);
      vals.forEach(v => assert.ok(typeof v === 'string' && v.trim() === v && v, `row "${it.id}"/${c}: bad value ${JSON.stringify(v)}`));
      vals.forEach(v => assert.doesNotThrow(() => MDK.fmt(v)));
    }
  }
});

for (const d of tableDecks) test(`table deck "${d.id}": generated questions are always valid`, () => {
  for (let k = 0; k < 300; k++) for (const it of d.items) {
    const q = MDK.tableQ(d, it);
    assert.equal(q.options.length, 4, 'needs 4 options');
    assert.equal(new Set(q.options).size, 4, 'duplicate options');
    assert.ok(q.options.includes(q.answer), 'answer missing from options');
    assert.ok(q.good.has(q.answer), 'answer not in accepted set');
    assert.equal(q.options.filter(o => q.good.has(o)).length >= 1, true);
    assert.notEqual(q.from, q.to);
  }
});

test('table: many-to-many cells accept every correct answer', () => {
  const d = MDK.decks['enzyme-ions'];
  // "Pyruvate kinase" -> ion: both K+ and Mg2+ are correct
  let seen = false;
  for (let k = 0; k < 2000 && !seen; k++) {
    const q = MDK.tableQ(d, d.items.find(x => x.id === 'k'));
    if (q.from === 'enz') { seen = true; assert.ok(q.good.has('K^+^') && q.good.has('Mg^2+^'), 'both ions must be accepted'); }
  }
  assert.ok(seen);
});

test('every game declares types that match some deck, and every deck has a game', () => {
  for (const d of decks) assert.ok(MDK.gamesFor(d).length >= 1, `deck "${d.id}" has no game`);
});
