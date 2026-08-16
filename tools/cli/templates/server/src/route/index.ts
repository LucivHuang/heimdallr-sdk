import express from 'express';
import { resolve } from 'path';
import { initGet as projInitGet, initPost as projInitPost, list as projList } from '../controller/projCtrl';
import { uploadPost as logPostUpload, uploadGet as logGetUpload, list as logList, detail as logDetail } from '../controller/logCtrl';
import { upload as smUpload, search as smSearch } from '../controller/sourcemapCtrl';
import { statisticTotalGet, statisticProjGet } from '../controller/statisticCtrl';
import { list as sessionList, detail as sessionDetail } from '../controller/sessionCtrl';

const resolveDirname = (target: string) => resolve(__dirname, target);

const router = express.Router(); // 创建路由对象

router.post('/project/init', projInitPost);
router.get('/project/init', projInitGet);
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

// views
router.use('/', express.static(resolveDirname('../views')));

export default router;
