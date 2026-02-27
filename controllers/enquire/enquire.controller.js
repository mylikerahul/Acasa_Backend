import * as EnquiryModel from '../../models/enquire/enquire.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

const PORT = process.env.PORT || 8080;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath === 'null' || imagePath === 'undefined') return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  return `${API_URL}/uploads/${imagePath}`;
};

const processEnquiryData = (enquiry) => {
  if (!enquiry) return null;
  return {
    ...enquiry,
    property_image: buildImageUrl(enquiry.property_image),
    property_featured_image: buildImageUrl(enquiry.property_featured_image),
    project_featured_image: buildImageUrl(enquiry.project_featured_image),
    agent_image: buildImageUrl(enquiry.agent_image),
    resume: buildImageUrl(enquiry.resume)
  };
};

export const getActiveEnquiries = catchAsyncErrors(async (req, res, next) => {
  const result = await EnquiryModel.getActiveEnquiries({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    type: req.query.type,
    source: req.query.source,
    priority: req.query.priority,
    quality: req.query.quality,
    status: req.query.status,
    lead_status: req.query.lead_status,
    agent_id: req.query.agent_id,
    property_id: req.query.property_id,
    project_id: req.query.project_id,
    community_id: req.query.community_id,
    contact_type: req.query.contact_type,
    listing_type: req.query.listing_type,
    date_from: req.query.date_from,
    date_to: req.query.date_to,
    search: req.query.search || req.query.q,
    sortBy: req.query.sortBy || 'created_at',
    sortOrder: req.query.sortOrder || 'DESC'
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch enquiries', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processEnquiryData),
    pagination: result.pagination
  });
});

export const getEnquiryById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Enquiry ID is required', 400));
  }

  const result = await EnquiryModel.getEnquiryById(id);

  if (!result.success) {
    return next(new ErrorHandler('Enquiry not found', 404));
  }

  res.status(200).json({
    success: true,
    data: processEnquiryData(result.data)
  });
});

export const getEnquiriesByProperty = catchAsyncErrors(async (req, res, next) => {
  const { propertyId } = req.params;
  const limit = parseInt(req.query.limit) || 10;

  if (!propertyId) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  const result = await EnquiryModel.getEnquiriesByProperty(propertyId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch enquiries', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processEnquiryData)
  });
});

export const getEnquiriesByProject = catchAsyncErrors(async (req, res, next) => {
  const { projectId } = req.params;
  const limit = parseInt(req.query.limit) || 10;

  if (!projectId) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  const result = await EnquiryModel.getEnquiriesByProject(projectId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch enquiries', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processEnquiryData)
  });
});

export const getEnquiriesByAgent = catchAsyncErrors(async (req, res, next) => {
  const { agentId } = req.params;

  if (!agentId) {
    return next(new ErrorHandler('Agent ID is required', 400));
  }

  const result = await EnquiryModel.getEnquiriesByAgent(agentId, {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    status: req.query.status,
    lead_status: req.query.lead_status
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch enquiries', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processEnquiryData),
    pagination: result.pagination
  });
});

export const getEnquiriesByContact = catchAsyncErrors(async (req, res, next) => {
  const { contactId } = req.params;
  const limit = parseInt(req.query.limit) || 20;

  if (!contactId) {
    return next(new ErrorHandler('Contact ID is required', 400));
  }

  const result = await EnquiryModel.getEnquiriesByContact(contactId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch enquiries', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processEnquiryData)
  });
});

export const getRecentEnquiries = catchAsyncErrors(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;

  const result = await EnquiryModel.getRecentEnquiries(limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch enquiries', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processEnquiryData)
  });
});

export const getUnassignedEnquiries = catchAsyncErrors(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 50;

  const result = await EnquiryModel.getUnassignedEnquiries(limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch enquiries', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processEnquiryData)
  });
});

export const getHighPriorityEnquiries = catchAsyncErrors(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 20;

  const result = await EnquiryModel.getHighPriorityEnquiries(limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch enquiries', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processEnquiryData)
  });
});

export const searchEnquiries = catchAsyncErrors(async (req, res, next) => {
  const query = req.query.q || req.query.search || '';
  const limit = parseInt(req.query.limit) || 10;

  if (!query.trim()) {
    return res.status(200).json({
      success: true,
      data: []
    });
  }

  const result = await EnquiryModel.searchEnquiries(query, limit);

  if (!result.success) {
    return next(new ErrorHandler('Search failed', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processEnquiryData)
  });
});

