import express from 'express';
import { resolve } from 'path';
import { init as projInit, list as projList } from '../controller/projCtrl';
import { uploadPost as logPostUpload, uploadGet as logGetUpload, list as logList, detail as logDetail } from '../controller/logCtrl';
import { upload as smUpload, search as smSearch } from '../controller/sourcemapCtrl';
import { statisticTotalGet, statisticProjGet } from '../controller/statisticCtrl';
import { list as sessionList, detail as sessionDetail } from '../controller/sessionCtrl';

const resolveDirname = (target: string) => resolve(__dirname, target);

const router = express.Router(); // 创建路由对象

router.get('/project/init', projInit);
router.get('/project/list', projList);

router.get('/statistic/total', statisticTotalGet);
router.get('/statistic/proj', statisticProjGet);

router.post('/log/report', logPostUpload);
router.get('/log/report', logGetUpload);
router.get('/log/list', logList);
router.get('/log/detail', logDetail);

router.post('/sourcemap/upload', smUpload);
router.get('/sourcemap/search', smSearch);

router.get('/session/list', sessionList);
router.get('/session/detail', sessionDetail);

router.get('/test', (req, res) => {
  setTimeout(() => {
    res.send({
      code: 0,
      data: {
        mesaage: '测试接口'
      },
      msg: 'succeed'
    });
  }, 4000)
});

// resource
router.use('/browser-dist', express.static(resolveDirname('../../../clients/browser/dist')));
router.use('/customer-dist', express.static(resolveDirname('../../../../browser_plugins/customer/dist')));
router.use('/dom-dist', express.static(resolveDirname('../../../../browser_plugins/dom/dist')));
router.use('/fetch-dist', express.static(resolveDirname('../../../../browser_plugins/fetch/dist')));
router.use('/hash-dist', express.static(resolveDirname('../../../../browser_plugins/hash/dist')));
router.use('/history-dist', express.static(resolveDirname('../../../../browser_plugins/history/dist')));
router.use('/crash-dist', express.static(resolveDirname('../../../../browser_plugins/page_crash/dist')));
router.use('/crash-worker', express.static(resolveDirname('../../../../browser_plugins/page_crash_worker/dist')));
router.use('/performance-dist', express.static(resolveDirname('../../../../browser_plugins/performance/dist')));
router.use('/xhr-dist', express.static(resolveDirname('../../../../browser_plugins/xhr/dist')));
router.use('/record-dist', express.static(resolveDirname('../../../../browser_plugins/record/dist')));

// views
router.use('/', express.static(resolveDirname('../views')));
router.use('/demo', express.static(resolveDirname('../views/demo.html')));
// playground dist
router.use('/playground', express.static(resolveDirname('../../../../playground/dist')));
router.use('/assets', express.static(resolveDirname('../../../../playground/dist/assets')));

export default router;
