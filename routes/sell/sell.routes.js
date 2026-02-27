import express from 'express';
import * as sellController from '../../controllers/sell/sell.controller.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';
import { createUploader, handleUploadError } from '../../middleware/uploads.js';

const router = express.Router();

// Upload configurations
const documentUpload = createUploader('sell/documents', { maxSize: 5 * 1024 * 1024 });

// ============================================
// PUBLIC ROUTES
// ============================================

// Create new sell listing (public form submission)
router.post('/submit', 
  documentUpload.single('add_document'),
  handleUploadError,
  sellController.createSellListing
);

// Search listings
router.get('/search', sellController.searchSellListings);

// ============================================
// ADMIN ROUTES
// ============================================

// Get all listings (admin)
router.get('/', isAuthenticated, isAdmin, sellController.getAllSellListings);

// Get stats
router.get('/stats', isAuthenticated, isAdmin, sellController.getSellStats);

// Get recent listings
router.get('/recent', isAuthenticated, isAdmin, sellController.getRecentSellListings);

// Count by city
router.get('/count/city', isAuthenticated, isAdmin, sellController.countSellListingsByCity);

// Count by status
router.get('/count/status', isAuthenticated, isAdmin, sellController.countSellListingsByStatus);

// Get by date range
router.get('/date-range', isAuthenticated, isAdmin, sellController.getSellListingsByDateRange);

// Bulk operations
router.post('/bulk/status', isAuthenticated, isAdmin, sellController.bulkUpdateSellStatus);
router.post('/bulk/delete', isAuthenticated, isAdmin, sellController.bulkDeleteSellListings);

// Get single listing
router.get('/:id', isAuthenticated, isAdmin, sellController.getSellListingById);

// Update listing
router.put('/:id', 
  isAuthenticated, 
  isAdmin,
  documentUpload.single('add_document'),
  handleUploadError,
  sellController.updateSellListing
);

// Update status
router.patch('/:id/status', isAuthenticated, isAdmin, sellController.updateSellStatus);

// Delete listing (soft)
router.delete('/:id', isAuthenticated, isAdmin, sellController.deleteSellListing);

// Hard delete
router.delete('/:id/hard', isAuthenticated, isAdmin, sellController.hardDeleteSellListing);

// Get by city
router.get('/city/:city', isAuthenticated, isAdmin, sellController.getSellListingsByCity);

// Get by status
router.get('/status/:status', isAuthenticated, isAdmin, sellController.getSellListingsByStatus);

export default router;