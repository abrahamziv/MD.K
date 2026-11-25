/* Game (table decks): pick the answer. Shows one cell of a row, asks for another column. */
MDK.registerGame({
  id: 'tmcq', types: ['table'],
  title: 'שאלות על הטבלה',
  desc: 'ארבע אפשרויות, אחת נכונה',
  start(stage, ctx) {
    const { deck } = ctx, esc = MDK.esc, fmt = MDK.fmt;
    const qs = MDK.pick(deck.id, ctx.items, ctx.n), results = [], label = id => deck.cols.find(c => c.id === id).label;
    let i = 0, locked = false, timer = null, cur = null, q = null;

    function show() {
      if (i >= qs.length) return ctx.onDone(results);
      ctx.setProgress(i, qs.length);
      cur = qs[i]; q = MDK.tableQ(deck, cur); locked = false;
      stage.innerHTML = `<div class="q fade">
        <p class="ask">נתון <b dir="ltr" lang="en">${esc(label(q.from))}</b> — מה <b dir="ltr" lang="en">${esc(label(q.to))}</b>?</p>
        <div class="prompt name tprompt" dir="ltr" lang="en"><span>${fmt(q.prompt)}</span></div>
        <div class="opts s2n">${q.options.map((o, k) => `<button class="opt txt" data-v="${esc(o)}"><span class="key">${k + 1}</span><span dir="ltr" lang="en">${fmt(o)}</span></button>`).join('')}</div>
        <div class="after" aria-live="polite"></div></div>`;
      stage.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => answer(b)));
    }

    function answer(b) {
      if (locked) return; locked = true;
      const ok = q.good.has(b.dataset.v);
      stage.querySelectorAll('.opt').forEach(o => {
        o.disabled = true;
        if (o.dataset.v === q.answer || q.good.has(o.dataset.v)) o.classList.add('right');
        else if (o === b) o.classList.add('wrong'); else o.classList.add('dim');
      });
      ctx.record(cur, ok); results.push({ item: cur, ok });
      const after = stage.querySelector('.after');
      if (ok) { after.innerHTML = `<p class="verdict ok">נכון!</p>`; timer = setTimeout(next, 750); }
      else {
        const all = [...q.good].map(v => fmt(v)).join(' · ');
        after.innerHTML = `<p class="verdict bad">לא בדיוק. התשובה הנכונה: <b dir="ltr" lang="en">${all}</b></p><button class="btn primary next">הבא</button>`;
        after.querySelector('.next').addEventListener('click', next);
        after.querySelector('.next').focus({ preventScroll: true });
      }
    }
    function next() { clearTimeout(timer); i++; show(); }
    function onKey(e) {
      if (/^[1-4]$/.test(e.key)) { const b = stage.querySelectorAll('.opt')[+e.key - 1]; if (b && !b.disabled) b.click(); }
      else if (e.key === 'Enter' && locked) { e.preventDefault(); next(); }
    }
    document.addEventListener('keydown', onKey);
    show();
    return { stop() { clearTimeout(timer); document.removeEventListener('keydown', onKey); } };
  }
});
