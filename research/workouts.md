# Готовые тренировки из проверенных источников

21 тренировка: 3 фулбади + по 3 на грудь, спину, ноги, плечи, руки и пресс/кор. Машиночитаемая версия лежит в [`workouts.json`](workouts.json). Все `exerciseId` взяты из каталога `js/data/exercises.js`, и это проверено скриптом.

**Для кого:** мужчина 173 см / 78 кг, сушка до 68 кг, зал 3 раза в неделю, новичок-любитель, пресс в приоритете. В зале есть олимпийский гриф, EZ-гриф, гантели, тренажёры и блоки.

---

## 1. Как отбирались источники

1. **Брались только опубликованные программы или протоколы**, у которых есть автор и URL. Ни одно упражнение не придумано: каждое взято из источника или явно помечено как замена.
2. **Допускались такие источники:**
   - рецензируемые исследования (PubMed/PMC);
   - официальные публикации авторов методик: Jim Wendler, Mark Rippetoe;
   - Renaissance Periodization (RP). Это компания Dr. Mike Israetel, PhD по спортивной науке и автора концепции объёмных ориентиров MV/MEV/MAV/MRV. В её серии «Hypertrophy Training Tips» для каждой мышцы есть ориентиры объёма и образец недели;
   - American Council on Exercise (ACE). Это некоммерческая организация с NCCA-аккредитованной сертификацией тренеров, которая заказывает ЭМГ-исследования у независимых университетских лабораторий (Univ. of Wisconsin–La Crosse, San Diego State);
   - методика Stuart McGill (почётный профессор биомеханики позвоночника, Univ. of Waterloo) в изложении сертифицированного CSCS на сайте ACE.
3. **Отклонены** перепечатки с агрегаторов (BoxRox, Fitness Volt, Boostcamp, Lift Vault и т.п.). Их использовали только как подсказку, где искать первоисточник. Программа Greg Nuckols (Stronger By Science) не вошла: её первоисточник не удалось открыть и сверить, нашлись только пересказы.
4. **Как устроены тренировки на мышечные группы.** Образец недели RP для каждой мышцы — это три дня (Пн/Ср/Пт) с разными диапазонами повторов: тяжёлый 5–10, средний 10–20, лёгкий 20–30. Это совпадает с графиком пользователя (3 раза в неделю), поэтому день образца = шаблон. Для ног, плеч и рук один и тот же день недели собран из нескольких статей RP одного автора (квадрицепс + задняя поверхность + ягодицы; средняя + задняя + передняя дельта; бицепс + трицепс). Третий шаблон в группе — либо ещё один день RP, либо независимый источник (ACE, McGill), чтобы опора была не на одного автора.
5. **Адаптация под новичка** везде отмечена в поле `source.adapted` и в этом отчёте. Типичные замены:
   - подтягивания и брусья → гравитрон;
   - технически сложные упражнения (JM-жим, становая сумо с дефицитом) → более простые аналоги;
   - упражнения, которых нет в каталоге → ближайший аналог.

### Что говорят исследования (на этом основаны общие правила)

