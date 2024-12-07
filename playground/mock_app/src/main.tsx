import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createHashRouter } from "react-router-dom";
import router from "./router.tsx";
import './index.css';
import init from '@heimdallr-sdk/browser';
import dom from '@heimdallr-sdk/dom';
import fetch from '@heimdallr-sdk/fetch';
import hash from '@heimdallr-sdk/hash';
import history from '@heimdallr-sdk/history';
import pageCrash from '@heimdallr-sdk/page-crash';
import performance from '@heimdallr-sdk/performance';
import record from '@heimdallr-sdk/record';
import xhr from '@heimdallr-sdk/xhr';

init({
  dsn: {
    host: 'localhost:8001',
    init: '/project/init',
    report: '/log/report'
  },
  app: {
    name: 'playgroundAPP',
    leader: 'test',
    desc: 'test proj'
  },
  plugins: [
    dom(),
    fetch(),
    hash(),
    history(),
    performance(),
    record(),
    xhr(),
    pageCrash({
      pageCrashWorkerUrl: '/crash-worker/page_crash_worker.iife.js'
    }),
  ],
  debug: true
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={createHashRouter(router)} />
  </StrictMode>
);
