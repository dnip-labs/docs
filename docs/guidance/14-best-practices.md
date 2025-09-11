---
sidebar_position: 14
---

# Best Practices
> Додатково: [Контракти](contracts/05-contracts.md), [Валідація](contracts/08-validation.md)

## Чому потрібні практики

DNIP задає протокол — як описувати інтерфейси вузла.  
Але _як правильно організувати код_ залежить від розробника.  
Щоб уникнути хаосу, рекомендується дотримуватися принципів **Clean Architecture**.  

---

## Clean Architecture у контексті DNIP

### Шари архітектури

1. **Domain Layer**  
   - Містить _бізнес-логіку_.  
   - У DNIP реалізується у файлі `protocol.js`, у розділі `domain`.  
   - Відповідає за виконання дій (`actions`), описаних у `protocol.json`.  

2. **Adapters Layer**  
   - Реалізує доступ до зовнішніх ресурсів: баз даних, кешів, API.  
   - У DNIP може бути винесений у файл `adapters.js`.  
   - Наприклад, адаптер для PostgreSQL або Redis.  
Kafka, AMQP та інші брокери повідомлень описуються як **transports** у `protocol.json` і реалізуються платформою, а не adapters.  

3. **Infrastructure Layer**  
   - Транспорт, HTTP-сервер, брокери повідомлень тощо.  
   - У випадку DNIP цим займається _платформа_, яка розуміє `protocol.json`.  
   - Вона автоматично створює маршрути, підключає транспорти, запускає cron jobs.  

4. **Presentation Layer**  
   - Зовнішній API: HTTP, RPC, Events.  
   - Також реалізується платформою DNIP.  
   - Розробнику не потрібно писати вручну REST- або AMQP-контролери.  

---

## Як це виглядає у DNIP

### protocol.json

```json
{
  "services": {
    "user": {
      "version": 1,
      "transports": ["amqp"],
      "actions": {
        "getProfile": {
          "contract": "contracts/get-profile.json",
          "execute": "domain.user.getProfile"
        }
      }
    }
  }
}
```

### protocol.js (Domain Layer)

```js
export default function Protocol() {
  return {
    domain: {
      user: {
        getProfile: async (params, context) => {
          const { userRepo } = context.adapters;
          return await userRepo.findById(params.userId);
        }
      }
    }
  };
}
```

### adapters.js (Adapters Layer)

```js
import { Client } from "pg";
import Redis from "ioredis";

export function createAdapters() {
  const pg = new Client({ connectionString: process.env.PG_URL });
  const redis = new Redis(process.env.REDIS_URL);

  return {
    userRepo: {
      findById: async (id) => {
        const cached = await redis.get(`user:${id}`);
        if (cached) return JSON.parse(cached);
        const res = await pg.query("SELECT * FROM users WHERE id = $1", [id]);
        return res.rows[0];
      }
    }
  };
}
```

### Платформа (Infrastructure + Presentation)

- Читає `protocol.json`.  
- Підключає `protocol.js` та `adapters.js`.  
- Реалізує HTTP / AMQP / Kafka / Cron відповідно до декларації.  

---

## Переваги такого підходу

- **Відокремлення бізнес-логіки** від інфраструктури.  
- **Заміна інструментів без переписування домену** (наприклад, Kafka → NATS).  
- **Тестованість**: domain можна тестувати із замоканими адаптерами.  
- **Прозорість**: уся інфраструктура описана декларативно в `protocol.json`.  

---

## Референс

DNIP не нав'язує архітектурних підходів.  
Проте Clean Architecture добре узгоджується з філософією DNIP.  