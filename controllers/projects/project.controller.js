import * as ProjectModel from '../../models/projects/project.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  API_URL: process.env.API_URL || 'http://localhost:3000',
  DEFAULT_LIMIT: 1000,  
  MAX_LIMIT: 1000,
  FEATURED_LIMIT: 10,
  SIMILAR_LIMIT: 6,
  SEARCH_LIMIT: 20,
  ADMIN_DEFAULT_LIMIT: 25,
  IMAGE_BASE_PATH: '/uploads/projects',
  GALLERY_PATH: '/uploads/projects/gallery'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safe limit calculator - prevents abuse
 */
const getSafeLimit = (requestedLimit, defaultLimit = CONFIG.DEFAULT_LIMIT, maxLimit = CONFIG.MAX_LIMIT) => {
  const limit = parseInt(requestedLimit) || defaultLimit;
  return Math.min(Math.max(1, limit), maxLimit);
};

/**
 * Build complete image URL
 */
const buildImageUrl = (imagePath) => {
  // Return null for invalid inputs
  if (!imagePath || imagePath === 'null' || imagePath === 'undefined' || imagePath.trim() === '') {
    return null;
  }

  // Already complete URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Clean the path
  let cleanPath = imagePath.trim()
    .replace(/^\/+/, '')
    .replace(/^uploads\//, '')
    .replace(/^projects\//, '');

  // Handle gallery images
  if (cleanPath.startsWith('gallery-') || cleanPath.startsWith('gallery/')) {
    cleanPath = cleanPath.replace(/^gallery\//, '');
    return `${CONFIG.API_URL}${CONFIG.GALLERY_PATH}/${cleanPath}`;
  }

  return `${CONFIG.API_URL}${CONFIG.IMAGE_BASE_PATH}/${cleanPath}`;
};

/**
 * Generate SEO-friendly slug
 */
const generateSlug = (name) => {
  if (!name || typeof name !== 'string') {
    return `project-${Date.now()}`;
  }
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')      // Remove special characters
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/-+/g, '-')            // Remove multiple hyphens
    .replace(/^-+|-+$/g, '')        // Trim hyphens from start/end
    .substring(0, 100)              // Limit length
    + '-' + Date.now().toString(36); // Add unique identifier
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Parse integer safely
 */
const safeParseInt = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Clean object - remove undefined and empty values
 */
const cleanObject = (obj) => {
  const cleaned = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

// ============================================
// DATA PROCESSORS
// ============================================

/**
 * Process single project data with images
 */
const processProjectData = (project) => {
  if (!project) return null;

  const primaryImage = project.primaryImage 
    || project.featured_image 
    || project.gallery_thumb 
    || project.media_thumb 
    || null;

  return {
    ...project,
    featured_image: buildImageUrl(project.featured_image),
    gallery_thumb: buildImageUrl(project.gallery_thumb),
    media_thumb: buildImageUrl(project.media_thumb),
    LogoUrl: buildImageUrl(project.LogoUrl),
    primaryImage: buildImageUrl(primaryImage),
    display_image: buildImageUrl(primaryImage)
  };
};

/**
 * Process multiple projects
 */
const processProjectsData = (projects) => {
  if (!Array.isArray(projects)) return [];
  return projects.map(processProjectData).filter(Boolean);
};

/**
 * Process gallery data
 */
const processGalleryData = (gallery) => {
  if (!gallery || !Array.isArray(gallery)) return [];
  
  return gallery.map(img => ({
    ...img,
    Url: buildImageUrl(img.Url),
    thumbnail: buildImageUrl(img.Url)
  }));
};

/**
 * Process floor plan data
 */
const processFloorPlanData = (floorPlans) => {
  if (!floorPlans || !Array.isArray(floorPlans)) return [];
  
  return floorPlans.map(plan => ({
    ...plan,
    image: buildImageUrl(plan.image)
  }));
};

// ============================================
// PUBLIC API CONTROLLERS
// ============================================

/**
 * Get all active projects with filters and pagination
 * @route GET /api/projects
 * @query page, limit, city_id, community_id, developer_id, listing_type, etc.
 */
export const getActiveProjects = catchAsyncErrors(async (req, res, next) => {
  const {
    page,
    limit,
    city_id,
    community_id,
    sub_community_id,
    developer_id,
    listing_type,
    property_type,
    bedroom,
    min_price,
    max_price,
    min_area,
    max_area,
    featured,
    search,
    q,
    sortBy,
    sortOrder
  } = req.query;

  const filters = {
    page: safeParseInt(page, 1),
    limit: getSafeLimit(limit, CONFIG.DEFAULT_LIMIT),
    city_id: city_id || null,
    community_id: community_id || null,
    sub_community_id: sub_community_id || null,
    developer_id: safeParseInt(developer_id),
    listing_type: listing_type || null,
    property_type: property_type || null,
    bedroom: bedroom || null,
    min_price: safeParseInt(min_price),
    max_price: safeParseInt(max_price),
    min_area: safeParseInt(min_area),
    max_area: safeParseInt(max_area),
    featured_project: featured || null,
    search: search || q || null,
    sortBy: sortBy || 'created_at',
    sortOrder: ['ASC', 'DESC'].includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC'
  };

  const result = await ProjectModel.getActiveProjects(filters);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch projects', 500));
  }

  res.status(200).json({
    success: true,
    data: processProjectsData(result.data),
    pagination: result.pagination,
    filters: {
      applied: Object.keys(filters).filter(k => filters[k] !== null && !['page', 'limit', 'sortBy', 'sortOrder'].includes(k)).length
    }
  });
});

/**
 * Get project by slug
 * @route GET /api/projects/:slug
 */
export const getProjectBySlug = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.params;

  if (!slug || slug.trim() === '') {
    return next(new ErrorHandler('Project slug is required', 400));
  }

  const result = await ProjectModel.getProjectBySlug(slug.trim());

  if (!result.success || !result.data) {
    return next(new ErrorHandler('Project not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      ...processProjectData(result.data),
      gallery: processGalleryData(result.data.gallery),
      floorPlans: processFloorPlanData(result.data.floorPlans),
      galleryStats: result.data.galleryStats || null
    }
  });
});

/**
 * Get featured projects
 * @route GET /api/projects/featured
 */
export const getFeaturedProjects = catchAsyncErrors(async (req, res, next) => {
  const limit = getSafeLimit(req.query.limit, CONFIG.FEATURED_LIMIT, 50);

  const result = await ProjectModel.getFeaturedProjects(limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch featured projects', 500));
  }

  res.status(200).json({
    success: true,
    data: processProjectsData(result.data),
    count: result.data?.length || 0
  });
});

/**
 * Get projects by city
 * @route GET /api/projects/city/:cityId
 */
export const getProjectsByCity = catchAsyncErrors(async (req, res, next) => {
  const { cityId } = req.params;
  const limit = getSafeLimit(req.query.limit, 20, 100);

  if (!cityId) {
    return next(new ErrorHandler('City ID is required', 400));
  }

  const result = await ProjectModel.getProjectsByCity(cityId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch projects', 500));
  }

  res.status(200).json({
    success: true,
    data: processProjectsData(result.data),
    count: result.data?.length || 0
  });
});

/**
 * Get projects by developer
 * @route GET /api/projects/developer/:developerId
 */
export const getProjectsByDeveloper = catchAsyncErrors(async (req, res, next) => {
  const { developerId } = req.params;
  const limit = getSafeLimit(req.query.limit, 20, 100);

  if (!developerId) {
    return next(new ErrorHandler('Developer ID is required', 400));
  }

  const result = await ProjectModel.getProjectsByDeveloper(developerId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch projects', 500));
  }

  res.status(200).json({
    success: true,
    data: processProjectsData(result.data),
    count: result.data?.length || 0
  });
});

/**
 * Get projects by community
 * @route GET /api/projects/community/:communityId
 */
export const getProjectsByCommunity = catchAsyncErrors(async (req, res, next) => {
  const { communityId } = req.params;
  const limit = getSafeLimit(req.query.limit, 20, 100);

  if (!communityId) {
    return next(new ErrorHandler('Community ID is required', 400));
  }

  const result = await ProjectModel.getProjectsByCommunity(communityId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch projects', 500));
  }

  res.status(200).json({
    success: true,
    data: processProjectsData(result.data),
    count: result.data?.length || 0
  });
});

/**
 * Get similar projects
 * @route GET /api/projects/:projectId/similar
 */
export const getSimilarProjects = catchAsyncErrors(async (req, res, next) => {
  const { projectId } = req.params;
  const limit = getSafeLimit(req.query.limit, CONFIG.SIMILAR_LIMIT, 20);

  if (!projectId) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  const result = await ProjectModel.getSimilarProjects(projectId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Project not found', 404));
  }

  res.status(200).json({
    success: true,
    data: processProjectsData(result.data),
    count: result.data?.length || 0
  });
});

/**
 * Search projects
 * @route GET /api/projects/search
 */
export const searchProjects = catchAsyncErrors(async (req, res, next) => {
  const query = (req.query.q || req.query.search || '').trim();
  const limit = getSafeLimit(req.query.limit, CONFIG.SEARCH_LIMIT, 50);

  if (!query) {
    return res.status(200).json({
      success: true,
      data: [],
      count: 0,
      query: ''
    });
  }

  const result = await ProjectModel.searchProjects(query, limit);

  if (!result.success) {
    return next(new ErrorHandler('Search failed', 500));
  }

  res.status(200).json({
    success: true,
    data: processProjectsData(result.data),
    count: result.data?.length || 0,
    query: query
  });
});

/**
 * Get top viewed projects
 * @route GET /api/projects/top-viewed
 */
export const getTopViewedProjects = catchAsyncErrors(async (req, res, next) => {
  const limit = getSafeLimit(req.query.limit, 10, 50);

  const result = await ProjectModel.getTopViewedProjects(limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch projects', 500));
  }

  res.status(200).json({
    success: true,
    data: processProjectsData(result.data),
    count: result.data?.length || 0
  });
});

// ============================================
// ADMIN CONTROLLERS
// ============================================

/**
 * Get all projects for admin panel
 * @route GET /api/admin/projects
 */
export const getAllProjectsAdmin = catchAsyncErrors(async (req, res, next) => {
  const {
    page,
    limit,
    status,
    city_id,
    developer_id,
    listing_type,
    featured,
    verified,
    search,
    q,
    sortBy,
    sortOrder
  } = req.query;

  const filters = {
    page: safeParseInt(page, 1),
    limit: getSafeLimit(limit, CONFIG.ADMIN_DEFAULT_LIMIT, 500),
    status: status !== undefined ? safeParseInt(status) : null,
    city_id: city_id || null,
    developer_id: safeParseInt(developer_id),
    listing_type: listing_type || null,
    featured_project: featured || null,
    verified: verified !== undefined ? safeParseInt(verified) : null,
    search: search || q || null,
    sortBy: sortBy || 'created_at',
    sortOrder: ['ASC', 'DESC'].includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC'
  };

  const result = await ProjectModel.getAllProjectsAdmin(filters);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch projects', 500));
  }

  res.status(200).json({
    success: true,
    data: processProjectsData(result.data),
    pagination: result.pagination
  });
});

