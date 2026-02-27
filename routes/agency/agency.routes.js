import express from 'express';
import * as AgencyController from '../../controllers/agency/agency.controller.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';
import { createUploader, handleUploadError } from '../../middleware/uploads.js';

const router = express.Router();

const agentUpload = createUploader('agents', { maxSize: 5 * 1024 * 1024 });

// Agency Routes
router.get('/list', AgencyController.getActiveAgencies);
router.get('/stats', isAuthenticated, isAdmin, AgencyController.getStats);
router.get('/:id', AgencyController.getAgencyById);

router.post('/create', isAuthenticated, isAdmin, AgencyController.createAgency);
router.put('/update/:id', isAuthenticated, isAdmin, AgencyController.updateAgency);
router.delete('/delete/:id', isAuthenticated, isAdmin, AgencyController.deleteAgency);

// Agent Routes
router.get('/agents/list', AgencyController.getActiveAgents);
router.get('/agents/check-slug', AgencyController.checkSlugAvailability);
router.get('/agents/slug/:slug', AgencyController.getAgentBySlug);
router.get('/agents/:id', AgencyController.getAgentById);

router.post('/agents/create', isAuthenticated, isAdmin, agentUpload.single('image'), handleUploadError, AgencyController.createAgent);
router.put('/agents/update/:id', isAuthenticated, isAdmin, agentUpload.single('image'), handleUploadError, AgencyController.updateAgent);
router.delete('/agents/delete/:id', isAuthenticated, isAdmin, AgencyController.deleteAgent);

export default router;