import express from 'express';
import cors from 'cors';
import formidable from 'express-formidable';
import router from './route';
import { getUseablePort } from './lib/utils';

const app = express();

app.use(formidable());
app.use(cors());
app.use(router);

getUseablePort().then((port) => {
  app.listen(port, () => {
    console.log(`consumer server running on localhost:${port}`);
  });
});