/**
 * Get project by ID for admin
 * @route GET /api/admin/projects/:id
 */
export const getProjectByIdAdmin = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  const result = await ProjectModel.getProjectByIdAdmin(id);

  if (!result.success || !result.data) {
    return next(new ErrorHandler('Project not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      ...processProjectData(result.data),
      gallery: processGalleryData(result.data.gallery),
      floorPlans: processFloorPlanData(result.data.floorPlans)
    }
  });
});

/**
 * Create new project
 * @route POST /api/admin/projects
 */
export const createProject = catchAsyncErrors(async (req, res, next) => {
  const {
    ProjectName,
    Description,
    listing_type,
    property_type,
    price,
    price_end,
    askprice,
    currency_id,
    bedroom,
    area,
    area_end,
    area_size,
    city_id,
    state_id,
    community_id,
    sub_community_id,
    developer_id,
    LocationName,
    CityName,
    StateName,
    BuildingName,
    StreetName,
    PinCode,
    LandMark,
    country,
    floors,
    rooms,
    total_building,
    completion_date,
    occupancy,
    amenities,
    featured_project,
    status,
    verified,
    video_url,
    whatsapp_url,
    dld_permit,
    Spa_number,
    keyword,
    seo_title,
    meta_description,
    canonical_tags,
    specs,
    gallery,
    floorPlans
  } = req.body;

  // Validation
  if (!ProjectName || ProjectName.trim() === '') {
    return next(new ErrorHandler('Project name is required', 400));
  }

  // Handle file uploads
  let featured_image = null;
  let logoUrl = null;

  if (req.files) {
    if (req.files.featured_image?.[0]) {
      featured_image = req.files.featured_image[0].filename;
    }
    if (req.files.logo?.[0]) {
      logoUrl = req.files.logo[0].filename;
    }
  }

  // Build project data
  const projectData = cleanObject({
    ProjectName: ProjectName.trim(),
    Description,
    listing_type,
    property_type,
    price,
    price_end,
    askprice,
    currency_id: safeParseInt(currency_id),
    bedroom,
    area,
    area_end,
    area_size,
    city_id,
    state_id,
    community_id,
    sub_community_id,
    developer_id: safeParseInt(developer_id),
    LocationName,
    CityName,
    StateName,
    BuildingName,
    StreetName,
    PinCode,
    LandMark,
    country: country || 'UAE',
    floors: safeParseInt(floors),
    rooms: safeParseInt(rooms),
    total_building: safeParseInt(total_building),
    completion_date,
    occupancy,
    amenities: typeof amenities === 'object' ? JSON.stringify(amenities) : amenities,
    featured_project: featured_project || '0',
    status: status !== undefined ? safeParseInt(status, 1) : 1,
    verified: verified ? 1 : 0,
    video_url,
    whatsapp_url,
    dld_permit,
    Spa_number,
    keyword,
    seo_title,
    meta_description,
    canonical_tags,
    featured_image,
    LogoUrl: logoUrl,
    project_slug: generateSlug(ProjectName),
    user_id: req.user?.id || null
  });

  // Related data
  const relatedData = {};
  if (specs && typeof specs === 'object') relatedData.specs = specs;
  if (gallery && Array.isArray(gallery)) relatedData.gallery = gallery;
  if (floorPlans && Array.isArray(floorPlans)) relatedData.floorPlans = floorPlans;

  const result = await ProjectModel.createProject(projectData, relatedData);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to create project', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    projectId: result.projectId,
    slug: result.slug
  });
});