| Вопрос | Вывод | Источник |
|---|---|---|
| Сколько подходов на мышцу в неделю | Есть зависимость «доза–ответ»: ≥10 подходов в неделю дают больше роста, чем <5. Новичку хватает нижней границы. | Schoenfeld, Ogborn, Krieger 2017, *J Sports Sci* (PMID 27433992) |
| Объём в рамках фулбади | 3×/нед, 7 упражнений, 8–12 повторов: 3 и 5 подходов дали больше гипертрофии, чем 1; сила росла одинаково. | Schoenfeld et al. 2019, *Med Sci Sports Exerc* (PMID 30153194) |
| Ориентиры объёма по мышцам | MEV/MAV/MRV для каждой мышцы (таблицы ниже), не больше 8–12 подходов на мышцу за сессию. | Статьи RP (ссылки у каждой тренировки) |
| Частота | Тренировать мышцу ≥2 раз в неделю лучше, чем 1 раз. | Schoenfeld, Ogborn, Krieger 2016, *Sports Med* (PMID 27102172) |
| Диапазон повторов | Лёгкие и тяжёлые веса дают сопоставимую гипертрофию, если подходы доводить близко к отказу. Сила лучше растёт от тяжёлых. | Schoenfeld et al. 2017, *JSCR* (PMID 28834797) |
| Отдых | 3 мин между подходами многосуставных упражнений дали больше роста, чем 1 мин. | Schoenfeld et al. 2016, *JSCR* (PMID 26605807); ACE: 2–3 мин |
| Близость к отказу | Чем ближе к отказу, тем больше рост, но полный отказ не обязателен. Запас 1–3 повтора — рабочий вариант. | Refalo et al. 2023, *Sports Med* (PMID 36334240) |
| Общие рамки для новичка | 1–3 подхода × 8–12 повторов, 2–3 раза в неделю, прогрессия нагрузки. | ACSM Position Stand 2009, *MSSE* (PMID 19204579) |
| Пресс и жир на животе | 6 недель упражнений на пресс не уменьшили жир живота. Локального жиросжигания нет: кубики проявляются от дефицита калорий. | Vispute et al. 2011, *JSCR* (PMID 21804427) |
| Сушка натурала | Медленный темп снижения веса (~0,5–1% массы в неделю) и высокий белок помогают сохранить мышцы. Тяжёлые веса на сушке убирать нельзя. | Helms, Aragon, Fitschen 2014, *JISSN* (PMID 24864135) |

**Про RIR для новичка.** В JSON у каждого подхода, как и в `program.json`, стоит поле `rir`. Расшифровка: остановись, когда чувствуешь, что смог бы сделать ещё 1–2 повтора чисто, без потери техники. В исследовании Schoenfeld 2019 подходы шли до отказа. Здесь везде оставлен запас: для новичка в дефиците калорий это безопаснее, а по данным Refalo 2023 почти ничего не теряется.

---

## 2. Фулбади (3)

### Ф1. Протокол Schoenfeld 2019 (гипертрофия)
**Источник:** Schoenfeld BJ, Contreras B, Krieger J et al. *Resistance Training Volume Enhances Muscle Hypertrophy but Not Strength in Trained Men.* Med Sci Sports Exerc 2019;51(1):94–103. https://pmc.ncbi.nlm.nih.gov/articles/PMC6303131/
**Почему доверяем:** рандомизированное контролируемое исследование (РКИ) в ведущем журнале. Протокол из методики приведён дословно.

| Упражнение | Подходы × повторы | Отдых |
|---|---|---|
| Приседания со штангой (`barbell-squat`) | 3 × 8–12 | 90 с |
| Жим штанги лёжа (`bench-press`) | 3 × 8–12 | 90 с |
| Тяга верхнего блока широким хватом (`wide-grip-pulldown`) | 3 × 8–12 | 90 с |
| Жим штанги стоя (`overhead-press`) | 3 × 8–12 | 90 с |
| Тяга нижнего блока (`seated-cable-row`) | 3 × 8–12 | 90 с |
| Жим ногами (`leg-press`) | 3 × 8–12 | 90 с |
| Разгибание ног, по одной (`leg-extension`) | 3 × 8–12 | 90 с |

В исследовании отдых между упражнениями ~2 мин, частота 3 раза в неделю через день.
**Изменено:** из трёх групп исследования (1/3/5 подходов) взята средняя, 3 подхода. Вместо отказа оставлен запас 1–2 повтора. Добавлены разминочные подходы. Время ~60–70 мин.

### Ф2. Wendler — 5/3/1 for Beginners, день 1
**Источник:** Jim Wendler, *The 5/3/1 Philosophy for Beginners*. https://www.jimwendler.com/blogs/jimwendler-com/5-3-1-for-beginners. Проценты недель взяты из книги *5/3/1 2nd Edition*.
**Почему доверяем:** официальная страница автора метода. 5/3/1 — одна из самых проверенных практикой силовых систем.

| Упражнение | Схема |
|---|---|
| Присед | 5/3/1 (3 подхода) + 5×5 FSL |
| Жим лёжа | 5/3/1 (3 подхода) + 5×5 FSL |
| Толкающее: отжимания | 50–100 повторов суммарно |
| Тянущее: гравитрон | 50–100 повторов суммарно |
| Одна нога / кор: подъём коленей в упоре | 50–100 повторов суммарно |

