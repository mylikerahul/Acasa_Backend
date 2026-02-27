import express from 'express';
import * as DealsController from '../../controllers/deals/deals.controller.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';

const router = express.Router();

router.get('/list', isAuthenticated, DealsController.getActiveDeals);

router.get('/stats', isAuthenticated, isAdmin, DealsController.getDealStats);

router.get('/closing/:closingId', isAuthenticated, DealsController.getDealsByClosingId);

router.get('/:id', isAuthenticated, DealsController.getDealById);

router.post('/create', isAuthenticated, isAdmin, DealsController.createDeal);

router.put('/update/:id', isAuthenticated, isAdmin, DealsController.updateDeal);

router.delete('/delete/:id', isAuthenticated, isAdmin, DealsController.deleteDeal);

export default router;