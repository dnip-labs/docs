---
sidebar_position: 2
---

# Огляд
> Див. також [Платформа](architecture/04-platform.md) та [Контракти](contracts/05-contracts.md)

## Основні компоненти вузла (Node)

У DNIP кожен вузол описується п’ятьма ключовими артефактами.  
Вони працюють разом і утворюють єдину архітектуру.

---

### 1. **protocol.json**
Це **декларація** вузла: визначає **що вузол вміє робити**.  
- `dependencies` → декларативний список залежностей сервісу. Використання визначає **Платформа** (очікування запуску, healthcheck тощо).
- `services` → опис дій (actions) та їхніх контрактів.  
- `gateway` → мапінг для зовнішних ресурсів таких як: HTTP, Events, та інших за потреб **Платформи**

Також **Платформа** може додавати розширення до протоколу в залежності від потреб, такі як:
- `cron` → періодичні завдання.
- `processors` → внутрішня черга завдань для Node
- та інші. Ці розширення **Платформа** має вже документувати окремо

---

### 2. **contracts/*.json**
- Кожна дія (action) має свій контракт.  
- Це формальна обіцянка вузла на правильний формат даних.
- Формат: [**JSON Schema draft-07**](https://json-schema.org/draft-07/draft-handrews-json-schema-01).
- Контракти описують `headers`, `input`, `output`, `x-meta`. Можуть бути додані ще кастомні поля по стандарту [**JSON Schema**](https://json-schema.org/draft-07/draft-handrews-json-schema-01) починаючи з префіксу `x-`.
- Усі контракти зберігаються у **плоскій структурі** `contracts/*.json` без піддиректорій.
- Піддиректорія `contracts/models/*.json` - shared [**JSON Schema**](https://json-schema.org/draft-07/draft-handrews-json-schema-01) моделі для використання в контрактах
- Піддиректорія `contracts/dependencies/*.json` - [**JSON Schema**](https://json-schema.org/draft-07/draft-handrews-json-schema-01) контракти інших вузлів для використання в offline форматі у контрактах Node *(як от reference на response іншої Node при проксуванні)*.

---

### 3. **config.js**
Це **конфігурація** вузла. Визначає параметри оточення:  
- Підключення до баз даних, кешів, сторонніх API
- Конфігурації ключових артефактів **protocol.json**: services, gateway, events *(host/port, TLS, CORS)*
- Конфігурації розширень протоколу
- Конфігурації для `adapters.js`
- Дані для бізнес-логіки: feature flags та інші опції для дій вузла. 

---

### 4. **adapters.js**
- Реалізація адаптерів на основі `config.js`.  
- Повертає готові клієнти для роботи з інфраструктурними сервісами (Postgres, Redis, Kafka, AMQP, Mailer тощо).  
- Робить їх доступними через `context.ports` у `protocol.js`.  
- Забезпечує відокремлення бізнес-логіки від деталей підключення.  

---

### 5. **protocol.js**
Це **імплементація**: бізнес‑логіка, яка виконується Платформою.  
- Саме тут описано **як** виконуються дії, визначені у `protocol.json`.  
- Використовується підхід:  

```js
export default function ProtocolImplementation() {
  return {
    domain: {
      system: {
        ping: async (context) => {
          const db = context.ports.postgres;
          const res = await db.query("SELECT 1 as ok");
          return { echo: context.params.message, db: res.rows[0].ok };
        }
      }
    }
  };
}
```

- У проколі це виглядає так:
```json
{
  "dependencies": {},
  "services": [
    {
      "name": "system",
      "version": 1,
      "transports": ["amqp"],
      "actions": {
        "ping": {
          "contract": "contracts/ping.json",
          "execute": "domain.system.ping"
        }
      }
    }
  ]
}
```

---

## Структура вузла

```
.
├── contracts/
│   └── dependencies/*.json ← контракти інших вузлів (JSON Schema)
│   └── models/*.json ← shared моделі (JSON Schema)
│   └── *.json        ← контракти (JSON Schema)
├── protocol.json     ← декларація вузла
├── config.js         ← конфігурація
├── adapters.js       ← інстанси клієнтів (БД, кеш та інші ресурси)
└── protocol.js       ← реалізація логіки
```

---

## Як це працює разом

1. **protocol.json** описує, які дії доступні.  
2. **contracts/*.json** гарантують формат даних для цих дій.  
3. **config.js** описує параметри доступу до ресурсів.  
4. **adapters.js** створює клієнти зовнішних ресурсів та передає їх у `context.ports`.  
5. **protocol.js** реалізує логіку дій, використовуючи адаптери.  

У результаті кожен вузол DNIP прозорий: його можливості можна зрозуміти, просто подивившись у `protocol.json` і відповідні контракти, а реалізацію легко протестувати через чітко визначені адаптери.