/* App shell: home/setup, play, summary, browse. */
{
  const app = document.getElementById('app'), esc = MDK.esc, P = MDK.progress;
  const S = Object.assign({ subject: null, deck: Object.keys(MDK.decks)[0], game: 'mcq', dir: 's2n', n: 10, cats: [], hints: false, weak: false },
    MDK.store.get('settings', {}));
  if (!MDK.decks[S.deck]) S.deck = Object.keys(MDK.decks)[0];
  const subjectDecks = () => Object.values(MDK.decks).filter(x => x.subject === S.subject);
  const save = () => MDK.store.set('settings', S);
  const deck = () => MDK.decks[S.deck];
  let running = null;

  const setHints = v => { S.hints = v; save(); document.body.classList.toggle('hints-on', v);
    document.querySelectorAll('.hint-tg').forEach(b => b.setAttribute('aria-pressed', v)); };
  setHints(S.hints);

  const pool = () => {
    let it = deck().items;
    if (S.cats.length) it = it.filter(x => S.cats.includes(x.cat));
    if (S.weak) it = it.filter(x => P.weak(S.deck, x.id));
    return it;
  };
  const seg = (key, opts) => `<div class="seg" role="radiogroup">${opts.map(([v, l]) =>
    `<button role="radio" aria-checked="${S[key] === v}" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
  const hintBtn = () => `<button class="hint-tg" aria-pressed="${S.hints}"><span class="dot"></span>רמזי צבע</button>`;

  /* ---------- landing: choose a subject ---------- */
  function landing() {
    stop(); S.subject = null; save();
    app.innerHTML = `
    <header class="hero">
      <div class="brand"><span class="logo" aria-hidden="true">MD</span><div><h1>MD.K</h1><p>הכנה למבחן המיון לרפואה</p></div></div>
    </header>
    <main class="wrap">
      <h2 class="land-h">בחרי מקצוע</h2>
      <div class="subjects">${Object.values(MDK.subjects).map(x => {
        const live = Object.values(MDK.decks).some(d => d.subject === x.id);
        return `<button class="subj ${live ? '' : 'soon'}" data-s="${esc(x.id)}">
          <span class="subj-t">${esc(x.title)}</span><span class="subj-en" dir="ltr" lang="en">${esc(x.en)}</span>
          <span class="subj-b">${live ? 'לתרגול' : 'בקרוב'}</span></button>`; }).join('')}</div>
    </main>`;
    window.scrollTo(0, 0);
    app.querySelectorAll('.subj').forEach(b => b.onclick = () => openSubject(b.dataset.s));
  }
  function openSubject(id) {
    const ds = Object.values(MDK.decks).filter(d => d.subject === id);
    if (!ds.length) return soon(id);
    S.subject = id; if (!ds.some(d => d.id === S.deck)) { S.deck = ds[0].id; S.cats = []; }
    save(); home();
  }
  function soon(id) {
    const x = MDK.subjects[id];
    app.innerHTML = `<div class="play"><div class="playbar"><button class="icon x" aria-label="חזרה">✕</button><h2 class="pb-title">${esc(x.title)}</h2></div>
      <main class="wrap soon-pg fade"><div class="soon-ic" aria-hidden="true">🚧</div><h2>${esc(x.title)} — בקרוב</h2>
      <p class="muted">עוד אין כאן חומר. מוסיפים אותו בהדרגה.</p>
      <button class="btn primary" id="back">לבחירת מקצוע</button></main></div>`;
    app.querySelector('.x').onclick = landing; app.querySelector('#back').onclick = landing;
  }

  /* ---------- home (inside a subject) ---------- */
  function home() {
    stop();
    if (!S.subject) return landing();
    const d = deck(), items = d.items, isT = d.type === 'table', gl = MDK.gamesFor(d);
    if (!gl.some(g => g.id === S.game)) { S.game = gl[0].id; save(); }
    document.body.classList.toggle('hints-on', S.hints && !isT);
    const mast = items.filter(x => P.mastered(d.id, x.id)).length;
    const weakN = items.filter(x => P.weak(d.id, x.id)).length, sample = items[Math.random() * items.length | 0];
    const decks = subjectDecks(), subj = MDK.subjects[S.subject];
    app.innerHTML = `
    <header class="hero">
      <div class="brand"><button class="logo back-logo" id="subjects" aria-label="חזרה לבחירת מקצוע">MD</button><div><h1>${esc(subj.title)}</h1><p>MD.K · אימון כרטיס אחרי כרטיס</p></div></div>
      ${isT ? '' : `<div class="hero-mol" aria-hidden="true">${MDK.render(sample, 'show-hl')}<span dir="ltr">${esc(sample.name)}</span></div>`}
    </header>
    <main class="wrap">
      ${decks.length > 1 ? `<nav class="decks">${decks.map(x => `<button class="deck-tab" aria-pressed="${x.id === d.id}" data-deck="${esc(x.id)}">${esc(x.title)}</button>`).join('')}</nav>` : ''}
      <section class="panel">
        <div class="deck-head">
          <div><h2>${esc(d.title)}</h2><p class="muted">${esc(d.subtitle)} · ${items.length} כרטיסים</p></div>
          <button class="btn ghost" id="browse">עיון בכרטיסים</button>
        </div>
        <div class="mastery"><div class="bar"><i style="width:${(mast / items.length * 100).toFixed(0)}%"></i></div>
          <span>שולטת ב-${mast} מתוך ${items.length}</span></div>

        <h3>משחק</h3>${seg('game', gl.map(g => [g.id, g.title]))}
        ${isT ? '' : `<h3>כיוון</h3>${seg('dir', [['s2n', 'ממבנה לשם'], ['n2s', 'משם למבנה'], ['mix', 'מעורב']])}`}
        ${Object.keys(d.cats).length ? `<h3>נושאים</h3>
        <div class="chips">
          <button class="cat" aria-pressed="${!S.cats.length}" data-cat="">הכל</button>
          ${Object.entries(d.cats).map(([k, l]) => `<button class="cat" aria-pressed="${S.cats.includes(k)}" data-cat="${k}"><span class="sw c-${k}"></span>${esc(l)}</button>`).join('')}
        </div>` : ''}
        <h3>אורך סבב</h3>${seg('n', [[10, '10'], [20, '20'], [0, 'הכל']])}
        <div class="toggles">
          ${isT ? '' : hintBtn()}
          <button class="tg" id="weak" aria-pressed="${S.weak}" ${weakN ? '' : 'disabled'}><span class="dot"></span>רק מה שצריך חזרה${weakN ? ` (${weakN})` : ''}</button>
        </div>
        <p class="warn" id="warn" hidden></p>
        <button class="btn primary big" id="go">התחילי</button>
      </section>
      <footer class="foot"><span>${esc(d.source)}</span><button class="link" id="reset">איפוס התקדמות</button></footer>
    </main>`;

    app.querySelectorAll('.seg button').forEach(b => b.onclick = () => {
      const k = b.dataset.k; S[k] = k === 'n' ? +b.dataset.v : b.dataset.v; save(); home(); });
    app.querySelectorAll('.cat').forEach(b => b.onclick = () => {
      const c = b.dataset.cat;
      S.cats = !c ? [] : S.cats.includes(c) ? S.cats.filter(x => x !== c) : [...S.cats, c];
      if (S.cats.length === Object.keys(d.cats).length) S.cats = [];
      save(); home(); });
    app.querySelectorAll('.deck-tab').forEach(b => b.onclick = () => { S.deck = b.dataset.deck; S.cats = []; save(); home(); });
    const ht = app.querySelector('.hint-tg'); if (ht) ht.onclick = () => setHints(!S.hints);
    app.querySelector('#weak').onclick = () => { S.weak = !S.weak; save(); home(); };
    app.querySelector('#subjects').onclick = landing;
    app.querySelector('#browse').onclick = browse;
    app.querySelector('#reset').onclick = () => confirmBox('לאפס את כל ההתקדמות בחפיסה הזו?', () => { P.reset(d.id); S.weak = false; save(); home(); });
    app.querySelector('#go').onclick = () => {
      const items = pool();
      if (items.length < 2) { const w = app.querySelector('#warn'); w.hidden = false; w.textContent = 'צריך לפחות 2 כרטיסים. בחרי עוד נושאים.'; return; }
      play(items);
    };
  }

  /* ---------- play ---------- */
  function play(items) {
    stop();
    const d = deck(), n = Math.min(S.n || items.length, items.length);
    app.innerHTML = `<div class="play">
      <div class="playbar"><button class="icon x" aria-label="יציאה">✕</button>
        <div class="meter"><i></i></div><span class="count"></span>${d.type === 'table' ? '' : hintBtn()}</div>
      <div class="stage wrap"></div></div>`;
    const stage = app.querySelector('.stage'), meter = app.querySelector('.meter i'), count = app.querySelector('.count');
    app.querySelector('.x').onclick = home;
    const ht = app.querySelector('.hint-tg'); if (ht) ht.onclick = () => setHints(!S.hints);
    window.scrollTo(0, 0);
    running = MDK.games[S.game].start(stage, {
      deck: d, items, n, dir: S.dir,
      setProgress(i, t) { meter.style.width = (i / t * 100) + '%'; count.textContent = `${i}/${t}`; },
      record(it, ok) { P.record(d.id, it.id, ok); },
      onDone(res) { summary(res, items); }
    });
  }

  /* ---------- summary ---------- */
  function summary(res, items) {
    stop();
    const ok = res.filter(r => r.ok).length, t = res.length, pct = t ? Math.round(ok / t * 100) : 0;
    const missed = [...new Map(res.filter(r => !r.ok).map(r => [r.item.id, r.item])).values()];
    const msg = pct === 100 ? 'מושלם! דוקטור K בדרך.' : pct >= 80 ? 'יפה מאוד! עוד קצת וזה סגור.' : pct >= 50 ? 'בכיוון הנכון. בואי נחזור על הטעויות.' : 'זה בסדר, ככה לומדים. שווה לעבור על הכרטיסים.';
    app.innerHTML = `<main class="wrap summary fade">
      <div class="score"><div class="ring" style="--p:${pct}"><span>${ok}<small>/${t}</small></span></div>
        <div><h2>${msg}</h2><p class="muted">${pct}% נכון בניסיון הראשון</p></div></div>
      ${missed.length ? `<h3>לחזור על אלה</h3><div class="grid">${missed.map(card).join('')}</div>` : ''}
      <div class="actions">
        ${missed.length ? `<button class="btn primary" id="again-missed">תרגול הטעויות (${missed.length})</button>` : ''}
        <button class="btn ${missed.length ? '' : 'primary'}" id="again">סבב נוסף</button>
        <button class="btn ghost" id="menu">לתפריט</button>
      </div></main>`;
    window.scrollTo(0, 0);
    app.querySelector('#again').onclick = () => play(items);
    app.querySelector('#menu').onclick = home;
    const am = app.querySelector('#again-missed');
    if (am) am.onclick = () => play(missed.length >= 2 ? missed : [...missed, ...(deck().type === 'table' ? deck().items.filter(x => x !== missed[0]).slice(0, 1) : MDK.distractors(deck(), missed[0], 1))]);
  }

  /* ---------- browse ---------- */
  function card(it) {
    const r = P.item(S.deck, it.id), n = r.c + r.w, d = deck();
    const head = d.type === 'table'
      ? `<div class="fname" dir="ltr" lang="en">${MDK.fmt(MDK.cellList(it, d.cols[0].id).join(', '))}</div><div class="vals" dir="ltr" lang="en">${d.cols.slice(1).map(c => MDK.fmt(MDK.cellList(it, c.id).join(', '))).join('<br>')}</div>`
      : `<div class="fpic">${MDK.render(it)}</div><div class="fname" dir="ltr" lang="en">${esc(it.name)}</div>`;
    return `<div class="fcard">${head}
      <div class="fstat">${n ? `${r.c}/${n} נכון${P.mastered(S.deck, it.id) ? ' · <b class="okc">נשלט</b>' : ''}` : 'עוד לא תורגל'}</div></div>`;
  }
  function browse() {
    stop();
    const d = deck(), isT = d.type === 'table';
    const tableView = () => `<div class="twrap"><table class="tbl" dir="ltr" lang="en"><thead><tr>${d.cols.map(c => `<th>${esc(c.label)}</th>`).join('')}<th></th></tr></thead><tbody>${d.items.map(it => {
      const r = P.item(d.id, it.id), n = r.c + r.w;
      return `<tr>${d.cols.map(c => `<td>${MDK.fmt(MDK.cellList(it, c.id).join(', '))}</td>`).join('')}<td class="muted" dir="rtl">${n ? `${r.c}/${n}` : ''}${P.mastered(d.id, it.id) ? ' ✓' : ''}</td></tr>`; }).join('')}</tbody></table></div>`;
    app.innerHTML = `<div class="play"><div class="playbar"><button class="icon x" aria-label="חזרה">✕</button>
      <h2 class="pb-title">${esc(d.title)}</h2>${isT ? '' : hintBtn()}</div>
      <main class="wrap">${isT ? tableView() : Object.entries(d.cats).map(([k, l]) => {
        const its = d.items.filter(x => x.cat === k);
        return its.length ? `<h3 class="cat-h"><span class="sw c-${k}"></span>${esc(l)}</h3><div class="grid">${its.map(card).join('')}</div>` : '';
      }).join('')}</main></div>`;
    window.scrollTo(0, 0);
    app.querySelector('.x').onclick = home;
    const ht = app.querySelector('.hint-tg'); if (ht) ht.onclick = () => setHints(!S.hints);
  }

  function confirmBox(text, yes) {
    const el = document.createElement('div'); el.className = 'modal';
    el.innerHTML = `<div class="box" role="dialog" aria-modal="true"><p>${esc(text)}</p><div class="actions"><button class="btn danger" id="y">איפוס</button><button class="btn ghost" id="n">ביטול</button></div></div>`;
    document.body.appendChild(el);
    el.querySelector('#y').onclick = () => { el.remove(); yes(); };
    el.querySelector('#n').onclick = () => el.remove();
  }

  function stop() { if (running && running.stop) running.stop(); running = null; }
  S.subject ? home() : landing();
}
