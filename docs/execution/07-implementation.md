---
sidebar_position: 7
---

# 🚀 Імплементація

## Що таке імплементація

**Імплементація** — це код, який виконує логіку вузла.  
DNIP не обмежує вибір мови програмування чи структури коду.  
Розробник може реалізувати логіку на **будь-якому стеку**: JavaScript, Python, Go, Rust тощо.  

Це повністью структуровано-гнучкий обʼєкт посилань на функції який може мати будь які шляхи, до прикладу:
- `domain.system.ping`
- `useCases.ping`
- `processors.documents.abc.doJob`

А у протоколі треба вказувати правильний шлях до цих функцій:
- `"execute": "domain.system.ping"`
- `"execute": "useCases.ping"`
- `"execute": "processors.documents.abc.doJob"`

---

## Як це працює разом з protocol.json, config і adapters.js

У декларації ми описуємо дію:  

```json
{
  "dependencies": {},
  "services": [
    {
      "name": "user",
      "version": 1,
      "transports": ["amqp"],
      "actions": {
        "getProfile": {
          "contract": "contracts/get_profile.json",
          "execute": "useCases.user.getProfile"
        }
      }
    }
  ]
}
```

У конфігурації ми описуємо ресурси, параметри середовища, а також **налаштування для transports** (наприклад, AMQP/Kafka), які будуть використані платформою:  

```js
export default {
  domain: { feature_flags: { beta_mode: true } }
  services: { transports: { default: ['amqp'] } },
  gateway: { http: { ip: '0.0.0.0', port: 8080 } },
  adapters: {
    postgres: { url: 'postgres://...' },
    redis: { url: 'redis://localhost:6379' }
  },
};
```

У файлі **adapters.js** ми створюємо реальні клієнти на основі `config.adapters`:  

```js
import { Client } from 'pg';
import Redis from 'ioredis';

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
    useCases: {
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

## Контекст виконання

Під час виклику будь-якої дії DNIP передає у функцію **context**:  
- `context.domain` → значення з `config.domain`.  
- `context.ports` → готові клієнти з `adapters.js`.
- `context.meta.headers` → заголовки запиту згідно контракту.  

Функція повинна повертати результат, який відповідає **contract.output** інакше, **Платформа** за стандартом DNIP має створити помилку "Bad Response".
