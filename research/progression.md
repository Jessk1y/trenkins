# Прогрессия, объём и программа для «Тренькинс»

Исследовательская записка для приложения. Ситуация пользователя: 78 кг, рост 173 см, цель — 68 кг с сохранением или ростом мышц. Зал 3 раза в неделю, готовой программы нет, пресс в приоритете, кардио не любит, но готов делать.

Ссылки в квадратных скобках ведут в раздел «Источники» в конце. Уровень доказательности помечен так:
**[мета]** — мета-анализ или систематический обзор, **[поз.]** — позиционная статья ассоциации, **[иссл.]** — отдельное исследование, **[практика]** — книга или руководство практиков (Helms, SBS, RP). Это мнение экспертов, а не прямой результат исследований.

---

## 1. RPE и RIR простыми словами

**RIR (Reps In Reserve, «повторы в запасе»)** — сколько ещё повторов ты смог бы сделать с хорошей техникой, если бы не остановился.
- RIR 0 — больше ни одного повтора не сделать (отказ).
- RIR 2 — «ещё два бы сделал».
- RIR 4+ — было довольно легко.

**RPE (Rating of Perceived Exertion)** в силовом тренинге — та же шкала, только перевёрнутая: RPE 10 = RIR 0, RPE 9 = RIR 1, RPE 8 = RIR 2 и так далее. Эту шкалу в силовом тренинге закрепили Zourdos и соавт. [1] и Helms и соавт. [2]. RIR понятнее новичку: на вопрос «сколько ещё смог бы?» ответить легче, чем перевести ощущения в баллы.

**Зачем это нужно.** Для роста мышц подход должен быть достаточно тяжёлым, но идти до отказа необязательно. По мета-анализам рост мышц увеличивается по мере приближения к отказу, но польза от последних 1–2 повторов невелика, а утомление растёт. Для силы близость к отказу почти не важна [3][4] **[мета]**. Практический вывод: большинство подходов заканчивать за **1–3 повтора до отказа**, изоляцию и пресс можно ближе, за 0–1.

**Нужно ли вводить RIR новичку?** Как ориентир — да, как обязательное поле — нет.
- Новички плохо угадывают свой запас и обычно его **занижают**, то есть останавливаются слишком рано. Точность растёт с опытом и по мере приближения к отказу [5] **[мета]**.
- Поэтому в приложении RIR лучше сделать **необязательным**: в шаблоне показывать цель («остановись, когда в запасе 1–3 повтора»), а после подхода давать по желанию кнопки `0 · 1 · 2 · 3 · 4+`. Алгоритм ниже работает и без RIR (основа — повторы и вес), а если RIR введён, он только уточняет решение.
- Чтобы научиться чувствовать отказ, полезно иногда (раз в 2–4 недели, в последнем подходе изоляции или тренажёра, но не в приседе или жиме лёжа без страховки) дойти до реального отказа и сравнить с тем, что казалось.

---

## 2. Модели прогрессии

| Модель | Как работает | Плюсы | Минусы |
|---|---|---|---|
| **Линейная** (Starting Strength, «+2.5 кг каждую тренировку», 3×5) | Фиксированное число повторов, вес растёт каждую тренировку | Предельно просто, быстрый рост силы у новичка | В дефиците калорий быстро упирается в потолок (через 4–8 недель), повторы не дают запаса, много «провалов» |
| **Двойная прогрессия** (диапазон повторов, например 8–12) | Тот же вес, пока во всех подходах не будет верх диапазона → +шаг веса, снова от низа | Прогресс есть даже когда вес расти не может (через повторы); крупные шаги гантелей и тренажёров не мешают; подходит для любого оборудования | Чуть медленнее линейной на самом старте; нужен диапазон, а не одно число |
| **На основе RIR / e1RM** (автрегуляция, RTS / Helms) | Цель — «N повторов при RIR 2», вес подбирается по самочувствию или по расчётному 1ПМ с прошлых подходов | Учитывает плохие и хорошие дни, точно дозирует усилие | Требует точной оценки RIR, а новички её не умеют [5]; сложнее объяснить и закодировать |

Прогрессия повторами (при том же весе) и прогрессия весом дают сопоставимый рост мышц и силы [6] **[иссл.]**. Значит, двойная прогрессия, где сначала растут повторы, а потом вес, ничего не теряет по сравнению с «вес каждую тренировку». ACSM рекомендует повышать нагрузку на ~2–10%, когда человек стабильно делает на 1–2 повтора больше цели [7] **[поз.]**. Это по сути и есть двойная прогрессия.

**Что подходит при 3 тренировках в неделю в дефиците:** **двойная прогрессия с необязательной коррекцией по RIR.**
- В дефиците сила у новичка обычно ещё растёт, а мышечная масса хуже, чем при поддержке калорий: по мета-регрессии рост мышц заметно страдает примерно при дефиците больше ~500 ккал/сут, рост силы — нет [8] **[мета]**. Значит, прогресс будет «рваным», и модель должна спокойно переживать недели без прибавки веса.
- У новичка и человека с лишним жиром одновременные потеря жира и рост мышц («рекомпозиция») реальны [9] **[обзор]**.
- Каждое упражнение повторяется 1–2 раза в неделю (при ротации А/Б/В), поэтому шаг +2.5 кг на каждой встрече с упражнением слишком быстрый для линейной модели. Двойная прогрессия даёт «микрошаги» через повторы.

