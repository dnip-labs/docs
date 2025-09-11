---
sidebar_position: 15
---

# Глосарій

## Основні терміни

- [**Node (Вузол)**](https://uk.wikipedia.org/wiki/Вузол_(інформатика)) — окремий елемент мережі DNIP, який має декларацію (**protocol.json**) та реалізацію (**protocol.js**).  

- [**Protocol (Протокол)**](https://uk.wikipedia.org/wiki/Комунікаційний_протокол) — стандарт DNIP, що описує, як вузли взаємодіють між собою.  

- **protocol.json** — декларативний опис сервісів, дій, gateway, cronjobs та processors вузла. Це ядро вузла.  

- **Contract (Контракт)** — файл **contracts/*.json** у форматі **JSON Schema draft-07**, що описує формат вхідних та вихідних даних (`headers`, `input`, `output`).  
  Усі контракти зберігаються у плоскій структурі **contracts/*.json** без піддиректорій.  

- **x-meta** — довільні метадані в контракті, наприклад `status_code`.  

- [**Gateway**](https://uk.wikipedia.org/wiki/Мережевий_шлюз) — шар, який мапить зовнішні інтерфейси на дії сервісів. Складається з:  
  - **HTTP gateway** (`gateway.http.routes`) — визначає відповідність HTTP маршрутів діям сервісів.  
  - **Events gateway** (`gateway.events`) — визначає відповідність асинхронних подій (наприклад, `user.created`) діям сервісів.  

- **Action (Дія)** — викликаємий метод сервісу. Має `contract` та `execute`.  

- **Transports** — перелік технологій для взаємодії між вузлами (`amqp`, `kafka`, `nats`, `mqtt`, `redis`).  

- [**Cronjobs**](https://uk.wikipedia.org/wiki/Cron) — розділ `cron` у `protocol.json`. Використовується для опису періодичних завдань, що виконуються реалізацією вузла. Не мають контрактів.  

- [**Processors**](https://en.wikipedia.org/wiki/Job_queue) — розділ `processors` у `protocol.json`. Черги завдань, які обробляються вузлом (аналог до BullMQ). Можуть мати `execute` та `onError`.  

- **Config.js** — конфігурація вузла (бази даних, кеші, зовнішні API, параметри черг тощо).  

- **protocol.js** — реалізація логіки вузла: функції для `domain`, які викликаються через `execute`, `onError`, `onComplete`, а також реалізація cronjobs та processors.  

---

## Додаткові терміни

- [**Draft-07**](https://json-schema.org/draft-07/draft-handrews-json-schema-01) — стандарт JSON Schema, який використовується у DNIP для всіх описів.  
- [**Middleware**](https://uk.wikipedia.org/wiki/Проміжне_програмне_забезпечення) — функції-посередники, що можуть застосовуватись до HTTP gateway.  
- [**Alias**](https://uk.wikipedia.org/wiki/Аліас) — ярлик для дії сервісу, який спрощує виклик через gateway.  
