---
sidebar_position: 3
---

# Протокол

## Що таке protocol.json

**protocol.json** — це декларація вузла (**Node**) у мережі DNIP.  
Він описує:  
- які **сервіси** доступні;  
- які в них **дії** (actions);  
- як працює **gateway** (HTTP та Events);  
- які заплановані **cron jobs**;  
- які **processors** виконує вузол.  

---

## Структура

### 1. services
- `version` — номер версії сервісу.  
- `transports` — перелік транспортів (`amqp`, `kafka`, `nats`, `mqtt`, `redis`).  
- `actions` — набір дій сервісу:  
  - `contract` — шлях до contract JSON (див. [$ref](https://json-schema.org/draft-07/draft-handrews-json-schema-01#rfc.section.8.3)).  
  - `execute` — шлях до методу в імплементації.  
  - `alias` — альтернативна назва для виклику.  

> Ключі, що починаються з `#`, ігноруються (чернетки).  

---

### 2. gateway

Gateway складається з двох частин:  

- **http**  
  - `middlewares` — глобальні middleware для HTTP.  
  - `routes` — маппінг маршрутів (`METHOD /path`) на дії сервісів.  
  - усередині `routes` можна також визначати локальні `middlewares`.  

- **events**  
  - описує асинхронні події (AMQP, Kafka, NATS, MQTT, Socket.IO тощо).  
  - ключ = назва події або патерн (наприклад, `user.created`, `order.*`).  
  - значення = або `alias`, або `contract` + `execute`.  
  - middleware тут **не використовується**.  

---

### 3. cron
- `timezone` — таймзона у форматі IANA.  
- `jobs[]` — масив завдань із параметрами:  
  - `name` — унікальне ім’я;  
  - `pattern` — cron-вираз;  
  - `execute` — функція у домені.  
- опційні: `disabled`, `onComplete`, `onError`.  

---

### 4. processors
**Processors** — це **відкладені завдання (delayed jobs)**, які описуються у `protocol.json`.  

Вони відрізняються від `transports`:  
- `transports` визначають спосіб взаємодії вузлів у мережі (AMQP, Kafka, NATS тощо).  
- `processors` — це внутрішні асинхронні задачі вузла, які виконуються у чергах платформи (наприклад, через BullMQ).  

Характеристики:  
- запускаються після постановки у чергу;  
- завжди мають `input`;  
- можуть мати `output`, яке використовується у `onComplete`, але не повертається клієнту напряму.  

У декларації описується лише логіка:  
- `contract` — опис input/output (JSON Schema).  
- `execute` або `alias`.  
- `onError` — виконується при помилці.  
- `onComplete` — виконується після завершення.  

---

## Мінімальний приклад

```json
{
  "services": {
    "system": {
      "version": 1,
      "transports": ["amqp"],
      "actions": {
        "ping": {
          "contract": "contracts/ping.json",
          "execute": "domain.system.ping"
        }
      }
    }
  },
  "gateway": {
    "http": {
      "routes": {
        "GET /ping": { "alias": "system.v1.ping" }
      }
    },
    "events": {
      "system.pinged": { "alias": "system.v1.onPinged" }
    }
  },
  "cron": {
    "timezone": "Europe/Berlin",
    "jobs": [
      {
        "name": "cleanup",
        "pattern": "0 0 * * *",
        "execute": "domain.jobs.cleanup"
      }
    ]
  },
  "processors": {
    "email.send": {
      "contract": "contracts/send-email.json",
      "execute": "domain.processors.emailSend",
      "onError": "domain.processors.onErrorHandler",
      "onComplete": "domain.processors.onCompleteHandler"
    }
  }
}
```

---

## Розширений приклад з middleware та чернетками

```json
{
  "services": {
    "a": {
      "version": 1,
      "transports": ["kafka"],
      "actions": {
        "action1": {
          "contract": "contracts/action-1.json",
          "execute": "domain.a.action1"
        },
        "# action2": {
          "contract": "contracts/action-2.json",
          "execute": "domain.a.action2"
        }
      }
    }
  },
  "gateway": {
    "http": {
      "routes": {
        "POST /a": { "alias": "a.v1.action1" }
      }
    },
    "events": {
      "a.event": {
        "contract": "contracts/aEvent.json",
        "execute": "domain.a.onEvent"
      }
    }
  },
  "cron": {
    "timezone": "Europe/Kyiv",
    "jobs": [
      {
        "name": "nightlyJob",
        "pattern": "0 3 * * *",
        "execute": "domain.jobs.nightly"
      }
    ]
  },
  "processors": {
    "report.generate": {
      "contract": "contracts/report.json",
      "execute": "domain.processors.reportGenerate"
    }
  }
}
```