---

## 3. Рекомендуемое правило прогрессии (алгоритм для приложения)

### 3.1. Словами
1. Для упражнения задан диапазон `repsMin–repsMax` и число рабочих подходов.
2. **Сделал верх диапазона во всех рабочих подходах → прибавь вес на один шаг**, цель — снова `repsMin`.
3. **Сделал хотя бы низ диапазона во всех подходах, но не верх → вес тот же**, цель — +1 повтор в каждом подходе (до `repsMax`).
4. **Не дотянул до низа в половине подходов или больше → «неудачная тренировка»**. Первый раз — повтори тот же вес (плохой день бывает). Два раза подряд — откат.
5. **Застой — 3 тренировки подряд с этим упражнением без прогресса** (ни вес, ни сумма повторов не выросли) → откат: −10% веса (минимум на один шаг вниз) и разгон заново.
6. **Перерыв 14+ дней** → начни с −10% от прошлого веса.
7. **Делоад** (неделя облегчения) — не по календарю, а когда застой одновременно в нескольких упражнениях или по кнопке пользователя: тот же вес, половина подходов, остановка за 3–4 повтора до отказа. Делоадные тренировки не учитываются при поиске застоя.
8. Если RIR введён: все подходы при RIR ≥ 4 и повторы в диапазоне → вес был слишком лёгким, прибавляй, как при верхе диапазона.

Почему откат на ~10%: так поступает большинство практических программ (Helms, Pyramid [17]; SBS [18]). Цифра практическая, а не экспериментальная. Почему делоад по ситуации, а не каждые N недель: прямых данных о пользе плановых делоадов мало; в эксперименте на тренированных людях неделя полного отдыха в середине 9-недельной программы не дала преимущества в росте мышц по сравнению с непрерывными тренировками [10] **[иссл.]**. Эксперты в Delphi-консенсусе описывают делоад как гибкий инструмент против накопленной усталости [11] **[консенсус]**.

### 3.2. Шаги веса и «лестница» доступных весов
Чтобы подсказка не предлагала вес, которого нет в зале, алгоритм работает с **лестницей доступных весов** для каждого типа оборудования. Значения по умолчанию — меняемые настройки:

| `equipment` | Что хранится в `weight` | Лестница по умолчанию |
|---|---|---|
| `barbell` | общий вес со штангой | от 20 (гриф) с шагом 2.5 (по 1.25 на сторону); если есть «блинчики» 0.5 — шаг 1 |
| `dumbbell` | вес **одной** гантели | 1…10 с шагом 1, дальше 12, 14 … 50 с шагом 2 |
| `machine`, `cable` | вес по стеку | шаг стека `stackStep` (по умолчанию 5; у многих блоков 2.5) |
| `bodyweight` | **дополнительный** вес (0 = без веса) | 0, 2.5, 5, 7.5 … (гантель между стоп, пояс) |
| `timed` | — (прогрессия по времени) | +5 с за раз, потолок 90 с |

### 3.3. Псевдокод (переносится в JS напрямую)

