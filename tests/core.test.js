const test = require('node:test'), assert = require('node:assert/strict');
const { loadMDK } = require('./helpers');

const fresh = () => loadMDK().MDK;
const deck = { id: 't', items: ['a', 'b', 'c', 'd', 'e'].map((id, i) => ({ id, name: id, cat: i < 3 ? 'X' : 'Y', confuse: id === 'a' ? ['d', 'zzz'] : [] })) };

test('esc escapes HTML', () => assert.equal(fresh().esc(`<a href="x">&'`), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;'));

test('shuffle keeps elements and does not mutate', () => {
  const M = fresh(), a = [1, 2, 3, 4, 5], s = M.shuffle(a);
  assert.deepEqual(a, [1, 2, 3, 4, 5]); assert.deepEqual([...s].sort(), a);
});

test('progress: record, streak, weak, mastered', () => {
  const P = fresh().progress;
  assert.deepEqual({ ...P.item('t', 'a') }, { c: 0, w: 0, s: 0 });
  P.record('t', 'a', false);
  assert.ok(P.weak('t', 'a'));
  P.record('t', 'a', true); P.record('t', 'a', true);
  assert.equal(P.item('t', 'a').s, 2); assert.ok(!P.weak('t', 'a')); assert.ok(!P.mastered('t', 'a'));
  P.record('t', 'a', true); assert.ok(P.mastered('t', 'a'));
  P.record('t', 'a', false); assert.equal(P.item('t', 'a').s, 0);
  P.reset('t'); assert.equal(P.item('t', 'a').c, 0);
});

test('progress weight: unseen > mastered, wrong > right', () => {
  const P = fresh().progress;
  P.record('t', 'right', true); P.record('t', 'right', true); P.record('t', 'right', true);
  P.record('t', 'wrong', false);
  assert.ok(P.weight('t', 'new') > P.weight('t', 'right'));
  assert.ok(P.weight('t', 'wrong') > P.weight('t', 'right'));
});

test('pick returns n unique items, capped at pool size', () => {
  const M = fresh();
  const p = M.pick('t', deck.items, 3);
  assert.equal(p.length, 3); assert.equal(new Set(p).size, 3);
  assert.equal(M.pick('t', deck.items, 99).length, 5);
});

test('distractors: n unique, never the item, ignores unknown confuse ids, prefers look-alikes', () => {
  const M = fresh();
  for (let k = 0; k < 50; k++) {
    const d = M.distractors(deck, deck.items[0], 3);
    assert.equal(d.length, 3); assert.equal(new Set(d).size, 3);
    assert.ok(!d.includes(deck.items[0]));
    assert.ok(d.some(x => x.id === 'd'), 'look-alike "d" should always be offered');
  }
});

test('store survives corrupt / unavailable localStorage', () => {
  const { MDK, mem } = loadMDK();
  mem['mdk.settings'] = '{not json';
  assert.equal(MDK.store.get('settings', { ok: 1 }).ok, 1);
});

test('every script in index.html exists and loads', () => {
  const { srcs } = loadMDK(); assert.ok(srcs.length >= 5);
});
