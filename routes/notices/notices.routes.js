import express from 'express';
import * as NoticesController from '../../controllers/notices/notices.controllers.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';

const router = express.Router();

router.get('/', isAuthenticated, NoticesController.getNotices);

router.get('/my-notices', isAuthenticated, NoticesController.getMyNotices);

router.get('/:id', isAuthenticated, NoticesController.getNoticeById);

router.post('/create', isAuthenticated, isAdmin, NoticesController.createNotice);

router.put('/update/:id', isAuthenticated, isAdmin, NoticesController.updateNotice);

router.delete('/delete/:id', isAuthenticated, isAdmin, NoticesController.deleteNotice);

export default router;