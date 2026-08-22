import express from 'express';
import cors from 'cors';
import formidable from 'express-formidable';
import { create } from 'browser-sync';
import router from './route';
import expressIp from 'express-ip';
import { getUseablePort } from './lib/utils';

const app = express();

app.use(formidable());
app.use(cors({
  exposedHeaders: 'date'
}));
app.use(expressIp().getIpInfoMiddleware);
app.use(router);

const bs = create();

const DEFAULT_PORT = 8001;

async function start() {
  const port = Number(process.env.PORT) || (await getUseablePort({ port: DEFAULT_PORT }));
  const proxyPort = await getUseablePort({ port: port + 1 });

  if (!port || !proxyPort) {
    return;
  }

  app.listen(port, () => {
    bs.init({
      open: false,
      ui: false,
      notify: true,
      proxy: `localhost:${port}`,
      files: ['packages/**/dist/*.iife.js'],
      port: proxyPort
    });
  });
}

void start();
