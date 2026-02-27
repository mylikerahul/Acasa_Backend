import * as SellModel from '../../models/sell/sell.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';
import fs from 'fs/promises';
import path from 'path';

const PORT = process.env.PORT;
const API_URL = process.env.API_URL;

// ============================================
// UTILITY FUNCTIONS
// ============================================
const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath === 'null' || imagePath === 'undefined') return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;

  let cleanPath = imagePath.trim().replace(/^\/+/, '').replace(/^uploads\//, '').replace(/^sell\//, '');
  
  if (cleanPath.startsWith('gallery-') || cleanPath.startsWith('gallery/')) {
    cleanPath = cleanPath.replace(/^gallery\//, '');
    return `${API_URL}/uploads/sell/gallery/${cleanPath}`;
  }
  
  if (cleanPath.startsWith('documents-') || cleanPath.startsWith('documents/')) {
    cleanPath = cleanPath.replace(/^documents\//, '');
    return `${API_URL}/uploads/sell/documents/${cleanPath}`;
  }
  
  return `${API_URL}/uploads/sell/${cleanPath}`;
};

const processListingData = (listing) => {
  if (!listing) return null;
  
  return {
    ...listing,
    add_document: buildImageUrl(listing.add_document),
    full_name: `${listing.first_name || ''} ${listing.last_name || ''}`.trim(),
    status_text: listing.status === 1 ? 'Active' : listing.status === 2 ? 'Pending' : 'Inactive',
    created_formatted: listing.create_date ? new Date(listing.create_date).toLocaleString() : null,
  };
};

const deleteFile = async (filePath) => {
  if (!filePath) return;
  
  try {
    const fullPath = path.join(process.cwd(), 'public', 'uploads', 'sell', filePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Error deleting file:', error.message);
  }
};

// ============================================
// GET ALL SELL LISTINGS
// ============================================
export const getAllSellListings = catchAsyncErrors(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    status,
    city,
    bedrooms,
    search,
    sortBy,
    sortOrder
  } = req.query;

  const filters = {
    page: parseInt(page),
    limit: parseInt(limit),
    status: status !== undefined ? status : undefined,
    city,
    bedrooms,
    search,
    sortBy,
    sortOrder
  };

  const result = await SellModel.getAllSellListings(filters);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to fetch listings', 400));
  }

  // Process each listing
  const processedData = result.data.map(processListingData);

  res.status(200).json({
    success: true,
    data: processedData,
    pagination: result.pagination,
    message: 'Sell listings fetched successfully'
  });
});

// ============================================
// GET SINGLE SELL LISTING
// ============================================
export const getSellListingById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const result = await SellModel.getSellListingById(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Listing not found', 404));
  }

  const processedData = processListingData(result.data);

  res.status(200).json({
    success: true,
    data: processedData,
    message: 'Listing fetched successfully'
  });
});

// ============================================
// CREATE SELL LISTING (Public Form Submission)
// ============================================
export const createSellListing = catchAsyncErrors(async (req, res, next) => {
  const listingData = { ...req.body };

  // Handle file uploads
  if (req.files && req.files.add_document) {
    const documentFile = req.files.add_document[0];
    listingData.add_document = `documents/${documentFile.filename}`;
  }

  // Set default status
  if (!listingData.status) {
    listingData.status = 0; // Pending by default
  }

  // Set subscription
  listingData.stubscribe = listingData.stubscribe === 'true' || listingData.stubscribe === 1 ? 1 : 0;

  const result = await SellModel.createSellListing(listingData);

  if (!result.success) {
    // Delete uploaded file if creation failed
    if (listingData.add_document) {
      await deleteFile(listingData.add_document);
    }
    return next(new ErrorHandler(result.message || 'Failed to create listing', 400));
  }

  res.status(201).json({
    success: true,
    data: {
      id: result.listingId,
      ...listingData,
      add_document: buildImageUrl(listingData.add_document)
    },
    message: 'Your property listing has been submitted successfully. We will contact you soon!'
  });
});

