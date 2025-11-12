---
sidebar_position: 6
---

# ⚙️ Конфігурація

## Що таке config

**config.js** — це файл конфігурації вузла.  
Він описує **середовище виконання вузла** та **налаштування для реалізації протоколу**, включно з:

- **Налаштуваннями середовища**: `gateway` (host/IP/port, TLS, CORS, rate-limit), `services.transports (налаштування для транспортів)`, логування, метрики, безпека, підключення до баз даних, кешів, сторонніх API, тощо.
- **Даними для логіки**: feature flags та інші опції для дій вузла.

---

> Як і **protocol.json**, **config.js** має базову **стандартизовану структуру** та **рекомендовану структуру**. Тому коли ви бачите стандартизовану стуктуру для `logger` до прикладу, це базовий стандарт але платформа може додавати ще поля у `logger` у довільному форматі. Тут теж як і з **protocol.json**, Платформа має документувати ці поля окремо.

## Рекомендована структура

- `project` — службовий файл **Платформи** для розуміня як зчитувати стандарт
  - `ext` — розширеня файлу яке використовує проєкт, наприклад: `js`, `ts`
  - `dir` — структура директорій проєкту
    - `protocol` — назва директорії де лежить **protocol.json**, наприклад: `dnip`
    - `contracts` — назва директорії де лежать контракти, наприклад: `contracts`
    - **Платформа** може додавати ще полі за потреб, наприклад:
      - `dto` — назва директорії де лежать DTO обʼєекти, наприклад: `dto`
  - `meta` — довільні дані
- `env` — Environment у якому було запущено Node, наприклад:
  - `local` — локальне середовище
  - `test` — тестове середовище
  - `stage` — stage середовище
  - `production` — production середовище
- `node` — дані про вузол
  - `name` — назва вузла (не плутати з назвою сервісів у вузлі)
  - `version` — версія вузла (не плутати з версією сервісів у вузлі)
  - `probe` — TCP port для healthcheck опитувань
  - `namespace` — простір імен у якому працює вузол
- `logger` — налаштування для логування
  - `level` — рівень логів
- `tracing` — налаштування для трасування (довільний формат)
- `services` — налаштування для сервісів
  - `transports` — налаштування для траспортів сервісів, до прикладу:
    - `amqp`
      - `hosts` — URL строка до хосту RabbitMQ
- `gateway`
  - `http` — HTTP налаштування (host/port, TLS, CORS, rate-limit).
    - `ip` — IP для HTTP сервера у вузлі (зазвичай `0.0.0.0`)
    - `port` — port для HTTP сервера у вузлі
  - `events` — опис джерел подій. Тут можна вказати транспорт і параметри підключення.
- `adapters` — підключення до зовнішніх ресурсів (PostgreSQL, Redis, S3, Kafka тощо). 
  - `назва адаптеру`
    - `його конфігурація`
- `domain` — будь-які налаштування для бізнес логикі.  

---

*Зазвичай цей конфіг наповнюється зі змінних оточення*

## Приклад

```js
export default {
  project: {
    ext: 'js',
    dir: {
      protocol: 'broker',
      contracts: 'contracts',
    },
    meta: {},
  },
  env: 'local',
  node: {
    name: 'billing',
    version: '1.0.0',
    probe: 5000,
    namespace: 'local',
  },
  logger: {
    level: 'debug',
  },
  tracing: {
    jaeger: 'http://127.0.0.1:14268/api/traces',
  },
  services: {
    transports: {
      amqp: {
        host: 'amqp://127.0.0.1:5672/local',
      }
    },
  },
  gateway: {
    http: {
      ip: '0.0.0.0',
      port: 8080,
      request_timeout: 60000,
    },
  },
  adapters: {
    pg: {
      username: 'test',
      password: 'test',
      database: 'billing',
    },
    http_clients: {
      example: {
        hostname: 'http://example.com',
        path: 'v1',
      },
    },
  },
  domain: {
    apply_to_services: [7, 504, 23],
    restricted_fields: ['pan'],
  },
};
```

---

## Як це використовує реалізація

- **Платформа** може читати **параметри середовища** (`gateway.http`, `gateway.events.sources`, `services.transports (налаштування для транспортів)`, `logger`, `metrics`, `security`).  
- Виконання подій з `gateway.events` залежить від реалізації:  
  - у Kafka це буде consumer group,  
  - у AMQP — queue,  
  - у NATS — subject,  
  - у Socket.IO — namespace/room.  
- Якщо `sources` не задані, реалізація може мати дефолтні налаштування або не активувати events взагалі.  
- Під час виконання дій у функціях передається `config.domain` → `context.domain` (і за потреби `config.adapters` -> `adapters.js` → `context.ports`).  

---

## Зв'язок із protocol.json

- **protocol.json** описує, інтерфейси та сервіси  
- **config** може описати, *як саме* ці інтерфесі та сервіси підключаються (транспорт і хости).  
- Це розділення дозволяє описати API незалежно від інфраструктури.  
