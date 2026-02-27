import path from 'path';
import fs from 'fs';
import * as ContactUsModel from '../../models/contact_us/contact_us.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

const UPLOAD_BASE_PATH = 'uploads';
const ITEMS_PER_PAGE = 20;
const API_BASE_URL = process.env.API_URL;

const buildFileUrl = (filePath) => {
  if (!filePath) return null;
  return `${API_BASE_URL}/${filePath.replace(/\\/g, '/')}`;
};

const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

const formatContactResponse = (contact) => {
  if (!contact) return null;
  return {
    ...contact,
    profile: buildFileUrl(contact.profile),
    resume: buildFileUrl(contact.resume)
  };
};

export const getAll = catchAsyncErrors(async (req, res, next) => {
  const filters = {
    search: req.query.search,
    status: req.query.status,
    source: req.query.source,
    type: req.query.type,
    lead_status: req.query.lead_status,
    contact_type: req.query.contact_type,
    agent_id: req.query.agent_id,
    property_id: req.query.property_id,
    developerid: req.query.developerid,
    individualid: req.query.individualid,
    compnayid: req.query.compnayid,
    orderBy: req.query.orderBy,
    order: req.query.order
  };

  const pagination = {
    page: req.query.page || 1,
    limit: req.query.limit || ITEMS_PER_PAGE
  };

  const result = await ContactUsModel.findAll(filters, pagination);

  result.data = result.data.map(formatContactResponse);

  res.status(200).json({
    success: true,
    ...result
  });
});

export const getById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const contact = await ContactUsModel.findById(id);

  if (!contact) {
    return next(new ErrorHandler('Contact not found', 404));
  }

  res.status(200).json({
    success: true,
    data: formatContactResponse(contact)
  });
});

export const getByCuid = catchAsyncErrors(async (req, res, next) => {
  const { cuid } = req.params;

  const contact = await ContactUsModel.findByCuid(cuid);

  if (!contact) {
    return next(new ErrorHandler('Contact not found', 404));
  }

  res.status(200).json({
    success: true,
    data: formatContactResponse(contact)
  });
});

export const getByAgentId = catchAsyncErrors(async (req, res, next) => {
  const { agentId } = req.params;

  const contacts = await ContactUsModel.findByAgentId(agentId);

  res.status(200).json({
    success: true,
    data: contacts.map(formatContactResponse)
  });
});

export const getByPropertyId = catchAsyncErrors(async (req, res, next) => {
  const { propertyId } = req.params;

  const contacts = await ContactUsModel.findByPropertyId(propertyId);

  res.status(200).json({
    success: true,
    data: contacts.map(formatContactResponse)
  });
});

export const getByDeveloperId = catchAsyncErrors(async (req, res, next) => {
  const { developerId } = req.params;

  const contacts = await ContactUsModel.findByDeveloperId(developerId);

  res.status(200).json({
    success: true,
    data: contacts.map(formatContactResponse)
  });
});

export const getByIndividualId = catchAsyncErrors(async (req, res, next) => {
  const { individualId } = req.params;

  const contacts = await ContactUsModel.findByIndividualId(individualId);

  res.status(200).json({
    success: true,
    data: contacts.map(formatContactResponse)
  });
});

export const getByCompanyId = catchAsyncErrors(async (req, res, next) => {
  const { companyId } = req.params;

  const contacts = await ContactUsModel.findByCompanyId(companyId);

  res.status(200).json({
    success: true,
    data: contacts.map(formatContactResponse)
  });
});

