/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { resolve } from 'path';
import { list as projList } from '../controller/projCtrl';
import { list as logList, detail as logDetail } from '../controller/logCtrl';
import { search as smSearch } from '../controller/sourcemapCtrl';
import { statisticTotalGet, statisticProjGet } from '../controller/statisticCtrl';
import { list as sessionList, detail as sessionDetail } from '../controller/sessionCtrl';

const resolveDirname = (target: string) => resolve(__dirname, target);

const router = express.Router(); // 创建路由对象

router.get('/project/list', projList);

router.get('/statistic/total', statisticTotalGet);
router.get('/statistic/proj', statisticProjGet);

router.get('/log/list', logList);
router.get('/log/detail', logDetail);

router.get('/sourcemap/search', smSearch);

router.get('/session/list', sessionList);
router.get('/session/detail', sessionDetail);

// views
router.use('/', express.static(resolveDirname('../views')));

export default router;
