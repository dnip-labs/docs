---
sidebar_position: 8
---

# 🔧 Services
> Services описуються декларативно у [protocol.json](../architecture/03-protocol-json.md)

## Що таке Services

**Services** — це базовий артефакт DNIP.  
Він описує набір сервісів вузла, їхню версію, транспорти та дії (actions).  
Сервіси є головними точками входу для виконання бізнес-логіки.  

> Назва сервісу у мережі за стандартом DNIP повинна бути **унікальною**.  
> Разом з номером версії (`serviceName.vX`) вона формує глобальний ідентифікатор сервісу.

---

## Структура у protocol.json

```json
{
  "services": [
    {
      "name": "user",
      "version": 1,
      "transports": ["amqp"],
      "actions": {
        "getProfile": {
          "contract": "contracts/get_profile.json",
          "execute": "domain.user.getProfile"
        }
      }
    }
  ]
}
```

- `services` — масив де елементами є сервіси.
  - `name` — назва сервісу. 
  - `version` — номер версії сервісу.  
  - `transports` — перелік транспортів, які використовує сервіс (`amqp`, `kafka`, `nats`, `mqtt`, `redis`).  
  - `actions` — набір дій сервісу.  
    - `назва action`
      - `contract` — шлях до contract JSON (див. [$ref](https://json-schema.org/draft-07/draft-handrews-json-schema-01#rfc.section.8.3)).
      - `execute` — шлях до методу в імплементації у `adapters.js`.

### Actions

- Action — це кінцева точка виконання.  
- Завжди має **`contract` + `execute`**.  
- Alias у `actions` **не використовується**. `alias` застосовується тільки на рівні Gateway або розширень для того щоб перенаправити виклик на action сервісу.

---

## Див. також
- [Contracts](../contracts/05-contracts.md) — описують формат `params` і `output`.  
- [Platform](../architecture/04-platform.md) — пояснює, як формується `context`.  
- [Gateway](../execution/09-gateway.md) — відповідає за маршрутизацію викликів до `actions`.
