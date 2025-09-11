---
sidebar_position: 6
---

# Конфігурація

## Що таке config

**config.(js|ts|…​)** — це файл конфігурації вузла.  
Він описує **середовище виконання вузла** та **налаштування для реалізації протоколу**, включно з:

- **Налаштуваннями середовища**: `gateway` (host/IP/port, TLS, CORS, rate-limit), `services.transports (налаштування для транспортів)`, логування, метрики, безпека, підключення до баз даних, кешів, сторонніх API, тощо.
- **Даними для логіки**: feature flags та інші опції для дій вузла.  

> Формат config-файлу **не стандартизований** протоколом DNIP.  
> Це **рекомендована структура**. Реалізації можуть відрізнятися.  

---

## Рекомендована структура

- **gateway.http** — HTTP налаштування (host/port, TLS, CORS, rate-limit).  
- **gateway.events** — опис джерел подій. Тут можна вказати транспорт і параметри підключення.
- **services** — спільні параметри для сервісів, зокрема **транспорти** за замовчуванням.  
- **security** — секрети/ключі, політики доступу.  
- **logger** — рівні логування, формати.  
- **metrics** — експозиція Prometheus/статистика.  
- **domain** — будь-які налаштування для бізнес логикі.  
- **adapters** — підключення до зовнішніх ресурсів (PostgreSQL, Redis, S3, Kafka тощо).  

---

## Приклад (JavaScript)

```js
export default {
  gateway: {
    http: {
      host: "0.0.0.0",
      port: 8080,
      tls: {
        enabled: false,
        keyPath: "/etc/ssl/key.pem",
        certPath: "/etc/ssl/cert.pem"
      },
      cors: { enabled: true, origin: ["*"] },
      rateLimit: { windowMs: 60_000, max: 200 }
    },

    events: {
      sources: {
        amqpMain: {
          transport: "amqp",
          url: "amqp://user:pass@rabbitmq:5672",
          queue: "main-events"
        },
        kafkaOrders: {
          transport: "kafka",
          brokers: ["kafka1:9092", "kafka2:9092"],
          topic: "orders"
        },
        natsLogs: {
          transport: "nats",
          url: "nats://localhost:4222",
          subject: "logs.*"
        },
        chat: {
          transport: "socketio",
          namespace: "/chat"
        }
      }
    }
  },

  services: {
    transports: {
      default: ["amqp"],
      amqp: { url: "amqp://localhost:5672", prefetch: 100 },
      kafka: { brokers: ["localhost:9092"] },
      nats: { url: "nats://localhost:4222" },
      mqtt: { url: "mqtt://localhost:1883" },
      redis: { url: "redis://localhost:6379" }
    }
  },

  security: {
    jwt: { secret: "change-me", issuer: "dnip-node" },
    headers: { required: ["Authorization"] }
  },

  logger: { level: "info", pretty: true },
  metrics: { prometheus: { enabled: true, port: 9100 } },

  domain: {
    featureFlags: { newCheckout: false }
  },

  adapters: {
    postgres: {
      url: "postgres://user:pass@localhost:5432/app"
    },
    redis: {
      url: "redis://localhost:6379"
    },
    s3: {
      endpoint: "http://localhost:9000",
      accessKeyId: "minio",
      secretAccessKey: "miniosecret",
      bucket: "uploads"
    }
  }
};
```

---

## Як це використовує реалізація

- Реалізація DNIP може читати **параметри середовища** (`gateway.http`, `gateway.events.sources`, `services.transports (налаштування для транспортів)`, `logger`, `metrics`, `security`).  
- Виконання подій з `gateway.events` залежить від реалізації:  
  - у Kafka це буде consumer group,  
  - у AMQP — queue,  
  - у NATS — subject,  
  - у Socket.IO — namespace/room.  
- Якщо `sources` не задані, реалізація може мати дефолтні налаштування або не активувати events взагалі.  
- Під час виконання дій у функціях передається `context.domain` (і за потреби `context.adapters`).  

---

## Зв'язок із protocol.json

- **protocol.json** описує, які події існують (ключі у `gateway.events`).  
- **config** може описати, *як саме* ці події доставляються (транспорт і хости).  
- Це розділення дозволяє описати API незалежно від інфраструктури.  

---

## Референс

Config не має власної JSON Schema у DNIP: це **вільний файл конфігурації**.  
Рекомендована структура допомагає зробити реалізації сумісними, але протокол її не фіксує.  
