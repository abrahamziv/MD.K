/* Game (table decks): fill the table. Rows appear as in the book with one blank each;
   tap a term, then tap the blank it belongs to. Multi-value cells blank one value. */
MDK.registerGame({
  id: 'tfill', types: ['table'],
  title: 'השלמת הטבלה',
  desc: 'הטבלה מהספר, עם חורים להשלים',
  start(stage, ctx) {
    const { deck } = ctx, esc = MDK.esc, fmt = MDK.fmt, per = 6;
    const all = MDK.pick(deck.id, ctx.items, ctx.n), rounds = [], results = [];
    for (let k = 0; k < all.length; k += per) rounds.push(all.slice(k, k + per));
    if (rounds.length > 1 && rounds[rounds.length - 1].length < 2) rounds[rounds.length - 2].push(...rounds.pop());
    let r = 0, done = 0, sel = null, timer = null;

    function round() {
      if (r >= rounds.length) return ctx.onDone(results);
      ctx.setProgress(done, all.length);
      const set = rounds[r], wrong = new Set(); let left = set.length; sel = null;
      // one blank per row: random column, and a random value inside multi-value cells
      const blank = new Map(set.map(it => {
        const col = MDK.shuffle(deck.cols.map(c => c.id))[0], n = MDK.cellList(it, col).length;
        return [it.id, { col, idx: n > 1 ? Math.random() * n | 0 : 0 }];
      }));
      const cell = (it, c) => {
        const b = blank.get(it.id), vals = MDK.cellList(it, c.id);
        const inner = vals.map((v, i) => b && b.col === c.id && b.idx === i
          ? `<span class="hole" data-row="${esc(it.id)}" data-v="${esc(v)}" role="button" tabindex="0" aria-label="חור להשלמה"></span>`
          : `<span>${fmt(v)}</span>`).join(vals.length > 1 ? '<span class="sep">, </span>' : '');
        return `<td dir="ltr" lang="en">${inner}</td>`;
      };
      const chips = MDK.shuffle(set).map(it => { const b = blank.get(it.id); return MDK.cellList(it, b.col)[b.idx]; });
      stage.innerHTML = `<div class="tfill fade"><p class="ask">הקישי על מונח, ואז על החור שמתאים לו</p>
        <div class="twrap"><table class="tbl" dir="ltr"><thead><tr>${deck.cols.map(c => `<th>${esc(c.label)}</th>`).join('')}</tr></thead>
        <tbody>${set.map(it => `<tr data-row="${esc(it.id)}">${deck.cols.map(c => cell(it, c)).join('')}</tr>`).join('')}</tbody></table></div>
        <div class="tray tfill-tray">${chips.map(v => `<button class="chip tchip" dir="ltr" lang="en" data-v="${esc(v)}">${fmt(v)}</button>`).join('')}</div></div>`;

      const select = c => { sel = sel === c ? null : c; stage.querySelectorAll('.tchip').forEach(x => x.classList.toggle('sel', x === sel)); };
      const holes = [...stage.querySelectorAll('.hole')];
      stage.querySelectorAll('.tchip').forEach(c => c.addEventListener('click', () => !c.disabled && select(c)));
      holes.forEach(h => {
        const go = () => {
          if (!sel || h.classList.contains('filled')) return;
          const chip = sel, row = h.dataset.row, it = set.find(x => x.id === row);
          select(null);
          if (chip.dataset.v === h.dataset.v) {
            h.innerHTML = fmt(h.dataset.v); h.classList.add('filled'); chip.disabled = true; chip.classList.add('used');
            ctx.record(it, !wrong.has(row)); results.push({ item: it, ok: !wrong.has(row) }); done++; ctx.setProgress(done, all.length);
            if (!--left) { r++; timer = setTimeout(round, 650); }
          } else {
            wrong.add(row); h.classList.remove('shake'); void h.offsetWidth; h.classList.add('shake');
          }
        };
        h.addEventListener('click', go);
        h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
    }
    round();
    return { stop() { clearTimeout(timer); } };
  }
});
