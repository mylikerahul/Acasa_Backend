import express from 'express';
import * as JobsController from '../../controllers/jobs/jobs.controller.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';
import { createUploader, handleUploadError } from '../../middleware/uploads.js';

const router = express.Router();

const resumeUpload = createUploader('jobs/resumes', {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
});

// Public Routes
router.get('/', JobsController.getActiveJobs);
router.get('/types', JobsController.getJobTypes);
router.get('/locations', JobsController.getJobLocations);
router.get('/slug/:slug', JobsController.getJobBySlug);
router.get('/detail/:id', JobsController.getJobById);
router.post('/apply', resumeUpload.single('resume'), handleUploadError, JobsController.applyForJob);

// Admin Routes
router.get('/admin/list', isAuthenticated, isAdmin, JobsController.getActiveJobs);
router.get('/admin/stats', isAuthenticated, isAdmin, JobsController.getJobStats);
router.get('/admin/applications', isAuthenticated, isAdmin, JobsController.getJobApplications);
router.get('/admin/check-slug', isAuthenticated, isAdmin, JobsController.checkSlugAvailability);

router.post('/admin/create', isAuthenticated, isAdmin, JobsController.createJob);
router.put('/admin/update/:id', isAuthenticated, isAdmin, JobsController.updateJob);
router.delete('/admin/delete/:id', isAuthenticated, isAdmin, JobsController.deleteJob);
router.delete('/admin/hard-delete/:id', isAuthenticated, isAdmin, JobsController.hardDeleteJob);

router.patch('/admin/application/:id/status', isAuthenticated, isAdmin, JobsController.updateApplicationStatus);
router.delete('/admin/application/:id', isAuthenticated, isAdmin, JobsController.deleteApplication);

export default router;