/**
 * Update project
 * @route PUT /api/admin/projects/:id
 */
export const updateProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  const allowedFields = [
    'ProjectName', 'Description', 'listing_type', 'property_type',
    'price', 'price_end', 'askprice', 'currency_id', 'bedroom',
    'area', 'area_end', 'area_size', 'city_id', 'state_id',
    'community_id', 'sub_community_id', 'developer_id', 'LocationName',
    'CityName', 'StateName', 'BuildingName', 'StreetName', 'PinCode',
    'LandMark', 'country', 'floors', 'rooms', 'total_building',
    'completion_date', 'occupancy', 'amenities', 'featured_project',
    'status', 'verified', 'video_url', 'whatsapp_url', 'dld_permit',
    'Spa_number', 'keyword', 'seo_title', 'meta_description',
    'canonical_tags', 'project_slug'
  ];

  const intFields = ['currency_id', 'developer_id', 'floors', 'rooms', 'total_building', 'status'];
  const boolFields = ['verified'];

  const updateData = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (intFields.includes(field)) {
        updateData[field] = safeParseInt(req.body[field]);
      } else if (boolFields.includes(field)) {
        updateData[field] = req.body[field] ? 1 : 0;
      } else if (field === 'amenities' && typeof req.body[field] === 'object') {
        updateData[field] = JSON.stringify(req.body[field]);
      } else {
        updateData[field] = req.body[field];
      }
    }
  });

  // Handle file uploads
  if (req.files) {
    if (req.files.featured_image?.[0]) {
      updateData.featured_image = req.files.featured_image[0].filename;
    }
    if (req.files.logo?.[0]) {
      updateData.LogoUrl = req.files.logo[0].filename;
    }
  }

  // Related updates
  const relatedUpdates = {};
  const { specs, gallery, floorPlans } = req.body;
  
  if (specs && typeof specs === 'object') relatedUpdates.specs = specs;
  if (gallery && Array.isArray(gallery)) relatedUpdates.gallery = gallery;
  if (floorPlans && Array.isArray(floorPlans)) relatedUpdates.floorPlans = floorPlans;

  if (Object.keys(updateData).length === 0 && Object.keys(relatedUpdates).length === 0) {
    return next(new ErrorHandler('No update data provided', 400));
  }

  const result = await ProjectModel.updateProject(id, updateData, relatedUpdates);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update project', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Project updated successfully'
  });
});