export const getEnquiryStats = catchAsyncErrors(async (req, res, next) => {
  const result = await EnquiryModel.getEnquiryStats({
    agent_id: req.query.agent_id,
    date_from: req.query.date_from,
    date_to: req.query.date_to
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch stats', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const createEnquiry = catchAsyncErrors(async (req, res, next) => {
  const {
    contact_id,
    property_id,
    project_item_id,
    project_id,
    item_type,
    type,
    source,
    agent_id,
    country,
    priority,
    quality,
    contact_type,
    listing_type,
    exclusive_status,
    construction_status,
    state_id,
    community_id,
    sub_community_id,
    building,
    price_min,
    price_max,
    bedroom_min,
    bedroom_max,
    contact_source,
    lead_source,
    message,
    drip_marketing,
    status,
    contact_date,
    lead_status
  } = req.body;

  let property_image = null;
  let resume = null;

  if (req.files) {
    if (req.files.property_image && req.files.property_image[0]) {
      property_image = req.files.property_image[0].filename;
    }
    if (req.files.resume && req.files.resume[0]) {
      resume = req.files.resume[0].filename;
    }
  }

  const enquiryData = {
    contact_id: contact_id ? parseInt(contact_id) : null,
    property_id: property_id ? parseInt(property_id) : null,
    project_item_id: project_item_id ? parseInt(project_item_id) : null,
    project_id: project_id ? parseInt(project_id) : null,
    item_type,
    type,
    source,
    agent_id: agent_id ? parseInt(agent_id) : null,
    country: country ? parseInt(country) : null,
    priority: priority || 'medium',
    quality,
    contact_type,
    listing_type,
    exclusive_status,
    construction_status,
    state_id: state_id ? parseInt(state_id) : null,
    community_id: community_id ? parseInt(community_id) : null,
    sub_community_id: sub_community_id ? parseInt(sub_community_id) : null,
    building,
    price_min,
    price_max,
    bedroom_min,
    bedroom_max,
    contact_source,
    lead_source,
    property_image,
    message,
    resume,
    drip_marketing: drip_marketing || 'no',
    status: status !== undefined ? parseInt(status) : 1,
    contact_date: contact_date || new Date().toISOString().split('T')[0],
    lead_status: lead_status !== undefined ? parseInt(lead_status) : 1
  };

  Object.keys(enquiryData).forEach(key => {
    if (enquiryData[key] === undefined || enquiryData[key] === '' || enquiryData[key] === null) {
      delete enquiryData[key];
    }
  });

  const result = await EnquiryModel.createEnquiry(enquiryData);

  if (!result.success) {
    return next(new ErrorHandler('Failed to create enquiry', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Enquiry created successfully',
    enquiryId: result.enquiryId
  });
});

export const updateEnquiry = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Enquiry ID is required', 400));
  }

  const updateData = {};

  const allowedFields = [
    'contact_id', 'property_id', 'project_item_id', 'project_id', 'item_type',
    'type', 'source', 'agent_id', 'country', 'priority', 'quality', 'contact_type',
    'agent_activity', 'admin_activity', 'listing_type', 'exclusive_status',
    'construction_status', 'state_id', 'community_id', 'sub_community_id', 'building',
    'price_min', 'price_max', 'bedroom_min', 'bedroom_max', 'contact_source',
    'lead_source', 'message', 'drip_marketing', 'status', 'contact_date',
    'lead_status', 'lost_status'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  if (req.files) {
    if (req.files.property_image && req.files.property_image[0]) {
      updateData.property_image = req.files.property_image[0].filename;
    }
    if (req.files.resume && req.files.resume[0]) {
      updateData.resume = req.files.resume[0].filename;
    }
  }

  if (Object.keys(updateData).length === 0) {
    return next(new ErrorHandler('No update data provided', 400));
  }

  const result = await EnquiryModel.updateEnquiry(id, updateData);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update enquiry', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Enquiry updated successfully'
  });
});

export const deleteEnquiry = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Enquiry ID is required', 400));
  }

  const result = await EnquiryModel.deleteEnquiry(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete enquiry', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Enquiry deleted successfully'
  });
});

export const hardDeleteEnquiry = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Enquiry ID is required', 400));
  }

  const result = await EnquiryModel.hardDeleteEnquiry(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete enquiry', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Enquiry permanently deleted'
  });
});

export const updateEnquiryStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return next(new ErrorHandler('Enquiry ID is required', 400));
  }

  if (status === undefined || status === null) {
    return next(new ErrorHandler('Status is required', 400));
  }

  const result = await EnquiryModel.updateEnquiryStatus(id, status);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update status', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Status updated successfully'
  });
});

export const updateLeadStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { lead_status, lost_status } = req.body;

  if (!id) {
    return next(new ErrorHandler('Enquiry ID is required', 400));
  }

  if (lead_status === undefined || lead_status === null) {
    return next(new ErrorHandler('Lead status is required', 400));
  }

  const result = await EnquiryModel.updateLeadStatus(id, lead_status, lost_status);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update lead status', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Lead status updated successfully'
  });
});

