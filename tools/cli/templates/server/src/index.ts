import express from 'express';
import cors from 'cors';
import formidable from 'express-formidable';
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

getUseablePort().then((port) => {
  app.listen(port, () => {
    console.log(`server running on localhost:${port}`);
  });
});