**Схема по неделям.** Все веса считаются от тренировочного максимума (ТМ) — это 90% от 1ПМ.
- Неделя 1: 65/75/85% ТМ × 5/5/5+.
- Неделя 2: 70/80/90% × 3/3/3+.
- Неделя 3: 75/85/95% × 5/3/1+.
- FSL — 5×5 весом первого подхода.
- Чередование дней: Пн — присед + жим лёжа, Ср — становая + жим стоя, Пт — жим лёжа + присед.
- После цикла ТМ растёт: верх +2,5 кг, низ +5 кг.

**Изменено:**
- Отдых в источнике не указан. Поставлено 3 мин на основные подходы и 90 с на FSL (по Schoenfeld 2016).
- Подтягивания заменены гравитроном. Сам Wendler считает стандартом новичка 10 подтягиваний.
- В слот «кор» поставлен пресс, потому что он в приоритете у пользователя.
- Разминка Agile 8 и прыжки опущены: их нет в каталоге.
- Шаблон не умеет хранить проценты. Нужный вес на неделю пользователь ставит по заметке.

### Ф3. Starting Strength — день A
**Источник:** Mark Rippetoe, *Starting Strength Training Programs*, https://startingstrength.com/get-started/programs, и статья *Who Wants to be a Novice? You Do*, https://startingstrength.com/article/who_wants_to_be_a_novice_you_do.
**Почему доверяем:** автор учебника *Starting Strength: Basic Barbell Training*. Эталонная линейная программа для новичков.

| Упражнение | Подходы × повторы | Отдых |
|---|---|---|
| Присед | 3 × 5 | 3–5 мин |
| Жим стоя | 3 × 5 | 3 мин |
| Становая тяга | **1** × 5 | — |
| Подтягивания в гравитроне (опционально) | 3 × 5–10 | 2 мин |

День A чередуется с днём B (присед, жим лёжа, становая или взятие на грудь). Вес растёт каждую тренировку.
**Изменено:** отдых — наш ориентир, у автора «сколько нужно». Подтягивания заменены гравитроном.
**Оговорка:** сайт startingstrength.com блокирует автоматическое чтение (403). Состав дня взят из выдачи поиска по этим страницам и совпадает с описанием из нескольких независимых пересказов.

---

## 3. Грудь (3)

**Ориентиры RP (подходов в неделю):** MV 2–4, MEV 4–6, MAV 6–16, MRV 16–24. 2–4 сессии в неделю.

| Шаблон | Упражнения | Отдых |
|---|---|---|
| **A. RP: тяжёлый день** | Жим лёжа 3×5–10; жим на наклонной 3×5–10; жим стоя 2×5–10 | 150 с |
| **B. RP: средний день** | Жим гантелей на наклонной 3×10–20; разводка 3×10–20; жим гантелей сидя 2×10–20 | 90–120 с |
| **C. ACE: топ-3 по ЭМГ** | Жим лёжа 3×8–12; бабочка 3×10–15; кроссовер в наклоне 3×10–15 | 120–150 с |

**Источники:**
- A и B: Israetel / RP, *Chest Hypertrophy Training Tips*, https://rpstrength.com/blogs/articles/chest-hypertrophy-training-tips. Жимы на плечи взяты из образца «грудь + передняя дельта» в статье *Front Delt Hypertrophy Training Tips*, https://rpstrength.com/blogs/articles/front-delt-hypertrophy-training-tips.
- C: ACE / Univ. of Wisconsin–La Crosse, 2012, https://www.acefitness.org/about-ace/press-room/press-releases/2930/ace-study-tests-common-chest-exercises-finds-barbell-bench-press-most-effective/. Результаты: жим лёжа 100%, бабочка 98%, кроссовер в наклоне 93% активации.

**Изменено:**
- A и B — без изменений, добавлена только разминка.
- C: исследование выбирает упражнения, но не задаёт программу. Подходы, повторы и отдых взяты из общих рекомендаций ACE: 1–4 подхода × 8–15 повторов, 2–3 мин. Ограничение: ЭМГ показывает активацию мышцы, а не гарантированный рост.

## 4. Спина (3)

**Ориентиры RP:** не больше 8–12 подходов за сессию, 2–4 сессии в неделю.

