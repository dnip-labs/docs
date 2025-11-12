---
sidebar_position: 13
---

# JavaScript

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
  },
  "required": ["input", "output"]
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

## Моноліт

У моноліті кілька доменів реалізуються в одній Node  

### Файлова структура

```
.
├── contracts/
│   ├── ping.json
│   ├── create_user.json
│   ├── create_order.json
│   └── user_created_event.json
├── protocol.json
├── config.js
└── protocol.js
```

### protocol.json (моноліт)

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
    },
    {
      "name": "users",
      "version": 1,
      "transports": ["amqp"],
      "actions": {
        "createUser": {
          "contract": "contracts/create_user.json",
          "execute": "domain.users.create_user"
        },
        "onUserCreated": {
          "contract": "contracts/user_created_event.json",
          "execute": "domain.users.on_user_created"
        }
      }
    },
    {
      "name": "orders",
      "version": 1,
      "transports": ["amqp"],
      "actions": {
        "createOrder": {
          "contract": "contracts/create_order.json",
          "execute": "domain.orders.create_order"
        }
      }
    }
  ],
  "gateway": {
    "http": {
      "routes": {
        "GET /ping": { "alias": "system.v1.ping" },
        "POST /users": {
          "contract": "contracts/create_user.json",
          "execute": "domain.users.create_user"
        },
        "POST /orders": {
          "contract": "contracts/create_order.json",
          "execute": "domain.orders.create_order"
        }
      }
    },
    "events": {
      "routes": {
        "user.created": {
          "contract": "contracts/user_created_event.json",
          "execute": "domain.users.on_user_created"
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
  "required": ["input", "output"]
}
```

### Приклади контрактів

#### contracts/create_user.json

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "contracts/create_user.json",
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
  },
  "required": ["input", "output"]
}
```

#### contracts/create_order.json

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "contracts/create_order.json",
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
  },
  "required": ["input", "output"]
}
```

#### contracts/user_created_event.json

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "contracts/user_created_event.json",
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
  },
  "required": ["input", "output"]
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
      }
    }
  };
}
```