```js
// ---------- НАСТРОЙКИ ----------
const CFG = {
  barbell:   { min: 20, step: 2.5 },
  dumbbell:  { ladder: [1,2,3,4,5,6,7,8,9,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50] },
  machine:   { stepDefault: 5 },
  bodyweight:{ step: 2.5 },
  timed:     { step: 5, cap: 90 },
  stallSessions: 3,      // столько тренировок подряд без прогресса = застой
  failStreakReset: 2,    // столько неудачных подряд = откат
  resetFactor: 0.9,      // откат −10%
  longBreakDays: 14,     // перерыв, после которого −10%
  rirTooEasy: 4,         // все подходы с RIR ≥ 4 → вес слишком лёгкий
  bigJumpExtraReps: 3,   // перебрал верх диапазона на 3+ во всех подходах → +2 шага
};

// ---------- ВХОД ----------
// ex      = { equipment: 'barbell'|'dumbbell'|'machine'|'cable'|'bodyweight'|'timed',
//             stackStep?: number, allowAddedLoad?: boolean }
// target  = { sets: N,               // сколько рабочих (normal) подходов в шаблоне
//             repsMin, repsMax,      // для timed — вместо них timeSec
//             timeSec?, rir? }
// history = массив прошлых тренировок с ЭТИМ упражнением, новые первыми:
//             [{ date, isDeload: bool,
//                sets: [{ kind: 'warmup'|'normal'|'drop', weight, reps, rir?, timeSec? }] }]
// opts    = { today: Date, deloadWeek: bool }
//
// ---------- ВЫХОД ----------
// { status, weight, reps: [числа по подходам] | null, timeSec?: число, sets: N, rir?: число, text }
// status: 'first'|'increase'|'reps'|'repeat'|'reset'|'comeback'|'deload'|'harder'

// ---------- ЛЕСТНИЦА ВЕСОВ ----------
function ladder(ex) {
  if (ex.equipment === 'dumbbell') return CFG.dumbbell.ladder;
  const step = ex.equipment === 'barbell'    ? CFG.barbell.step
             : ex.equipment === 'bodyweight' ? CFG.bodyweight.step
             : (ex.stackStep || CFG.machine.stepDefault);
  const start = ex.equipment === 'barbell' ? CFG.barbell.min : 0;
  const out = [];
  for (let w = start; w <= 400; w = +(w + step).toFixed(2)) out.push(w);
  return out;
}
const nextUp   = (ex, w, n = 1) => { const L = ladder(ex); let i = L.findIndex(x => x > w + 1e-9);
                                     if (i < 0) return L[L.length - 1];
                                     return L[Math.min(i + n - 1, L.length - 1)]; };
const floorTo  = (ex, w) => { const L = ladder(ex); let r = L[0];
                              for (const x of L) if (x <= w + 1e-9) r = x; return r; };
// откат: не больше чем W*0.9 и минимум на один шаг ниже W
const resetWeight = (ex, W) => { const L = ladder(ex);
  const below = L.filter(x => x < W - 1e-9);
  const oneDown = below.length ? below[below.length - 1] : L[0];
  return Math.min(floorTo(ex, W * CFG.resetFactor), oneDown); };

// ---------- РАЗБОР ТРЕНИРОВКИ ----------
const work      = s => s.sets.filter(x => x.kind === 'normal');
const topWeight = s => Math.max(...work(s).map(x => x.weight || 0));
const mainSets  = s => work(s).filter(x => (x.weight || 0) === topWeight(s));
const totalReps = s => mainSets(s).reduce((a, x) => a + (x.reps || 0), 0);

function evalSession(s, t) {
  const m = mainSets(s);
  const reps = m.map(x => x.reps || 0);
  const failedCnt = reps.filter(r => r < t.repsMin).length;
  const rirs = m.map(x => x.rir).filter(v => v != null);
  return {
    W: topWeight(s), reps,
    hitTop:   m.length >= t.sets && reps.every(r => r >= t.repsMax),
    bigOver:  m.length >= t.sets && reps.every(r => r >= t.repsMax + CFG.bigJumpExtraReps),
    failed:   m.length > 0 && failedCnt >= Math.ceil(m.length / 2),
    inRange:  m.length >= t.sets && reps.every(r => r >= t.repsMin),
    tooEasy:  rirs.length === m.length && m.length >= t.sets
              && rirs.every(v => v >= CFG.rirTooEasy) && reps.every(r => r >= t.repsMin),
    allFail0: rirs.length === m.length && m.length > 0 && rirs.every(v => v === 0),
  };
}

// прогресс между двумя тренировками: вес вырос, или вес тот же и сумма повторов больше
function progressed(cur, prev) {
  return topWeight(cur) > topWeight(prev) ||
        (topWeight(cur) === topWeight(prev) && totalReps(cur) > totalReps(prev));
}

// сколько последних тренировок подряд без прогресса (на том же или большем весе)
function stallCount(h) {
  let n = 0;
  for (let i = 0; i + 1 < h.length; i++) {
    if (topWeight(h[i]) < topWeight(h[i + 1])) break; // был откат — новый отсчёт
    if (progressed(h[i], h[i + 1])) break;
    n++;
  }
  return n;
}

// сколько последних тренировок подряд «неудачные» на одном и том же весе
function failStreak(h, t) {
  let n = 0;
  for (let i = 0; i < h.length; i++) {
    if (i > 0 && topWeight(h[i]) !== topWeight(h[0])) break;
    if (!evalSession(h[i], t).failed) break;
    n++;
  }
  return n;
}

// ---------- ГЛАВНАЯ ФУНКЦИЯ ----------
function recommend(ex, target, history, opts) {
  const h = history.filter(s => !s.isDeload && work(s).length > 0);
  const N = target.sets;

  // 0) упражнения на время
  if (ex.equipment === 'timed') return recommendTimed(target, h);

  // 1) первый раз
  if (h.length === 0) return { status: 'first', weight: null,
    reps: Array(N).fill(target.repsMin), sets: N, rir: target.rir,
    text: `Первый раз: подбери вес, с которым ${target.repsMin}–${target.repsMax} повторов даются ` +
          `с запасом 2–3 повтора. Лучше начать легче — дальше прибавим.` };

  const last = h[0];
  const e = evalSession(last, target);
  const W = e.W;

  // 2) делоад-неделя (флаг приходит от приложения, см. 3.4)
  if (opts.deloadWeek) return { status: 'deload', weight: W,
    reps: Array(Math.ceil(N / 2)).fill(target.repsMin), sets: Math.ceil(N / 2), rir: 3,
    text: `Неделя разгрузки: ${W} кг, ${Math.ceil(N / 2)} подх. по ${target.repsMin}, ` +
          `остановись, когда в запасе 3–4 повтора. Через неделю вернёмся к прежним весам.` };

  // 3) долгий перерыв
  const days = (opts.today - new Date(last.date)) / 864e5;
  if (days >= CFG.longBreakDays) { const w = floorTo(ex, W * CFG.resetFactor);
    return { status: 'comeback', weight: w, reps: Array(N).fill(target.repsMin), sets: N, rir: target.rir,
      text: `Перерыв ${Math.round(days)} дн. — начнём с ${w} кг (−10%) и быстро вернёмся к ${W} кг.` }; }

  // 4) прибавка веса
  if (e.hitTop || e.tooEasy) {
    if (ex.equipment === 'bodyweight' && !ex.allowAddedLoad) {
      return { status: 'harder', weight: W, reps: Array(N).fill(target.repsMax), sets: N, rir: target.rir,
        text: `Все подходы по ${target.repsMax} — пора усложнять: следующий вариант упражнения ` +
              `или медленный негатив 3 с.` };
    }
    const w = nextUp(ex, W, e.bigOver ? 2 : 1);
    const why = e.tooEasy && !e.hitTop ? 'Было слишком легко (запас 4+)' : `Все подходы по ${target.repsMax}+`;
    return { status: 'increase', weight: w, reps: Array(N).fill(target.repsMin), sets: N, rir: target.rir,
      text: `${why} — прибавляем: ${w} кг, цель ${target.repsMin}+ повторов в каждом подходе.` };
  }

  // 5) откат: 2 неудачи подряд или застой
  const fs = failStreak(h, target), st = stallCount(h);
  if (fs >= CFG.failStreakReset || st >= CFG.stallSessions) {
    const w = resetWeight(ex, W);
    const mid = Math.ceil((target.repsMin + target.repsMax) / 2);
    return { status: 'reset', weight: w, reps: Array(N).fill(mid), sets: N, rir: target.rir,
      text: (fs >= CFG.failStreakReset ? `Два раза подряд не вышло ${target.repsMin} повторов` :
             `${st} тренировки подряд без прогресса`) +
            ` — откатываемся до ${w} кг и разгоняемся заново. Это нормально, особенно в дефиците.` };
  }

  // 6) одна неудача — повторить
  if (e.failed) return { status: 'repeat', weight: W, reps: Array(N).fill(target.repsMin), sets: N, rir: target.rir,
    text: `Прошлый раз было тяжело — повторим ${W} кг, цель ${target.repsMin} повторов. ` +
          `Выспись и поешь перед тренировкой.` };

  // 7) обычный случай: тот же вес, +1 повтор в каждом подходе
  const reps = Array.from({ length: N }, (_, i) =>
    Math.min(target.repsMax, Math.max(target.repsMin, (e.reps[i] ?? target.repsMin) + 1)));
  let text = `${W} кг, добавь по повтору: ${reps.join(' / ')}. Когда во всех подходах будет ` +
             `${target.repsMax} — прибавим вес.`;
  if (st === CFG.stallSessions - 1) text += ' Уже 2 тренировки без прогресса — если и сегодня не выйдет, сделаем откат.';
  if (e.allFail0) text += ' Прошлый раз все подходы были до отказа — оставляй 1–2 повтора в запасе.';
  return { status: 'reps', weight: W, reps, sets: N, rir: target.rir, text };
}

// ---------- УПРАЖНЕНИЯ НА ВРЕМЯ ----------
function recommendTimed(target, h) {
  const N = target.sets;
  if (h.length === 0) return { status: 'first', weight: null, reps: null, timeSec: target.timeSec, sets: N,
    text: `Держи ${target.timeSec} с с идеальной техникой. Если не выходит — сколько получится.` };
  const ts = work(h[0]).map(x => x.timeSec || 0);
  const minT = Math.min(...ts);
  if (minT >= CFG.timed.cap) return { status: 'harder', weight: null, reps: null, timeSec: CFG.timed.cap, sets: N,
    text: `${CFG.timed.cap} с даются легко — усложни вариант (подними ногу, блин на спину), а не время.` };
  // все подходы выполнены и не короче шаблона → +5 с к худшему подходу (с округлением до 5 с)
  const base = Math.floor(minT / CFG.timed.step) * CFG.timed.step;
  const next = ts.length >= N && minT >= target.timeSec
    ? Math.min(CFG.timed.cap, base + CFG.timed.step)
    : target.timeSec;
  return { status: next > minT ? 'increase' : 'reps', weight: null, reps: null, timeSec: next, sets: N,
    text: next > minT ? `Прошлый раз отлично — сегодня ${next} с.` : `Цель ${next} с в каждом подходе.` };
}
```

