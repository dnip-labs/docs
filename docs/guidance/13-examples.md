---
sidebar_position: 13
---

# Приклади

## Мінімальний вузол

Файлова структура:  

```
.
├── contracts/
│   └── ping.json
├── protocol.json
├── config.js
└── protocol.js
```

### protocol.json

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
    }
  }
}
```

### contracts/ping.json

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
        "echo": { "type": "string" }
      }
    }
  }
}
```

### protocol.js

```js
export default function ProtocolImplementation() {
  return {
    domain: {
      system: {
        ping: async (context) => {
          return { echo: context.params.message };
        }
      }
    }
  };
}
```

---

## Cronjobs

### protocol.json

```json
{
  "cron": {
    "timezone": "Europe/Kyiv",
    "jobs": [
      {
        "name": "cleanup",
        "pattern": "0 0 * * *",
        "execute": "domain.jobs.cleanup",
        "onError": "domain.jobs.onErrorHandler"
      }
    ]
  }
}
```

### protocol.js

```js
export default function ProtocolImplementation() {
  return {
    domain: {
      jobs: {
        cleanup: async (context) => {
          const db = context.ports.postgres;
          if (db && typeof db.cleanupInactiveUsers === "function") {
            await db.cleanupInactiveUsers();
          }
          return { ok: true };
        },
        onErrorHandler: async (context) => {
          console.error("Cron job error:", context.error);
        }
      }
    }
  };
}
```

---

## Processor

### config.js

```js
export default {
  processors: {
    emailQueue: {
      connection: { host: "localhost", port: 6379 },
      concurrency: 5
    }
  }
};
```

### protocol.json

```json
{
  "processors": [
    {
      "queue": "emailQueue",
      "execute": "domain.processors.sendEmail",
      "onError": "domain.processors.onEmailError"
    }
  ]
}
```

### protocol.js

```js
export default function ProtocolImplementation() {
  return {
    domain: {
      processors: {
        sendEmail: async (context) => {
          const { to, body } = context.params;
          console.log("Sending email to", to, "with body", body);
          return { status: "sent" };
        },
        onEmailError: (context) => {
          console.error("Email job failed:", context.error);
        }
      }
    }
  };
}
```

---

## Моноліт

У моноліті кілька доменів реалізуються в одній Node  

### Файлова структура

```
.
├── contracts/
│   ├── ping.json
│   ├── createUser.json
│   ├── createOrder.json
│   └── userCreatedEvent.json
├── protocol.json
├── config.js
└── protocol.js
```

### protocol.json (моноліт)

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
    },
    "users": {
      "version": 1,
      "transports": ["amqp"],
      "actions": {
        "createUser": {
          "contract": "contracts/createUser.json",
          "execute": "domain.users.createUser"
        },
        "onUserCreated": {
          "contract": "contracts/userCreatedEvent.json",
          "execute": "domain.users.onUserCreated"
        }
      }
    },
    "orders": {
      "version": 1,
      "transports": ["amqp"],
      "actions": {
        "createOrder": {
          "contract": "contracts/createOrder.json",
          "execute": "domain.orders.createOrder"
        }
      }
    }
  },
  "gateway": {
    "http": {
      "routes": {
        "GET /ping": { "alias": "system.v1.ping" },
        "POST /users": {
          "contract": "contracts/createUser.json",
          "execute": "domain.users.createUser"
        },
        "POST /orders": {
          "contract": "contracts/createOrder.json",
          "execute": "domain.orders.createOrder"
        }
      }
    },
    "events": {
      "routes": {
        "user.created": {
          "contract": "contracts/userCreatedEvent.json",
          "execute": "domain.users.onUserCreated"
        }
      }
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
  "processors": [
    {
      "queue": "emailQueue",
      "execute": "domain.processors.sendEmail"
    }
  ]
}
```

### Приклади контрактів

#### contracts/createUser.json

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "contracts/createUser.json",
  "type": "object",
  "properties": {
    "input": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" }
      },
      "required": ["name", "email"]
    },
    "output": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" }
      },
      "required": ["id", "name", "email"]
    }
  }
}
```

#### contracts/createOrder.json

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "contracts/createOrder.json",
  "type": "object",
  "properties": {
    "input": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "amount": { "type": "number" }
      },
      "required": ["id", "amount"]
    },
    "output": {
      "type": "object",
      "properties": {
        "orderId": { "type": "string" },
        "status": { "type": "string" }
      },
      "required": ["orderId", "status"]
    }
  }
}
```

#### contracts/userCreatedEvent.json

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "contracts/userCreatedEvent.json",
  "type": "object",
  "properties": {
    "input": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" }
      },
      "required": ["id", "name", "email"]
    },
    "output": {
      "type": "object",
      "properties": {
        "ok": { "type": "boolean" }
      },
      "required": ["ok"]
    }
  }
}
```

### protocol.js

```js
export default function ProtocolImplementation() {
  return {
    domain: {
      system: {
        ping: async (context) => {
          return { echo: context.params.message };
        }
      },
      users: {
        createUser: async (context) => {
          // create user ...
          return { id: "u1", name: context.params.name, email: context.params.email };
        },
        onUserCreated: async (context) => {
          console.log("Handled user.created event:", context.params.id);
          return { ok: true };
        }
      },
      orders: {
        createOrder: async (context) => {
          // create order ...
          return { orderId: context.params.id, status: "ok" };
        }
      },
      jobs: {
        cleanup: async (context) => {
          console.log("Cleanup executed");
          return { ok: true };
        }
      },
      processors: {
        sendEmail: async (context) => {
          console.log("Email sent to", context.params.to);
          return { status: "sent" };
        }
      }
    }
  };
}
```