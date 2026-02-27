  import express from 'express';
  import * as ProjectController from '../../controllers/projects/project.controller.js';
  import { isAdmin, isAuthenticated } from '../../guards/guards.js';
  import { createUploader, handleUploadError } from '../../middleware/uploads.js';

  const router = express.Router();

  const projectUpload = createUploader('projects', { maxSize: 5 * 1024 * 1024 });
  const galleryUpload = createUploader('projects/gallery', { maxSize: 5 * 1024 * 1024 });
  const floorPlanUpload = createUploader('projects/floorplans', { maxSize: 5 * 1024 * 1024 });

  const uploadFields = projectUpload.fields([
    { name: 'featured_image', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
    { name: 'gallery', maxCount: 20 }
  ]);

  router.get('/', ProjectController.getActiveProjects);

  router.get('/search', ProjectController.searchProjects);

  router.get('/featured', ProjectController.getFeaturedProjects);

  router.get('/top-viewed', ProjectController.getTopViewedProjects);

  router.get('/check-slug', ProjectController.checkSlugAvailability);

  router.get('/city/:cityId', ProjectController.getProjectsByCity);

  router.get('/developer/:developerId', ProjectController.getProjectsByDeveloper);

  router.get('/community/:communityId', ProjectController.getProjectsByCommunity);

  router.get('/similar/:projectId', ProjectController.getSimilarProjects);

  router.get('/slug/:slug', ProjectController.getProjectBySlug);

  router.get('/gallery/:projectId', ProjectController.getGalleryByProjectId);

  router.get('/floor-plans/:projectId', ProjectController.getFloorPlansByProjectId);

  router.get('/project-data/sub-community/:subCommunityId', ProjectController.getProjectDataBySubCommunity);

  router.post('/contact', ProjectController.createProjectContact);

  router.get('/admin/list', isAuthenticated, isAdmin, ProjectController.getAllProjectsAdmin);

  router.get('/admin/stats', isAuthenticated, isAdmin, ProjectController.getProjectStats);

  router.get('/admin/contacts', isAuthenticated, isAdmin, ProjectController.getAllProjectContacts);

  router.get('/admin/contacts/:projectId', isAuthenticated, isAdmin, ProjectController.getProjectContacts);

  router.get('/admin/:id', isAuthenticated, isAdmin, ProjectController.getProjectByIdAdmin);

  router.post('/admin/create', isAuthenticated, isAdmin, uploadFields, handleUploadError, ProjectController.createProject);

  router.put('/admin/update/:id', isAuthenticated, isAdmin, uploadFields, handleUploadError, ProjectController.updateProject);

  router.delete('/admin/delete/:id', isAuthenticated, isAdmin, ProjectController.deleteProject);

  router.delete('/admin/hard-delete/:id', isAuthenticated, isAdmin, ProjectController.hardDeleteProject);

  router.patch('/admin/status/:id', isAuthenticated, isAdmin, ProjectController.updateProjectStatus);

  router.patch('/admin/verify/:id', isAuthenticated, isAdmin, ProjectController.verifyProject);

  router.patch('/admin/featured/:id', isAuthenticated, isAdmin, ProjectController.toggleFeaturedProject);

  router.patch('/admin/restore/:id', isAuthenticated, isAdmin, ProjectController.restoreProject);

  router.patch('/admin/bulk-status', isAuthenticated, isAdmin, ProjectController.bulkUpdateStatus);

  router.post('/admin/gallery/:projectId', isAuthenticated, isAdmin, galleryUpload.array('images', 20), handleUploadError, ProjectController.addGalleryImages);

  router.delete('/admin/gallery/:imageId', isAuthenticated, isAdmin, ProjectController.deleteGalleryImage);

  router.post('/admin/floor-plan/:projectId', isAuthenticated, isAdmin, floorPlanUpload.single('image'), handleUploadError, ProjectController.addFloorPlan);

  router.delete('/admin/floor-plan/:floorPlanId', isAuthenticated, isAdmin, ProjectController.deleteFloorPlan);

  router.post('/admin/project-data', isAuthenticated, isAdmin, ProjectController.createProjectData);

  router.put('/admin/project-data/:id', isAuthenticated, isAdmin, ProjectController.updateProjectData);

  router.delete('/admin/project-data/:id', isAuthenticated, isAdmin, ProjectController.deleteProjectData);

  export default router;