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

---

## Структура

### dependencies
- `dependencies` — **сервіси** зовнішніх вузлів (Node), від яких залежить цей вузол. Поле обов’язкове; якщо залежностей немає — масив порожній. Використання визначає Платформа (очікування запуску, healthcheck тощо)
- Кожен елемент має формат **`${serviceName}.v${serviceVersion}`** (наприклад: `accounts.v1`).
- Назва сервісу повинна бути **унікальною** в мережі DNIP.
- Ці дані можуть використовуватися Платформою на власний розсуд (наприклад, щоб затримати запуск вузла, доки не будуть готові залежні сервіси, або для інших механізмів).
- Кожен елемент повинен мати формат **`${serviceName}.v${serviceVersion}`** (наприклад: `accounts.v1`, `billing.v2`).
- Це посилання на інші Node у мережі DNIP, які описані власними `protocol.json`.
- Поле **обов’язкове**: навіть якщо залежностей немає, потрібно вказати `"dependencies": []`.

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

## Мінімальний приклад

```json
{
  "dependencies": [],
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
    "jobs": {
      "cleanup": {
        "pattern": "0 0 * * *",,
        "execute": "domain.jobs.cleanup"
      }
    }
  }
}
```

---

## Розширений приклад з middleware та чернетками

```json
{
  "dependencies": [],
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
    "jobs": {
      "nightlyJob": {
        "pattern": "0 3 * * *",,
        "execute": "domain.jobs.nightly"
      }
    }
  }
}
```