Пояснения к краевым случаям:
- **Разные веса в подходах** (например, 60/60/57.5). Рабочим весом считается максимальный, оцениваются только подходы с ним (`mainSets`). Если таких подходов меньше `target.sets`, верх диапазона не засчитывается — вес не растёт.
- **Подходы `drop`** (дроп-сеты) и `warmup` в расчёте не участвуют.
- **Гантели:** если между 10 и 12 кг есть 11 — просто добавить 11 в `CFG.dumbbell.ladder`. Прыжок на гантелях относительно большой (10 → 12 = +20%), поэтому двойная прогрессия тут особенно важна: после прибавки повторы упадут до низа диапазона и снова будут расти.
- **Собственный вес + отягощение** (подъём ног в висе): `weight` = дополнительный вес. При `allowAddedLoad: true` шаг 2.5 кг, иначе — подсказка «усложни вариант».
- **Ассистированные тренажёры** (гравитрон) в программе не используются. Если их добавят, нужна инверсия: прогресс = уменьшение веса помощи.

### 3.4. Когда приложению предлагать делоад (флаг `deloadWeek`)
Показывать баннер «Предлагаем неделю разгрузки», если выполнено хоть одно условие:
1. За последние 14 дней **3 или больше разных упражнений** получили статус `reset`.
2. Пользователь отметил «чувствую себя разбитым» (необязательная кнопка), и с прошлого делоада прошло ≥ 4 недель.
3. С начала программы или прошлого делоада прошло **≥ 8 недель**, и есть хотя бы одно упражнение в застое (`stallCount ≥ 2`).

