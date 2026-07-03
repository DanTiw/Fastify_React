import { buildApp } from './app';
import { env } from './lib/env';

const app = buildApp();

app
  .listen({ port: env.PORT, host: '0.0.0.0' })
  .then((address) => app.log.info(`API ready at ${address} — docs at /docs`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
