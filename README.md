# @elysia/cookie-middleware

To install dependencies:

```bash
bun add @elysia/cookie-middleware
```

### Usage:
```javascript
import { Elysia } from 'elysia'
import { cookieMiddleware } from '@elysia/cookie-middleware'

new Elysia()
  .use(cookieMiddleware("<YOUR_SECRET_KEY>"))
  .get("/", () => return "Hello world")
```

This project was inspired from `expressjs` and i hope this package can help you. If yes give me 1 star.
