import * as DealsModel from '../../models/deals/deals.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

export const getActiveDeals = catchAsyncErrors(async (req, res, next) => {
  const result = await DealsModel.getActiveDeals({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    status: req.query.status,
    closing_status: req.query.closing_status,
    search: req.query.search || req.query.q,
    sortBy: req.query.sortBy || 'updated_at',
    sortOrder: req.query.sortOrder || 'DESC'
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch deals', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

export const getDealById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Deal ID is required', 400));
  }

  const result = await DealsModel.getDealById(id);

  if (!result.success) {
    return next(new ErrorHandler('Deal not found', 404));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const getDealsByClosingId = catchAsyncErrors(async (req, res, next) => {
  const { closingId } = req.params;

  if (!closingId) {
    return next(new ErrorHandler('Closing ID is required', 400));
  }

  const result = await DealsModel.getDealsByClosingId(closingId);

  if (!result.success) {
    return next(new ErrorHandler('Deal not found', 404));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const createDeal = catchAsyncErrors(async (req, res, next) => {
  const result = await DealsModel.createDeal(req.body);

  if (!result.success) {
    return next(new ErrorHandler('Failed to create deal', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Deal created successfully',
    dealId: result.dealId
  });
});

export const updateDeal = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Deal ID is required', 400));
  }

  const result = await DealsModel.updateDeal(id, req.body);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update deal', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Deal updated successfully'
  });
});

export const deleteDeal = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Deal ID is required', 400));
  }

  const result = await DealsModel.deleteDeal(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete deal', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Deal deleted successfully'
  });
});

export const getDealStats = catchAsyncErrors(async (req, res, next) => {
  const result = await DealsModel.getDealStats();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch stats', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export default {
  getActiveDeals,
  getDealById,
  getDealsByClosingId,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealStats
};