Делоад длится 3 тренировки (неделю), сессии помечаются `isDeload: true`. После него подсказки продолжаются от последнего неделоадного веса.

### 3.5. Тексты подсказок (короткая версия для плашки)
| status | Короткий текст |
|---|---|
| first | «Подбери вес на 8–12 с запасом 2–3» |
| increase | «+2.5 кг → 62.5 кг × 6+» |
| reps | «60 кг, добавь повтор: 9/9/8» |
| repeat | «Повтори 60 кг — плохой день бывает» |
| reset | «Откат до 55 кг, разгоняемся» |
| comeback | «После перерыва: 55 кг» |
| deload | «Разгрузка: 2 подхода, легко» |
| harder | «Пора усложнить вариант» |

---

## 4. Объём, темп похудения, белок, шаги и кардио

### 4.1. Сколько рабочих подходов на мышцу в неделю
- Рост мышц увеличивается с объёмом: ≥ 10 подходов на мышцу в неделю дали больше, чем < 5 [12] **[мета]**. Более новая мета-регрессия (Pelland, Robinson и соавт.) показывает, что рост продолжается и дальше, но с уменьшающейся отдачей. Для силы отдача от объёма выходит на плато раньше [13] **[мета, препринт]**.
- Частота 2 раза в неделю на мышцу как минимум не хуже одного раза. При равном объёме разница небольшая, поэтому частота — прежде всего способ удобно распределить объём [14] **[мета]**.
- **Новичку в дефиците: 6–12 прямых рабочих подходов на крупную мышцу в неделю**, плюс непрямая работа (жимы нагружают трицепс и переднюю дельту, тяги — бицепс). Больше в дефиците обычно хуже восстанавливается. Начинать с нижней границы, добавлять по подходу отстающим мышцам, если прогресс идёт и восстановление в порядке. Концепция MEV/MAV/MRV (минимальный, оптимальный и максимальный восстанавливаемый объём) из Renaissance Periodization [16] — удобная рамка, но конкретные цифры RP — экспертная оценка, а не результат исследований.

**Объём в программе ниже (прямые подходы в неделю):** квадрицепс 8, бицепс бедра 7, ягодицы ~9 (присед, румынская тяга, жим ногами), грудь 6 (+ жим над головой), спина 9, средняя дельта 4 (+ жимы), бицепс 2 + 9 тяговых, трицепс 2 + 9 жимовых, пресс ~15 (из них ~9 динамических).

### 4.2. Темп снижения веса
- **0.5–1% массы тела в неделю** — рекомендация для сохранения мышц [15] **[обзор]**. В исследовании на спортсменах более медленный темп (~0.7%/нед) сохранил мышцы и силу лучше, чем быстрый (~1.4%/нед) [19] **[иссл.]**.
- Для 78 кг это **~0.4–0.7 кг в неделю**. Ориентир — **~0.5 кг/нед** (дефицит ~300–500 ккал/сут; больше ~500 ккал уже заметно мешает росту мышц [8]). До 68 кг — примерно **4–6 месяцев**. Ближе к цели темп обычно замедляется.
- Вес тела в приложении смотреть по **скользящему среднему за 7 дней**, а не по отдельным взвешиваниям: колебания воды ±1 кг в день — норма.
- Замеры (талия на уровне пупка) раз в 1–2 недели. Если вес стоит, а талия уходит при растущих рабочих весах, это хороший сигнал.

