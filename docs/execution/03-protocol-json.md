---
sidebar_position: 3
---

# 📋 Протокол

## Що таке protocol.json

**protocol.json** — це декларація вузла (**Node**) у мережі за стандартом DNIP.
  
Він описує:  
- які **сервіси** доступні;  
- які в них **дії** (actions);  
- як працює **gateway** (HTTP, Events тощо);  
- які є розширення

---

## Структура

### dependencies
- `dependencies` — **сервіси** зовнішніх вузлів (Node), від яких залежить цей вузол.
- Ці дані можуть використовуватися **Платформою** на власний розсуд (наприклад, щоб затримати запуск вузла, доки не будуть готові залежні сервіси, або для інших механізмів).
- Кожен елемент має формат назви **`${serviceName}.v${serviceVersion}`** (наприклад: `accounts.v1`).
- Назва сервісу повинна бути **унікальною** в мережі по стандарту DNIP.
- Поле **обов’язкове**: навіть якщо залежностей немає, потрібно вказати `"dependencies": {}`.

### 1. services
- `name` - назва сервісу.
- `version` — номер версії сервісу.  
- `transports` — перелік транспортів (`amqp`, `kafka`, `nats`, `mqtt`, `redis`).  
- `actions` — набір дій сервісу:  
  - `contract` — шлях до contract JSON (див. [$ref](https://json-schema.org/draft-07/draft-handrews-json-schema-01#rfc.section.8.3)).  
  - `execute` — шлях до методу в імплементації у `adapters.js`.  

---

### 2. gateway

Gateway мінімально складається з двох частин:  

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

> **Платформа** може додавати артефакти до протоколу за потреби, до прикладу: у gateway елементи для інших фреймворків які використовують свій стандарт спілкування або cronjobs, processors (як от BullMQ)

## Мінімальний приклад

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
  ],
  "gateway": {
    "http": {
      "routes": {
        "GET /ping": { "alias": "system.v1.ping" }
      }
    },
    "events": {
      "system.pinged": { "alias": "system.v1.onPinged" }
    }
  }
}
```