| Шаблон | Упражнения | Отдых |
|---|---|---|
| **A. RP: средний день** | Гравитрон 4×10–20; тяга штанги в наклоне 4×10–20 | 120 с |
| **B. RP: тяжёлый + лёгкий** | Тяга штанги 2×5–10; верхний блок 2×5–10; тяга в Хаммере 2×20–30; верхний блок узким хватом 2×20–30 | 150 / 90 с |
| **C. ACE: спина + бицепс блоками** | Пары без отдыха: тяга в наклоне + концентрированные сгибания; разведение в наклоне (вместо I-Y-T) + подъём EZ; гравитрон + сгибания гантелей сидя. Всё 3×8–15, отдых 2–3 мин после пары | 150 с |

**Источники:**
- A и B: RP, *Back Hypertrophy Training Tips*, https://rpstrength.com/blogs/articles/back-hypertrophy-training-tips.
- C: ACE, *What is the Best Back Exercise?* (2023), https://www.acefitness.org/continuing-education/certified/january-2023/8214/what-is-the-best-back-exercise/. Основан на ЭМГ-исследованиях ACE по спине (2018) и бицепсу (2014).

**Изменено:**
- A: подтягивания без веса на 10–20 повторов заменены гравитроном. Он есть в списке упражнений самой RP.
- B: объединены дни Пн и Пт образца, итого 8 подходов. Подтягивания с весом заменены верхним блоком. Тяга обратным хватом заменена тягой узким хватом: обратного хвата нет в каталоге.
- C: I-Y-T заменён разведением гантелей в наклоне. «Biceps curl» — подъём EZ-штанги, «seated curl» — гантели. Подтягивания заменены гравитроном.

## 5. Ноги (3)

**Ориентиры RP (подходов в неделю):**
- квадрицепс: MEV 4–6, MAV 6–14, MRV 14–18;
- бицепс бедра: MEV 2–4, MAV 2–8, MRV 8–14;
- ягодицы: MEV 6–8, MAV 8–24.

| Шаблон | Упражнения | Отдых |
|---|---|---|
| **A. RP: тяжёлый день** | Присед 3×5–10; гакк-присед 3×5–10; румынская тяга 3×5–10; ягодичный мостик со штангой 3×5–10 | 120–180 с |
| **B. RP: средний день** | Гакк 3×10–20; жим ногами 3×10–20; сгибание ног лёжа 3×10–20; мостик 5×10–20; гоблет-присед широкой постановкой 3×10–20 | 90–120 с |
| **C. RP: лёгкий день** | Разгибание ног 3×20–30; жим ногами 3×20–30; сгибание ног сидя 3×20–30; выпады с гантелями в ходьбе 4×20–30 | 75–90 с |

**Источники:**
- RP, *Quad Hypertrophy Training Tips*, https://rpstrength.com/blogs/articles/quad-hypertrophy-training-tips
- RP, *Hamstring Hypertrophy Training Tips*, https://rpstrength.com/blogs/articles/hamstring-hypertrophy-training-tips
- RP, *Glute Hypertrophy Training Tips*, https://rpstrength.com/blogs/articles/glute-hypertrophy-training-tips

**Изменено:**
- A: убрана становая сумо с дефицитом. Для новичка это сложное упражнение, и в тот же день уже есть тяжёлая румынская тяга. Становая на прямых ногах заменена румынской тягой.
- B: мостик на одной ноге заменён мостиком на двух (когда освоишь — делай на одной). Присед сумо заменён гоблет-приседом широкой постановкой. Диапазон сгибаний сужен с 10–30 до 10–20.
- C: выпады со штангой заменены выпадами с гантелями.

## 6. Плечи (3)

**Ориентиры RP (подходов в неделю):**
- средняя дельта: MEV 6–8, MAV 8–24;
- задняя дельта: MAV 4–12, часть объёма даёт спина;
- передняя дельта: MAV 4–8, не больше 1 упражнения за сессию — её и так нагружают жимы на грудь.