// ============================================
// UPDATE SELL LISTING
// ============================================
export const updateSellListing = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // Get existing listing to handle file updates
  const existingResult = await SellModel.getSellListingById(id);
  if (!existingResult.success) {
    return next(new ErrorHandler('Listing not found', 404));
  }

  const existingListing = existingResult.data;

  // Handle file uploads
  if (req.files && req.files.add_document) {
    // Delete old document
    if (existingListing.add_document) {
      await deleteFile(existingListing.add_document);
    }
    
    const documentFile = req.files.add_document[0];
    updateData.add_document = `documents/${documentFile.filename}`;
  }

  // Handle subscription
  if (updateData.stubscribe !== undefined) {
    updateData.stubscribe = updateData.stubscribe === 'true' || updateData.stubscribe === 1 ? 1 : 0;
  }

  const result = await SellModel.updateSellListing(id, updateData);

  if (!result.success) {
    // Delete newly uploaded file if update failed
    if (req.files && req.files.add_document) {
      await deleteFile(updateData.add_document);
    }
    return next(new ErrorHandler(result.message || 'Failed to update listing', 400));
  }

  res.status(200).json({
    success: true,
    data: {
      id: parseInt(id),
      ...updateData,
      add_document: buildImageUrl(updateData.add_document || existingListing.add_document)
    },
    message: 'Listing updated successfully'
  });
});

// ============================================
// DELETE SELL LISTING (Soft Delete)
// ============================================
export const deleteSellListing = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const result = await SellModel.deleteSellListing(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete listing', 400));
  }

  res.status(200).json({
    success: true,
    message: 'Listing deleted successfully'
  });
});

// ============================================
// HARD DELETE SELL LISTING
// ============================================
export const hardDeleteSellListing = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  // Get listing to delete files
  const existingResult = await SellModel.getSellListingById(id);
  if (existingResult.success && existingResult.data) {
    const listing = existingResult.data;
    
    // Delete associated files
    if (listing.add_document) {
      await deleteFile(listing.add_document);
    }
  }

  const result = await SellModel.hardDeleteSellListing(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete listing', 400));
  }

  res.status(200).json({
    success: true,
    message: 'Listing permanently deleted'
  });
});

// ============================================
// UPDATE STATUS
// ============================================
export const updateSellStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status === undefined || status === null) {
    return next(new ErrorHandler('Status is required', 400));
  }

  const result = await SellModel.updateSellStatus(id, status);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update status', 400));
  }

  res.status(200).json({
    success: true,
    message: 'Status updated successfully'
  });
});

// ============================================
// BULK UPDATE STATUS
// ============================================
export const bulkUpdateSellStatus = catchAsyncErrors(async (req, res, next) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorHandler('IDs array is required', 400));
  }

  if (status === undefined || status === null) {
    return next(new ErrorHandler('Status is required', 400));
  }

  const result = await SellModel.bulkUpdateSellStatus(ids, status);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update listings', 400));
  }

  res.status(200).json({
    success: true,
    message: result.message,
    affectedRows: result.affectedRows
  });
});

// ============================================
// BULK DELETE
// ============================================
export const bulkDeleteSellListings = catchAsyncErrors(async (req, res, next) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorHandler('IDs array is required', 400));
  }

  const result = await SellModel.bulkDeleteSellListings(ids);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete listings', 400));
  }

  res.status(200).json({
    success: true,
    message: result.message,
    affectedRows: result.affectedRows
  });
});

// ============================================
// GET STATS
// ============================================
export const getSellStats = catchAsyncErrors(async (req, res, next) => {
  const result = await SellModel.getSellStats();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch stats', 400));
  }

  res.status(200).json({
    success: true,
    data: result.data,
    message: 'Stats fetched successfully'
  });
});

