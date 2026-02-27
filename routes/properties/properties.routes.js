import express from 'express';
import * as PropertyController from '../../controllers/properties/properties.controller.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';
import { createUploader, handleUploadError } from '../../middleware/uploads.js';

const router = express.Router();

const propertyUpload = createUploader('properties', { maxSize: 5 * 1024 * 1024 });
const galleryUpload = createUploader('properties/gallery', { maxSize: 5 * 1024 * 1024 });
const floorPlanUpload = createUploader('properties/floorplans', { maxSize: 5 * 1024 * 1024 });

const uploadFields = propertyUpload.fields([
  { name: 'featured_image', maxCount: 1 },
  { name: 'gallery', maxCount: 20 }
]);

router.get('/', PropertyController.getActiveProperties);

router.get('/search', PropertyController.searchProperties);

router.get('/featured', PropertyController.getFeaturedProperties);

router.get('/top-viewed', PropertyController.getTopViewedProperties);

router.get('/for-rent', PropertyController.getPropertiesForRent);

router.get('/for-sale', PropertyController.getPropertiesForSale);

router.get('/check-slug', PropertyController.checkSlugAvailability);

router.get('/types', PropertyController.getPropertyTypes);

router.get('/sub-types', PropertyController.getPropertySubTypes);

router.get('/list-types', PropertyController.getPropertyListTypes);

router.get('/amenities/private', PropertyController.getPrivateAmenities);

router.get('/amenities/commercial', PropertyController.getCommercialAmenities);

router.get('/city/:cityId', PropertyController.getPropertiesByCity);

router.get('/developer/:developerId', PropertyController.getPropertiesByDeveloper);

router.get('/community/:communityId', PropertyController.getPropertiesByCommunity);

router.get('/agent/:agentId', PropertyController.getPropertiesByAgent);

router.get('/project/:projectId', PropertyController.getPropertiesByProject);

router.get('/similar/:propertyId', PropertyController.getSimilarProperties);

router.get('/slug/:slug', PropertyController.getPropertyBySlug);

router.get('/detail/:id', PropertyController.getPropertyById);

router.get('/gallery/:propertyId', PropertyController.getGalleryByPropertyId);

router.get('/floor-plans/:propertyId', PropertyController.getFloorPlansByPropertyId);

router.get('/saved', isAuthenticated, PropertyController.getSavedProperties);

router.post('/save/:propertyId', isAuthenticated, PropertyController.saveProperty);

router.delete('/unsave/:propertyId', isAuthenticated, PropertyController.unsaveProperty);

router.get('/check-saved/:propertyId', isAuthenticated, PropertyController.checkPropertySaved);

router.get('/admin/list', isAuthenticated, isAdmin, PropertyController.getAllPropertiesAdmin);

router.get('/admin/stats', isAuthenticated, isAdmin, PropertyController.getPropertyStats);

router.get('/admin/:id', isAuthenticated, isAdmin, PropertyController.getPropertyByIdAdmin);

router.post('/admin/create', isAuthenticated, isAdmin, uploadFields, handleUploadError, PropertyController.createProperty);

router.put('/admin/update/:id', isAuthenticated, isAdmin, uploadFields, handleUploadError, PropertyController.updateProperty);

router.delete('/admin/delete/:id', isAuthenticated, isAdmin, PropertyController.deleteProperty);

router.delete('/admin/hard-delete/:id', isAuthenticated, isAdmin, PropertyController.hardDeleteProperty);

router.patch('/admin/status/:id', isAuthenticated, isAdmin, PropertyController.updatePropertyStatus);

router.patch('/admin/featured/:id', isAuthenticated, isAdmin, PropertyController.toggleFeaturedProperty);

router.patch('/admin/restore/:id', isAuthenticated, isAdmin, PropertyController.restoreProperty);

router.patch('/admin/bulk-status', isAuthenticated, isAdmin, PropertyController.bulkUpdateStatus);

router.post('/admin/gallery/:propertyId', isAuthenticated, isAdmin, galleryUpload.array('images', 20), handleUploadError, PropertyController.addGalleryImages);

router.delete('/admin/gallery/:imageId', isAuthenticated, isAdmin, PropertyController.deleteGalleryImage);

router.post('/admin/floor-plan/:propertyId', isAuthenticated, isAdmin, floorPlanUpload.single('image'), handleUploadError, PropertyController.addFloorPlan);

router.delete('/admin/floor-plan/:floorPlanId', isAuthenticated, isAdmin, PropertyController.deleteFloorPlan);

router.post('/admin/types', isAuthenticated, isAdmin, PropertyController.createPropertyType);

router.delete('/admin/types/:id', isAuthenticated, isAdmin, PropertyController.deletePropertyType);

router.post('/admin/sub-types', isAuthenticated, isAdmin, PropertyController.createPropertySubType);

router.post('/admin/amenities', isAuthenticated, isAdmin, PropertyController.createAmenity);

router.delete('/admin/amenities/:id', isAuthenticated, isAdmin, PropertyController.deleteAmenity);

export default router;