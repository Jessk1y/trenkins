// Лёгкий SVG-график по времени без библиотек. Ширина 100% контейнера, цвета — из CSS-токенов.
//
// lineChart({
//   series: [{ points: [{ t, y, tip?: [строка, ...] }], color: 'var(--accent)', line: true, dots: 'all'|'last'|'none',
//              width: 2, dotR: 3, area: false, dashed: false, hit: false }],
//   refLines: [{ y, label, color }],          // горизонтальные линии (цель)
//   height: 200, mini: false,                 // mini — без осей и подсказок (спарклайн)
//   fmtY: (v) => string, xDomain: [t0, t1], yMin, yMax,
//   ariaLabel,
// }) → HTMLElement
// Подсказка берётся с первой серии с hit:true (или первой): касание/наведение выбирает ближайшую точку.

import { fmtDate } from '../core/util.js';

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}, style = null) => {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (style) Object.assign(el.style, style);
  return el;
};

/** «Красивые» засечки оси Y: возвращает { ticks, min, max } */
export function niceTicks(lo, hi, count = 4) {
  if (!(hi > lo)) { const d = Math.abs(lo) * 0.05 || 1; lo -= d; hi += d; }
  const raw = (hi - lo) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const min = Math.floor(lo / step + 1e-9) * step;
  const max = Math.ceil(hi / step - 1e-9) * step;
  const ticks = [];
  for (let v = min; v <= max + step / 2; v += step) ticks.push(Math.round(v / step * 1e6) / 1e6 * step);
  return { ticks, min, max };
}