| Шаблон | Упражнения | Отдых |
|---|---|---|
| **A. RP: тяжёлый день** | Жим стоя 2×5–10; тяга к подбородку 3×5–10; махи в стороны 3×10–20; тяга каната к лицу 3×10–20; обратная бабочка 3×10–20 | 75–150 с |
| **B. RP: средний день** | Жим гантелей сидя 2×10–20; махи 4×10–20; тяга к подбородку 4×10–20; разведение в наклоне 4×10–20; тяга к лицу 4×10–20 | 60–120 с |
| **C. RP: лёгкий день** | Махи «большой палец вниз» 4×20–30; махи в блоке 4×20–30; обратная бабочка 4×20–30; тяга к лицу 4×20–30 | 60 с |

**Источники:**
- RP, *Side Delt Hypertrophy Training Tips*, https://rpstrength.com/blogs/articles/side-delt-hypertrophy-training-tips
- RP, *Rear Delt Hypertrophy Training Tips*, https://rpstrength.com/blogs/articles/rear-delt-hypertrophy-training-tips
- RP, *Front Delt Hypertrophy Training Tips*, https://rpstrength.com/blogs/articles/front-delt-hypertrophy-training-tips

**Изменено:**
- Тяга штанги к лицу на 5–10 повторов заменена тягой каната к лицу на 10–20. Штангового варианта нет в каталоге, а сама RP пишет, что 5–10 повторов на заднюю дельту подходит «очень немногим».
- Тяга гантелей к подбородку заменена тягой штанги к подбородку.
- Тяга нижнего блока к подбородку заменена махами в блоке (та же средняя дельта).
- Техника для безопасности: тянуть к подбородку хватом шире плеч, локти не выше плеч.

## 7. Руки (3)

**Ориентиры RP (подходов в неделю):**
- бицепс: 8–20, новичкам 6–10;
- трицепс: MEV 4–6, MAV 6–16.

| Шаблон | Упражнения | Отдых |
|---|---|---|
| **A. RP: тяжёлый + лёгкий** | Подъём штанги на бицепс 3×5–10; жим узким хватом 4×5–10; суперсет: сгибания на блоке 3×20–30 + разгибания на блоке 4×20–30 | 60–150 с |
| **B. RP: средний день** | Сгибания на скамье Скотта 6×10–20; французский жим гантели из-за головы 3×10–20; брусья в гравитроне 3×10–20 | 75–90 с |
| **C. ACE: лидеры ЭМГ** | Пары: концентрированные сгибания + отжимания «треугольником»; разгибание с гантелью в наклоне + сгибания на блоке; затем брусья в гравитроне. Всё 3×8–15 | 120–150 с |

**Источники:**
- A и B:
  - RP, *Bicep Hypertrophy Training Tips*, https://rpstrength.com/blogs/articles/bicep-hypertrophy-training-tips
  - RP, *Tricep Hypertrophy Training Tips*, https://rpstrength.com/blogs/articles/tricep-hypertrophy-training-tips
- C:
  - ACE / J. Porcari, бицепс (2014), https://www.acefitness.org/about-ace/press-room/press-releases/4989/new-study-reveals-best-biceps-exercises/
  - ACE / UW–La Crosse, трицепс (2012), https://www.acefitness.org/about-ace/press-room/press-releases/2718/american-council-on-exercise-study-highlights-most-effective-triceps-exercises/

**Изменено:**
- A: объединены дни Пн и Пт. JM-жим (сложная техника, нагрузка на локти) заменён жимом узким хватом.
- B: spider curl заменён скамьёй Скотта. Разгибание с EZ из-за головы заменено гантелью. Брусья заменены гравитроном.
- C: подходы, повторы и отдых — по рекомендациям ACE. Отжимания «треугольником» записаны как `push-up` с узкой постановкой.

## 8. Пресс и кор (3)

**Ориентиры RP:** MAV 4–12 подходов в неделю, 3–6 сессий.
**Важно:** пресс «не сжигает» жир на животе (Vispute 2011). Рельеф появится от дефицита калорий. Сами тренировки пресса растят и укрепляют мышцу, из-за чего она станет заметнее при меньшем проценте жира.

