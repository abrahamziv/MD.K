/* Game (table decks): fill the table. Rows appear as in the book with one blank each;
   drag a term onto its blank (or tap the term, then the blank). Multi-value cells blank one value. */
MDK.registerGame({
  id: 'tfill', types: ['table'],
  title: 'השלמת הטבלה',
  desc: 'הטבלה מהספר, עם חורים להשלים',
  start(stage, ctx) {
    const { deck } = ctx, esc = MDK.esc, fmt = MDK.fmt, per = 6;
    const all = MDK.pick(deck.id, ctx.items, ctx.n), rounds = [], results = [];
    for (let k = 0; k < all.length; k += per) rounds.push(all.slice(k, k + per));
    if (rounds.length > 1 && rounds[rounds.length - 1].length < 2) rounds[rounds.length - 2].push(...rounds.pop());
    let r = 0, done = 0, sel = null, timer = null, drag = null;

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
      stage.innerHTML = `<div class="tfill fade"><p class="ask">גררי כל מונח לחור שלו (או הקישי על מונח ואז על החור)</p>
        <div class="twrap"><table class="tbl" dir="ltr"><thead><tr>${deck.cols.map(c => `<th>${esc(c.label)}</th>`).join('')}</tr></thead>
        <tbody>${set.map(it => `<tr data-row="${esc(it.id)}">${deck.cols.map(c => cell(it, c)).join('')}</tr>`).join('')}</tbody></table></div>
        <div class="tray tfill-tray">${chips.map(v => `<button class="chip tchip" dir="ltr" lang="en" data-v="${esc(v)}">${fmt(v)}</button>`).join('')}</div></div>`;

      const select = c => { sel = sel === c ? null : c; stage.querySelectorAll('.tchip').forEach(x => x.classList.toggle('sel', x === sel)); };
      const holes = [...stage.querySelectorAll('.hole')];
      const hover = h => holes.forEach(x => x.classList.toggle('over', x === h));
      /* the blank under a screen point (the whole table cell counts, so the target is easy to hit) */
      const under = (x, y) => { const el = document.elementFromPoint(x, y), td = el && el.closest('td');
        return td ? td.querySelector('.hole:not(.filled)') : null; };

      function place(chip, h) {
        const row = h.dataset.row, it = set.find(x => x.id === row);
        select(null);
        if (chip.dataset.v === h.dataset.v) {
          h.innerHTML = fmt(h.dataset.v); h.classList.add('filled'); chip.disabled = true; chip.classList.add('used');
          ctx.record(it, !wrong.has(row)); results.push({ item: it, ok: !wrong.has(row) }); done++; ctx.setProgress(done, all.length);
          if (!--left) { r++; timer = setTimeout(round, 650); }
        } else {
          wrong.add(row); h.classList.remove('shake'); void h.offsetWidth; h.classList.add('shake');
        }
      }

      /* tap a term, then tap a blank */
      holes.forEach(h => {
        const go = () => { if (sel && !h.classList.contains('filled')) place(sel, h); };
        h.addEventListener('click', go);
        h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });

      /* or drag a term onto a blank (mouse + touch); the page scrolls when held near an edge */
      const autoScroll = () => {
        if (!drag || !drag.ghost) return;
        const y = drag.py, tray = stage.querySelector('.tray').getBoundingClientRect(), edge = 90;
        const bottom = Math.min(innerHeight, tray.top);          // the tray covers the lower part of the screen
        if (y < edge) scrollBy(0, -Math.ceil((edge - y) / 6));
        else if (y < bottom && y > bottom - edge) scrollBy(0, Math.ceil((y - bottom + edge) / 6));
        drag.raf = requestAnimationFrame(autoScroll);
      };
      stage.querySelectorAll('.tchip').forEach(chip => {
        chip.addEventListener('pointerdown', e => {
          if (chip.disabled || e.button > 0) return;
          drag = { chip, x0: e.clientX, y0: e.clientY, ghost: null };
          try { chip.setPointerCapture(e.pointerId); } catch (_) {}
        });
        chip.addEventListener('pointermove', e => {
          if (!drag || drag.chip !== chip) return;
          if (!drag.ghost && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) {
            const bx = chip.getBoundingClientRect(), g = chip.cloneNode(true);
            g.classList.add('drag-ghost'); g.style.width = bx.width + 'px';
            document.body.appendChild(g);
            drag.ghost = g; drag.ox = e.clientX - bx.left; drag.oy = e.clientY - bx.top;
            chip.classList.add('lifted'); select(null);
          }
          if (drag.ghost) {
            drag.ghost.style.transform = `translate(${e.clientX - drag.ox}px, ${e.clientY - drag.oy}px) rotate(-2deg)`;
            hover(under(e.clientX, e.clientY));
            drag.py = e.clientY; if (!drag.raf) autoScroll();
          }
        });
        const end = (e, cancel) => {
          if (!drag || drag.chip !== chip) return;
          const d = drag; drag = null; hover(null); cancelAnimationFrame(d.raf);
          if (d.ghost) {
            d.ghost.remove(); chip.classList.remove('lifted');
            const h = !cancel && under(e.clientX, e.clientY);
            if (h) place(chip, h);
          } else if (!cancel && !chip.disabled) select(chip);
        };
        chip.addEventListener('pointerup', e => end(e, false));
        chip.addEventListener('pointercancel', e => end(e, true));
      });
    }
    round();
    return { stop() { clearTimeout(timer); if (drag && drag.ghost) drag.ghost.remove(); } };
  }
});