export const updatePriority = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { priority } = req.body;

  if (!id) {
    return next(new ErrorHandler('Enquiry ID is required', 400));
  }

  if (!priority) {
    return next(new ErrorHandler('Priority is required', 400));
  }

  const result = await EnquiryModel.updatePriority(id, priority);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update priority', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Priority updated successfully'
  });
});

export const updateQuality = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { quality } = req.body;

  if (!id) {
    return next(new ErrorHandler('Enquiry ID is required', 400));
  }

  if (!quality) {
    return next(new ErrorHandler('Quality is required', 400));
  }

  const result = await EnquiryModel.updateQuality(id, quality);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update quality', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Quality updated successfully'
  });
});

export const assignAgent = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { agent_id } = req.body;

  if (!id) {
    return next(new ErrorHandler('Enquiry ID is required', 400));
  }

  if (!agent_id) {
    return next(new ErrorHandler('Agent ID is required', 400));
  }

  const result = await EnquiryModel.assignAgent(id, agent_id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to assign agent', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Agent assigned successfully'
  });
});

export const updateAgentActivity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { activity } = req.body;

  if (!id) {
    return next(new ErrorHandler('Enquiry ID is required', 400));
  }

  if (!activity) {
    return next(new ErrorHandler('Activity is required', 400));
  }

  const result = await EnquiryModel.updateAgentActivity(id, activity);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update activity', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Agent activity updated successfully'
  });
});

export const updateAdminActivity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { activity } = req.body;

  if (!id) {
    return next(new ErrorHandler('Enquiry ID is required', 400));
  }

  if (!activity) {
    return next(new ErrorHandler('Activity is required', 400));
  }

  const result = await EnquiryModel.updateAdminActivity(id, activity);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update activity', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Admin activity updated successfully'
  });
});

export const restoreEnquiry = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Enquiry ID is required', 400));
  }

  const result = await EnquiryModel.restoreEnquiry(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to restore enquiry', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Enquiry restored successfully'
  });
});

export const bulkUpdateStatus = catchAsyncErrors(async (req, res, next) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorHandler('Enquiry IDs array is required', 400));
  }

  if (status === undefined || status === null) {
    return next(new ErrorHandler('Status is required', 400));
  }

  const result = await EnquiryModel.bulkUpdateStatus(ids, status);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update enquiries', 400));
  }

  res.status(200).json({
    success: true,
    message: result.message,
    affectedRows: result.affectedRows
  });
});

export const bulkAssignAgent = catchAsyncErrors(async (req, res, next) => {
  const { ids, agent_id } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorHandler('Enquiry IDs array is required', 400));
  }

  if (!agent_id) {
    return next(new ErrorHandler('Agent ID is required', 400));
  }

  const result = await EnquiryModel.bulkAssignAgent(ids, agent_id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to assign agent', 400));
  }

  res.status(200).json({
    success: true,
    message: result.message,
    affectedRows: result.affectedRows
  });
});

export const bulkUpdateLeadStatus = catchAsyncErrors(async (req, res, next) => {
  const { ids, lead_status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorHandler('Enquiry IDs array is required', 400));
  }

  if (lead_status === undefined || lead_status === null) {
    return next(new ErrorHandler('Lead status is required', 400));
  }

  const result = await EnquiryModel.bulkUpdateLeadStatus(ids, lead_status);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update enquiries', 400));
  }

  res.status(200).json({
    success: true,
    message: result.message,
    affectedRows: result.affectedRows
  });
});

export const toggleDripMarketing = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { enabled } = req.body;

  if (!id) {
    return next(new ErrorHandler('Enquiry ID is required', 400));
  }

  const result = await EnquiryModel.toggleDripMarketing(id, enabled);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update drip marketing', 404));
  }

  res.status(200).json({
    success: true,
    message: result.message
  });
});

export default {
  getActiveEnquiries,
  getEnquiryById,
  getEnquiriesByProperty,
  getEnquiriesByProject,
  getEnquiriesByAgent,
  getEnquiriesByContact,
  getRecentEnquiries,
  getUnassignedEnquiries,
  getHighPriorityEnquiries,
  searchEnquiries,
  getEnquiryStats,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  hardDeleteEnquiry,
  updateEnquiryStatus,
  updateLeadStatus,
  updatePriority,
  updateQuality,
  assignAgent,
  updateAgentActivity,
  updateAdminActivity,
  restoreEnquiry,
  bulkUpdateStatus,
  bulkAssignAgent,
  bulkUpdateLeadStatus,
  toggleDripMarketing
};