import * as JobsModel from '../../models/jobs/jobs.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

const PORT = process.env.PORT || 8080;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

const buildResumeUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}/uploads/jobs/resumes/${path}`;
};

const generateSlug = (title) => {
  if (!title) return 'job-' + Date.now();
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

export const getActiveJobs = catchAsyncErrors(async (req, res, next) => {
  const result = await JobsModel.getActiveJobs({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    type: req.query.type,
    city_name: req.query.city_name,
    search: req.query.search || req.query.q,
    sortBy: req.query.sortBy || 'created_at',
    sortOrder: req.query.sortOrder || 'DESC'
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch jobs', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

export const getJobBySlug = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.params;

  if (!slug) {
    return next(new ErrorHandler('Slug is required', 400));
  }

  const result = await JobsModel.getJobBySlug(slug);

  if (!result.success) {
    return next(new ErrorHandler('Job not found', 404));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const getJobById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Job ID is required', 400));
  }

  const result = await JobsModel.getJobById(id);

  if (!result.success) {
    return next(new ErrorHandler('Job not found', 404));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const createJob = catchAsyncErrors(async (req, res, next) => {
  const {
    full_name,
    title,
    description,
    sub_title,
    sub_description,
    about_team,
    about_company,
    job_title,
    city_name,
    responsibilities,
    type,
    link,
    facilities,
    social,
    seo_title,
    seo_description,
    seo_keyword,
    status
  } = req.body;

  if (!title) {
    return next(new ErrorHandler('Job title is required', 400));
  }

  const jobData = {
    full_name,
    title,
    description,
    sub_title,
    sub_description,
    about_team,
    about_company,
    job_title,
    city_name,
    responsibilities,
    type,
    link,
    facilities,
    social,
    seo_title,
    seo_description,
    seo_keyword,
    status: status !== undefined ? parseInt(status) : 1,
    slug: generateSlug(title)
  };

  const result = await JobsModel.createJob(jobData);

  if (!result.success) {
    return next(new ErrorHandler('Failed to create job', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Job created successfully',
    jobId: result.jobId,
    slug: result.slug
  });
});

export const updateJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Job ID is required', 400));
  }

  const result = await JobsModel.updateJob(id, req.body);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update job', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Job updated successfully'
  });
});

export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Job ID is required', 400));
  }

  const result = await JobsModel.deleteJob(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete job', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Job deleted successfully'
  });
});

export const hardDeleteJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Job ID is required', 400));
  }

  const result = await JobsModel.hardDeleteJob(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete job', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Job permanently deleted'
  });
});

export const applyForJob = catchAsyncErrors(async (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    message,
    current_last_employer,
    current_job_title,
    employment_status,
    term
  } = req.body;

  if (!first_name || !last_name || !email) {
    return next(new ErrorHandler('Name and email are required', 400));
  }

  let resume = null;
  if (req.file) {
    resume = req.file.filename;
  }

  const applicationData = {
    first_name,
    last_name,
    email,
    phone,
    message,
    resume,
    current_last_employer,
    current_job_title,
    employment_status,
    term: term ? parseInt(term) : 0,
    status: 1
  };

  const result = await JobsModel.applyForJob(applicationData);

  if (!result.success) {
    return next(new ErrorHandler('Failed to submit application', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    applicationId: result.applicationId
  });
});

export const getJobApplications = catchAsyncErrors(async (req, res, next) => {
  const result = await JobsModel.getJobApplications({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    status: req.query.status,
    search: req.query.search || req.query.q
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch applications', 500));
  }

  const processedData = result.data.map(app => ({
    ...app,
    resumeUrl: buildResumeUrl(app.resume)
  }));

  res.status(200).json({
    success: true,
    data: processedData,
    pagination: result.pagination
  });
});

export const updateApplicationStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return next(new ErrorHandler('Application ID is required', 400));
  }

  if (status === undefined) {
    return next(new ErrorHandler('Status is required', 400));
  }

  const result = await JobsModel.updateApplicationStatus(id, status);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update status', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Status updated successfully'
  });
});

export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Application ID is required', 400));
  }

  const result = await JobsModel.deleteApplication(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete application', 404));
  }

  // Optionally delete resume file
  // if (result.resume) await deleteFile(result.resume);

  res.status(200).json({
    success: true,
    message: 'Application deleted successfully'
  });
});

export const getJobStats = catchAsyncErrors(async (req, res, next) => {
  const result = await JobsModel.getJobStats();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch stats', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const getJobTypes = catchAsyncErrors(async (req, res, next) => {
  const result = await JobsModel.getJobTypes();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch job types', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const getJobLocations = catchAsyncErrors(async (req, res, next) => {
  const result = await JobsModel.getJobLocations();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch locations', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const checkSlugAvailability = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.query;
  const { excludeId } = req.query;

  if (!slug) {
    return next(new ErrorHandler('Slug is required', 400));
  }

  const result = await JobsModel.checkSlugAvailability(slug, excludeId);

  res.status(200).json({
    success: true,
    available: result.available
  });
});

export default {
  getActiveJobs,
  getJobBySlug,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  hardDeleteJob,
  applyForJob,
  getJobApplications,
  updateApplicationStatus,
  deleteApplication,
  getJobStats,
  getJobTypes,
  getJobLocations,
  checkSlugAvailability
};