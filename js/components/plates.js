// Калькулятор блинов: какие блины вешать на каждую сторону.
import { h, sheet } from '../core/ui.js';
import { store } from '../core/store.js';
import { platesFor, fmtNum, parseNum } from '../core/util.js';

const COLORS = { 25: '#d33a3a', 20: '#2f6fd6', 15: '#e2b42b', 10: '#2fa66a', 5: '#e9eef3', 2.5: '#8d939c', 1.25: '#b6bcc5', 0.5: '#c9ced6' };
const HEIGHTS = { 25: 88, 20: 88, 15: 76, 10: 62, 5: 44, 2.5: 34, 1.25: 28, 0.5: 22 };

export function drawBarbell(plates) {
  return h('div', { class: 'barbell', 'aria-hidden': 'true' },
    h('span', { class: 'rod', style: { width: '56px' } }),
    plates.map((p) => h('span', { class: 'plate', style: { width: p >= 10 ? '13px' : '8px', height: (HEIGHTS[p] || 30) + 'px', background: COLORS[p] || 'var(--faint)' } })),
    h('span', { class: 'rod', style: { width: '28px' } }));
}

export function openPlateCalc({ weight = null, barId = 'olympic' } = {}) {
  const st = store.settings();
  let bar = st.bars.find((b) => b.id === barId) || st.bars[0];
  const input = h('input', { class: 'input num', inputmode: 'decimal', value: weight ? fmtNum(weight) : '', placeholder: 'Вес на штанге, кг', style: { fontSize: '22px', fontWeight: '800', textAlign: 'center' } });
  const out = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' } });
  const seg = h('div', { class: 'seg' });

  function renderSeg() {
    seg.replaceChildren(...st.bars.map((b) => h('button', { class: b.id === bar.id ? 'on' : '', onclick: () => { bar = b; renderSeg(); calc(); } }, `${b.name.replace(' гриф', '')} ${fmtNum(b.weight)}`)));
  }
  function calc() {
    const w = parseNum(input.value);
    if (!w) { out.replaceChildren(h('div', { class: 'muted small' }, 'Введи общий вес вместе с грифом')); return; }
    const r = platesFor(w, bar.weight, st.plates);
    out.replaceChildren(
      drawBarbell(r.plates),
      h('div', { style: { fontSize: '18px', fontWeight: '700' }, class: 'num' }, r.plates.length ? 'На сторону: ' + r.plates.map((p) => fmtNum(p)).join(' + ') : 'Только гриф'),
      !r.ok ? h('div', { class: 'small', style: { color: 'var(--warn)' } }, r.rest < 0 ? 'Вес меньше грифа' : `Не хватает ${fmtNum(r.rest)} кг до точного веса`) : null);
  }
  input.addEventListener('input', calc);
  renderSeg(); calc();
  sheet({ title: 'Калькулятор блинов', content: h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, input, seg, out) });
}
