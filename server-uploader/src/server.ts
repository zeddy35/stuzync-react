import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { env } from './config/env';
import router from './routes';
import { scheduleDailyReset } from './jobs/dailyReset';

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  const app = express();

  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'img-src': ["'self'", 'data:', 'https:', env.R2_PUBLIC_BASE_URL],
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'connect-src': ["'self'", 'https:'],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      strictTransportSecurity: { maxAge: 63072000, includeSubDomains: true, preload: true },
    })
  );
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use(router);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  });

  scheduleDailyReset();
  app.listen(env.PORT, () => console.log(`Uploader listening on :${env.PORT}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

