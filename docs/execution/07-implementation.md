---
sidebar_position: 7
---

# Імплементація

## Що таке імплементація

**Імплементація** — це код, який виконує логіку вузла.  
DNIP не обмежує вибір мови програмування чи структури коду.  
Розробник може реалізувати логіку на **будь-якому стеку**: JavaScript, Python, Go, Rust тощо.  

---

## Як це працює разом з protocol.json, config і adapters.js

У декларації ми описуємо дію:  

```json
{
  "dependencies": [],
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

У конфігурації ми описуємо ресурси, параметри середовища, а також **налаштування для transports** (наприклад, AMQP/Kafka), які будуть використані платформою:  

```js
export default {
  gateway: { http: { host: "0.0.0.0", port: 8080 } },
  services: { transports: { default: ["amqp"] } },
  adapters: {
    postgres: { url: "postgres://..." },
    redis: { url: "redis://localhost:6379" }
  },
  domain: { featureFlags: { betaMode: true } }
};
```

У файлі **adapters.js** ми створюємо реальні клієнти на основі `config.adapters`:  

```js
import { Client } from "pg";
import Redis from "ioredis";

export function createAdapters(config) {
  const pg = new Client({ connectionString: config.adapters.postgres.url });
  const redis = new Redis(config.adapters.redis.url);

  return {
    postgres: pg,
    redis
  };
}
```

У реалізації ми використовуємо вже готові адаптери через `context.ports`:  

```js
export default function ProtocolImplementation() {
  return {
    domain: {
      user: {
        getProfile: async (context) => {
          const db = context.ports.postgres;
          const res = await db.query("SELECT * FROM users WHERE id = $1", [context.params.userId]);
          return res.rows[0];
        }
      }
    }
  };
}
```

---

## Основні елементи імплементації

1. **mw (middlewares)**  
   - Набір функцій, які можуть використовуватися у gateway.  
   - Наприклад, перевірка авторизації чи заголовків.  

2. **domain**  
   - Логіка дій (actions), cron-методи, утиліти.  
   - Шлях до функції повинен відповідати полю `execute` у `protocol.json`.  

3. **adapters**  
   - Ініціалізуються у файлі `adapters.js` на основі `config.adapters`.  
   - Потрапляють у `context.ports` і доступні для дій вузла.  

---

## Контекст виконання

Під час виклику будь-якої дії DNIP передає у функцію **context**:  
- `context.domain` → значення з `config.domain`.  
- `context.ports` → готові клієнти з `adapters.js`.  
- `context.meta.headers` → заголовки запиту згідно контракту.  

Функція повинна повертати результат, який відповідає **contract.output**.  

---

## Референс

Імплементація не має окремої схеми у DNIP.  
Це **вільний код**, який повинен відповідати опису з `protocol.json`, контрактам і конфігурації.  
