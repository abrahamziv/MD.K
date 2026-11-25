/* Game: multiple choice. Structure -> name, or name -> structure. */
MDK.registerGame({
  id: 'mcq',
  title: 'שאלות אמריקאיות',
  desc: 'ארבע אפשרויות, אחת נכונה',
  start(stage, ctx) {
    const { deck } = ctx, esc = MDK.esc;
    const qs = MDK.pick(deck.id, ctx.items, ctx.n), results = [];
    let i = 0, locked = false, timer = null, cur = null;

    function show() {
      if (i >= qs.length) return ctx.onDone(results);
      ctx.setProgress(i, qs.length);
      const it = qs[i], dir = ctx.dir === 'mix' ? (Math.random() < .5 ? 's2n' : 'n2s') : ctx.dir;
      const opts = MDK.shuffle([it, ...MDK.distractors(deck, it, 3)]);
      cur = it; locked = false;
      const prompt = dir === 's2n'
        ? `<p class="ask">מה שם הקבוצה?</p><div class="prompt">${MDK.render(it)}</div>`
        : `<p class="ask">איזה מבנה מתאים לשם?</p><div class="prompt name" dir="ltr" lang="en">${esc(it.name)}</div>`;
      const btns = opts.map((o, k) => dir === 's2n'
        ? `<button class="opt txt" data-id="${esc(o.id)}"><span class="key">${k + 1}</span><span dir="ltr" lang="en">${esc(o.name)}</span></button>`
        : `<button class="opt pic" data-id="${esc(o.id)}"><span class="key">${k + 1}</span>${MDK.render(o)}</button>`).join('');
      stage.innerHTML = `<div class="q fade">${prompt}<div class="opts ${dir}">${btns}</div><div class="after" aria-live="polite"></div></div>`;
      stage.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => answer(b)));
    }

    function answer(b) {
      if (locked) return; locked = true;
      const it = cur, ok = b.dataset.id === it.id;
      stage.querySelectorAll('.opt').forEach(o => {
        o.disabled = true;
        if (o.dataset.id === it.id) o.classList.add('right');
        else if (o === b) o.classList.add('wrong');
        else o.classList.add('dim');
      });
      ctx.record(it, ok); results.push({ item: it, ok });
      const after = stage.querySelector('.after');
      if (ok) {
        after.innerHTML = `<p class="verdict ok">נכון!</p>`;
        timer = setTimeout(next, 750);
      } else {
        after.innerHTML = `<p class="verdict bad">לא בדיוק. התשובה הנכונה: <b dir="ltr" lang="en">${esc(it.name)}</b></p><button class="btn primary next">הבא</button>`;
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
