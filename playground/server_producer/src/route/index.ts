import express from 'express';
import { resolve } from 'path';
import { init as projInit } from '../controller/projCtrl';
import { uploadPost as logPostUpload, uploadGet as logGetUpload } from '../controller/logCtrl';
import { upload as smUpload } from '../controller/sourcemapCtrl';

const resolveDirname = (target: string) => resolve(__dirname, target);

const router = express.Router(); // 创建路由对象

router.get('/project/init', projInit);

router.post('/log/report', logPostUpload);
router.get('/log/report', logGetUpload);

router.post('/sourcemap/upload', smUpload);

router.get('/test', (req, res) => {
  res.send({
    code: 0,
    data: {
      mesaage: '测试接口'
    },
    msg: 'succeed'
  });
});

// resource
router.use('/browser-dist', express.static(resolveDirname('../../../../packages/browser/dist')));
router.use('/customer-dist', express.static(resolveDirname('../../../../packages/customer/dist')));
router.use('/dom-dist', express.static(resolveDirname('../../../../packages/dom/dist')));
router.use('/fetch-dist', express.static(resolveDirname('../../../../packages/fetch/dist')));
router.use('/hash-dist', express.static(resolveDirname('../../../../packages/hash/dist')));
router.use('/history-dist', express.static(resolveDirname('../../../../packages/history/dist')));
router.use('/crash-dist', express.static(resolveDirname('../../../../packages/page_crash/dist')));
router.use('/crash-worker', express.static(resolveDirname('../../../../packages/page_crash_worker/dist')));
router.use('/performance-dist', express.static(resolveDirname('../../../../packages/performance/dist')));
router.use('/xhr-dist', express.static(resolveDirname('../../../../packages/xhr/dist')));

// views
router.use('/', express.static(resolveDirname('../views')));
router.use('/demo', express.static(resolveDirname('../views/demo.html')));

export default router;