/**
 * Soft delete project
 * @route DELETE /api/admin/projects/:id
 */
export const deleteProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  const result = await ProjectModel.deleteProject(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete project', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully'
  });
});

/**
 * Permanently delete project
 * @route DELETE /api/admin/projects/:id/permanent
 */
export const hardDeleteProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  const result = await ProjectModel.hardDeleteProject(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete project', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Project permanently deleted'
  });
});

/**
 * Update project status
 * @route PATCH /api/admin/projects/:id/status
 */
export const updateProjectStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  if (status === undefined || status === null) {
    return next(new ErrorHandler('Status is required', 400));
  }

  const result = await ProjectModel.updateProjectStatus(id, safeParseInt(status, 0));

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update status', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Status updated successfully'
  });
});

/**
 * Verify project
 * @route PATCH /api/admin/projects/:id/verify
 */
export const verifyProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { verified } = req.body;

  if (!id) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  const result = await ProjectModel.verifyProject(id, verified ? 1 : 0);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to verify project', 404));
  }

  res.status(200).json({
    success: true,
    message: result.message || 'Project verification updated'
  });
});

/**
 * Toggle featured project
 * @route PATCH /api/admin/projects/:id/featured
 */
export const toggleFeaturedProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { featured } = req.body;

  if (!id) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  const result = await ProjectModel.toggleFeaturedProject(id, featured);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update featured status', 404));
  }

  res.status(200).json({
    success: true,
    message: result.message || 'Featured status updated'
  });
});

