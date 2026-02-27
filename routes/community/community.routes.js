import express from 'express';
import * as CommunityController from '../../controllers/community/community.contollers.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';
import { createUploader, handleUploadError } from '../../middleware/uploads.js';

const router = express.Router();

const communityUpload = createUploader('communities', { maxSize: 5 * 1024 * 1024 });
const subCommunityUpload = createUploader('communities/sub', { maxSize: 5 * 1024 * 1024 });

const communityUploadFields = communityUpload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'school_img', maxCount: 1 },
  { name: 'hotel_img', maxCount: 1 },
  { name: 'hospital_img', maxCount: 1 },
  { name: 'train_img', maxCount: 1 },
  { name: 'bus_img', maxCount: 1 }
]);

router.get('/', CommunityController.getActiveCommunities);

router.get('/search', CommunityController.searchCommunities);

router.get('/featured', CommunityController.getFeaturedCommunities);

router.get('/check-slug', CommunityController.checkCommunitySlugAvailability);

router.get('/dropdowns', CommunityController.getLocationDropdowns);

router.get('/city/:cityId', CommunityController.getCommunitiesByCity);

router.get('/hierarchy/:communityId', CommunityController.getCommunityWithHierarchy);

router.get('/slug/:slug', CommunityController.getCommunityBySlug);

router.get('/detail/:id', CommunityController.getCommunityById);

router.get('/data/city/:cityId', CommunityController.getCommunityDataByCity);

router.get('/sub', CommunityController.getActiveSubCommunities);

router.get('/sub/search', CommunityController.searchSubCommunities);

router.get('/sub/check-slug', CommunityController.checkSubCommunitySlugAvailability);

router.get('/sub/community/:communityId', CommunityController.getSubCommunitiesByCommunity);

router.get('/sub/city/:cityId', CommunityController.getSubCommunitiesByCity);

router.get('/sub/slug/:slug', CommunityController.getSubCommunityBySlug);

router.get('/sub/detail/:id', CommunityController.getSubCommunityById);

router.get('/sub/data/:communityId', CommunityController.getSubCommunityDataByCommunity);

router.get('/admin/list', isAuthenticated, isAdmin, CommunityController.getAllCommunitiesAdmin);

router.get('/admin/stats', isAuthenticated, isAdmin, CommunityController.getCommunityStats);

router.get('/admin/:id', isAuthenticated, isAdmin, CommunityController.getCommunityByIdAdmin);

router.post('/admin/create', isAuthenticated, isAdmin, communityUploadFields, handleUploadError, CommunityController.createCommunity);

router.put('/admin/update/:id', isAuthenticated, isAdmin, communityUploadFields, handleUploadError, CommunityController.updateCommunity);

router.delete('/admin/delete/:id', isAuthenticated, isAdmin, CommunityController.deleteCommunity);

router.delete('/admin/hard-delete/:id', isAuthenticated, isAdmin, CommunityController.hardDeleteCommunity);

router.patch('/admin/status/:id', isAuthenticated, isAdmin, CommunityController.updateCommunityStatus);

router.patch('/admin/featured/:id', isAuthenticated, isAdmin, CommunityController.toggleFeaturedCommunity);

router.patch('/admin/restore/:id', isAuthenticated, isAdmin, CommunityController.restoreCommunity);

router.patch('/admin/bulk-status', isAuthenticated, isAdmin, CommunityController.bulkUpdateCommunityStatus);

router.post('/admin/data', isAuthenticated, isAdmin, CommunityController.createCommunityData);

router.put('/admin/data/:id', isAuthenticated, isAdmin, CommunityController.updateCommunityData);

router.delete('/admin/data/:id', isAuthenticated, isAdmin, CommunityController.deleteCommunityData);

router.get('/admin/sub/list', isAuthenticated, isAdmin, CommunityController.getAllSubCommunitiesAdmin);

router.get('/admin/sub/:id', isAuthenticated, isAdmin, CommunityController.getSubCommunityByIdAdmin);

router.post('/admin/sub/create', isAuthenticated, isAdmin, subCommunityUpload.single('img'), handleUploadError, CommunityController.createSubCommunity);

router.put('/admin/sub/update/:id', isAuthenticated, isAdmin, subCommunityUpload.single('img'), handleUploadError, CommunityController.updateSubCommunity);

router.delete('/admin/sub/delete/:id', isAuthenticated, isAdmin, CommunityController.deleteSubCommunity);

router.delete('/admin/sub/hard-delete/:id', isAuthenticated, isAdmin, CommunityController.hardDeleteSubCommunity);

router.patch('/admin/sub/status/:id', isAuthenticated, isAdmin, CommunityController.updateSubCommunityStatus);

router.patch('/admin/sub/restore/:id', isAuthenticated, isAdmin, CommunityController.restoreSubCommunity);

router.post('/admin/sub/data', isAuthenticated, isAdmin, CommunityController.createSubCommunityData);

router.put('/admin/sub/data/:id', isAuthenticated, isAdmin, CommunityController.updateSubCommunityData);

router.delete('/admin/sub/data/:id', isAuthenticated, isAdmin, CommunityController.deleteSubCommunityData);

export default router;