### 4.3. Белок
- Прирост мышечной массы от добавочного белка выходит на плато примерно на **1.6 г/кг/сут**; верхняя граница доверительного интервала — **~2.2 г/кг** [20] **[мета]**. ISSN: 1.4–2.0 г/кг для тренирующихся, в дефиците — выше [21] **[поз.]**.
- **Практически: 1.6–2.2 г/кг → ~125–170 г белка в сутки** (в дефиците ближе к верху). Удобный ориентир — **~2 г на кг целевого веса (68 кг) ≈ 135–140 г**. Распределить на 3–5 приёмов по 25–40 г.

### 4.4. Шаги и кардио
- **Шаги — главный инструмент для того, кто не любит кардио.** 8–10 тысяч шагов в день — разумная цель: в мета-анализе когорт польза для смертности растёт примерно до 8–10 тыс. у людей младше 60 лет [22] **[мета]**. Для похудения шаги дают постоянный прирост расхода без влияния на восстановление ног. Увеличивать постепенно, на +1000 в неделю от текущего уровня.
- ACSM: для заметного снижения веса нужно ~150–250+ мин умеренной активности в неделю, но главный рычаг — питание [23] **[поз.]**.
- **«Кардио убьёт мышцы»** — сильное преувеличение. Помехи от аэробной нагрузки для силовых результатов небольшие и зависят от типа и объёма. Велосипед мешает меньше бега [24] **[мета]**. Поэтому в программе — **необязательные 10–20 мин ходьбы в горку или велотренажёра после силовой**, в разговорном темпе.

---

## 5. Пресс: миф о локальном жиросжигании и как тренировать правильно

**Миф:** «качаю пресс → уходит жир с живота». **Неправда.** В рандомизированном исследовании 6 недель упражнений на пресс не уменьшили жир на животе по сравнению с контролем [25] **[иссл.]**. В другом исследовании тренировка одной ноги привела к потере жира в основном **в других** областях тела, а не на тренируемой ноге [26] **[иссл.]**. Жир уходит со всего тела при дефиците калорий, а откуда раньше — решает генетика. Живот часто худеет одним из последних.

**Что из этого следует:**
1. «Кубики» видны, когда **процент жира в организме** достаточно низкий. Поэтому главное для видимого пресса — дефицит, белок и терпение (раздел 4).
2. Тренировка пресса всё равно имеет смысл: прямая мышца живота — обычная мышца, она растёт от **прогрессивной нагрузки**, как бицепс. Чем она толще, тем раньше рельеф проявится при снижении жира. Плюс сильный корпус помогает в приседе и становой.
3. **Как тренировать:**
   - Относиться к прессу **как к любой мышце**: 2–4 подхода за тренировку, 8–15 повторов, близко к отказу (RIR 0–2), **с прогрессией веса или сложности**. 100 скручиваний без веса работают плохо.
   - Покрыть все функции: **сгибание позвоночника** (скручивания на блоке, подъёмы ног в висе), **антиразгибание** (ролик, планка), **антиротация и боковое сгибание** (Pallof, боковая планка).
   - Планка — хорошее упражнение на стабилизацию, но для роста мышцы слабее нагружаемых скручиваний. Держать дольше 60–90 с бессмысленно: лучше усложнять вариант.
   - 3 тренировки пресса в неделю по 2 упражнения (~12–15 подходов) — достаточно щедро. Пресс хорошо восстанавливается, но если появляется боль в пояснице или сгибателях бедра, урезать подъёмы ног.

---

## 6. Расчётный 1ПМ (e1RM)

| Формула | Выражение | Особенность |
|---|---|---|
| **Epley** (1985) | `1ПМ = w × (1 + r/30)` | Плавная, без особенностей; при больших r немного завышает |
| **Brzycki** (1993) | `1ПМ = w × 36 / (37 − r)` | При r → 37 уходит в бесконечность; при малых r чуть консервативнее |

При r = 10 обе формулы дают одинаковый результат (×1.333), при r < 10 разница меньше 1–2%.

**Что показывать в приложении:** **Epley**, считать по лучшему рабочему подходу тренировки (максимум e1RM среди подходов `normal`), **только для подходов с 1–10 повторами** (при r = 1 → 1ПМ = w). Точность всех формул заметно падает после ~10 повторов [27] **[иссл.]**: на многоповторных подходах важна выносливость, и ошибка растёт. Подходы с 11+ повторами в e1RM не учитывать; пресс, изоляцию и упражнения на время тоже не показывать (бессмысленно). Подписывать как «≈ расчётный 1ПМ», а график строить по максимуму e1RM за тренировку.

```js
function e1rm(weight, reps) {
  if (!weight || !reps || reps < 1 || reps > 10) return null;
  return reps === 1 ? weight : weight * (1 + reps / 30); // Epley
}
```

---

## 7. Почему фулбади 3 раза, а не верх/низ

- При 3 тренировках верх/низ не делится поровну: одна половина тела получает 2 тренировки, другая — 1, и неделя к неделе чередуется. Фулбади даёт **каждой мышце 2–3 стимула в неделю** и равномерно распределяет объём [14].
- Если тренировка пропущена, фулбади теряет меньше: в любой оставшейся есть всё тело.
- Пресс в каждой тренировке ложится естественно.
- Три разных дня (А/Б/В) вместо одного повторяющегося — разнообразие упражнений и меньше нагрузки на одни и те же суставы. Helms и SBS рекомендуют для 3 дней в неделю именно фулбади или его вариации [17][18] **[практика]**.