/**
 * Restore deleted project
 * @route PATCH /api/admin/projects/:id/restore
 */
export const restoreProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  const result = await ProjectModel.restoreProject(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to restore project', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Project restored successfully'
  });
});

/**
 * Bulk update project status
 * @route PATCH /api/admin/projects/bulk/status
 */
export const bulkUpdateStatus = catchAsyncErrors(async (req, res, next) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorHandler('Project IDs array is required', 400));
  }

  if (ids.length > 100) {
    return next(new ErrorHandler('Maximum 100 projects can be updated at once', 400));
  }

  if (status === undefined || status === null) {
    return next(new ErrorHandler('Status is required', 400));
  }

  const result = await ProjectModel.bulkUpdateStatus(ids, safeParseInt(status, 0));

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update projects', 400));
  }

  res.status(200).json({
    success: true,
    message: result.message || 'Projects updated successfully',
    affectedRows: result.affectedRows
  });
});

// ============================================
// GALLERY CONTROLLERS
// ============================================

/**
 * Get gallery by project ID
 * @route GET /api/projects/:projectId/gallery
 */
export const getGalleryByProjectId = catchAsyncErrors(async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  const result = await ProjectModel.getGalleryByProjectId(projectId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch gallery', 500));
  }

  res.status(200).json({
    success: true,
    data: processGalleryData(result.data),
    count: result.data?.length || 0
  });
});

/**
 * Add gallery images
 * @route POST /api/admin/projects/:projectId/gallery
 */
