---
sidebar_position: 10
---

# Cron
> Cronjobs описуються декларативно у [protocol.json](architecture/03-protocol-json.md)

## Що таке Cron у DNIP

**Cron** у DNIP — це декларативний опис періодичних завдань вузла.  
Він визначається у **protocol.json** і виконується реалізацією вузла.  

---

## Структура cron у protocol.json

```json
{
  "cron": {
    "timezone": "Europe/Berlin",
    "jobs": {
      "cleanup": {
        "pattern": "0 0 * * *",
        "execute": "domain.jobs.cleanup",
        "onError": "domain.jobs.onErrorHandler"
      },
      "report": {
        "pattern": "*/15 * * * *",
        "execute": "domain.jobs.report",
        "onError": "domain.jobs.onErrorHandler",
        "onComplete": "domain.jobs.notify"
      }
    }
  }  
}
```

У цьому прикладі:  
- `timezone` — таймзона, яка має збігатися з патерном та відповідати стандарту **IANA Time Zone Database** (наприклад, `Europe/Berlin`).  
- `jobs` — об’єкт, де ключами є унікальні імена завдань:  
  - `pattern` — cron-вираз.  
  - `execute` — функція у домені.
  - `onError` — опціональний обробник помилок.  
  - `onComplete` — опційний хук після виконання.  
  
---

## Як це відображається в імплементації

```js title="protocol.js"
export default function ProtocolImplementation() {
  return {
    domain: {
      jobs: {
        cleanup: async (context) => {
          // приклад: використовуємо готові адаптери
          const db = context.ports.postgres;
          if (db && typeof db.cleanupInactiveUsers === "function") {
            await db.cleanupInactiveUsers();
          }
          return { ok: true };
        },
        report: (context) => {
          return { generated: true, at: new Date().toISOString() };
        },
        notify: (context) => {
          console.log("Report completed!");
          return { notified: true };
        },
        onErrorHandler: async (context) => {
          // context.error може містити інформацію про помилку під час виконання job
          console.error("Cron job error (context):", context.error);
        }
      }
    }
  };
}
```

---

## Валідація

У схемі `protocol.json` та `implemented.json`:  
- `jobs[]` вимагають `name`, `pattern`, `execute`.  
- дозволено `onComplete`, `disabled`.  
- `timezone` має збігатися з патерном **і** відповідати стандарту **IANA Time Zone Database** (наприклад, `Europe/Kyiv`):  
  ```regex
  ^([a-zA-Z_]{2,14}\/){1,2}[a-zA-Z_]{2,14}$
  ```

---

## Референс

Офіційна схема cron:  
див. [protocol.json](https://github.com/dnip-labs/dnip/blob/master/json-schema/protocol.json#L22)