// ============================================
// GET RECENT LISTINGS
// ============================================
export const getRecentSellListings = catchAsyncErrors(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const result = await SellModel.getRecentSellListings(parseInt(limit));

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch recent listings', 400));
  }

  const processedData = result.data.map(processListingData);

  res.status(200).json({
    success: true,
    data: processedData,
    message: 'Recent listings fetched successfully'
  });
});

// ============================================
// SEARCH LISTINGS
// ============================================
export const searchSellListings = catchAsyncErrors(async (req, res, next) => {
  const { q, limit = 20 } = req.query;

  if (!q) {
    return next(new ErrorHandler('Search query is required', 400));
  }

  const result = await SellModel.searchSellListings(q, parseInt(limit));

  if (!result.success) {
    return next(new ErrorHandler('Failed to search listings', 400));
  }

  const processedData = result.data.map(processListingData);

  res.status(200).json({
    success: true,
    data: processedData,
    total: processedData.length,
    message: 'Search completed successfully'
  });
});

// ============================================
// GET LISTINGS BY CITY
// ============================================
export const getSellListingsByCity = catchAsyncErrors(async (req, res, next) => {
  const { city } = req.params;
  const { limit = 20 } = req.query;

  const result = await SellModel.getSellListingsByCity(city, parseInt(limit));

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch listings', 400));
  }

  const processedData = result.data.map(processListingData);

  res.status(200).json({
    success: true,
    data: processedData,
    total: processedData.length,
    message: `Listings for ${city} fetched successfully`
  });
});

// ============================================
// GET LISTINGS BY STATUS
// ============================================
export const getSellListingsByStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.params;
  const { limit = 20 } = req.query;

  const result = await SellModel.getSellListingsByStatus(parseInt(status), parseInt(limit));

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch listings', 400));
  }

  const processedData = result.data.map(processListingData);

  res.status(200).json({
    success: true,
    data: processedData,
    total: processedData.length,
    message: 'Listings fetched successfully'
  });
});

// ============================================
// GET LISTINGS BY DATE RANGE
// ============================================
export const getSellListingsByDateRange = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(new ErrorHandler('Start date and end date are required', 400));
  }

  const result = await SellModel.getSellListingsByDateRange(startDate, endDate);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch listings', 400));
  }

  const processedData = result.data.map(processListingData);

  res.status(200).json({
    success: true,
    data: processedData,
    total: processedData.length,
    message: 'Listings fetched successfully'
  });
});

// ============================================
// COUNT BY CITY
// ============================================
export const countSellListingsByCity = catchAsyncErrors(async (req, res, next) => {
  const result = await SellModel.countSellListingsByCity();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch counts', 400));
  }

  res.status(200).json({
    success: true,
    data: result.data,
    message: 'City counts fetched successfully'
  });
});

// ============================================
// COUNT BY STATUS
// ============================================
export const countSellListingsByStatus = catchAsyncErrors(async (req, res, next) => {
  const result = await SellModel.countSellListingsByStatus();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch counts', 400));
  }

  // Add status labels
  const dataWithLabels = result.data.map(item => ({
    ...item,
    status_label: item.status === 1 ? 'Active' : 
                  item.status === 2 ? 'Pending' : 'Inactive'
  }));

  res.status(200).json({
    success: true,
    data: dataWithLabels,
    message: 'Status counts fetched successfully'
  });
});

// ============================================
// EXPORT DEFAULT
// ============================================
export default {
  getAllSellListings,
  getSellListingById,
  createSellListing,
  updateSellListing,
  deleteSellListing,
  hardDeleteSellListing,
  updateSellStatus,
  bulkUpdateSellStatus,
  bulkDeleteSellListings,
  getSellStats,
  getRecentSellListings,
  searchSellListings,
  getSellListingsByCity,
  getSellListingsByStatus,
  getSellListingsByDateRange,
  countSellListingsByCity,
  countSellListingsByStatus
};