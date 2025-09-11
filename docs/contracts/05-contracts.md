---
sidebar_position: 5
---

# Контракти
> Як перевіряються контракти: див. [Валідація](contracts/08-validation.md)

## Що таке контракт

**Контракт** — це формальна обіцянка вузла (**Node**) на правильний формат даних.  
Він визначає:  
- **headers** — заголовки запиту/повідомлення (HTTP, AMQP, Kafka…).  
- **input** — вхідні дані.  
- **output** — вихідні дані.  

Контракт описується у форматі **JSON Schema draft-07**.  

---

## Структура контракту

- `$id` — унікальний ідентифікатор контракту.  
- `$schema` — завжди `https://json-schema.org/draft-07/schema#`.  
- `properties` — опис об’єкта з полями `headers`, `input`, `output`.  
- `required` — зазвичай включає `input` та `output` (та `headers` за потреби).
- `x-meta` — додаткові метадані (наприклад, `status_code`).  

---

## Мінімальний приклад

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "contracts/ping.json",
  "type": "object",
  "properties": {
    "input": {
      "type": "object",
      "properties": {
        "message": { "type": "string" }
      },
      "required": ["message"]
    },
    "output": {
      "type": "object",
      "properties": {
        "pong": { "type": "boolean" }
      },
      "required": ["pong"]
    }
  },
  "required": ["input", "output"]
}
```

---

## Приклад з `x-meta`

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "contracts/get-user.json",
  "type": "object",
  "x-meta": {
    "status_code": 200
  },
  "properties": {
    "headers": {
      "type": "object",
      "properties": {
        "Authorization": { "type": "string" }
      },
      "required": ["Authorization"]
    },
    "input": {
      "type": "object",
      "properties": {
        "userId": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" }
      },
      "required": ["userId"]
    },
    "output": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" }
      },
      "required": ["name", "email"]
    }
  },
  "required": ["input", "output"]
}
```

У цьому прикладі:  
- `x-meta.status_code = 200` → підказка для HTTP-відповіді.  
- `headers` вимагає токен авторизації.  
- `input` — ідентифікатор користувача.  
- `output` — об’єкт із даними користувача.  

---

## Валідація

Контракти можна валідовувати будь-яким інструментом для **JSON Schema draft-07**:  

- Node.js → [AJV](https://ajv.js.org/)  
- Python → [jsonschema](https://github.com/python-jsonschema/jsonschema)  
- Go → [gojsonschema](https://github.com/xeipuuv/gojsonschema)  
- Rust → [jsonschema crate](https://docs.rs/jsonschema/)  

---

## Референс

Офіційна схема контракту:  
[contract.json](https://github.com/dnip-labs/dnip/tree/master/json-schema/contract.json)

---

## Де зберігати контракти

Усі контракти зберігаються у плоскій структурі **contracts/*.json**.  
Це означає, що в директорії `contracts/` розташовані лише файли контрактів, без піддиректорій. Такий підхід спрощує організацію та пошук контрактів у проєкті.