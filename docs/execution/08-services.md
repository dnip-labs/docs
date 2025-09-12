---
sidebar_position: 8
---

# Services
> Services описуються декларативно у [protocol.json](../architecture/03-protocol-json.md)

## Що таке Services

**Services** — це базовий артефакт DNIP.  
Він описує набір сервісів вузла, їхню версію, транспорти та дії (actions).  
Сервіси є головними точками входу для виконання бізнес-логіки.  

> Назва сервісу у мережі DNIP повинна бути **унікальною**.  
> Разом з номером версії (`serviceName.vX`) вона формує глобальний ідентифікатор сервісу.

---

## Структура у protocol.json

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

- `services` — об’єкт, ключами є імена сервісів.  
- `version` — номер версії API сервісу.  
- `transports` — перелік транспортів, які використовує сервіс (`amqp`, `kafka`, `nats`, `mqtt`, `redis`).  
- `actions` — набір дій сервісу.  

### Actions

- Action — це кінцева точка виконання.  
- Завжди має **`contract` + `execute`**.  
- Alias у `actions` **не використовується** (alias застосовується тільки на рівні Gateway/Events).

---

## Виклики через `context.call`

Платформа додає у **`context`** метод **`.call`** для виклику внутрішніх або зовнішніх дій сервісів.

```js
await context.call('service.v1.action', params, context)
```

- `service.v1.action` — ім’я сервісу + версія + action.  
- `params` — тільки **серіалізовані об’єкти** (наприклад, `{ userId: "123" }`).  
- `context` — службовий контекст, який формується Платформою. Він містить:  
  - `params` — вхідні дані поточного виклику;  
  - `ports` — адаптери (Postgres, Redis тощо);  
  - `meta` — службові поля (headers, correlationId тощо);  
  - `trace`, `span` — дані трасування;  
  - `call` — метод для виклику інших сервісів.  

> Заборонено передавати у `params` та `context` несеріалізовані об’єкти, наприклад `ports`.  
> У `params` та `context` дозволені лише серіалізовані структури (JSON-сумісні).

---

## Приклад імплементації

```json title="protocol.json"
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

```js title="protocol.js"
export default function ProtocolImplementation() {
  return {
    domain: {
      user: {
        getProfile: async (context) => {
          // Виклик іншого сервісу через call
          const orders = await context.call(
            'orders.v1.getUserOrders',
            { userId: context.params.id },
            context
          );

          return { profile: { id: context.params.id, orders } };
        }
      }
    }
  };
}
```

---

## Див. також
- [Contracts](../contracts/05-contracts.md) — описують формат `params` і `output`.  
- [Platform](../architecture/04-platform.md) — пояснює, як формується `context`.  
- [Gateway](../execution/09-gateway.md) — відповідає за маршрутизацію викликів до `actions`.
