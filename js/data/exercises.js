// Встроенный каталог упражнений «Тренькинс».
// Поля: id, name, aliases, muscle, secondary, equipment, type, bar?, step?, rest

export const MUSCLES = { chest: 'Грудь', back: 'Спина', shoulders: 'Плечи', biceps: 'Бицепс', triceps: 'Трицепс', forearms: 'Предплечья', abs: 'Пресс', quads: 'Квадрицепс', hamstrings: 'Бицепс бедра', glutes: 'Ягодицы', calves: 'Икры', lower_back: 'Поясница', cardio: 'Кардио', full_body: 'Всё тело' };
export const EQUIPMENT = { barbell: 'Штанга', ez: 'EZ-гриф', dumbbell: 'Гантели', machine: 'Тренажёр', cable: 'Блок', smith: 'Смит', bodyweight: 'Свой вес', kettlebell: 'Гиря', band: 'Резина', cardio: 'Кардиотренажёр', other: 'Другое' };
export const TYPES = { weight_reps: 'Вес × повторы', bw_reps: 'Свой вес (+ отягощение)', assisted: 'С помощью (гравитрон)', time: 'На время', cardio: 'Время + дистанция' };

export const EXERCISES = [
  // ───── Грудь ─────
  { id: 'bench-press', name: 'Жим штанги лёжа', aliases: ['жим лёжа', 'жим лежа', 'бенч'], muscle: 'chest', secondary: ['triceps', 'shoulders'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 150 },
  { id: 'incline-bench-press', name: 'Жим штанги на наклонной скамье', aliases: ['жим на наклонной', 'наклонный жим'], muscle: 'chest', secondary: ['shoulders', 'triceps'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 150 },
  { id: 'decline-bench-press', name: 'Жим штанги на скамье с обратным наклоном', aliases: ['жим головой вниз', 'жим на обратном наклоне'], muscle: 'chest', secondary: ['triceps'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 150 },
  { id: 'db-bench-press', name: 'Жим гантелей лёжа', aliases: ['жим гантелей', 'жим гантелей лежа'], muscle: 'chest', secondary: ['triceps', 'shoulders'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 150 },
  { id: 'incline-db-press', name: 'Жим гантелей на наклонной скамье', aliases: ['жим гантелей на наклонной', 'наклонный жим гантелей'], muscle: 'chest', secondary: ['shoulders', 'triceps'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 150 },
  { id: 'machine-chest-press', name: 'Жим в тренажёре Хаммер (грудь)', aliases: ['хаммер', 'жим в хаммере', 'жим от груди в тренажёре', 'грудной тренажёр'], muscle: 'chest', secondary: ['triceps', 'shoulders'], equipment: 'machine', type: 'weight_reps', step: 5, rest: 120 },
  { id: 'smith-bench-press', name: 'Жим лёжа в Смите', aliases: ['жим в смите'], muscle: 'chest', secondary: ['triceps', 'shoulders'], equipment: 'smith', type: 'weight_reps', step: 5, rest: 150 },
  { id: 'db-fly', name: 'Разводка гантелей лёжа', aliases: ['разводка гантелей', 'разведение гантелей'], muscle: 'chest', secondary: ['shoulders'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 90 },
  { id: 'incline-db-fly', name: 'Разводка гантелей на наклонной скамье', aliases: ['разводка на наклонной'], muscle: 'chest', secondary: ['shoulders'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 90 },
  { id: 'cable-crossover', name: 'Сведение рук в кроссовере', aliases: ['кроссовер', 'сведение в блоках', 'сведение на верхних блоках'], muscle: 'chest', secondary: ['shoulders'], equipment: 'cable', type: 'weight_reps', step: 5, rest: 75 },
  { id: 'low-cable-crossover', name: 'Сведение рук в кроссовере снизу вверх', aliases: ['кроссовер снизу', 'сведение на нижних блоках'], muscle: 'chest', secondary: ['shoulders'], equipment: 'cable', type: 'weight_reps', step: 5, rest: 75 },
  { id: 'pec-deck', name: 'Бабочка (сведение в тренажёре)', aliases: ['пек-дек', 'пекдек', 'бабочка', 'разводка в тренажёре'], muscle: 'chest', secondary: ['shoulders'], equipment: 'machine', type: 'weight_reps', step: 5, rest: 75 },
  { id: 'push-up', name: 'Отжимания от пола', aliases: ['отжимания'], muscle: 'chest', secondary: ['triceps', 'shoulders', 'abs'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 90 },
  { id: 'chest-dips', name: 'Отжимания на брусьях (грудь)', aliases: ['брусья на грудь'], muscle: 'chest', secondary: ['triceps', 'shoulders'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 120 },
  { id: 'assisted-dips', name: 'Отжимания на брусьях в гравитроне', aliases: ['брусья в гравитроне'], muscle: 'triceps', secondary: ['chest', 'shoulders'], equipment: 'machine', type: 'assisted', step: 5, rest: 120 },

  // ───── Спина ─────
  { id: 'lat-pulldown', name: 'Тяга верхнего блока к груди', aliases: ['верхний блок', 'тяга верхнего блока', 'вертикальная тяга'], muscle: 'back', secondary: ['biceps', 'forearms'], equipment: 'cable', type: 'weight_reps', step: 5, rest: 120 },
  { id: 'wide-grip-pulldown', name: 'Тяга верхнего блока широким хватом', aliases: ['верхний блок широким хватом'], muscle: 'back', secondary: ['biceps'], equipment: 'cable', type: 'weight_reps', step: 5, rest: 120 },
  { id: 'close-grip-pulldown', name: 'Тяга верхнего блока узким хватом', aliases: ['верхний блок узким хватом', 'тяга к груди V-рукояткой'], muscle: 'back', secondary: ['biceps'], equipment: 'cable', type: 'weight_reps', step: 5, rest: 120 },
  { id: 'pull-up', name: 'Подтягивания', aliases: ['подтягивания широким хватом', 'турник'], muscle: 'back', secondary: ['biceps', 'forearms'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 150 },
  { id: 'chin-up', name: 'Подтягивания обратным хватом', aliases: ['подтягивания к себе', 'обратным хватом'], muscle: 'back', secondary: ['biceps'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 150 },
  { id: 'assisted-pull-up', name: 'Подтягивания в гравитроне', aliases: ['гравитрон', 'подтягивания с помощью'], muscle: 'back', secondary: ['biceps'], equipment: 'machine', type: 'assisted', step: 5, rest: 120 },
  { id: 'seated-cable-row', name: 'Тяга нижнего блока к поясу', aliases: ['нижний блок', 'горизонтальная тяга', 'тяга блока сидя'], muscle: 'back', secondary: ['biceps', 'forearms'], equipment: 'cable', type: 'weight_reps', step: 5, rest: 120 },
  { id: 'barbell-row', name: 'Тяга штанги в наклоне', aliases: ['тяга штанги к поясу', 'тяга в наклоне'], muscle: 'back', secondary: ['biceps', 'lower_back', 'forearms'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 150 },
  { id: 'db-row', name: 'Тяга гантели одной рукой', aliases: ['тяга гантели в наклоне', 'тяга гантели к поясу'], muscle: 'back', secondary: ['biceps', 'forearms'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 120 },
  { id: 't-bar-row', name: 'Тяга Т-грифа', aliases: ['т-гриф', 'тяга т-образного грифа'], muscle: 'back', secondary: ['biceps', 'lower_back'], equipment: 'barbell', type: 'weight_reps', step: 2.5, rest: 150 },
  { id: 'machine-row', name: 'Тяга в тренажёре Хаммер (спина)', aliases: ['рычажная тяга', 'тяга в хаммере', 'тяга хаммер'], muscle: 'back', secondary: ['biceps'], equipment: 'machine', type: 'weight_reps', step: 5, rest: 120 },
  { id: 'chest-supported-row', name: 'Тяга гантелей с упором грудью', aliases: ['тяга на наклонной скамье'], muscle: 'back', secondary: ['biceps', 'shoulders'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 120 },
  { id: 'straight-arm-pulldown', name: 'Пулловер на верхнем блоке', aliases: ['тяга прямыми руками', 'пуловер в блоке'], muscle: 'back', secondary: ['triceps'], equipment: 'cable', type: 'weight_reps', step: 5, rest: 90 },
  { id: 'db-pullover', name: 'Пуловер с гантелью', aliases: ['пулловер'], muscle: 'back', secondary: ['chest', 'triceps'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 90 },
  { id: 'deadlift', name: 'Становая тяга', aliases: ['становая', 'классическая становая'], muscle: 'back', secondary: ['glutes', 'hamstrings', 'lower_back', 'forearms'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 180 },
  { id: 'sumo-deadlift', name: 'Становая тяга сумо', aliases: ['сумо'], muscle: 'back', secondary: ['glutes', 'quads', 'hamstrings', 'lower_back'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 180 },
  { id: 'rack-pull', name: 'Тяга с плинтов', aliases: ['рэк-пул', 'становая с плинтов'], muscle: 'back', secondary: ['lower_back', 'glutes', 'forearms'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 180 },
  { id: 'shrug-barbell', name: 'Шраги со штангой', aliases: ['шраги', 'пожимания плечами'], muscle: 'back', secondary: ['forearms'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 90 },
  { id: 'shrug-db', name: 'Шраги с гантелями', aliases: ['шраги гантели'], muscle: 'back', secondary: ['forearms'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 90 },
  { id: 'hyperextension', name: 'Гиперэкстензия', aliases: ['гипер', 'разгибания на римском стуле'], muscle: 'lower_back', secondary: ['glutes', 'hamstrings'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 75 },
  { id: 'good-morning', name: 'Наклоны со штангой (Good morning)', aliases: ['гуд монинг', 'доброе утро'], muscle: 'lower_back', secondary: ['hamstrings', 'glutes'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 120 },
  { id: 'back-extension-machine', name: 'Разгибания спины в тренажёре', aliases: ['тренажёр для поясницы'], muscle: 'lower_back', secondary: ['glutes'], equipment: 'machine', type: 'weight_reps', step: 5, rest: 75 },

  // ───── Плечи ─────
  { id: 'overhead-press', name: 'Жим штанги стоя', aliases: ['армейский жим', 'жим стоя'], muscle: 'shoulders', secondary: ['triceps', 'abs'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 150 },
  { id: 'seated-barbell-press', name: 'Жим штанги сидя', aliases: ['жим сидя'], muscle: 'shoulders', secondary: ['triceps'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 150 },
  { id: 'db-shoulder-press', name: 'Жим гантелей сидя', aliases: ['жим гантелей над головой', 'жим гантелей на плечи'], muscle: 'shoulders', secondary: ['triceps'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 150 },
  { id: 'arnold-press', name: 'Жим Арнольда', aliases: ['арнольд'], muscle: 'shoulders', secondary: ['triceps'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 120 },
  { id: 'machine-shoulder-press', name: 'Жим в тренажёре на плечи', aliases: ['жим от плеч в тренажёре', 'плечевой жим в хаммере'], muscle: 'shoulders', secondary: ['triceps'], equipment: 'machine', type: 'weight_reps', step: 5, rest: 120 },
  { id: 'smith-shoulder-press', name: 'Жим в Смите сидя', aliases: ['жим плеч в смите'], muscle: 'shoulders', secondary: ['triceps'], equipment: 'smith', type: 'weight_reps', step: 5, rest: 120 },
  { id: 'lateral-raise', name: 'Махи гантелей в стороны', aliases: ['разведение гантелей в стороны', 'махи в стороны', 'боковые махи'], muscle: 'shoulders', secondary: [], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 60 },
  { id: 'cable-lateral-raise', name: 'Махи в стороны в блоке', aliases: ['боковые махи на блоке'], muscle: 'shoulders', secondary: [], equipment: 'cable', type: 'weight_reps', step: 5, rest: 60 },
  { id: 'machine-lateral-raise', name: 'Махи в стороны в тренажёре', aliases: ['разведение в стороны в тренажёре'], muscle: 'shoulders', secondary: [], equipment: 'machine', type: 'weight_reps', step: 5, rest: 60 },
  { id: 'front-raise', name: 'Подъём гантелей перед собой', aliases: ['махи вперёд', 'фронтальные махи'], muscle: 'shoulders', secondary: [], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 60 },
  { id: 'rear-delt-fly', name: 'Разведение гантелей в наклоне', aliases: ['задние дельты', 'махи в наклоне'], muscle: 'shoulders', secondary: ['back'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 60 },
  { id: 'reverse-pec-deck', name: 'Обратная бабочка (задние дельты)', aliases: ['обратные разведения в тренажёре', 'задняя дельта в пек-деке'], muscle: 'shoulders', secondary: ['back'], equipment: 'machine', type: 'weight_reps', step: 5, rest: 60 },
  { id: 'face-pull', name: 'Тяга каната к лицу', aliases: ['фейс пулл', 'тяга к лицу', 'face pull'], muscle: 'shoulders', secondary: ['back'], equipment: 'cable', type: 'weight_reps', step: 5, rest: 60 },
  { id: 'upright-row', name: 'Тяга штанги к подбородку', aliases: ['протяжка'], muscle: 'shoulders', secondary: ['back'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 90 },

  // ───── Бицепс ─────
  { id: 'barbell-curl', name: 'Подъём штанги на бицепс', aliases: ['бицепс со штангой', 'сгибания со штангой'], muscle: 'biceps', secondary: ['forearms'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 75 },
  { id: 'ez-curl', name: 'Подъём EZ-штанги на бицепс', aliases: ['бицепс с EZ', 'бицепс с изогнутой штангой', 'z-гриф'], muscle: 'biceps', secondary: ['forearms'], equipment: 'ez', type: 'weight_reps', bar: 'ez', step: 2.5, rest: 75 },
  { id: 'db-curl', name: 'Подъём гантелей на бицепс', aliases: ['бицепс с гантелями', 'сгибания с гантелями'], muscle: 'biceps', secondary: ['forearms'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 75 },
  { id: 'hammer-curl', name: 'Молотки', aliases: ['хаммер сгибания', 'сгибания молотком', 'молотковые сгибания'], muscle: 'biceps', secondary: ['forearms'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 75 },
  { id: 'incline-db-curl', name: 'Сгибания гантелей на наклонной скамье', aliases: ['бицепс на наклонной скамье'], muscle: 'biceps', secondary: [], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 75 },
  { id: 'preacher-curl', name: 'Сгибания на скамье Скотта', aliases: ['скотт', 'скамья скотта', 'бицепс на скотте'], muscle: 'biceps', secondary: [], equipment: 'ez', type: 'weight_reps', bar: 'ez', step: 2.5, rest: 75 },
  { id: 'concentration-curl', name: 'Концентрированные сгибания', aliases: ['концентрированный подъём'], muscle: 'biceps', secondary: [], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 60 },
  { id: 'cable-curl', name: 'Сгибания рук на нижнем блоке', aliases: ['бицепс в блоке', 'бицепс на блоке'], muscle: 'biceps', secondary: ['forearms'], equipment: 'cable', type: 'weight_reps', step: 5, rest: 60 },
  { id: 'machine-curl', name: 'Сгибания рук в тренажёре', aliases: ['бицепс в тренажёре'], muscle: 'biceps', secondary: [], equipment: 'machine', type: 'weight_reps', step: 5, rest: 60 },

  // ───── Трицепс ─────
  { id: 'triceps-pushdown', name: 'Разгибание рук на верхнем блоке', aliases: ['трицепс на блоке', 'разгибания на блоке', 'трицепс канат', 'прямая рукоятка'], muscle: 'triceps', secondary: [], equipment: 'cable', type: 'weight_reps', step: 5, rest: 75 },
  { id: 'rope-pushdown', name: 'Разгибание рук с канатом на блоке', aliases: ['трицепс с канатом', 'канат на трицепс'], muscle: 'triceps', secondary: [], equipment: 'cable', type: 'weight_reps', step: 5, rest: 75 },
  { id: 'overhead-triceps-extension', name: 'Французский жим из-за головы (гантель)', aliases: ['разгибание из-за головы', 'трицепс из-за головы'], muscle: 'triceps', secondary: [], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 75 },
  { id: 'cable-overhead-extension', name: 'Разгибание рук из-за головы на блоке', aliases: ['трицепс из-за головы на блоке'], muscle: 'triceps', secondary: [], equipment: 'cable', type: 'weight_reps', step: 5, rest: 75 },
  { id: 'skullcrusher', name: 'Французский жим лёжа', aliases: ['французский жим', 'жим лбом', 'скуллкрашер'], muscle: 'triceps', secondary: [], equipment: 'ez', type: 'weight_reps', bar: 'ez', step: 2.5, rest: 90 },
  { id: 'close-grip-bench', name: 'Жим лёжа узким хватом', aliases: ['жим узким хватом'], muscle: 'triceps', secondary: ['chest', 'shoulders'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 150 },
  { id: 'dips', name: 'Отжимания на брусьях', aliases: ['брусья'], muscle: 'triceps', secondary: ['chest', 'shoulders'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 120 },
  { id: 'bench-dips', name: 'Обратные отжимания от скамьи', aliases: ['отжимания от скамьи сзади'], muscle: 'triceps', secondary: ['shoulders'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 75 },
  { id: 'db-kickback', name: 'Разгибание руки с гантелью в наклоне', aliases: ['кикбэк', 'отведение гантели назад'], muscle: 'triceps', secondary: [], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 60 },
  { id: 'machine-triceps-extension', name: 'Разгибание рук в тренажёре', aliases: ['трицепс в тренажёре'], muscle: 'triceps', secondary: [], equipment: 'machine', type: 'weight_reps', step: 5, rest: 75 },

  // ───── Предплечья ─────
  { id: 'wrist-curl', name: 'Сгибания кистей со штангой', aliases: ['предплечья', 'сгибания запястий'], muscle: 'forearms', secondary: [], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 60 },
  { id: 'reverse-wrist-curl', name: 'Разгибания кистей со штангой', aliases: ['разгибания запястий'], muscle: 'forearms', secondary: [], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 60 },
  { id: 'reverse-curl', name: 'Сгибания обратным хватом', aliases: ['обратные сгибания', 'бицепс обратным хватом'], muscle: 'forearms', secondary: ['biceps'], equipment: 'ez', type: 'weight_reps', bar: 'ez', step: 2.5, rest: 60 },
  { id: 'farmer-walk', name: 'Прогулка фермера', aliases: ['фермерская прогулка'], muscle: 'forearms', secondary: ['back', 'abs'], equipment: 'dumbbell', type: 'time', rest: 90 },
  { id: 'dead-hang', name: 'Вис на турнике', aliases: ['вис'], muscle: 'forearms', secondary: ['back'], equipment: 'bodyweight', type: 'time', rest: 60 },

  // ───── Квадрицепс ─────
  { id: 'barbell-squat', name: 'Приседания со штангой', aliases: ['присед', 'приседания', 'присед со штангой'], muscle: 'quads', secondary: ['glutes', 'hamstrings', 'lower_back'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 180 },
  { id: 'front-squat', name: 'Фронтальный присед', aliases: ['присед на груди', 'присед со штангой на груди'], muscle: 'quads', secondary: ['glutes', 'abs'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 180 },
  { id: 'smith-squat', name: 'Приседания в Смите', aliases: ['присед в смите'], muscle: 'quads', secondary: ['glutes'], equipment: 'smith', type: 'weight_reps', step: 5, rest: 150 },
  { id: 'goblet-squat', name: 'Гоблет-присед', aliases: ['присед с гантелью', 'присед с гирей', 'гоблет'], muscle: 'quads', secondary: ['glutes', 'abs'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 90 },
  { id: 'hack-squat', name: 'Гакк-присед', aliases: ['гакк', 'хакк', 'гакк-машина', 'присед в гакк-тренажёре'], muscle: 'quads', secondary: ['glutes'], equipment: 'machine', type: 'weight_reps', step: 5, rest: 150 },
  { id: 'leg-press', name: 'Жим ногами', aliases: ['жим платформы', 'платформа', 'жим ногами в тренажёре'], muscle: 'quads', secondary: ['glutes', 'hamstrings'], equipment: 'machine', type: 'weight_reps', step: 5, rest: 150 },
  { id: 'narrow-leg-press', name: 'Жим ногами узкой постановкой', aliases: ['жим ногами узко'], muscle: 'quads', secondary: ['glutes'], equipment: 'machine', type: 'weight_reps', step: 5, rest: 150 },
  { id: 'high-feet-leg-press', name: 'Жим ногами с высокой постановкой ног', aliases: ['жим ногами высоко', 'жим ногами на ягодицы'], muscle: 'glutes', secondary: ['quads', 'hamstrings'], equipment: 'machine', type: 'weight_reps', step: 5, rest: 150 },
  { id: 'single-leg-press', name: 'Жим ногами одной ногой', aliases: ['жим одной ногой'], muscle: 'quads', secondary: ['glutes'], equipment: 'machine', type: 'weight_reps', step: 5, rest: 120 },
  { id: 'leg-extension', name: 'Разгибание ног в тренажёре', aliases: ['разгибания ног', 'квадрицепс в тренажёре'], muscle: 'quads', secondary: [], equipment: 'machine', type: 'weight_reps', step: 5, rest: 75 },
  { id: 'walking-lunge', name: 'Выпады с гантелями в ходьбе', aliases: ['выпады', 'выпады в ходьбе', 'выпады с гантелями'], muscle: 'quads', secondary: ['glutes', 'hamstrings'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 120 },
  { id: 'reverse-lunge', name: 'Обратные выпады', aliases: ['выпады назад'], muscle: 'quads', secondary: ['glutes', 'hamstrings'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 120 },
  { id: 'bulgarian-split-squat', name: 'Болгарские сплит-приседания', aliases: ['болгарские выпады', 'болгарка', 'болгарский присед'], muscle: 'quads', secondary: ['glutes', 'hamstrings'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 120 },
  { id: 'step-up', name: 'Зашагивания на тумбу', aliases: ['степ-ап', 'подъём на платформу'], muscle: 'quads', secondary: ['glutes'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 90 },
  { id: 'bodyweight-squat', name: 'Приседания с собственным весом', aliases: ['приседания без веса', 'воздушные приседания'], muscle: 'quads', secondary: ['glutes'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 60 },

  // ───── Бицепс бедра ─────
  { id: 'romanian-deadlift', name: 'Румынская тяга', aliases: ['румынка', 'румынская становая', 'РДЛ'], muscle: 'hamstrings', secondary: ['glutes', 'lower_back'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 150 },
  { id: 'db-romanian-deadlift', name: 'Румынская тяга с гантелями', aliases: ['румынка с гантелями'], muscle: 'hamstrings', secondary: ['glutes', 'lower_back'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 120 },
  { id: 'stiff-leg-deadlift', name: 'Становая тяга на прямых ногах', aliases: ['мёртвая тяга', 'тяга на прямых ногах'], muscle: 'hamstrings', secondary: ['glutes', 'lower_back'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 150 },
  { id: 'leg-curl', name: 'Сгибание ног лёжа в тренажёре', aliases: ['сгибания ног', 'сгибание ног лёжа'], muscle: 'hamstrings', secondary: ['calves'], equipment: 'machine', type: 'weight_reps', step: 5, rest: 75 },
  { id: 'seated-leg-curl', name: 'Сгибание ног сидя в тренажёре', aliases: ['сгибания ног сидя'], muscle: 'hamstrings', secondary: ['calves'], equipment: 'machine', type: 'weight_reps', step: 5, rest: 75 },
  { id: 'nordic-curl', name: 'Нордические сгибания', aliases: ['нордик'], muscle: 'hamstrings', secondary: ['glutes'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 120 },

  // ───── Ягодицы ─────
  { id: 'hip-thrust', name: 'Ягодичный мостик со штангой', aliases: ['ягодичный мост', 'хип-траст', 'мостик со штангой'], muscle: 'glutes', secondary: ['hamstrings', 'quads'], equipment: 'barbell', type: 'weight_reps', bar: 'olympic', step: 2.5, rest: 120 },
  { id: 'glute-bridge', name: 'Ягодичный мостик', aliases: ['мостик', 'ягодичный мост без веса'], muscle: 'glutes', secondary: ['hamstrings'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 75 },
  { id: 'cable-kickback', name: 'Отведение ноги назад в блоке', aliases: ['ягодичные отведения в блоке', 'кикбэк в блоке', 'отведение ноги в кроссовере'], muscle: 'glutes', secondary: ['hamstrings'], equipment: 'cable', type: 'weight_reps', step: 5, rest: 60 },
  { id: 'hip-abduction', name: 'Разведение ног в тренажёре', aliases: ['разведение ног', 'абдуктор'], muscle: 'glutes', secondary: [], equipment: 'machine', type: 'weight_reps', step: 5, rest: 60 },
  { id: 'hip-adduction', name: 'Сведение ног в тренажёре', aliases: ['сведение ног', 'аддуктор'], muscle: 'quads', secondary: [], equipment: 'machine', type: 'weight_reps', step: 5, rest: 60 },
  { id: 'kettlebell-swing', name: 'Махи гирей', aliases: ['мах гири', 'свинг'], muscle: 'glutes', secondary: ['hamstrings', 'lower_back', 'shoulders'], equipment: 'kettlebell', type: 'weight_reps', step: 4, rest: 90 },

  // ───── Икры ─────
  { id: 'calf-raise', name: 'Подъём на носки стоя', aliases: ['икры стоя', 'подъём на носки', 'икры'], muscle: 'calves', secondary: [], equipment: 'machine', type: 'weight_reps', step: 5, rest: 60 },
  { id: 'seated-calf-raise', name: 'Подъём на носки сидя', aliases: ['икры сидя'], muscle: 'calves', secondary: [], equipment: 'machine', type: 'weight_reps', step: 5, rest: 60 },
  { id: 'leg-press-calf-raise', name: 'Подъём на носки в жиме ногами', aliases: ['икры в платформе'], muscle: 'calves', secondary: [], equipment: 'machine', type: 'weight_reps', step: 5, rest: 60 },

  // ───── Пресс ─────
  { id: 'hanging-leg-raise', name: 'Подъём ног в висе', aliases: ['подъём прямых ног в висе', 'ноги в висе'], muscle: 'abs', secondary: ['forearms'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 60 },
  { id: 'hanging-knee-raise', name: 'Подъём коленей в висе', aliases: ['колени в висе', 'подъём согнутых ног в висе'], muscle: 'abs', secondary: ['forearms'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 60 },
  { id: 'captain-chair-knee-raise', name: 'Подъём коленей в упоре на брусьях', aliases: ['уголок', 'римский стул подъём ног', 'подъём ног в упоре', 'капитанский стул'], muscle: 'abs', secondary: [], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 60 },
  { id: 'toes-to-bar', name: 'Носки к перекладине', aliases: ['ноги к турнику', 'toes to bar'], muscle: 'abs', secondary: ['forearms', 'back'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 75 },
  { id: 'cable-crunch', name: 'Скручивания на верхнем блоке', aliases: ['молитва', 'скручивания в блоке', 'пресс на блоке', 'канатные скручивания'], muscle: 'abs', secondary: [], equipment: 'cable', type: 'weight_reps', step: 5, rest: 60 },
  { id: 'machine-crunch', name: 'Скручивания в тренажёре', aliases: ['пресс в тренажёре', 'тренажёр для пресса'], muscle: 'abs', secondary: [], equipment: 'machine', type: 'weight_reps', step: 5, rest: 60 },
  { id: 'plank', name: 'Планка', aliases: ['планка на локтях', 'статика'], muscle: 'abs', secondary: ['shoulders', 'lower_back'], equipment: 'bodyweight', type: 'time', rest: 45 },
  { id: 'side-plank', name: 'Боковая планка', aliases: ['планка на боку'], muscle: 'abs', secondary: ['shoulders'], equipment: 'bodyweight', type: 'time', rest: 45 },
  { id: 'hollow-hold', name: 'Лодочка (Hollow hold)', aliases: ['холлоу', 'удержание лодочки', 'hollow body'], muscle: 'abs', secondary: [], equipment: 'bodyweight', type: 'time', rest: 45 },
  { id: 'ab-wheel', name: 'Ролик для пресса', aliases: ['ab wheel', 'колесо для пресса', 'роликовые скручивания'], muscle: 'abs', secondary: ['shoulders', 'lower_back'], equipment: 'other', type: 'bw_reps', step: 2.5, rest: 60 },
  { id: 'crunch', name: 'Скручивания', aliases: ['скручивания лёжа', 'классические скручивания', 'пресс'], muscle: 'abs', secondary: [], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 45 },
  { id: 'weighted-crunch', name: 'Скручивания с отягощением', aliases: ['скручивания с блином'], muscle: 'abs', secondary: [], equipment: 'other', type: 'weight_reps', step: 2.5, rest: 60 },
  { id: 'reverse-crunch', name: 'Обратные скручивания', aliases: ['подъём таза лёжа', 'нижний пресс'], muscle: 'abs', secondary: [], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 45 },
  { id: 'lying-leg-raise', name: 'Подъём ног лёжа', aliases: ['поднимание ног лёжа', 'подъём прямых ног лёжа'], muscle: 'abs', secondary: [], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 45 },
  { id: 'decline-situp', name: 'Подъём корпуса на наклонной скамье', aliases: ['пресс на наклонной скамье', 'скручивания на наклонной скамье', 'подъёмы корпуса'], muscle: 'abs', secondary: [], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 60 },
  { id: 'bicycle-crunch', name: 'Велосипед', aliases: ['скручивания велосипед'], muscle: 'abs', secondary: [], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 45 },
  { id: 'russian-twist', name: 'Русские скручивания', aliases: ['русский твист', 'скручивания сидя с поворотом'], muscle: 'abs', secondary: [], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 45 },
  { id: 'dead-bug', name: 'Мёртвый жук', aliases: ['дед баг', 'dead bug'], muscle: 'abs', secondary: [], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 45 },
  { id: 'pallof-press', name: 'Жим Паллофа', aliases: ['паллоф', 'антиротация в блоке'], muscle: 'abs', secondary: ['shoulders'], equipment: 'cable', type: 'weight_reps', step: 5, rest: 60 },
  { id: 'woodchopper', name: 'Дровосек в блоке', aliases: ['дровосек', 'рубка дров', 'повороты в блоке'], muscle: 'abs', secondary: ['shoulders'], equipment: 'cable', type: 'weight_reps', step: 5, rest: 60 },
  { id: 'v-up', name: 'Складка (V-подъёмы)', aliases: ['складной нож', 'v-ups', 'уголок лёжа'], muscle: 'abs', secondary: [], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 45 },
  { id: 'mountain-climbers', name: 'Скалолаз', aliases: ['маунтин клаймберс', 'бег в упоре'], muscle: 'abs', secondary: ['shoulders', 'cardio'], equipment: 'bodyweight', type: 'time', rest: 45 },
  { id: 'bear-crawl', name: 'Медвежья походка', aliases: ['bear crawl'], muscle: 'abs', secondary: ['shoulders', 'quads'], equipment: 'bodyweight', type: 'time', rest: 60 },
  { id: 'stability-ball-crunch', name: 'Скручивания на фитболе', aliases: ['пресс на фитболе'], muscle: 'abs', secondary: [], equipment: 'other', type: 'bw_reps', step: 2.5, rest: 45 },

  // ───── Кардио ─────
  { id: 'treadmill-walk', name: 'Ходьба на дорожке', aliases: ['беговая дорожка', 'ходьба', 'ходьба в горку', 'дорожка'], muscle: 'cardio', secondary: [], equipment: 'cardio', type: 'cardio', rest: 0 },
  { id: 'treadmill-run', name: 'Бег на дорожке', aliases: ['бег', 'беговая дорожка бег'], muscle: 'cardio', secondary: ['quads', 'calves'], equipment: 'cardio', type: 'cardio', rest: 0 },
  { id: 'elliptical', name: 'Эллипс', aliases: ['эллиптический тренажёр', 'орбитрек'], muscle: 'cardio', secondary: [], equipment: 'cardio', type: 'cardio', rest: 0 },
  { id: 'stationary-bike', name: 'Велотренажёр', aliases: ['велосипед', 'вело', 'байк'], muscle: 'cardio', secondary: ['quads'], equipment: 'cardio', type: 'cardio', rest: 0 },
  { id: 'rowing-machine', name: 'Гребной тренажёр', aliases: ['гребля', 'концепт', 'гребной'], muscle: 'cardio', secondary: ['back', 'quads'], equipment: 'cardio', type: 'cardio', rest: 0 },
  { id: 'stair-climber', name: 'Лестница (степпер)', aliases: ['степпер', 'лестница', 'эскалатор'], muscle: 'cardio', secondary: ['glutes', 'quads'], equipment: 'cardio', type: 'cardio', rest: 0 },
  { id: 'jump-rope', name: 'Скакалка', aliases: ['прыжки на скакалке'], muscle: 'cardio', secondary: ['calves'], equipment: 'other', type: 'time', rest: 60 },
  { id: 'battle-ropes', name: 'Канаты (Battle ropes)', aliases: ['боевые канаты', 'волны канатами'], muscle: 'cardio', secondary: ['shoulders', 'abs'], equipment: 'other', type: 'time', rest: 60 },
  { id: 'burpee', name: 'Бёрпи', aliases: ['берпи'], muscle: 'full_body', secondary: ['cardio', 'chest', 'quads'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 60 },

  // ───── Всё тело ─────
  { id: 'kettlebell-clean-press', name: 'Взятие гири на грудь и жим', aliases: ['взятие и жим гири'], muscle: 'full_body', secondary: ['shoulders', 'glutes'], equipment: 'kettlebell', type: 'weight_reps', step: 4, rest: 90 },
  { id: 'turkish-get-up', name: 'Турецкий подъём', aliases: ['турецкий подъем'], muscle: 'full_body', secondary: ['shoulders', 'abs'], equipment: 'kettlebell', type: 'weight_reps', step: 4, rest: 90 },
  { id: 'thruster', name: 'Трастеры', aliases: ['трастер', 'thruster'], muscle: 'full_body', secondary: ['quads', 'shoulders', 'glutes'], equipment: 'dumbbell', type: 'weight_reps', step: 2, rest: 90 },
  // ───── Из библиотеки тренировок (research/workouts.md, раздел 10) ─────
  { id: 'bird-dog', name: 'Птица-собака (bird dog)', aliases: ['птица собака', 'bird dog', 'берд дог'], muscle: 'abs', secondary: ['lower_back', 'glutes'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 60 },
  { id: 'mcgill-curl-up', name: 'Скручивание McGill', aliases: ['скручивание макгилла', 'curl-up', 'макгилл'], muscle: 'abs', secondary: [], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 60 },
  { id: 'iyt-raise', name: 'Подъём I-Y-T лёжа на наклонной', aliases: ['iyt', 'ай вай ти'], muscle: 'back', secondary: ['shoulders'], equipment: 'dumbbell', type: 'weight_reps', step: 1, rest: 75, startWeight: 2 },
  { id: 'diamond-push-up', name: 'Отжимания узким хватом «треугольник»', aliases: ['алмазные отжимания', 'отжимания треугольником', 'diamond push-up'], muscle: 'triceps', secondary: ['chest', 'shoulders'], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 90 },
  { id: 'spider-curl', name: 'Паучьи сгибания', aliases: ['спайдер', 'spider curl', 'сгибания на наклонной грудью'], muscle: 'biceps', secondary: [], equipment: 'ez', type: 'weight_reps', bar: 'ez', step: 2.5, rest: 75 },
  { id: 'underhand-pulldown', name: 'Тяга верхнего блока обратным хватом', aliases: ['верхний блок обратным хватом'], muscle: 'back', secondary: ['biceps'], equipment: 'cable', type: 'weight_reps', step: 5, rest: 120 },
  { id: 'cable-upright-row', name: 'Тяга нижнего блока к подбородку', aliases: ['протяжка на блоке', 'тяга к подбородку на блоке'], muscle: 'shoulders', secondary: ['back'], equipment: 'cable', type: 'weight_reps', step: 5, rest: 75 },
  { id: 'candlestick', name: 'Свеча (подъём ног и таза лёжа)', aliases: ['свеча', 'candlestick'], muscle: 'abs', secondary: [], equipment: 'bodyweight', type: 'bw_reps', step: 2.5, rest: 60 }
];
