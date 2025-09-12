---
sidebar_position: 9
---

# Gateway
> Декларація — у `protocol.json`, конфігурація — у `config.js`, імплементація — у `protocol.js` (див. [Архітектура](../architecture/02-architecture.md)).

> Gateway описується декларативно у [protocol.json](architecture/03-protocol-json.md)

## Що таке Gateway

**Gateway** — це шар, який мапить зовнішні інтерфейси (HTTP, Events) на дії вузла.  
Усі маршрути та події описуються декларативно у **protocol.json**.  

---

## HTTP gateway

### Приклад у protocol.json

```json
{
  "gateway": {
    "http": {
      "middlewares": ["mw.jwt"],
      "routes": {
        "GET /user/profile": {
          "middlewares": ["mw.headers"],
          "alias": "user.v1.getProfile"
        },
        "POST /user/delete": {
          "contract": "contracts/delete-user.json",
          "execute": "domain.user.delete"
        },
        "# PUT /draft": {
          "contract": "contracts/draft.json",
          "execute": "domain.draft.update"
        }
      }
    }
  }
}
```

У цьому прикладі:  
- `middlewares` — глобальні для всього HTTP gateway.  
- `GET /user/profile` → alias на дію сервісу.  
- `POST /user/delete` → прямий виклик з contract + execute.  
- `# PUT /draft` → чернетка, ігнорується реалізацією.  

---

## Events gateway

### Приклад у protocol.json

```json
{
  "gateway": {
    "events": {
      "user.created": {
        "alias": "user.v1.createdHandler"
      },
      "order.*": {
        "contract": "contracts/order-event.json",
        "execute": "domain.orders.handleEvent"
      }
    }
  }
}
```

У цьому прикладі:  
- `user.created` → викликає alias на дію сервісу.  
- `order.*` → обробляє всі події, що починаються з `order.`.  
- middleware для events **не використовується**.  

---

## Валідація

У схемі `protocol.json`:  
- для HTTP-роутів ключ повинен збігатися з патерном:  
  ```regex
  ^(GET|POST|PUT|PATCH|DELETE)\s\/(\/|\w)+$
  ```
- для events ключ — довільний рядок (topic або pattern).  

Значення може бути:  
- рядком (alias),  
- або об’єктом `action` (`contract` + `execute`).  

---

## Референс

Офіційна схема gateway:  
див. [protocol.json](https://github.com/dnip-labs/dnip/blob/master/json-schema/protocol.json#L50)