// backend/controllers/savedProperties/savedProperties.controller.js

import * as SavedPropertiesModel from '../../models/savedProperties/savedProperties.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

// ==================== TOGGLE SAVED (ADD/REMOVE) ====================

export const toggleSavedProperty = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { 
    item_id, 
    item_type = 'property',
    item_name,
    item_slug,
    item_image,
    item_price,
    item_location,
    item_bedrooms,
    item_area,
    type = 'wishlist',
    notes 
  } = req.body;

  if (!item_id) {
    return next(new ErrorHandler('Item ID is required', 400));
  }

  const result = await SavedPropertiesModel.toggleSaved({
    user_id,
    item_id,
    item_type,
    item_name,
    item_slug,
    item_image,
    item_price,
    item_location,
    item_bedrooms,
    item_area,
    type,
    notes
  });

  res.status(200).json({
    success: true,
    message: result.action === 'added' ? 'Added to saved' : 'Removed from saved',
    action: result.action,
    is_saved: result.is_saved
  });
});

// ==================== ADD TO SAVED ====================

export const addToSaved = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { 
    item_id, 
    item_type = 'property',
    item_name,
    item_slug,
    item_image,
    item_price,
    item_location,
    item_bedrooms,
    item_area,
    type = 'wishlist',
    notes 
  } = req.body;

  if (!item_id) {
    return next(new ErrorHandler('Item ID is required', 400));
  }

  await SavedPropertiesModel.addToSaved({
    user_id,
    item_id,
    item_type,
    item_name,
    item_slug,
    item_image,
    item_price,
    item_location,
    item_bedrooms,
    item_area,
    type,
    notes
  });

  res.status(201).json({
    success: true,
    message: 'Added to saved successfully'
  });
});

// ==================== REMOVE FROM SAVED ====================

export const removeFromSaved = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { item_id, item_type = 'property' } = req.body;

  if (!item_id) {
    return next(new ErrorHandler('Item ID is required', 400));
  }

  await SavedPropertiesModel.removeFromSaved(user_id, item_id, item_type);

  res.status(200).json({
    success: true,
    message: 'Removed from saved successfully'
  });
});

// ==================== GET ALL SAVED ====================

export const getSavedProperties = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { item_type, type = 'wishlist', page = 1, limit = 20 } = req.query;

  const result = await SavedPropertiesModel.getSavedByUser(user_id, {
    item_type,
    type,
    page: parseInt(page),
    limit: parseInt(limit)
  });

  res.status(200).json({
    success: true,
    ...result
  });
});

// ==================== GET SAVED WITH FULL DETAILS ====================

export const getSavedWithDetails = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { item_type } = req.query;

  const properties = await SavedPropertiesModel.getSavedWithDetails(user_id, item_type);

  res.status(200).json({
    success: true,
    count: properties.length,
    properties
  });
});

// ==================== GET SAVED COUNT ====================

export const getSavedCount = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { type = 'wishlist' } = req.query;

  const count = await SavedPropertiesModel.getSavedCount(user_id, type);

  res.status(200).json({
    success: true,
    count
  });
});

// ==================== CHECK IF SAVED ====================

export const checkIfSaved = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { item_id, item_type = 'property' } = req.query;

  if (!item_id) {
    return next(new ErrorHandler('Item ID is required', 400));
  }

  const saved = await SavedPropertiesModel.checkIfSaved(user_id, parseInt(item_id), item_type);

  res.status(200).json({
    success: true,
    is_saved: !!saved
  });
});

// ==================== GET SAVED IDS ====================

export const getSavedIds = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { item_type } = req.query;

  const ids = await SavedPropertiesModel.getSavedIds(user_id, item_type);

  res.status(200).json({
    success: true,
    ...ids
  });
});

// ==================== CLEAR ALL SAVED ====================

export const clearAllSaved = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { type = 'wishlist' } = req.body;

  await SavedPropertiesModel.clearAllSaved(user_id, type);

  res.status(200).json({
    success: true,
    message: 'All saved items cleared'
  });
});

// ==================== BULK ADD TO SAVED ====================

export const bulkAddToSaved = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new ErrorHandler('Items array is required', 400));
  }

  const result = await SavedPropertiesModel.bulkAddToSaved(user_id, items);

  res.status(201).json({
    success: true,
    message: `${result.added} items added to saved`,
    ...result
  });
});

// ==================== UPDATE SAVED ITEM ====================

export const updateSavedItem = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { id } = req.params;
  const { notes, type } = req.body;

  const existing = await SavedPropertiesModel.getSavedById(id, user_id);
  
  if (!existing) {
    return next(new ErrorHandler('Saved item not found', 404));
  }

  await SavedPropertiesModel.updateSavedItem(id, user_id, { notes, type });

  res.status(200).json({
    success: true,
    message: 'Saved item updated successfully'
  });
});

// ==================== DELETE SAVED ITEM BY ID ====================

export const deleteSavedItem = catchAsyncErrors(async (req, res, next) => {
  const user_id = req.user.id;
  const { id } = req.params;

  const existing = await SavedPropertiesModel.getSavedById(id, user_id);
  
  if (!existing) {
    return next(new ErrorHandler('Saved item not found', 404));
  }

  await SavedPropertiesModel.removeFromSaved(user_id, existing.item_id, existing.item_type);

  res.status(200).json({
    success: true,
    message: 'Saved item deleted successfully'
  });
});