export const addGalleryImages = catchAsyncErrors(async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  let images = [];

  if (req.files && req.files.length > 0) {
    images = req.files.map(file => file.filename);
  } else if (req.body.images && Array.isArray(req.body.images)) {
    images = req.body.images.filter(img => img && img.trim() !== '');
  }

  if (images.length === 0) {
    return next(new ErrorHandler('No images provided', 400));
  }

  if (images.length > 50) {
    return next(new ErrorHandler('Maximum 50 images can be uploaded at once', 400));
  }

  const result = await ProjectModel.addGalleryImages(projectId, images);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to add images', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Gallery images added successfully',
    count: images.length
  });
});

/**
 * Delete gallery image
 * @route DELETE /api/admin/gallery/:imageId
 */
export const deleteGalleryImage = catchAsyncErrors(async (req, res, next) => {
  const { imageId } = req.params;

  if (!imageId) {
    return next(new ErrorHandler('Image ID is required', 400));
  }

  const result = await ProjectModel.deleteGalleryImage(imageId);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete image', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully'
  });
});

// ============================================
// FLOOR PLAN CONTROLLERS
// ============================================

/**
 * Get floor plans by project ID
 * @route GET /api/projects/:projectId/floor-plans
 */
export const getFloorPlansByProjectId = catchAsyncErrors(async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  const result = await ProjectModel.getFloorPlansByProjectId(projectId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch floor plans', 500));
  }

  res.status(200).json({
    success: true,
    data: processFloorPlanData(result.data),
    count: result.data?.length || 0
  });
});

/**
 * Add floor plan
 * @route POST /api/admin/projects/:projectId/floor-plans
 */
export const addFloorPlan = catchAsyncErrors(async (req, res, next) => {
  const { projectId } = req.params;
  const { title, description } = req.body;

  if (!projectId) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  let image = null;

  if (req.file) {
    image = req.file.filename;
  } else if (req.body.image) {
    image = req.body.image;
  }

  const result = await ProjectModel.addFloorPlan(projectId, {
    title: title || null,
    description: description || null,
    image
  });

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to add floor plan', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Floor plan added successfully',
    floorPlanId: result.floorPlanId
  });
});

/**
 * Delete floor plan
 * @route DELETE /api/admin/floor-plans/:floorPlanId
 */
export const deleteFloorPlan = catchAsyncErrors(async (req, res, next) => {
  const { floorPlanId } = req.params;

  if (!floorPlanId) {
    return next(new ErrorHandler('Floor plan ID is required', 400));
  }

  const result = await ProjectModel.deleteFloorPlan(floorPlanId);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete floor plan', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Floor plan deleted successfully'
  });
});

// ============================================
// CONTACT CONTROLLERS
// ============================================

/**
 * Create project inquiry/contact
 * @route POST /api/projects/contact
 */
export const createProjectContact = catchAsyncErrors(async (req, res, next) => {
  const { project_id, name, email, phone, message } = req.body;

  // Validation
  if (!project_id) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  if (!name || name.trim() === '') {
    return next(new ErrorHandler('Name is required', 400));
  }

  if (!email || !isValidEmail(email)) {
    return next(new ErrorHandler('Valid email is required', 400));
  }

  const result = await ProjectModel.createProjectContact({
    project_id: safeParseInt(project_id),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    message: message?.trim() || null
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to submit inquiry', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Inquiry submitted successfully',
    contactId: result.contactId
  });
});

/**
 * Get contacts by project ID
 * @route GET /api/admin/projects/:projectId/contacts
 */
export const getProjectContacts = catchAsyncErrors(async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  const result = await ProjectModel.getProjectContacts(projectId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch contacts', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data,
    count: result.data?.length || 0
  });
});

/**
 * Get all contacts
 * @route GET /api/admin/contacts
 */
