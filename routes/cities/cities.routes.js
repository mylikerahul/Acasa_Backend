import express from 'express';
import * as CitiesController from '../../controllers/cities/cities.controller.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';
import { createUploader, handleUploadError } from '../../middleware/uploads.js';

const router = express.Router();

const cityUpload = createUploader('cities', { maxSize: 5 * 1024 * 1024 });

router.get('/', CitiesController.getActiveCities);

router.get('/countries', CitiesController.getCountries);

router.get('/states', CitiesController.getStates);

router.get('/check-slug', CitiesController.checkSlugAvailability);

router.get('/data/:countryId', CitiesController.getCityData);

router.get('/slug/:slug', CitiesController.getCityBySlug);

router.get('/detail/:id', CitiesController.getCityById);

router.get('/admin/list', isAuthenticated, isAdmin, CitiesController.getAllCitiesAdmin);

router.get('/admin/stats', isAuthenticated, isAdmin, CitiesController.getCityStats);

router.post('/admin/create', isAuthenticated, isAdmin, cityUpload.single('img'), handleUploadError, CitiesController.createCity);

router.put('/admin/update/:id', isAuthenticated, isAdmin, cityUpload.single('img'), handleUploadError, CitiesController.updateCity);

router.delete('/admin/delete/:id', isAuthenticated, isAdmin, CitiesController.deleteCity);

router.delete('/admin/hard-delete/:id', isAuthenticated, isAdmin, CitiesController.hardDeleteCity);

router.patch('/admin/status/:id', isAuthenticated, isAdmin, CitiesController.updateCityStatus);

router.patch('/admin/restore/:id', isAuthenticated, isAdmin, CitiesController.restoreCity);

router.post('/admin/data', isAuthenticated, isAdmin, CitiesController.createCityData);

router.put('/admin/data/:id', isAuthenticated, isAdmin, CitiesController.updateCityData);

router.delete('/admin/data/:id', isAuthenticated, isAdmin, CitiesController.deleteCityData);

export default router;