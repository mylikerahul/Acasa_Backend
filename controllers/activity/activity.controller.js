import * as RecentActivityModel from '../../models/activity/activity.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

const ITEMS_PER_PAGE = 20;

const getClientInfo = (req) => {
  return {
    ip_address: req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0],
    user_agent: req.headers['user-agent'] || null
  };
};

export const getAll = catchAsyncErrors(async (req, res, next) => {
  const filters = {
    search: req.query.search,
    activity_type: req.query.activity_type,
    user_id: req.query.user_id,
    user_name: req.query.user_name,
    module: req.query.module,
    module_id: req.query.module_id,
    action: req.query.action,
    status: req.query.status,
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    orderBy: req.query.orderBy,
    order: req.query.order
  };

  const pagination = {
    page: req.query.page || 1,
    limit: req.query.limit || ITEMS_PER_PAGE
  };

  const result = await RecentActivityModel.findAll(filters, pagination);

  res.status(200).json({
    success: true,
    ...result
  });
});

export const getById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const activity = await RecentActivityModel.findById(id);

  if (!activity) {
    return next(new ErrorHandler('Activity not found', 404));
  }

  res.status(200).json({
    success: true,
    data: activity
  });
});

export const getByUserId = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  const activities = await RecentActivityModel.findByUserId(userId);

  res.status(200).json({
    success: true,
    data: activities
  });
});

export const getByUserName = catchAsyncErrors(async (req, res, next) => {
  const { userName } = req.params;

  const activities = await RecentActivityModel.findByUserName(userName);

  res.status(200).json({
    success: true,
    data: activities
  });
});

export const getByModule = catchAsyncErrors(async (req, res, next) => {
  const { module } = req.params;

  const activities = await RecentActivityModel.findByModule(module);

  res.status(200).json({
    success: true,
    data: activities
  });
});

export const getByModuleAndId = catchAsyncErrors(async (req, res, next) => {
  const { module, moduleId } = req.params;

  const activities = await RecentActivityModel.findByModuleAndId(module, moduleId);

  res.status(200).json({
    success: true,
    data: activities
  });
});

export const getByAction = catchAsyncErrors(async (req, res, next) => {
  const { action } = req.params;

  const activities = await RecentActivityModel.findByAction(action);

  res.status(200).json({
    success: true,
    data: activities
  });
});

export const getByType = catchAsyncErrors(async (req, res, next) => {
  const { type } = req.params;

  const activities = await RecentActivityModel.findByType(type);

  res.status(200).json({
    success: true,
    data: activities
  });
});

export const getByDateRange = catchAsyncErrors(async (req, res, next) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return next(new ErrorHandler('Start date and end date are required', 400));
  }

  const activities = await RecentActivityModel.findByDateRange(start_date, end_date);

  res.status(200).json({
    success: true,
    data: activities
  });
});

export const getRecent = catchAsyncErrors(async (req, res, next) => {
  const limit = req.query.limit || 10;

  const activities = await RecentActivityModel.findRecent(limit);

  res.status(200).json({
    success: true,
    data: activities
  });
});

export const create = catchAsyncErrors(async (req, res, next) => {
  const data = { ...req.body };

  if (!data.activity_type && !data.activity_title && !data.action) {
    return next(new ErrorHandler('Activity type, title or action is required', 400));
  }

  const clientInfo = getClientInfo(req);
  data.ip_address = data.ip_address || clientInfo.ip_address;
  data.user_agent = data.user_agent || clientInfo.user_agent;

  const activity = await RecentActivityModel.create(data);

  res.status(201).json({
    success: true,
    message: 'Activity created successfully',
    data: activity
  });
});

export const update = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const data = { ...req.body };

  const existing = await RecentActivityModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Activity not found', 404));
  }

  const activity = await RecentActivityModel.update(id, data);

  res.status(200).json({
    success: true,
    message: 'Activity updated successfully',
    data: activity
  });
});

export const remove = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const existing = await RecentActivityModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Activity not found', 404));
  }

  await RecentActivityModel.remove(id);

  res.status(200).json({
    success: true,
    message: 'Activity deleted successfully'
  });
});

export const bulkDelete = catchAsyncErrors(async (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || !ids.length) {
    return next(new ErrorHandler('Invalid IDs array', 400));
  }

  await RecentActivityModel.bulkDelete(ids);

  res.status(200).json({
    success: true,
    message: 'Activities deleted successfully'
  });
});

export const deleteByUserId = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  await RecentActivityModel.deleteByUserId(userId);

  res.status(200).json({
    success: true,
    message: 'User activities deleted successfully'
  });
});

export const deleteByModule = catchAsyncErrors(async (req, res, next) => {
  const { module } = req.params;
  const { module_id } = req.query;

  await RecentActivityModel.deleteByModule(module, module_id);

  res.status(200).json({
    success: true,
    message: 'Module activities deleted successfully'
  });
});

export const deleteOldActivities = catchAsyncErrors(async (req, res, next) => {
  const days = req.query.days || 30;

  const deletedCount = await RecentActivityModel.deleteOldActivities(parseInt(days));

  res.status(200).json({
    success: true,
    message: `${deletedCount} old activities deleted successfully`
  });
});

export const clearAll = catchAsyncErrors(async (req, res, next) => {
  await RecentActivityModel.clearAll();

  res.status(200).json({
    success: true,
    message: 'All activities cleared successfully'
  });
});

export const getStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await RecentActivityModel.getStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

export const getCountByModule = catchAsyncErrors(async (req, res, next) => {
  const data = await RecentActivityModel.getCountByModule();

  res.status(200).json({
    success: true,
    data
  });
});

export const getCountByAction = catchAsyncErrors(async (req, res, next) => {
  const data = await RecentActivityModel.getCountByAction();

  res.status(200).json({
    success: true,
    data
  });
});

export const getCountByType = catchAsyncErrors(async (req, res, next) => {
  const data = await RecentActivityModel.getCountByType();

  res.status(200).json({
    success: true,
    data
  });
});

export const getCountByUser = catchAsyncErrors(async (req, res, next) => {
  const data = await RecentActivityModel.getCountByUser();

  res.status(200).json({
    success: true,
    data
  });
});

export const getCountByDate = catchAsyncErrors(async (req, res, next) => {
  const days = req.query.days || 30;

  const data = await RecentActivityModel.getCountByDate(parseInt(days));

  res.status(200).json({
    success: true,
    data
  });
});

export const getCountByStatus = catchAsyncErrors(async (req, res, next) => {
  const data = await RecentActivityModel.getCountByStatus();

  res.status(200).json({
    success: true,
    data
  });
});

export const logActivity = catchAsyncErrors(async (req, res, next) => {
  const { activity_type, activity_title, activity_description, module, module_id, action, metadata } = req.body;

  const clientInfo = getClientInfo(req);

  const data = {
    activity_type,
    activity_title,
    activity_description,
    user_id: req.user?.id || null,
    user_name: req.user?.name || req.user?.email || null,
    module,
    module_id,
    action,
    ip_address: clientInfo.ip_address,
    user_agent: clientInfo.user_agent,
    metadata,
    status: 'completed'
  };

  const activity = await RecentActivityModel.create(data);

  res.status(201).json({
    success: true,
    message: 'Activity logged successfully',
    data: activity
  });
});