| Шаблон | Упражнения | Отдых |
|---|---|---|
| **A. «Большая тройка» McGill** | Скручивание McGill 8–6–4; боковая планка 8–6–4 удержаний по 10 с (80/60/40 с на сторону); мёртвый жук 8–6–4 (вместо bird dog). Каждое повторение — удержание 10 с | 60 с |
| **B. ACE: лучшие на пресс** | «Велосипед» 3×10–20; подъём коленей в упоре 3×10–20; скручивания на фитболе 3×10–20; обратные скручивания 3×10–20 | 60 с |
| **C. RP: гипертрофия пресса** | Обратные скручивания 3×5–10 (вместо candlestick); подъём корпуса на наклонной 6×10–20 (reaching sit-up); подъём коленей в висе 3×20–30 | 60 с |

**Источники:**
- A: Lorne Opler, M.Ed., CSCS, *Low-back Exercises: Stuart McGill's Big Three* (ACE), https://www.acefitness.org/resources/pros/expert-articles/7077/low-back-exercises-stuart-mcgill-s-big-three/
- B: Peter Francis, PhD, SDSU Biomechanics Lab / ACE, 2001, https://www.acefitness.org/about-ace/press-room/in-the-news/246/american-council-on-exercise-ace-sponsored-study-reveals-best-and-worst-abdominal-exercises/. В исследовании 13 упражнений: «велосипед» — №1 по прямой мышце, подъём коленей в упоре — №1 по косым.
- C: RP, *Ab Hypertrophy Training Tips*, https://rpstrength.com/blogs/articles/ab-hypertrophy-training-tips

**Изменено:**
- A: скручивание McGill записано как `crunch`, техника — в заметке. Bird dog заменён мёртвым жуком: bird dog нет в каталоге.
- B: в исследовании есть только рейтинг упражнений. Подходы и повторы взяты из «среднего» диапазона RP (10–20).
- C: объединены три дня образца в одну сессию из 12 подходов. Можно, как в источнике, разнести по одному упражнению в конец каждой фулбади.

**Совет по приоритету пресса:** к любому фулбади можно добавлять один шаблон кора. Например: Пн — A (McGill, как разминка перед приседом), Ср — B, Пт — C. Получится ~20–30 подходов в неделю. Это выше MAV, поэтому в первые недели в B и C делай по 2 подхода.

---

## 9. Как этим пользоваться при 3 тренировках в неделю

- **Основа** — одна из фулбади-программ. Ф1 — для гипертрофии, Ф2 и Ф3 — для силы. Все три вписываются в ~60–75 мин.
- **Шаблоны мышечных групп** — это дни из недельных образцов RP (тяжёлый, средний, лёгкий) или самостоятельные сессии ACE/McGill. Варианты использования:
  - сплит, например Пн — грудь A + спина A, Ср — ноги B, Пт — плечи C + руки C;
  - или добавлять 1–2 упражнения из шаблона в конец фулбади для «отстающей» мышцы.
- **Длительность:** одиночный шаблон группы занимает 25–50 мин. Два шаблона вместе — ~60–75 мин.
- **На сушке** снижай объём, а не вес: RP и Helms 2014 советуют держать тяжёлые подходы и убирать подходы, если восстановление не успевает.

---

## 10. Упражнения, которых нет в каталоге

> **Обновление:** упражнения из таблицы, кроме JM-жима и мостика на одной ноге, добавлены в каталог. В `workouts.json` вместо замен теперь стоят оригинальные упражнения источников. JM-жим оставлен заменённым жимом узким хватом: он безопаснее для новичка. Мостик на одной ноге описан в заметке.

Во всех случаях в JSON стоит ближайшая замена из каталога. Ниже — предложения для пополнения каталога (сам каталог не менялся).