export const create = catchAsyncErrors(async (req, res, next) => {
  const data = { ...req.body };

  if (!data.name && !data.first_name && !data.email && !data.phone) {
    return next(new ErrorHandler('At least name, first_name, email or phone is required', 400));
  }

  if (data.email) {
    const existingEmail = await ContactUsModel.findByEmail(data.email);
    if (existingEmail) {
      return next(new ErrorHandler('Email already exists', 409));
    }
  }

  if (data.phone) {
    const existingPhone = await ContactUsModel.findByPhone(data.phone);
    if (existingPhone) {
      return next(new ErrorHandler('Phone already exists', 409));
    }
  }

  if (data.cuid) {
    const existingCuid = await ContactUsModel.findByCuid(data.cuid);
    if (existingCuid) {
      return next(new ErrorHandler('CUID already exists', 409));
    }
  }

  if (req.files) {
    if (req.files.profile && req.files.profile[0]) {
      data.profile = req.files.profile[0].path;
    }
    if (req.files.resume && req.files.resume[0]) {
      data.resume = req.files.resume[0].path;
    }
  }

  const contact = await ContactUsModel.create(data);

  res.status(201).json({
    success: true,
    message: 'Contact created successfully',
    data: formatContactResponse(contact)
  });
});

export const update = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const data = { ...req.body };

  const existing = await ContactUsModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Contact not found', 404));
  }

  if (data.email && data.email !== existing.email) {
    const existingEmail = await ContactUsModel.findByEmail(data.email, id);
    if (existingEmail) {
      return next(new ErrorHandler('Email already exists', 409));
    }
  }

  if (data.phone && data.phone !== existing.phone) {
    const existingPhone = await ContactUsModel.findByPhone(data.phone, id);
    if (existingPhone) {
      return next(new ErrorHandler('Phone already exists', 409));
    }
  }

  if (data.cuid && data.cuid !== existing.cuid) {
    const existingCuid = await ContactUsModel.findByCuid(data.cuid);
    if (existingCuid) {
      return next(new ErrorHandler('CUID already exists', 409));
    }
  }

  if (req.files) {
    if (req.files.profile && req.files.profile[0]) {
      deleteFile(existing.profile);
      data.profile = req.files.profile[0].path;
    }
    if (req.files.resume && req.files.resume[0]) {
      deleteFile(existing.resume);
      data.resume = req.files.resume[0].path;
    }
  }

  const contact = await ContactUsModel.update(id, data);

  res.status(200).json({
    success: true,
    message: 'Contact updated successfully',
    data: formatContactResponse(contact)
  });
});

export const remove = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const existing = await ContactUsModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Contact not found', 404));
  }

  await ContactUsModel.softDelete(id);

  res.status(200).json({
    success: true,
    message: 'Contact deleted successfully'
  });
});

export const permanentRemove = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const existing = await ContactUsModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Contact not found', 404));
  }

  deleteFile(existing.profile);
  deleteFile(existing.resume);

  await ContactUsModel.hardDelete(id);

  res.status(200).json({
    success: true,
    message: 'Contact permanently deleted'
  });
});

export const bulkUpdateStatus = catchAsyncErrors(async (req, res, next) => {
  const { ids, status } = req.body;

  if (!Array.isArray(ids) || !ids.length) {
    return next(new ErrorHandler('Invalid IDs array', 400));
  }

  if (status === undefined || status === null) {
    return next(new ErrorHandler('Status is required', 400));
  }

  await ContactUsModel.bulkUpdateStatus(ids, status);

  res.status(200).json({
    success: true,
    message: 'Status updated successfully'
  });
});

export const bulkUpdateLeadStatus = catchAsyncErrors(async (req, res, next) => {
  const { ids, lead_status } = req.body;

  if (!Array.isArray(ids) || !ids.length) {
    return next(new ErrorHandler('Invalid IDs array', 400));
  }

  if (!lead_status) {
    return next(new ErrorHandler('Lead status is required', 400));
  }

  await ContactUsModel.bulkUpdateLeadStatus(ids, lead_status);

  res.status(200).json({
    success: true,
    message: 'Lead status updated successfully'
  });
});

export const bulkDelete = catchAsyncErrors(async (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || !ids.length) {
    return next(new ErrorHandler('Invalid IDs array', 400));
  }

  await ContactUsModel.bulkDelete(ids);

  res.status(200).json({
    success: true,
    message: 'Contacts deleted successfully'
  });
});

