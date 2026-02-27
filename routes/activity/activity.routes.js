import express from 'express';
import * as RecentActivityController from '../../controllers/activity/activity.controller.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';

const router = express.Router();

router.get('/', isAuthenticated, RecentActivityController.getAll);

router.get('/stats', isAuthenticated, RecentActivityController.getStats);

router.get('/recent', isAuthenticated, RecentActivityController.getRecent);

router.get('/date-range', isAuthenticated, RecentActivityController.getByDateRange);

router.get('/count/module', isAuthenticated, RecentActivityController.getCountByModule);

router.get('/count/action', isAuthenticated, RecentActivityController.getCountByAction);

router.get('/count/type', isAuthenticated, RecentActivityController.getCountByType);

router.get('/count/user', isAuthenticated, RecentActivityController.getCountByUser);

router.get('/count/date', isAuthenticated, RecentActivityController.getCountByDate);

router.get('/count/status', isAuthenticated, RecentActivityController.getCountByStatus);

router.get('/user/:userId', isAuthenticated, RecentActivityController.getByUserId);

router.get('/user-name/:userName', isAuthenticated, RecentActivityController.getByUserName);

router.get('/module/:module', isAuthenticated, RecentActivityController.getByModule);

router.get('/module/:module/:moduleId', isAuthenticated, RecentActivityController.getByModuleAndId);

router.get('/action/:action', isAuthenticated, RecentActivityController.getByAction);

router.get('/type/:type', isAuthenticated, RecentActivityController.getByType);

router.get('/:id', isAuthenticated, RecentActivityController.getById);

router.post('/', isAuthenticated, RecentActivityController.create);

router.post('/log', isAuthenticated, RecentActivityController.logActivity);

router.put('/:id', isAuthenticated, isAdmin, RecentActivityController.update);

router.delete('/old', isAuthenticated, isAdmin, RecentActivityController.deleteOldActivities);

router.delete('/clear-all', isAuthenticated, isAdmin, RecentActivityController.clearAll);

router.delete('/user/:userId', isAuthenticated, isAdmin, RecentActivityController.deleteByUserId);

router.delete('/module/:module', isAuthenticated, isAdmin, RecentActivityController.deleteByModule);

router.delete('/:id', isAuthenticated, isAdmin, RecentActivityController.remove);

router.post('/bulk/delete', isAuthenticated, isAdmin, RecentActivityController.bulkDelete);

export default router;