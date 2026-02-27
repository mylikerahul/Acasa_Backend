import express from 'express';
import * as TasksController from '../../controllers/task/task.controller.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';

const router = express.Router();

router.get('/', isAuthenticated, TasksController.getAll);

router.get('/stats', isAuthenticated, TasksController.getStats);

router.get('/by-assignee', isAuthenticated, TasksController.getTasksByAssignee);

router.get('/date-range', isAuthenticated, TasksController.getByDateRange);

router.get('/assign/:assign', isAuthenticated, TasksController.getByAssign);

router.get('/date/:date', isAuthenticated, TasksController.getByDate);

router.get('/slug/:slug', isAuthenticated, TasksController.getBySlug);

router.get('/:id', isAuthenticated, TasksController.getById);

router.post('/', isAuthenticated, TasksController.create);

router.put('/:id', isAuthenticated, TasksController.update);

router.patch('/:id/assign', isAuthenticated, TasksController.updateAssign);

router.patch('/:id/commission', isAuthenticated, TasksController.updateCommission);

router.delete('/:id', isAuthenticated, TasksController.remove);

router.post('/bulk/delete', isAuthenticated, isAdmin, TasksController.bulkDelete);

router.patch('/bulk/assign', isAuthenticated, isAdmin, TasksController.bulkUpdateAssign);

export default router;