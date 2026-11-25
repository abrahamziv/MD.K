/* MD.K — core: registries, storage, progress, helpers.
   Decks call MDK.registerDeck({...}); games call MDK.registerGame({...}). */
window.MDK = (function () {
  const decks = {}, games = {}, subjects = {};

  const store = {
    get(k, d) { try { const v = localStorage.getItem('mdk.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('mdk.' + k, JSON.stringify(v)); } catch (e) {} }
  };

  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Progress per deck/item: c = correct, w = wrong, s = current streak, t = last seen */
  const progress = {
    all() { return store.get('progress', {}); },
    item(deck, id) { return ((this.all()[deck] || {})[id]) || { c: 0, w: 0, s: 0 }; },
    record(deck, id, ok) {
      const a = this.all(); a[deck] = a[deck] || {};
      const r = a[deck][id] || { c: 0, w: 0, s: 0 };
      if (ok) { r.c++; r.s = (r.s || 0) + 1; } else { r.w++; r.s = 0; }
      r.t = Date.now(); a[deck][id] = r; store.set('progress', a);
    },
    reset(deck) { const a = this.all(); delete a[deck]; store.set('progress', a); },
    /* higher = needs more practice */
    weight(deck, id) {
      const r = this.item(deck, id), n = r.c + r.w;
      if (!n) return 2;
      return Math.max(0.3, 1 + 2 * (r.w / n) + (r.s === 0 ? 1 : 0) - Math.min(r.s, 4) * 0.2);
    },
    weak(deck, id) { const r = this.item(deck, id); return r.w > 0 && r.s < 2; },
    mastered(deck, id) { return this.item(deck, id).s >= 3; }
  };

  /* Weighted sample without replacement: weak items come up more often */
  function pick(deckId, items, n) {
    const pool = items.map(it => ({ it, w: progress.weight(deckId, it.id) })), out = [];
    while (out.length < n && pool.length) {
      let r = Math.random() * pool.reduce((s, p) => s + p.w, 0), i = 0;
      for (; i < pool.length - 1; i++) { r -= pool[i].w; if (r <= 0) break; }
      out.push(pool.splice(i, 1)[0].it);
    }
    return out;
  }

  /* Wrong answers: up to 2 look-alikes, then same category, then anything */
  function distractors(deck, item, n) {
    const byId = id => deck.items.find(x => x.id === id);
    const conf = shuffle((item.confuse || []).map(byId).filter(Boolean)).slice(0, 2);
    const same = shuffle(deck.items.filter(x => x.cat === item.cat));
    const rest = shuffle(deck.items);
    const out = [];
    for (const x of [...conf, ...same, ...rest]) {
      if (out.length >= n) break;
      if (x.id !== item.id && !out.includes(x)) out.push(x);
    }
    return out;
  }

  return {
    decks, games, subjects, store, progress, shuffle, esc, pick, distractors,
    registerSubject(x) { subjects[x.id] = x; },
    registerDeck(d) { decks[d.id] = d; },
    registerGame(g) { games[g.id] = g; }
  };
})();