| Упражнение из источника | Где встречается | Замена сейчас | Предлагаемые поля |
|---|---|---|---|
| Bird dog («Птица-собака») | Кор A (McGill) | `dead-bug` | `{ id: 'bird-dog', name: 'Птица-собака (bird dog)', muscle: 'abs', secondary: ['lower_back','glutes'], equipment: 'bodyweight', type: 'bw_reps', rest: 60 }` |
| McGill curl-up | Кор A | `crunch` | `{ id: 'mcgill-curl-up', name: 'Скручивание McGill', muscle: 'abs', equipment: 'bodyweight', type: 'bw_reps', rest: 60 }` |
| I-Y-T raise на наклонной скамье | Спина C (ACE) | `rear-delt-fly` | `{ id: 'iyt-raise', name: 'Подъём I-Y-T лёжа на наклонной', muscle: 'back', secondary: ['shoulders'], equipment: 'dumbbell', type: 'weight_reps', step: 1, rest: 75 }` |
| Отжимания «треугольником» (diamond push-up) | Руки C (ACE) | `push-up` | `{ id: 'diamond-push-up', name: 'Отжимания узким хватом «треугольник»', muscle: 'triceps', secondary: ['chest','shoulders'], equipment: 'bodyweight', type: 'bw_reps', rest: 90 }` |
| Spider curl | Руки B (RP) | `preacher-curl` | `{ id: 'spider-curl', name: 'Паучьи сгибания', muscle: 'biceps', equipment: 'ez', type: 'weight_reps', rest: 75 }` |
| JM-жим | Руки A (RP) | `close-grip-bench` | `{ id: 'jm-press', name: 'Жим JM', muscle: 'triceps', equipment: 'barbell', type: 'weight_reps', bar: 'olympic', rest: 120 }` |
| Тяга верхнего блока обратным хватом | Спина B (RP) | `close-grip-pulldown` | `{ id: 'underhand-pulldown', name: 'Тяга верхнего блока обратным хватом', muscle: 'back', secondary: ['biceps'], equipment: 'cable', type: 'weight_reps', rest: 120 }` |
| Тяга к подбородку на нижнем блоке / с гантелями | Плечи B, C (RP) | `upright-row`, `cable-lateral-raise` | `{ id: 'cable-upright-row', name: 'Тяга нижнего блока к подбородку', muscle: 'shoulders', equipment: 'cable', type: 'weight_reps', rest: 75 }` |
| Ягодичный мостик на одной ноге | Ноги B (RP) | `hip-thrust` | `{ id: 'single-leg-hip-thrust', name: 'Ягодичный мостик на одной ноге', muscle: 'glutes', equipment: 'bodyweight', type: 'bw_reps', rest: 75 }` |
| Modified candlestick | Кор C (RP) | `reverse-crunch` | `{ id: 'candlestick', name: 'Свеча (подъём ног и таза лёжа)', muscle: 'abs', equipment: 'bodyweight', type: 'bw_reps', rest: 60 }` |

---

## 11. Формат `workouts.json`

Формат совместим с `program.json`: те же поля элементов `exerciseId`, `rest`, `superset`, `note`, `sets[]`, а в подходах — `kind` (`warmup` | `normal`), `repsMin`, `repsMax`, `rir` или `timeSec`. Сверху добавлен уровень `programs[]`:

```
{ version, programs: [ { id, name, kind, note, templates: [ { id, name, note,
    source: { author, title, url, also?, credibility, adapted }, items: [...] } ] } ] }
```

- `kind` — одно из `fullbody | chest | back | legs | shoulders | arms | core`.
- `source.also` — дополнительный источник: объект или массив объектов.
- `superset` — одинаковая буква у упражнений, которые выполняются подряд без отдыха. `rest` у них — отдых после пары.

---

## 12. Источники

**Исследования (PubMed, все PMID сверены через NCBI E-utilities):**
1. Schoenfeld BJ et al. Resistance Training Volume Enhances Muscle Hypertrophy but Not Strength in Trained Men. *Med Sci Sports Exerc* 2019. PMID 30153194 — https://pmc.ncbi.nlm.nih.gov/articles/PMC6303131/
2. Schoenfeld BJ, Ogborn D, Krieger JW. Dose-response relationship between weekly resistance training volume and increases in muscle mass. *J Sports Sci* 2017. PMID 27433992 — https://pubmed.ncbi.nlm.nih.gov/27433992/
3. Schoenfeld BJ, Ogborn D, Krieger JW. Effects of Resistance Training Frequency on Measures of Muscle Hypertrophy. *Sports Med* 2016. PMID 27102172 — https://pubmed.ncbi.nlm.nih.gov/27102172/
4. Schoenfeld BJ et al. Strength and Hypertrophy Adaptations Between Low- vs. High-Load Resistance Training. *JSCR* 2017. PMID 28834797 — https://pubmed.ncbi.nlm.nih.gov/28834797/
5. Schoenfeld BJ et al. Longer Interset Rest Periods Enhance Muscle Strength and Hypertrophy in Resistance-Trained Men. *JSCR* 2016. PMID 26605807 — https://pubmed.ncbi.nlm.nih.gov/26605807/
6. Refalo MC et al. Influence of Resistance Training Proximity-to-Failure on Skeletal Muscle Hypertrophy. *Sports Med* 2023. PMID 36334240 — https://pubmed.ncbi.nlm.nih.gov/36334240/
7. ACSM Position Stand. Progression Models in Resistance Training for Healthy Adults. *MSSE* 2009. PMID 19204579 — https://pubmed.ncbi.nlm.nih.gov/19204579/
8. Vispute SS et al. The effect of abdominal exercise on abdominal fat. *JSCR* 2011. PMID 21804427 — https://pubmed.ncbi.nlm.nih.gov/21804427/
9. Helms ER, Aragon AA, Fitschen PJ. Evidence-based recommendations for natural bodybuilding contest preparation. *JISSN* 2014. PMID 24864135 — https://pubmed.ncbi.nlm.nih.gov/24864135/