export const getAllProjectContacts = catchAsyncErrors(async (req, res, next) => {
  const filters = {
    page: safeParseInt(req.query.page, 1),
    limit: getSafeLimit(req.query.limit, 20, 100)
  };

  const result = await ProjectModel.getAllProjectContacts(filters);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch contacts', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// ============================================
// STATS & UTILITY CONTROLLERS
// ============================================

/**
 * Get project statistics
 * @route GET /api/admin/projects/stats
 */
export const getProjectStats = catchAsyncErrors(async (req, res, next) => {
  const result = await ProjectModel.getProjectStats();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch stats', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

/**
 * Check slug availability
 * @route GET /api/projects/check-slug
 */
export const checkSlugAvailability = catchAsyncErrors(async (req, res, next) => {
  const { slug, excludeId } = req.query;

  if (!slug || slug.trim() === '') {
    return next(new ErrorHandler('Slug is required', 400));
  }

  const result = await ProjectModel.checkSlugAvailability(slug.trim(), excludeId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to check slug', 500));
  }

  res.status(200).json({
    success: true,
    available: result.available,
    slug: slug.trim()
  });
});

// ============================================
// PROJECT DATA (SUB-COMMUNITY) CONTROLLERS
// ============================================

/**
 * Get project data by sub-community
 * @route GET /api/project-data/sub-community/:subCommunityId
 */
export const getProjectDataBySubCommunity = catchAsyncErrors(async (req, res, next) => {
  const { subCommunityId } = req.params;

  if (!subCommunityId) {
    return next(new ErrorHandler('Sub-community ID is required', 400));
  }

  const result = await ProjectModel.getProjectDataBySubCommunity(subCommunityId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch project data', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data,
    count: result.data?.length || 0
  });
});

/**
 * Create project data
 * @route POST /api/admin/project-data
 */
export const createProjectData = catchAsyncErrors(async (req, res, next) => {
  const { sub_community_id, name, status } = req.body;

  if (!sub_community_id) {
    return next(new ErrorHandler('Sub-community ID is required', 400));
  }

  if (!name || name.trim() === '') {
    return next(new ErrorHandler('Name is required', 400));
  }

  const result = await ProjectModel.createProjectData({
    sub_community_id: safeParseInt(sub_community_id),
    name: name.trim(),
    status: status !== undefined ? safeParseInt(status, 1) : 1
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to create project data', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Project data created successfully',
    id: result.id
  });
});

/**
 * Update project data
 * @route PUT /api/admin/project-data/:id
 */
export const updateProjectData = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { sub_community_id, name, status } = req.body;

  if (!id) {
    return next(new ErrorHandler('Project data ID is required', 400));
  }

  const updateObj = cleanObject({
    sub_community_id: safeParseInt(sub_community_id),
    name: name?.trim(),
    status: status !== undefined ? safeParseInt(status) : undefined
  });

  if (Object.keys(updateObj).length === 0) {
    return next(new ErrorHandler('No update data provided', 400));
  }

  const result = await ProjectModel.updateProjectData(id, updateObj);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update project data', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Project data updated successfully'
  });
});

/**
 * Delete project data
 * @route DELETE /api/admin/project-data/:id
 */
export const deleteProjectData = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Project data ID is required', 400));
  }

  const result = await ProjectModel.deleteProjectData(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete project data', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Project data deleted successfully'
  });
});

// ============================================
// EXPORT ALL CONTROLLERS
// ============================================

export default {
  // Public APIs
  getActiveProjects,
  getProjectBySlug,
  getFeaturedProjects,
  getProjectsByCity,
  getProjectsByDeveloper,
  getProjectsByCommunity,
  getSimilarProjects,
  searchProjects,
  getTopViewedProjects,
  
  // Admin APIs
  getAllProjectsAdmin,
  getProjectByIdAdmin,
  createProject,
  updateProject,
  deleteProject,
  hardDeleteProject,
  updateProjectStatus,
  verifyProject,
  toggleFeaturedProject,
  restoreProject,
  bulkUpdateStatus,
  
  // Gallery
  getGalleryByProjectId,
  addGalleryImages,
  deleteGalleryImage,
  
  // Floor Plans
  getFloorPlansByProjectId,
  addFloorPlan,
  deleteFloorPlan,
  
  // Contacts
  createProjectContact,
  getProjectContacts,
  getAllProjectContacts,
  
  // Stats & Utility
  getProjectStats,
  checkSlugAvailability,
  
  // Project Data
  getProjectDataBySubCommunity,
  createProjectData,
  updateProjectData,
  deleteProjectData
};