**Структура:** А — присед, жим лёжа, вертикальная тяга. Б — румынская тяга, жим над головой, горизонтальная тяга, руки. В — жим ногами, наклонный жим, тяга гантели, изоляция ног. Пресс — по 2 упражнения в каждый день: сгибание + стабилизация. Кардио по желанию в конце. Полностью — в `research/program.json`.

---

## 8. Все `exerciseId` из программы

| exerciseId | Название | Основная мышца | Оборудование | `equipment` для алгоритма |
|---|---|---|---|---|
| `barbell-squat` | Приседания со штангой | Квадрицепс, ягодичные | Штанга, силовая рама | barbell |
| `bench-press` | Жим штанги лёжа | Грудные | Штанга, скамья | barbell |
| `lat-pulldown` | Тяга верхнего блока к груди | Широчайшие | Блочный тренажёр | cable |
| `dumbbell-lateral-raise` | Махи гантелями в стороны | Средняя дельта | Гантели | dumbbell |
| `cable-crunch` | Скручивания на блоке стоя на коленях | Прямая мышца живота | Блок с канатом | cable |
| `plank` | Планка | Мышцы кора (прямая и поперечная мышца живота) | Собственный вес | timed |
| `incline-treadmill-walk` | Ходьба в горку на дорожке (кардио) | Кардио | Беговая дорожка | timed |
| `romanian-deadlift` | Румынская тяга со штангой | Бицепс бедра, ягодичные | Штанга | barbell |
| `dumbbell-shoulder-press` | Жим гантелей сидя | Передняя и средняя дельта | Гантели, скамья со спинкой | dumbbell |
| `seated-cable-row` | Горизонтальная тяга блока сидя | Широчайшие, середина спины | Блочный тренажёр | cable |
| `seated-leg-curl` | Сгибание ног сидя в тренажёре | Бицепс бедра | Тренажёр | machine |
| `dumbbell-curl` | Сгибание рук с гантелями | Бицепс | Гантели | dumbbell |
| `triceps-pushdown` | Разгибание рук на верхнем блоке | Трицепс | Блок с рукоятью или канатом | cable |
| `hanging-leg-raise` | Подъём ног в висе | Прямая мышца живота, сгибатели бедра | Турник | bodyweight (allowAddedLoad) |
| `pallof-press` | Жим Паллофа (антиротация) | Косые мышцы живота, кор | Блок | cable |
| `leg-press` | Жим ногами в тренажёре | Квадрицепс, ягодичные | Тренажёр | machine |
| `incline-dumbbell-press` | Жим гантелей на наклонной скамье | Грудные (верх), передняя дельта | Гантели, наклонная скамья | dumbbell |
| `one-arm-dumbbell-row` | Тяга гантели одной рукой в наклоне | Широчайшие, середина спины | Гантель, скамья | dumbbell |
| `leg-extension` | Разгибание ног в тренажёре | Квадрицепс | Тренажёр | machine |
| `ab-wheel-rollout` | Выкатывание ролика с колен | Прямая мышца живота (антиразгибание) | Ролик для пресса | bodyweight |
| `side-plank` | Боковая планка | Косые мышцы живота | Собственный вес | timed |

---

## Источники

