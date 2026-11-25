/* Data integrity for every registered deck. New decks are checked automatically. */
const test = require('node:test'), assert = require('node:assert/strict');
const { loadMDK } = require('./helpers');
const { MDK } = loadMDK();
const decks = Object.values(MDK.decks);

test('at least one deck is registered', () => assert.ok(decks.length >= 1));

for (const d of decks) test(`deck "${d.id}" is well-formed`, () => {
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
