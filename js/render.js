/* Structure renderer: deck data -> SVG.
   Structure format:
     a: atoms  [x, y, 'label', charge?]   (bond length = 1 unit; y points down)
               labels: 'C','O','OH','R','R1'... trailing digit becomes a superscript
               charge: '+' or '−'
     b: bonds  [i, j, order]               order 1/2/3 (default 1)
     h: indices of atoms inside the colored hint box                         */
(function () {
  const U = 46, PAD = 22, FS = 17;
  const HL = { C: '#8a92a0', O: '#ff6b4a', N: '#2f9be0', S: '#f2c40f', P: '#ff9f1c' };
  
  const parse = l => { const m = /^([A-Za-z]+?)(\d)?$/.exec(l); return m ? { t: m[1], sup: m[2] || '' } : { t: l, sup: '' }; };
  const half = t => ({ w: 5.6 * t.length + 3, h: 10 });

  MDK.molWidth = item => { const xs = item.s.a.map(a => a[0]); return Math.max(...xs) - Math.min(...xs); };

  MDK.render = function (item, cls) {
    const s = item.s, A = s.a;
    const xs = A.map(a => a[0]), ys = A.map(a => a[1]);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    const W = (Math.max(...xs) - minX) * U + PAD * 2, H = (Math.max(...ys) - minY) * U + PAD * 2;
    const P = A.map(a => { const p = parse(a[2]); return { x: (a[0] - minX) * U + PAD, y: (a[1] - minY) * U + PAD, t: p.t, sup: p.sup, ch: a[3] || '' }; });

    // hint box: one shape per atom + thick strokes along bonds, drawn as a group so overlaps don't darken
    const hset = new Set(s.h || []);
    let hl = '';
    for (const i of hset) { const p = P[i], d = half(p.t); hl += `<rect x="${p.x - d.w - 4}" y="${p.y - 14}" width="${2 * d.w + 8}" height="28" rx="3"/>`; }
    for (const [i, j] of s.b) if (hset.has(i) && hset.has(j)) hl += `<line x1="${P[i].x}" y1="${P[i].y}" x2="${P[j].x}" y2="${P[j].y}" stroke-width="26" stroke-linecap="round"/>`;
    const col = HL[item.cat] || HL.C;

    // bonds, trimmed so they stop at the label edge
    const trim = (p, ux, uy) => { const d = half(p.t); return Math.min(ux ? d.w / Math.abs(ux) : 1e9, uy ? d.h / Math.abs(uy) : 1e9) + 2; };
    let bonds = '';
    for (const [i, j, o = 1] of s.b) {
      const p = P[i], q = P[j], dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      const t1 = trim(p, ux, uy), t2 = trim(q, ux, uy);
      const x1 = p.x + ux * t1, y1 = p.y + uy * t1, x2 = q.x - ux * t2, y2 = q.y - uy * t2, nx = -uy, ny = ux;
      const offs = o === 2 ? [-3, 3] : o === 3 ? [-4.5, 0, 4.5] : [0];
      for (const k of offs) bonds += `<line x1="${(x1 + nx * k).toFixed(1)}" y1="${(y1 + ny * k).toFixed(1)}" x2="${(x2 + nx * k).toFixed(1)}" y2="${(y2 + ny * k).toFixed(1)}"/>`;
    }

    let labels = '';
    for (const p of P) {
      const d = half(p.t);
      labels += `<text x="${p.x}" y="${p.y}">${p.t}</text>`;
      const sup = p.sup + (p.ch === '+' ? '+' : p.ch ? '−' : '');
      if (sup) labels += `<text class="sup" x="${p.x + d.w - 1}" y="${p.y - 8}">${sup}</text>`;
    }

    return `<svg direction="ltr" class="mol ${cls || ''}" viewBox="0 0 ${W} ${H}" style="--w:${W}px" role="img" aria-label="מבנה">
<g class="hl" fill="${col}" stroke="${col}">${hl}</g>
<g class="bonds" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">${bonds}</g>
<g class="lbl" fill="currentColor" font-size="${FS}" text-anchor="middle" dominant-baseline="central">${labels}</g></svg>`;
  };
})();