1. Zourdos MC, et al. Novel resistance training–specific rating of perceived exertion scale measuring repetitions in reserve. *J Strength Cond Res.* 2016;30(1):267–275. doi:10.1519/JSC.0000000000001049
2. Helms ER, Cronin J, Storey A, Zourdos MC. Application of the repetitions in reserve-based rating of perceived exertion scale for resistance training. *Strength Cond J.* 2016;38(4):42–49.
3. Refalo MC, Helms ER, Trexler ET, Hamilton DL, Fyfe JJ. Influence of resistance training proximity-to-failure on skeletal muscle hypertrophy: a systematic review with meta-analysis. *Sports Med.* 2023;53(3):649–665. doi:10.1007/s40279-022-01784-y
4. Robinson ZP, Pelland JC, Remmert JF, Refalo MC, Jukic I, Steele J, Zourdos MC. Exploring the dose–response relationship between estimated resistance training proximity to failure, strength gain, and muscle hypertrophy: a series of meta-regressions. *Sports Med.* 2024;54(9):2209–2231. doi:10.1007/s40279-024-02069-2
5. Halperin I, Malleron T, Har-Nir I, et al. Accuracy in predicting repetitions to task failure in resistance exercise: a scoping review and exploratory meta-analysis. *Sports Med.* 2022;52(2):377–390. doi:10.1007/s40279-021-01559-x
6. Plotkin D, Coleman M, Van Every D, et al. Progressive overload without progressing load? The effects of load or repetition progression on muscular adaptations. *PeerJ.* 2022;10:e14142. doi:10.7717/peerj.14142
7. American College of Sports Medicine. Position stand: Progression models in resistance training for healthy adults. *Med Sci Sports Exerc.* 2009;41(3):687–708. doi:10.1249/MSS.0b013e3181915670
8. Murphy C, Koehler K. Energy deficiency impairs resistance training gains in lean mass but not strength: a meta-analysis and meta-regression. *Scand J Med Sci Sports.* 2022;32(1):125–137. doi:10.1111/sms.14075
9. Barakat C, Pearson J, Escalante G, Campbell B, De Souza EO. Body recomposition: can trained individuals build muscle and lose fat at the same time? *Strength Cond J.* 2020;42(5):7–21.
10. Coleman M, Burke R, Augustin F, et al. Gaining more from doing less? The effects of a one-week deload period during supervised resistance training on muscular adaptations. *PeerJ.* 2024;12:e16777. doi:10.7717/peerj.16777
11. Bell L, Nolan D, Immonen V, et al. Integrating deloading into strength and physique sports training programmes: an international Delphi consensus approach. *Sports Med Open.* 2023;9:87. doi:10.1186/s40798-023-00633-0
12. Schoenfeld BJ, Ogborn D, Krieger JW. Dose-response relationship between weekly resistance training volume and increases in muscle mass: a systematic review and meta-analysis. *J Sports Sci.* 2017;35(11):1073–1082. doi:10.1080/02640414.2016.1210197
13. Pelland JC, Remmert JF, Robinson ZP, et al. The resistance training dose-response: meta-regressions exploring the effects of weekly volume and frequency on muscle hypertrophy and strength gains. *SportRxiv* (препринт), 2024 (sportrxiv.org/index.php/server/preprint/view/460); по вторичным данным рецензируемая версия вышла в 2026 г.
14. Schoenfeld BJ, Grgic J, Krieger J. How many times per week should a muscle be trained to maximize muscle hypertrophy? A systematic review and meta-analysis. *J Sports Sci.* 2019;37(11):1286–1295. doi:10.1080/02640414.2018.1555906
15. Helms ER, Aragon AA, Fitschen PJ. Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation. *J Int Soc Sports Nutr.* 2014;11:20. doi:10.1186/1550-2783-11-20
16. Israetel M, Hoffmann J, Smith CW. *Scientific Principles of Hypertrophy Training.* Renaissance Periodization, 2021. — с оговоркой: цифры MEV/MRV — экспертная оценка.
17. Helms E, Morgan A, Valdez A. *The Muscle and Strength Pyramid: Training.* 2nd ed., 2019.
18. Stronger by Science (Nuckols G., Trexler E. и др.) — обзорные статьи по объёму, частоте и прогрессии, strongerbyscience.com.
19. Garthe I, Raastad T, Refsnes PE, Koivisto A, Sundgot-Borgen J. Effect of two different weight-loss rates on body composition and strength and power-related performance in elite athletes. *Int J Sport Nutr Exerc Metab.* 2011;21(2):97–104.
20. Morton RW, Murphy KT, McKellar SR, et al. A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults. *Br J Sports Med.* 2018;52(6):376–384. doi:10.1136/bjsports-2017-097608
21. Jäger R, Kerksick CM, Campbell BI, et al. International Society of Sports Nutrition position stand: protein and exercise. *J Int Soc Sports Nutr.* 2017;14:20. doi:10.1186/s12970-017-0177-8
22. Paluch AE, Bajpai S, Bassett DR, et al. Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts. *Lancet Public Health.* 2022;7(3):e219–e228.
23. Donnelly JE, Blair SN, Jakicic JM, et al. ACSM position stand: Appropriate physical activity intervention strategies for weight loss and prevention of weight regain for adults. *Med Sci Sports Exerc.* 2009;41(2):459–471.
24. Wilson JM, Marin PJ, Rhea MR, et al. Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises. *J Strength Cond Res.* 2012;26(8):2293–2307.
25. Vispute SS, Smith JD, LeCheminant JD, Hurley KS. The effect of abdominal exercise on abdominal fat. *J Strength Cond Res.* 2011;25(9):2559–2564.
26. Ramírez-Campillo R, Andrade DC, Campos-Jara C, et al. Regional fat changes induced by localized muscle endurance resistance training. *J Strength Cond Res.* 2013;27(8):2219–2224.
27. LeSuer DA, McCormick JH, Mayhew JL, Wasserstein RL, Arnold MD. The accuracy of prediction equations for estimating 1-RM performance in the bench press, squat, and deadlift. *J Strength Cond Res.* 1997;11(4):211–213.
— Epley B. *Poundage Chart.* Boyd Epley Workout, 1985. Brzycki M. Strength testing — predicting a one-rep max from reps-to-fatigue. *JOPERD.* 1993;64(1):88–90.

> Примечание о проверке: [4], [10], [11] и [13] сверены онлайн (ноябрь 2026). Остальные — классические, широко цитируемые работы; их выходные данные приведены без построчной сверки.