export function lineChart(opts) {
  const { series = [], refLines = [], height = 200, mini = false, fmtY = (v) => String(Math.round(v * 10) / 10), ariaLabel = 'График' } = opts;
  const wrap = document.createElement('div');
  wrap.className = 'chart' + (mini ? ' mini' : '');
  wrap.style.height = height + 'px';
  wrap.setAttribute('role', 'img');
  wrap.setAttribute('aria-label', ariaLabel);

  const all = series.flatMap((s) => s.points);
  if (!all.length) return wrap;

  let selected = null;     // индекс точки в hit-серии
  let lastW = 0;
  const hitSeries = series.find((s) => s.hit) || series[0];

  function draw(W) {
    wrap.replaceChildren();
    const H = height;
    // --- домены
    let t0 = opts.xDomain ? opts.xDomain[0] : Math.min(...all.map((p) => p.t));
    let t1 = opts.xDomain ? opts.xDomain[1] : Math.max(...all.map((p) => p.t));
    if (t1 - t0 < 86400000) { const mid = (t0 + t1) / 2; t0 = mid - 3 * 86400000; t1 = mid + 3 * 86400000; }
    let ys = all.map((p) => p.y).concat(refLines.map((r) => r.y));
    let lo = opts.yMin ?? Math.min(...ys), hi = opts.yMax ?? Math.max(...ys);
    const pad = (hi - lo) * 0.08;
    if (opts.yMin == null) lo -= pad;
    if (opts.yMax == null) hi += pad;
    const nt = niceTicks(lo, hi, mini ? 2 : H > 170 ? 4 : 3);
    const yMin = nt.min, yMax = nt.max;

    const labelW = mini ? 0 : Math.max(...nt.ticks.map((v) => fmtY(v).length)) * 6.6 + 10;
    const m = mini ? { l: 6, r: 6, t: 6, b: 6 } : { l: labelW, r: 12, t: 10, b: 24 };
    const pw = Math.max(10, W - m.l - m.r), ph = Math.max(10, H - m.t - m.b);
    const X = (t) => m.l + ((t - t0) / (t1 - t0)) * pw;
    const Y = (v) => m.t + (1 - (v - yMin) / (yMax - yMin)) * ph;

    const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
    svg.style.display = 'block';
    svg.style.touchAction = 'pan-y';

    // --- сетка и подписи Y
    if (!mini) {
      for (const v of nt.ticks) {
        const y = Y(v);
        svg.append(svgEl('line', { x1: m.l, x2: W - m.r, y1: y, y2: y }, { stroke: 'var(--line)', strokeWidth: 1 }));
        const tx = svgEl('text', { x: m.l - 6, y: y + 4, 'text-anchor': 'end' }, { fill: 'var(--muted)', fontSize: '11px', fontVariantNumeric: 'tabular-nums' });
        tx.textContent = fmtY(v);
        svg.append(tx);
      }
      // подписи X (реальные даты)
      const n = Math.max(2, Math.min(5, Math.floor(pw / 78)));
      for (let i = 0; i < n; i++) {
        const t = t0 + ((t1 - t0) * i) / (n - 1);
        const x = X(t);
        const tx = svgEl('text', { x, y: H - 6, 'text-anchor': i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle' }, { fill: 'var(--muted)', fontSize: '11px' });
        tx.textContent = fmtDate(t);
        svg.append(tx);
      }
    }

    // --- опорные линии
    for (const r of refLines) {
      const y = Y(r.y);
      svg.append(svgEl('line', { x1: m.l, x2: W - m.r, y1: y, y2: y }, { stroke: r.color || 'var(--good)', strokeWidth: 1.5, strokeDasharray: '5 4' }));
      if (r.label && !mini) {
        const above = y > m.t + 14;
        const tx = svgEl('text', { x: W - m.r - 2, y: above ? y - 5 : y + 13, 'text-anchor': 'end' }, { fill: r.color || 'var(--good)', fontSize: '11px', fontWeight: 700 });
        tx.textContent = r.label;
        svg.append(tx);
      }
    }

    // --- серии
    for (const s of series) {
      const pts = s.points.slice().sort((a, b) => a.t - b.t);
      const color = s.color || 'var(--accent)';
      const xy = pts.map((p) => [X(p.t), Y(p.y)]);
      if (s.area && xy.length > 1) {
        const base = Y(Math.max(yMin, Math.min(...pts.map((p) => p.y))));
        const d = `M${xy[0][0]},${H - m.b} ` + xy.map((q) => `L${q[0]},${q[1]}`).join(' ') + ` L${xy[xy.length - 1][0]},${H - m.b} Z`;
        svg.append(svgEl('path', { d }, { fill: color, opacity: 0.1, stroke: 'none' }));
        void base;
      }
      if (s.line !== false && xy.length > 1) {
        svg.append(svgEl('path', { d: 'M' + xy.map((q) => `${q[0]},${q[1]}`).join(' L') }, {
          fill: 'none', stroke: color, strokeWidth: s.width ?? 2, strokeLinejoin: 'round', strokeLinecap: 'round',
          strokeDasharray: s.dashed ? '4 4' : null, opacity: s.opacity ?? 1,
        }));
      }
      const mode = s.dots ?? 'last';
      if (mode === 'all') {
        for (const q of xy) svg.append(svgEl('circle', { cx: q[0], cy: q[1], r: s.dotR ?? 3 }, { fill: 'var(--surface)', stroke: color, strokeWidth: 1.8, opacity: s.opacity ?? 1 }));
      }
      // маркер на последнем значении
      if (mode !== 'none' && xy.length && s.marker !== false) {
        const q = xy[xy.length - 1];
        svg.append(svgEl('circle', { cx: q[0], cy: q[1], r: (s.dotR ?? 3) + 4 }, { fill: color, opacity: 0.18 }));
        svg.append(svgEl('circle', { cx: q[0], cy: q[1], r: (s.dotR ?? 3) + 1 }, { fill: color, stroke: 'var(--surface)', strokeWidth: 2 }));
      }
    }
    wrap.append(svg);

    // --- подсказка
    if (mini) return;
    const hp = hitSeries.points.slice().sort((a, b) => a.t - b.t);
    const guide = svgEl('line', { y1: m.t, y2: H - m.b }, { stroke: 'var(--faint)', strokeWidth: 1, display: 'none' });
    const ring = svgEl('circle', { r: 6 }, { fill: 'none', stroke: hitSeries.color || 'var(--accent)', strokeWidth: 2.5, display: 'none' });
    svg.append(guide, ring);
    const tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.hidden = true;
    wrap.append(tip);

    function show(i) {
      selected = i;
      const p = hp[i];
      const x = X(p.t), y = Y(p.y);
      guide.setAttribute('x1', x); guide.setAttribute('x2', x); guide.style.display = '';
      ring.setAttribute('cx', x); ring.setAttribute('cy', y); ring.style.display = '';
      tip.replaceChildren();
      const head = document.createElement('b');
      head.textContent = p.tip ? p.tip[0] : fmtY(p.y);
      tip.append(head);
      const lines = p.tip ? p.tip.slice(1) : [];
      const dt = document.createElement('span');
      dt.textContent = [fmtDate(p.t, { year: true }), ...lines].join(' · ');
      tip.append(dt);
      tip.hidden = false;
      const tw = tip.offsetWidth;
      let left = x - tw / 2;
      left = Math.max(2, Math.min(W - tw - 2, left));
      tip.style.left = left + 'px';
      tip.style.top = Math.max(0, y - tip.offsetHeight - 12) + 'px';
      if (y - tip.offsetHeight - 12 < 0) tip.style.top = (y + 14) + 'px';
    }
    function hide() {
      selected = null; tip.hidden = true; guide.style.display = 'none'; ring.style.display = 'none';
    }
    function pick(ev) {
      const r = svg.getBoundingClientRect();
      const px = ev.clientX - r.left;
      let best = 0, bd = Infinity;
      hp.forEach((p, i) => { const d = Math.abs(X(p.t) - px); if (d < bd) { bd = d; best = i; } });
      show(best);
    }
    svg.addEventListener('pointerdown', pick);
    svg.addEventListener('pointermove', (ev) => { if (ev.pointerType === 'mouse' || ev.buttons) pick(ev); });
    svg.addEventListener('pointerleave', (ev) => { if (ev.pointerType === 'mouse') hide(); });
    if (selected != null && selected < hp.length) show(selected);
  }

  const ro = new ResizeObserver(() => {
    const w = Math.round(wrap.clientWidth);
    if (w > 0 && w !== lastW) { lastW = w; draw(w); }
  });
  ro.observe(wrap);
  if (wrap.clientWidth > 0) { lastW = Math.round(wrap.clientWidth); draw(lastW); }
  return wrap;
}
