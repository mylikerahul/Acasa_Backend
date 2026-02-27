import * as TasksModel from '../../models/task/task.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

const ITEMS_PER_PAGE = 20;

const generateSlug = (title) => {
  if (!title) return null;
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const getAll = catchAsyncErrors(async (req, res, next) => {
  const filters = {
    search: req.query.search,
    assign: req.query.assign,
    date: req.query.date,
    slug: req.query.slug,
    orderBy: req.query.orderBy,
    order: req.query.order
  };

  const pagination = {
    page: req.query.page || 1,
    limit: req.query.limit || ITEMS_PER_PAGE
  };

  const result = await TasksModel.findAll(filters, pagination);

  res.status(200).json({
    success: true,
    ...result
  });
});

export const getById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const task = await TasksModel.findById(id);

  if (!task) {
    return next(new ErrorHandler('Task not found', 404));
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

export const getBySlug = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.params;

  const task = await TasksModel.findBySlug(slug);

  if (!task) {
    return next(new ErrorHandler('Task not found', 404));
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

export const getByAssign = catchAsyncErrors(async (req, res, next) => {
  const { assign } = req.params;

  const tasks = await TasksModel.findByAssign(assign);

  res.status(200).json({
    success: true,
    data: tasks
  });
});

export const getByDate = catchAsyncErrors(async (req, res, next) => {
  const { date } = req.params;

  const tasks = await TasksModel.findByDate(date);

  res.status(200).json({
    success: true,
    data: tasks
  });
});

export const getByDateRange = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(new ErrorHandler('Start date and end date are required', 400));
  }

  const tasks = await TasksModel.findByDateRange(startDate, endDate);

  res.status(200).json({
    success: true,
    data: tasks
  });
});

export const create = catchAsyncErrors(async (req, res, next) => {
  const data = { ...req.body };

  if (!data.title) {
    return next(new ErrorHandler('Title is required', 400));
  }

  if (!data.slug && data.title) {
    data.slug = generateSlug(data.title);
  }

  if (data.slug) {
    const existingSlug = await TasksModel.checkSlugExists(data.slug);
    if (existingSlug) {
      return next(new ErrorHandler('Slug already exists', 409));
    }
  }

  const task = await TasksModel.create(data);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task
  });
});

export const update = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const data = { ...req.body };

  const existing = await TasksModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Task not found', 404));
  }

  if (data.slug && data.slug !== existing.slug) {
    const existingSlug = await TasksModel.checkSlugExists(data.slug, id);
    if (existingSlug) {
      return next(new ErrorHandler('Slug already exists', 409));
    }
  }

  if (data.title && !data.slug && data.title !== existing.title) {
    data.slug = generateSlug(data.title);
    const existingSlug = await TasksModel.checkSlugExists(data.slug, id);
    if (existingSlug) {
      data.slug = `${data.slug}-${Date.now()}`;
    }
  }

  const task = await TasksModel.update(id, data);

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
});

export const remove = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const existing = await TasksModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Task not found', 404));
  }

  await TasksModel.remove(id);

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully'
  });
});

export const bulkDelete = catchAsyncErrors(async (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || !ids.length) {
    return next(new ErrorHandler('Invalid IDs array', 400));
  }

  await TasksModel.bulkDelete(ids);

  res.status(200).json({
    success: true,
    message: 'Tasks deleted successfully'
  });
});

export const updateAssign = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { assign } = req.body;

  const existing = await TasksModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Task not found', 404));
  }

  const task = await TasksModel.updateAssign(id, assign);

  res.status(200).json({
    success: true,
    message: 'Task assigned successfully',
    data: task
  });
});

export const updateCommission = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { commission } = req.body;

  const existing = await TasksModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Task not found', 404));
  }

  const task = await TasksModel.updateCommission(id, commission);

  res.status(200).json({
    success: true,
    message: 'Commission updated successfully',
    data: task
  });
});

export const bulkUpdateAssign = catchAsyncErrors(async (req, res, next) => {
  const { ids, assign } = req.body;

  if (!Array.isArray(ids) || !ids.length) {
    return next(new ErrorHandler('Invalid IDs array', 400));
  }

  await TasksModel.bulkUpdateAssign(ids, assign);

  res.status(200).json({
    success: true,
    message: 'Tasks assigned successfully'
  });
});

export const getStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await TasksModel.getStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

export const getTasksByAssignee = catchAsyncErrors(async (req, res, next) => {
  const tasks = await TasksModel.getTasksByAssignee();

  res.status(200).json({
    success: true,
    data: tasks
  });
});