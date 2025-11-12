---
sidebar_position: 5
---

# Контракти

## Що таке контракт

**Контракт** — це формальна обіцянка вузла (**Node**) на правильний формат даних.  
Він визначає:  
- **headers** — заголовки запиту/повідомлення (HTTP, AMQP, Kafka…).  
- **input** — вхідні дані.  
- **output** — вихідні дані.

*Контракт описується у форматі [**JSON Schema draft-07**](https://json-schema.org/draft-07/draft-handrews-json-schema-01).*

*Можуть бути додані ще кастомні поля по стандарту [**JSON Schema**](https://json-schema.org/draft-07/draft-handrews-json-schema-01) починаючи з префіксу `x-`*

---

## Структура контракту

- `$id` (необовязкове) — унікальний ідентифікатор контракту.  
- `$schema` — завжди `https://json-schema.org/draft-07/schema#`.  
- `x-group` (необовязкове) — до яких груп належить контракт (наприклад: `['Users']`)
- `x-meta` (необовязкове) — додаткові метадані (наприклад, `status_code`).  
- `properties` — опис об’єкта з полями `headers`, `input`, `output`.  
- `required` — зазвичай включає `input` та `output` (та `headers` за потреби).

---
- `input.properties` може бути `x-in` — вказує звідки було взято дані. Доступні значення:
  - `path` — як URL param `/some-url/:bar` → `/some-url/1` (у цьому випдаку `:bar`)
  - `query` — як query param `/some-url?bar=1` (у цьому випдаку `bar`)

`x-in` дає можливість **Платформі** зрозуміти як генерувати документацію OpenAPI та інших стандартів у подальшому, а також як формувати `context.params`

---

## Мінімальний приклад

```json
{
  "$id": "contracts/get_user.json",
  "$schema": "https://json-schema.org/draft-07/schema#",
  "x-group": ["Users"],
  "x-meta": {
    "status_code": 200
  },
  "type": "object",
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
        "user_id": {
          "x-in": "query",
          "type": "string",
          "pattern": "^[0-9a-fA-F]{24}$"
        }
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
- `x-group` — декларує цей контракт у групі `Users`
- `x-meta.status_code = 200` → підказка для HTTP-відповіді.  
- `headers` вимагає токен авторизації.  
- `input` — ідентифікатор користувача.  
- `input.properties.user_id.x-in` — вказує що дані було взято з query запиту.
- `output` — об’єкт із даними користувача.  

---

## Валідація

Контракти можна валідовувати будь-яким інструментом для **Draft-07**:  

- Node.js → [AJV](https://ajv.js.org/)  
- Python → [jsonschema](https://github.com/python-jsonschema/jsonschema)  
- Go → [gojsonschema](https://github.com/xeipuuv/gojsonschema)  
- Rust → [jsonschema crate](https://docs.rs/jsonschema/)  

> Як перевіряються контракти: див. розділ [Валідація](contracts/08-validation.md)

> Офіційна схема контракту: [на GitHub](https://github.com/open-dnip/sdk-nodejs/blob/master/json-schema/contract.json)

---

## Де зберігати контракти

Усі контракти зберігаються у плоскій структурі **contracts/*.json**.  
Це означає, що в директорії `contracts/` розташовані лише файли контрактів, без піддиректорій. Такий підхід спрощує організацію та пошук контрактів у проєкті.