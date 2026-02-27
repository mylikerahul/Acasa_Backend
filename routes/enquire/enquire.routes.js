import express from 'express';
import * as EnquiryController from '../../controllers/enquire/enquire.controller.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';
import { createUploader, handleUploadError } from '../../middleware/uploads.js';

const router = express.Router();

const enquiryUpload = createUploader('enquiries', { maxSize: 5 * 1024 * 1024 });

const uploadFields = enquiryUpload.fields([
  { name: 'property_image', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]);

router.post('/', uploadFields, handleUploadError, EnquiryController.createEnquiry);

router.get('/list', isAuthenticated, EnquiryController.getActiveEnquiries);

router.get('/search', isAuthenticated, EnquiryController.searchEnquiries);

router.get('/recent', isAuthenticated, EnquiryController.getRecentEnquiries);

router.get('/unassigned', isAuthenticated, isAdmin, EnquiryController.getUnassignedEnquiries);

router.get('/high-priority', isAuthenticated, EnquiryController.getHighPriorityEnquiries);

router.get('/stats', isAuthenticated, isAdmin, EnquiryController.getEnquiryStats);

router.get('/property/:propertyId', isAuthenticated, EnquiryController.getEnquiriesByProperty);

router.get('/project/:projectId', isAuthenticated, EnquiryController.getEnquiriesByProject);

router.get('/agent/:agentId', isAuthenticated, EnquiryController.getEnquiriesByAgent);

router.get('/contact/:contactId', isAuthenticated, EnquiryController.getEnquiriesByContact);

router.get('/:id', isAuthenticated, EnquiryController.getEnquiryById);

router.put('/update/:id', isAuthenticated, uploadFields, handleUploadError, EnquiryController.updateEnquiry);

router.delete('/delete/:id', isAuthenticated, isAdmin, EnquiryController.deleteEnquiry);

router.delete('/hard-delete/:id', isAuthenticated, isAdmin, EnquiryController.hardDeleteEnquiry);

router.patch('/status/:id', isAuthenticated, EnquiryController.updateEnquiryStatus);

router.patch('/lead-status/:id', isAuthenticated, EnquiryController.updateLeadStatus);

router.patch('/priority/:id', isAuthenticated, EnquiryController.updatePriority);

router.patch('/quality/:id', isAuthenticated, EnquiryController.updateQuality);

router.patch('/assign-agent/:id', isAuthenticated, isAdmin, EnquiryController.assignAgent);

router.patch('/agent-activity/:id', isAuthenticated, EnquiryController.updateAgentActivity);

router.patch('/admin-activity/:id', isAuthenticated, isAdmin, EnquiryController.updateAdminActivity);

router.patch('/restore/:id', isAuthenticated, isAdmin, EnquiryController.restoreEnquiry);

router.patch('/drip-marketing/:id', isAuthenticated, EnquiryController.toggleDripMarketing);

router.patch('/bulk-status', isAuthenticated, isAdmin, EnquiryController.bulkUpdateStatus);

router.patch('/bulk-assign', isAuthenticated, isAdmin, EnquiryController.bulkAssignAgent);

router.patch('/bulk-lead-status', isAuthenticated, isAdmin, EnquiryController.bulkUpdateLeadStatus);

export default router;