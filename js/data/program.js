// Рекомендуемая программа (из research/program.json, id сведены с каталогом упражнений).
export const RECOMMENDED_PROGRAM = {
 "program": {
  "name": "Фулбади 3×: сила и рельеф в дефиците",
  "note": "Три разные тренировки на всё тело (А, Б, В), чередуются: например Пн — А, Ср — Б, Пт — В. Каждая мышца получает нагрузку 2–3 раза в неделю, пресс — в каждой тренировке. Рабочие подходы останавливай, когда в запасе остаётся 1–3 повтора (RIR — число в подходе). Вес и цель повторов на сегодня подсказывает приложение по правилу двойной прогрессии. Длительность ~55–70 мин без кардио. Первые 2 недели можно делать на 1 рабочий подход меньше в каждом упражнении, чтобы освоить технику и снизить крепатуру."
 },
 "templates": [
  {
   "name": "День А",
   "note": "Присед, жим лёжа, вертикальная тяга, средняя дельта, пресс (сгибание + удержание).",
   "items": [
    {
     "exerciseId": "barbell-squat",
     "rest": 180,
     "superset": null,
     "note": "Разминка: пустой гриф ×10, затем ~60% рабочего веса ×5. Глубина — насколько позволяет ровная спина.",
     "sets": [
      {
       "kind": "warmup",
       "repsMin": 10,
       "repsMax": 10
      },
      {
       "kind": "warmup",
       "repsMin": 5,
       "repsMax": 5
      },
      {
       "kind": "normal",
       "repsMin": 6,
       "repsMax": 10,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 6,
       "repsMax": 10,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 6,
       "repsMax": 10,
       "rir": 2
      }
     ]
    },
    {
     "exerciseId": "bench-press",
     "rest": 150,
     "superset": null,
     "note": "Лопатки сведены, стопы в пол. Работай со страховкой или в раме с ограничителями.",
     "sets": [
      {
       "kind": "warmup",
       "repsMin": 10,
       "repsMax": 10
      },
      {
       "kind": "warmup",
       "repsMin": 5,
       "repsMax": 5
      },
      {
       "kind": "normal",
       "repsMin": 6,
       "repsMax": 10,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 6,
       "repsMax": 10,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 6,
       "repsMax": 10,
       "rir": 2
      }
     ]
    },
    {
     "exerciseId": "lat-pulldown",
     "rest": 120,
     "superset": null,
     "note": "Тяни локтями вниз к рёбрам, без раскачки корпусом.",
     "sets": [
      {
       "kind": "warmup",
       "repsMin": 10,
       "repsMax": 10
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      }
     ]
    },
    {
     "exerciseId": "lateral-raise",
     "rest": 75,
     "superset": null,
     "note": "Лёгкий вес, без рывков, поднимай до уровня плеч.",
     "sets": [
      {
       "kind": "normal",
       "repsMin": 12,
       "repsMax": 20,
       "rir": 1
      },
      {
       "kind": "normal",
       "repsMin": 12,
       "repsMax": 20,
       "rir": 1
      }
     ]
    },
    {
     "exerciseId": "cable-crunch",
     "rest": 75,
     "superset": null,
     "note": "Скручивай позвоночник (грудь к тазу), а не наклоняйся в тазобедренных. Прогрессируй весом, как в любом упражнении.",
     "sets": [
      {
       "kind": "normal",
       "repsMin": 10,
       "repsMax": 15,
       "rir": 1
      },
      {
       "kind": "normal",
       "repsMin": 10,
       "repsMax": 15,
       "rir": 1
      },
      {
       "kind": "normal",
       "repsMin": 10,
       "repsMax": 15,
       "rir": 1
      }
     ]
    },
    {
     "exerciseId": "plank",
     "rest": 60,
     "superset": null,
     "note": "Ягодицы и пресс напряжены, поясница не провисает. Когда 60 с даются легко — усложняй (выше ноги, блин на спину), а не удлиняй до бесконечности.",
     "sets": [
      {
       "kind": "normal",
       "timeSec": 45
      },
      {
       "kind": "normal",
       "timeSec": 45
      }
     ]
    },
    {
     "exerciseId": "treadmill-walk",
     "rest": 0,
     "superset": null,
     "note": "Опционально. 10–20 мин ходьбы в горку (наклон 8–12%, 4.5–5.5 км/ч) или велотренажёр. Темп, при котором можно говорить.",
     "sets": [
      {
       "kind": "normal",
       "timeSec": 900
      }
     ]
    }
   ]
  },
  {
   "name": "День Б",
   "note": "Тазобедренный шарнир, жим над головой, горизонтальная тяга, бицепс бедра, руки, пресс (подъёмы ног + антиротация).",
   "items": [
    {
     "exerciseId": "romanian-deadlift",
     "rest": 180,
     "superset": null,
     "note": "Спина ровная, колени слегка согнуты, таз уходит назад, гриф скользит по бёдрам. Опускай до натяжения задней поверхности бедра.",
     "sets": [
      {
       "kind": "warmup",
       "repsMin": 10,
       "repsMax": 10
      },
      {
       "kind": "warmup",
       "repsMin": 5,
       "repsMax": 5
      },
      {
       "kind": "normal",
       "repsMin": 6,
       "repsMax": 10,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 6,
       "repsMax": 10,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 6,
       "repsMax": 10,
       "rir": 2
      }
     ]
    },
    {
     "exerciseId": "db-shoulder-press",
     "rest": 120,
     "superset": null,
     "note": "Сидя со спинкой. Не прогибай поясницу.",
     "sets": [
      {
       "kind": "warmup",
       "repsMin": 10,
       "repsMax": 10
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      }
     ]
    },
    {
     "exerciseId": "seated-cable-row",
     "rest": 120,
     "superset": null,
     "note": "Грудь вперёд, своди лопатки в конце, корпус почти неподвижен.",
     "sets": [
      {
       "kind": "warmup",
       "repsMin": 10,
       "repsMax": 10
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      }
     ]
    },
    {
     "exerciseId": "seated-leg-curl",
     "rest": 90,
     "superset": null,
     "note": "Контролируй опускание, не бросай вес.",
     "sets": [
      {
       "kind": "normal",
       "repsMin": 10,
       "repsMax": 15,
       "rir": 1
      },
      {
       "kind": "normal",
       "repsMin": 10,
       "repsMax": 15,
       "rir": 1
      }
     ]
    },
    {
     "exerciseId": "db-curl",
     "rest": 60,
     "superset": "A",
     "note": "Суперсет с разгибанием на блоке: подход сгибаний → сразу подход разгибаний → отдых.",
     "sets": [
      {
       "kind": "normal",
       "repsMin": 10,
       "repsMax": 15,
       "rir": 1
      },
      {
       "kind": "normal",
       "repsMin": 10,
       "repsMax": 15,
       "rir": 1
      }
     ]
    },
    {
     "exerciseId": "triceps-pushdown",
     "rest": 60,
     "superset": "A",
     "note": "Локти прижаты к корпусу.",
     "sets": [
      {
       "kind": "normal",
       "repsMin": 10,
       "repsMax": 15,
       "rir": 1
      },
      {
       "kind": "normal",
       "repsMin": 10,
       "repsMax": 15,
       "rir": 1
      }
     ]
    },
    {
     "exerciseId": "hanging-leg-raise",
     "rest": 75,
     "superset": null,
     "note": "Подкручивай таз к груди, без раскачки. Если пока не выходит 8 повторов — начни с подъёма согнутых коленей (или в упоре на брусьях/локтях), а прямые ноги — когда будет 12–15 повторов.",
     "sets": [
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 15,
       "rir": 1
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 15,
       "rir": 1
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 15,
       "rir": 1
      }
     ]
    },
    {
     "exerciseId": "pallof-press",
     "rest": 45,
     "superset": null,
     "note": "Боком к блоку, выжимай рукоять перед собой и удерживай 2 с, не давая корпусу повернуться. Повторы — на каждую сторону.",
     "sets": [
      {
       "kind": "normal",
       "repsMin": 10,
       "repsMax": 15,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 10,
       "repsMax": 15,
       "rir": 2
      }
     ]
    },
    {
     "exerciseId": "treadmill-walk",
     "rest": 0,
     "superset": null,
     "note": "Опционально. 10–20 мин ходьбы в горку или велотренажёр в разговорном темпе.",
     "sets": [
      {
       "kind": "normal",
       "timeSec": 900
      }
     ]
    }
   ]
  },
  {
   "name": "День В",
   "note": "Жим ногами, наклонный жим, тяга гантели, изоляция ног, средняя дельта, пресс (антиразгибание + боковая планка).",
   "items": [
    {
     "exerciseId": "leg-press",
     "rest": 150,
     "superset": null,
     "note": "Поясница прижата к спинке на всей амплитуде, колени не заваливаются внутрь.",
     "sets": [
      {
       "kind": "warmup",
       "repsMin": 10,
       "repsMax": 10
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      }
     ]
    },
    {
     "exerciseId": "incline-db-press",
     "rest": 120,
     "superset": null,
     "note": "Наклон скамьи 30–45°.",
     "sets": [
      {
       "kind": "warmup",
       "repsMin": 10,
       "repsMax": 10
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      }
     ]
    },
    {
     "exerciseId": "db-row",
     "rest": 90,
     "superset": null,
     "note": "Упор коленом и рукой в скамью, тяни гантель к поясу. Повторы — на каждую руку.",
     "sets": [
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 8,
       "repsMax": 12,
       "rir": 2
      }
     ]
    },
    {
     "exerciseId": "leg-extension",
     "rest": 60,
     "superset": "A",
     "note": "Суперсет со сгибанием ног: разгибания → сразу сгибания → отдых.",
     "sets": [
      {
       "kind": "normal",
       "repsMin": 10,
       "repsMax": 15,
       "rir": 1
      },
      {
       "kind": "normal",
       "repsMin": 10,
       "repsMax": 15,
       "rir": 1
      }
     ]
    },
    {
     "exerciseId": "seated-leg-curl",
     "rest": 60,
     "superset": "A",
     "note": "Контролируй опускание.",
     "sets": [
      {
       "kind": "normal",
       "repsMin": 10,
       "repsMax": 15,
       "rir": 1
      },
      {
       "kind": "normal",
       "repsMin": 10,
       "repsMax": 15,
       "rir": 1
      }
     ]
    },
    {
     "exerciseId": "lateral-raise",
     "rest": 75,
     "superset": null,
     "note": "Лёгкий вес, без рывков.",
     "sets": [
      {
       "kind": "normal",
       "repsMin": 12,
       "repsMax": 20,
       "rir": 1
      },
      {
       "kind": "normal",
       "repsMin": 12,
       "repsMax": 20,
       "rir": 1
      }
     ]
    },
    {
     "exerciseId": "ab-wheel",
     "rest": 75,
     "superset": null,
     "note": "С колен. Выкатывайся только до тех пор, пока поясница не начинает прогибаться. Увеличивай амплитуду постепенно.",
     "sets": [
      {
       "kind": "normal",
       "repsMin": 6,
       "repsMax": 12,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 6,
       "repsMax": 12,
       "rir": 2
      },
      {
       "kind": "normal",
       "repsMin": 6,
       "repsMax": 12,
       "rir": 2
      }
     ]
    },
    {
     "exerciseId": "side-plank",
     "rest": 45,
     "superset": null,
     "note": "Время — на каждую сторону. Тело в одну линию, таз не опускается.",
     "sets": [
      {
       "kind": "normal",
       "timeSec": 30
      },
      {
       "kind": "normal",
       "timeSec": 30
      }
     ]
    },
    {
     "exerciseId": "treadmill-walk",
     "rest": 0,
     "superset": null,
     "note": "Опционально. 10–20 мин ходьбы в горку или велотренажёр в разговорном темпе.",
     "sets": [
      {
       "kind": "normal",
       "timeSec": 900
      }
     ]
    }
   ]
  }
 ]
};
