import * as AgencyModel from '../../models/agency/agency.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

const PORT = process.env.PORT || 8080;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath === 'null' || imagePath === 'undefined') return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}/uploads/agents/${imagePath}`;
};

const processAgentData = (agent) => {
  if (!agent) return null;
  return {
    ...agent,
    image: buildImageUrl(agent.image)
  };
};

const generateSlug = (name) => {
  if (!name) return 'agent-' + Date.now();
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

// ==================== AGENCY CONTROLLERS ====================

export const getActiveAgencies = catchAsyncErrors(async (req, res, next) => {
  const result = await AgencyModel.getActiveAgencies({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    search: req.query.search || req.query.q,
    sortBy: req.query.sortBy || 'create_date',
    sortOrder: req.query.sortOrder || 'DESC'
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch agencies', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

export const getAgencyById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Agency ID is required', 400));
  }

  const result = await AgencyModel.getAgencyById(id);

  if (!result.success) {
    return next(new ErrorHandler('Agency not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      ...result.data,
      agents: result.data.agents ? result.data.agents.map(processAgentData) : []
    }
  });
});

export const createAgency = catchAsyncErrors(async (req, res, next) => {
  const result = await AgencyModel.createAgency(req.body);

  if (!result.success) {
    return next(new ErrorHandler('Failed to create agency', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Agency created successfully',
    agencyId: result.agencyId
  });
});

export const updateAgency = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Agency ID is required', 400));
  }

  const result = await AgencyModel.updateAgency(id, req.body);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update agency', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Agency updated successfully'
  });
});

export const deleteAgency = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Agency ID is required', 400));
  }

  const result = await AgencyModel.deleteAgency(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete agency', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Agency deleted successfully'
  });
});

// ==================== AGENT CONTROLLERS ====================

export const getActiveAgents = catchAsyncErrors(async (req, res, next) => {
  const result = await AgencyModel.getActiveAgents({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    company: req.query.company,
    language: req.query.language,
    search: req.query.search || req.query.q,
    sortBy: req.query.sortBy || 'name',
    sortOrder: req.query.sortOrder || 'ASC'
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch agents', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processAgentData),
    pagination: result.pagination
  });
});

export const getAgentBySlug = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.params;

  if (!slug) {
    return next(new ErrorHandler('Slug is required', 400));
  }

  const result = await AgencyModel.getAgentBySlug(slug);

  if (!result.success) {
    return next(new ErrorHandler('Agent not found', 404));
  }

  res.status(200).json({
    success: true,
    data: processAgentData(result.data)
  });
});

export const getAgentById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Agent ID is required', 400));
  }

  const result = await AgencyModel.getAgentById(id);

  if (!result.success) {
    return next(new ErrorHandler('Agent not found', 404));
  }

  res.status(200).json({
    success: true,
    data: processAgentData(result.data)
  });
});

export const createAgent = catchAsyncErrors(async (req, res, next) => {
  const agentData = { ...req.body };

  if (req.file) {
    agentData.image = req.file.filename;
  }

  if (!agentData.slug && agentData.name) {
    agentData.slug = generateSlug(agentData.name);
  }

  const result = await AgencyModel.createAgent(agentData);

  if (!result.success) {
    return next(new ErrorHandler('Failed to create agent', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Agent created successfully',
    agentId: result.agentId,
    slug: result.slug
  });
});

export const updateAgent = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Agent ID is required', 400));
  }

  const updateData = { ...req.body };

  if (req.file) {
    updateData.image = req.file.filename;
  }

  const result = await AgencyModel.updateAgent(id, updateData);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update agent', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Agent updated successfully'
  });
});

export const deleteAgent = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Agent ID is required', 400));
  }

  const result = await AgencyModel.deleteAgent(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete agent', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Agent deleted successfully'
  });
});

export const getStats = catchAsyncErrors(async (req, res, next) => {
  const result = await AgencyModel.getStats();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch stats', 500));
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

  const result = await AgencyModel.checkSlugAvailability(slug, excludeId);

  res.status(200).json({
    success: true,
    available: result.available
  });
});

export default {
  getActiveAgencies,
  getAgencyById,
  createAgency,
  updateAgency,
  deleteAgency,
  getActiveAgents,
  getAgentBySlug,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  getStats,
  checkSlugAvailability
};