**Программы и методики:**
10. Jim Wendler — The 5/3/1 Philosophy for Beginners — https://www.jimwendler.com/blogs/jimwendler-com/5-3-1-for-beginners
11. Mark Rippetoe — Starting Strength Training Programs — https://startingstrength.com/get-started/programs; Who Wants to be a Novice? You Do — https://startingstrength.com/article/who_wants_to_be_a_novice_you_do
12. Renaissance Periodization (Dr. Mike Israetel) — Hypertrophy Training Tips:
    - [грудь](https://rpstrength.com/blogs/articles/chest-hypertrophy-training-tips)
    - [спина](https://rpstrength.com/blogs/articles/back-hypertrophy-training-tips)
    - [квадрицепс](https://rpstrength.com/blogs/articles/quad-hypertrophy-training-tips)
    - [бицепс бедра](https://rpstrength.com/blogs/articles/hamstring-hypertrophy-training-tips)
    - [ягодицы](https://rpstrength.com/blogs/articles/glute-hypertrophy-training-tips)
    - [средняя дельта](https://rpstrength.com/blogs/articles/side-delt-hypertrophy-training-tips)
    - [задняя дельта](https://rpstrength.com/blogs/articles/rear-delt-hypertrophy-training-tips)
    - [передняя дельта](https://rpstrength.com/blogs/articles/front-delt-hypertrophy-training-tips)
    - [бицепс](https://rpstrength.com/blogs/articles/bicep-hypertrophy-training-tips)
    - [трицепс](https://rpstrength.com/blogs/articles/tricep-hypertrophy-training-tips)
    - [пресс](https://rpstrength.com/blogs/articles/ab-hypertrophy-training-tips)
13. ACE — исследование упражнений на грудь (2012) — https://www.acefitness.org/about-ace/press-room/press-releases/2930/ace-study-tests-common-chest-exercises-finds-barbell-bench-press-most-effective/
14. ACE — исследование упражнений на бицепс (2014) — https://www.acefitness.org/about-ace/press-room/press-releases/4989/new-study-reveals-best-biceps-exercises/
15. ACE — исследование упражнений на трицепс (2012) — https://www.acefitness.org/about-ace/press-room/press-releases/2718/american-council-on-exercise-study-highlights-most-effective-triceps-exercises/
16. ACE — исследование упражнений на пресс, SDSU (2001) — https://www.acefitness.org/about-ace/press-room/in-the-news/246/american-council-on-exercise-ace-sponsored-study-reveals-best-and-worst-abdominal-exercises/
17. ACE — What is the Best Back Exercise? (2023) — https://www.acefitness.org/continuing-education/certified/january-2023/8214/what-is-the-best-back-exercise/
18. ACE — Resistance Training: Beginner Home and Gym-based Workouts — https://www.acefitness.org/resources/everyone/blog/8650/resistance-training-workouts-for-beginners/
19. L. Opler (CSCS) / ACE — Low-back Exercises: Stuart McGill's Big Three — https://www.acefitness.org/resources/pros/expert-articles/7077/low-back-exercises-stuart-mcgill-s-big-three/
