---
sidebar_position: 11
---

# Processors
> Декларація — у `protocol.json`, конфігурація — у `config.js`, імплементація — у `protocol.js` (див. [Архітектура](../architecture/02-architecture.md)).

> Processors описуються у [protocol.json](architecture/03-protocol-json.md)

## Що таке processors

**Processors** — це опис відкладених завдань (delayed jobs).  
Вони відрізняються від `cron`:  
- запускаються не за розкладом, а після постановки в чергу;  
- мають повний `input` (контекст виконання);  
- можуть мати `output`, але він не повертається клієнту напряму, а використовується платформою (наприклад, у `onComplete`).  

---

## Структура у protocol.json

У декларації описується лише логіка:  

```json
{
  "processors": {
    "email.send": {
      "contract": "contracts/send-email.json",
      "execute": "domain.processors.emailSend",
      "onError": "domain.processors.onErrorHandler",
      "onComplete": "domain.processors.onCompleteHandler"
    },
    "report.generate": {
      "contract": "contracts/report.json",
      "execute": "domain.processors.reportGenerate"
    }
  }
}
```

- `execute` — основна функція.  
- `onError` — виконується при помилці.  
- `onComplete` — виконується після завершення (отримує `output`).  

---

## Структура у config.js

У конфігурації описуються параметри виконання:  

```js
export default {
  processors: {
    "email.send": {
      queue: "emails",
      attempts: 5,
      backoff: { type: "exponential", delay: 5000 }
    },
    "report.generate": {
      queue: "reports",
      delay: 60000,
      concurrency: 3
    }
  }
};
```

Тут можна вказати:  
- `queue` — черга для завдання.  
- `attempts` — кількість повторів при помилці.  
- `backoff` — стратегія повторів.  
- `delay` — відкладений запуск у мс.  
- `concurrency` — кількість паралельних обробників.  

---

## Приклад імплементації

```js
export default function ProtocolImplementation() {
  return {
    domain: {
      processors: {
        emailSend: async (context) => {
          await context.ports.mailer.send(context.params.to, context.params.body);
          return { delivered: true };
        },
        onErrorHandler: async (context) => {
          console.error("Job failed:", context.params.error);
        },
        onCompleteHandler: async (context) => {
          console.log("Job finished:", context.params.jobId, context.params.output);
        },
        reportGenerate: async (context) => {
          const report = await context.ports.reports.build(context.params.type);
          return { reportId: report.id };
        }
      }
    }
  };
}
```

---

## Відмінність від cron

| Cron                  | Processors                          |
|------------------------|------------------------------------|
| запускається за розкладом | запускається після постановки в чергу |
| не має `input` (мінімальний контекст) | завжди має `input` як у звичайного action |
| результат не використовується | `output` може бути використаний у `onComplete` |
| визначається лише у `protocol.json` | декларація у `protocol.json`, налаштування у `config.js` |

---

## Референс

Processors — це розширення DNIP для роботи з відкладеними завданнями.  
Вони описують логіку у `protocol.json` і параметри виконання у `config.js`.