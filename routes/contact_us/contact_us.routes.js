import express from 'express';
import * as ContactUsController from '../../controllers/contact_us/contact_us.controller.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';
import { createUploader } from '../../middleware/uploads.js';

const router = express.Router();

const contactUsUpload = createUploader('contact', {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
});

const uploadFields = contactUsUpload.fields([
  { name: 'profile', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]);

router.get('/', isAuthenticated, ContactUsController.getAll);

router.get('/stats', isAuthenticated, isAdmin, ContactUsController.getStats);

router.get('/date-range', isAuthenticated, ContactUsController.getByDateRange);

router.get('/source/:source', isAuthenticated, ContactUsController.getBySource);

router.get('/type/:type', isAuthenticated, ContactUsController.getByType);

router.get('/agent/:agentId', isAuthenticated, ContactUsController.getByAgentId);

router.get('/property/:propertyId', isAuthenticated, ContactUsController.getByPropertyId);

router.get('/developer/:developerId', isAuthenticated, ContactUsController.getByDeveloperId);

router.get('/individual/:individualId', isAuthenticated, ContactUsController.getByIndividualId);

router.get('/company/:companyId', isAuthenticated, ContactUsController.getByCompanyId);

router.get('/cuid/:cuid', isAuthenticated, ContactUsController.getByCuid);

router.get('/:id', isAuthenticated, ContactUsController.getById);

router.post('/', uploadFields, ContactUsController.create);

router.put('/:id', isAuthenticated, uploadFields, ContactUsController.update);

router.patch('/:id/lead-status', isAuthenticated, ContactUsController.updateLeadStatus);

router.patch('/:id/activity-log', isAuthenticated, ContactUsController.updateActivityLog);

router.patch('/:id/assign-agent', isAuthenticated, isAdmin, ContactUsController.assignAgent);

router.patch('/:id/assign-connected-agent', isAuthenticated, ContactUsController.assignConnectedAgent);

router.patch('/:id/assign-connected-agency', isAuthenticated, ContactUsController.assignConnectedAgency);

router.patch('/:id/assign-connected-employee', isAuthenticated, ContactUsController.assignConnectedEmployee);

router.patch('/:id/restore', isAuthenticated, isAdmin, ContactUsController.restore);

router.delete('/:id', isAuthenticated, ContactUsController.remove);

router.delete('/:id/permanent', isAuthenticated, isAdmin, ContactUsController.permanentRemove);

router.patch('/bulk/status', isAuthenticated, isAdmin, ContactUsController.bulkUpdateStatus);

router.patch('/bulk/lead-status', isAuthenticated, isAdmin, ContactUsController.bulkUpdateLeadStatus);

router.post('/bulk/delete', isAuthenticated, isAdmin, ContactUsController.bulkDelete);

router.post('/bulk/hard-delete', isAuthenticated, isAdmin, ContactUsController.bulkHardDelete);

export default router;