export const bulkHardDelete = catchAsyncErrors(async (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || !ids.length) {
    return next(new ErrorHandler('Invalid IDs array', 400));
  }

  for (const id of ids) {
    const contact = await ContactUsModel.findById(id);
    if (contact) {
      deleteFile(contact.profile);
      deleteFile(contact.resume);
    }
  }

  await ContactUsModel.bulkHardDelete(ids);

  res.status(200).json({
    success: true,
    message: 'Contacts permanently deleted'
  });
});

export const getStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await ContactUsModel.getStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

export const getBySource = catchAsyncErrors(async (req, res, next) => {
  const { source } = req.params;

  const contacts = await ContactUsModel.getBySource(source);

  res.status(200).json({
    success: true,
    data: contacts.map(formatContactResponse)
  });
});

export const getByType = catchAsyncErrors(async (req, res, next) => {
  const { type } = req.params;

  const contacts = await ContactUsModel.getByType(type);

  res.status(200).json({
    success: true,
    data: contacts.map(formatContactResponse)
  });
});

export const getByDateRange = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(new ErrorHandler('Start date and end date are required', 400));
  }

  const contacts = await ContactUsModel.getByDateRange(startDate, endDate);

  res.status(200).json({
    success: true,
    data: contacts.map(formatContactResponse)
  });
});

export const updateLeadStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { lead_status } = req.body;

  const existing = await ContactUsModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Contact not found', 404));
  }

  if (!lead_status) {
    return next(new ErrorHandler('Lead status is required', 400));
  }

  const contact = await ContactUsModel.updateLeadStatus(id, lead_status);

  res.status(200).json({
    success: true,
    message: 'Lead status updated successfully',
    data: formatContactResponse(contact)
  });
});

export const updateActivityLog = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { activity_log, activity_date_time } = req.body;

  const existing = await ContactUsModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Contact not found', 404));
  }

  const contact = await ContactUsModel.updateActivityLog(id, activity_log, activity_date_time || new Date().toISOString());

  res.status(200).json({
    success: true,
    message: 'Activity log updated successfully',
    data: formatContactResponse(contact)
  });
});

export const assignAgent = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { agent_id } = req.body;

  const existing = await ContactUsModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Contact not found', 404));
  }

  const contact = await ContactUsModel.assignAgent(id, agent_id);

  res.status(200).json({
    success: true,
    message: 'Agent assigned successfully',
    data: formatContactResponse(contact)
  });
});

export const assignConnectedAgent = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { connected_agent } = req.body;

  const existing = await ContactUsModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Contact not found', 404));
  }

  const contact = await ContactUsModel.assignConnectedAgent(id, connected_agent);

  res.status(200).json({
    success: true,
    message: 'Connected agent assigned successfully',
    data: formatContactResponse(contact)
  });
});

export const assignConnectedAgency = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { connected_agency } = req.body;

  const existing = await ContactUsModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Contact not found', 404));
  }

  const contact = await ContactUsModel.assignConnectedAgency(id, connected_agency);

  res.status(200).json({
    success: true,
    message: 'Connected agency assigned successfully',
    data: formatContactResponse(contact)
  });
});

export const assignConnectedEmployee = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { connected_employee } = req.body;

  const existing = await ContactUsModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Contact not found', 404));
  }

  const contact = await ContactUsModel.assignConnectedEmployee(id, connected_employee);

  res.status(200).json({
    success: true,
    message: 'Connected employee assigned successfully',
    data: formatContactResponse(contact)
  });
});

export const restore = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const existing = await ContactUsModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Contact not found', 404));
  }

  const contact = await ContactUsModel.update(id, { status: 1 });

  res.status(200).json({
    success: true,
    message: 'Contact restored successfully',
    data: formatContactResponse(contact)
  });
});