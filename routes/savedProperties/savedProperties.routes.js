// backend/routes/savedProperties/savedProperties.routes.js

import express from 'express';
import * as SavedPropertiesController from '../../controllers/savedProperties/savedProperties.controller.js';
import { isAuthenticated } from '../../guards/guards.js';

const router = express.Router();

router.post('/toggle', isAuthenticated, SavedPropertiesController.toggleSavedProperty);
router.post('/add', isAuthenticated, SavedPropertiesController.addToSaved);
router.post('/remove', isAuthenticated, SavedPropertiesController.removeFromSaved);
router.get('/', isAuthenticated, SavedPropertiesController.getSavedProperties);
router.get('/details', isAuthenticated, SavedPropertiesController.getSavedWithDetails);
router.get('/count', isAuthenticated, SavedPropertiesController.getSavedCount);
router.get('/check', isAuthenticated, SavedPropertiesController.checkIfSaved);
router.get('/ids', isAuthenticated, SavedPropertiesController.getSavedIds);
router.post('/bulk-add', isAuthenticated, SavedPropertiesController.bulkAddToSaved);
router.delete('/clear', isAuthenticated, SavedPropertiesController.clearAllSaved);
router.put('/:id', isAuthenticated, SavedPropertiesController.updateSavedItem);
router.delete('/:id', isAuthenticated, SavedPropertiesController.deleteSavedItem);

export default router;