/* Game: drag & drop matching (touch + mouse). Tap a chip, then tap a target, works too. */
MDK.registerGame({
  id: 'dnd', types: ['structure'],
  title: 'גרירה והתאמה',
  desc: 'גררי כל כרטיס למקום שלו',
  start(stage, ctx) {
    const { deck } = ctx, esc = MDK.esc;
    const per = matchMedia('(min-width: 760px)').matches ? 6 : 4;
    const all = MDK.pick(deck.id, ctx.items, ctx.n), rounds = [];
    for (let k = 0; k < all.length; k += per) rounds.push(all.slice(k, k + per));
    if (rounds.length > 1 && rounds[rounds.length - 1].length < 2) rounds[rounds.length - 2].push(...rounds.pop());
    const results = [];
    let r = 0, done = 0, drag = null, sel = null, timer = null;
    const wide = it => MDK.molWidth(it) >= 3.8 ? ' wide' : '';

    /* scroll the page while a chip is held near the top/bottom edge */
    function autoScroll() {
      if (!drag || !drag.ghost) return;
      const y = drag.py, h = innerHeight, edge = 110;
      if (y < edge) scrollBy(0, -Math.ceil((edge - y) / 8));
      else if (y > h - edge) scrollBy(0, Math.ceil((y - h + edge) / 8));
      drag.raf = requestAnimationFrame(autoScroll);
    }

    function round() {
      if (r >= rounds.length) return ctx.onDone(results);
      ctx.setProgress(done, all.length);
      const set = rounds[r], dir = ctx.dir === 'mix' ? (r % 2 ? 'n2s' : 's2n') : ctx.dir;
      const wrong = new Set(); let left = set.length; sel = null;
      const tg = MDK.shuffle(set).map(it => dir === 's2n'
        ? `<div class="tgt${wide(it)}" data-id="${esc(it.id)}"><div class="tgt-main">${MDK.render(it)}</div><div class="slot"></div></div>`
        : `<div class="tgt" data-id="${esc(it.id)}"><div class="tgt-main name" dir="ltr" lang="en">${esc(it.name)}</div><div class="slot pic"></div></div>`).join('');
      const chips = MDK.shuffle(set).map(it => dir === 's2n'
        ? `<button class="chip" data-id="${esc(it.id)}" dir="ltr" lang="en">${esc(it.name)}</button>`
        : `<button class="chip pic" data-id="${esc(it.id)}" aria-label="מבנה">${MDK.render(it)}</button>`).join('');
      stage.innerHTML = `<div class="dnd fade"><p class="ask">${dir === 's2n' ? 'גררי כל שם למבנה שלו' : 'גררי כל מבנה לשם שלו'}</p>
        <div class="board ${dir}">${tg}</div><div class="tray ${dir}">${chips}</div></div>`;

      const targets = [...stage.querySelectorAll('.tgt')];
      const under = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.closest('.tgt:not(.done)'); };
      const hover = t => targets.forEach(x => x.classList.toggle('over', x === t));
      const select = c => { sel = sel === c ? null : c; stage.querySelectorAll('.chip').forEach(x => x.classList.toggle('sel', x === sel)); stage.classList.toggle('armed', !!sel); };

      function tryMatch(chip, tgt) {
        const id = chip.dataset.id, tid = tgt.dataset.id;
        select(null); stage.classList.remove('armed');
        if (id === tid) {
          const it = set.find(x => x.id === tid), ok = !wrong.has(tid);
          tgt.querySelector('.slot').appendChild(chip);
          chip.disabled = true; chip.classList.add('placed'); tgt.classList.add('done');
          ctx.record(it, ok); results.push({ item: it, ok }); done++; ctx.setProgress(done, all.length);
          if (!--left) { r++; timer = setTimeout(round, 650); }
        } else {
          wrong.add(tid);
          tgt.classList.remove('shake'); void tgt.offsetWidth; tgt.classList.add('shake');
        }
      }

      stage.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('pointerdown', e => {
          if (chip.disabled || e.button > 0) return;
          drag = { chip, x0: e.clientX, y0: e.clientY, ghost: null };
          try { chip.setPointerCapture(e.pointerId); } catch (_) {}
        });
        chip.addEventListener('pointermove', e => {
          if (!drag || drag.chip !== chip) return;
          if (!drag.ghost && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) {
            const b = chip.getBoundingClientRect(), g = chip.cloneNode(true);
            g.classList.add('drag-ghost'); g.style.width = b.width + 'px'; g.style.height = b.height + 'px';
            document.body.appendChild(g);
            drag.ghost = g; drag.ox = e.clientX - b.left; drag.oy = e.clientY - b.top;
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
            const t = !cancel && under(e.clientX, e.clientY);
            if (t) tryMatch(chip, t);
          } else if (!cancel) select(chip);
        };
        chip.addEventListener('pointerup', e => end(e, false));
        chip.addEventListener('pointercancel', e => end(e, true));
      });
      targets.forEach(t => t.addEventListener('click', () => { if (sel && !t.classList.contains('done')) tryMatch(sel, t); }));
    }

    round();
    return { stop() { clearTimeout(timer); document.querySelectorAll('.drag-ghost').forEach(g => g.remove()); } };
  }
});
