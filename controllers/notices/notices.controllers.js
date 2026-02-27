import * as NoticesModel from '../../models/notices/notices.models.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

export const getNotices = catchAsyncErrors(async (req, res, next) => {
  const result = await NoticesModel.getNotices({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    assign: req.query.assign,
    date: req.query.date,
    search: req.query.search || req.query.q
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch notices', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

export const getNoticeById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Notice ID is required', 400));
  }

  const result = await NoticesModel.getNoticeById(id);

  if (!result.success) {
    return next(new ErrorHandler('Notice not found', 404));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const createNotice = catchAsyncErrors(async (req, res, next) => {
  const {
    Headings,
    Description,
    assign,
    date,
    title,
    heading,
    slug,
    descriptions,
    seo_title,
    seo_keywork,
    seo_description
  } = req.body;

  if (!Headings) {
    return next(new ErrorHandler('Heading is required', 400));
  }

  const noticeData = {
    Headings,
    Description,
    assign: assign || (req.user ? req.user.name : 'Admin'),
    date: date || new Date().toISOString().split('T')[0],
    title,
    heading,
    slug,
    descriptions,
    seo_title,
    seo_keywork,
    seo_description
  };

  // Clean undefined values
  Object.keys(noticeData).forEach(key => {
    if (noticeData[key] === undefined || noticeData[key] === '') {
      delete noticeData[key];
    }
  });

  const result = await NoticesModel.createNotice(noticeData);

  if (!result.success) {
    return next(new ErrorHandler('Failed to create notice', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Notice created successfully',
    noticeId: result.noticeId
  });
});

export const updateNotice = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Notice ID is required', 400));
  }

  const updateData = {};
  const allowedFields = [
    'Headings', 'Description', 'assign', 'date', 'title', 
    'heading', 'slug', 'descriptions', 'seo_title', 
    'seo_keywork', 'seo_description'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    return next(new ErrorHandler('No update data provided', 400));
  }

  const result = await NoticesModel.updateNotice(id, updateData);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update notice', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Notice updated successfully'
  });
});

export const deleteNotice = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Notice ID is required', 400));
  }

  const result = await NoticesModel.deleteNotice(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete notice', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Notice deleted successfully'
  });
});

export const getMyNotices = catchAsyncErrors(async (req, res, next) => {
  const userName = req.user.name;

  const result = await NoticesModel.getNoticesByUser(userName);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch notices', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export default {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  getMyNotices
};