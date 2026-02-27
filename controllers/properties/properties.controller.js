import * as PropertyModel from '../../models/properties/properties.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 1000,
  FEATURED_LIMIT: 10,
  SIMILAR_LIMIT: 6,
  SEARCH_LIMIT: 20,
  ADMIN_DEFAULT_LIMIT: 25,
  SAVED_LIMIT: 20,
  IMAGE_BASE_PATH: '/uploads/properties',
  GALLERY_PATH: '/uploads/properties/gallery'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get base URL dynamically from request or environment
 */
const getBaseUrl = (req) => {
  // Priority 1: Environment variable (for production)
  if (process.env.API_URL) {
    return process.env.API_URL.replace(/\/$/, ''); // Remove trailing slash
  }

  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, '');
  }

  // Priority 2: From request headers (for proxies/load balancers)
  if (req && req.get) {
    if (req.get('x-forwarded-host')) {
      const protocol = req.get('x-forwarded-proto') || 'https';
      return `${protocol}://${req.get('x-forwarded-host')}`;
    }

    // Priority 3: From request object
    const protocol = req.protocol || 'http';
    const host = req.get('host');
    if (host) {
      return `${protocol}://${host}`;
    }
  }

  // Priority 4: Fallback
  return 'http://localhost:8080';
};

/**
 * Safe limit calculator with min/max constraints
 */
const getSafeLimit = (requestedLimit, defaultLimit = CONFIG.DEFAULT_LIMIT, maxLimit = CONFIG.MAX_LIMIT) => {
  const limit = parseInt(requestedLimit) || defaultLimit;
  return Math.min(Math.max(1, limit), maxLimit);
};

/**
 * Build complete image URL with proper path handling
 */
const buildImageUrl = (imagePath, baseUrl) => {
  if (!imagePath || imagePath === 'null' || imagePath === 'undefined' || imagePath.trim() === '') {
    return null;
  }

  // Already full URL - return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Clean path - remove leading slashes and redundant prefixes
  let cleanPath = imagePath.trim()
    .replace(/^\/+/, '')
    .replace(/^uploads\//, '')
    .replace(/^properties\//, '');

  // Gallery images
  if (cleanPath.startsWith('gallery-') || cleanPath.startsWith('gallery/')) {
    cleanPath = cleanPath.replace(/^gallery\//, '');
    return `${baseUrl}${CONFIG.GALLERY_PATH}/${cleanPath}`;
  }

  // Regular property images
  return `${baseUrl}${CONFIG.IMAGE_BASE_PATH}/${cleanPath}`;
};

/**
 * Generate SEO-friendly slug
 */
const generateSlug = (name) => {
  if (!name || typeof name !== 'string') {
    return `property-${Date.now()}`;
  }
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
    + '-' + Date.now().toString(36);
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
 * Clean object - remove undefined/null/empty values
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
 * Process single property with images
 */
const processPropertyData = (property, baseUrl) => {
  if (!property) return null;

  const primaryImage = property.primaryImage 
    || property.featured_image 
    || property.gallery_thumb 
    || property.media_thumb 
    || null;

  return {
    ...property,
    featured_image: buildImageUrl(property.featured_image, baseUrl),
    gallery_thumb: buildImageUrl(property.gallery_thumb, baseUrl),
    media_thumb: buildImageUrl(property.media_thumb, baseUrl),
    primaryImage: buildImageUrl(primaryImage, baseUrl),
    display_image: buildImageUrl(primaryImage, baseUrl)
  };
};

/**
 * Process multiple properties
 */
const processPropertiesData = (properties, baseUrl) => {
  if (!Array.isArray(properties)) return [];
  return properties.map(prop => processPropertyData(prop, baseUrl)).filter(Boolean);
};

/**
 * Process gallery data
 */
const processGalleryData = (gallery, baseUrl) => {
  if (!gallery || !Array.isArray(gallery)) return [];
  
  return gallery.map(img => ({
    ...img,
    Url: buildImageUrl(img.Url, baseUrl),
    thumbnail: buildImageUrl(img.Url, baseUrl)
  }));
};

/**
 * Process floor plan data
 */
const processFloorPlanData = (floorPlans, baseUrl) => {
  if (!floorPlans || !Array.isArray(floorPlans)) return [];
  
  return floorPlans.map(plan => ({
    ...plan,
    image: buildImageUrl(plan.image, baseUrl)
  }));
};

// ============================================
// PUBLIC API CONTROLLERS
// ============================================

/**
 * Get all active properties with filters
 * @route GET /api/properties
 */
export const getActiveProperties = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  
  const {
    page, limit, city_id, community_id, sub_community_id,
    developer_id, agent_id, listing_type, property_type,
    property_purpose, bedroom, bathrooms, min_price, max_price,
    min_area, max_area, furnishing, featured, search, q,
    sortBy, sortOrder
  } = req.query;

  const filters = {
    page: safeParseInt(page, 1),
    limit: getSafeLimit(limit, CONFIG.DEFAULT_LIMIT),
    city_id: city_id || null,
    community_id: community_id || null,
    sub_community_id: sub_community_id || null,
    developer_id: safeParseInt(developer_id),
    agent_id: safeParseInt(agent_id),
    listing_type: listing_type || null,
    property_type: property_type || null,
    property_purpose: property_purpose || null,
    bedroom: bedroom || null,
    bathrooms: bathrooms || null,
    min_price: safeParseInt(min_price),
    max_price: safeParseInt(max_price),
    min_area: safeParseInt(min_area),
    max_area: safeParseInt(max_area),
    furnishing: furnishing || null,
    featured_property: featured || null,
    search: search || q || null,
    sortBy: sortBy || 'created_at',
    sortOrder: ['ASC', 'DESC'].includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC'
  };

  const result = await PropertyModel.getActiveProperties(filters);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch properties', 500));
  }

  res.status(200).json({
    success: true,
    data: processPropertiesData(result.data, baseUrl),
    pagination: result.pagination,
    filters: {
      applied: Object.keys(filters).filter(k => 
        filters[k] !== null && !['page', 'limit', 'sortBy', 'sortOrder'].includes(k)
      ).length
    }
  });
});

/**
 * Get property by slug
 * @route GET /api/properties/:slug
 */
export const getPropertyBySlug = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  const { slug } = req.params;

  if (!slug || slug.trim() === '') {
    return next(new ErrorHandler('Property slug is required', 400));
  }

  const result = await PropertyModel.getPropertyBySlug(slug.trim());

  if (!result.success || !result.data) {
    return next(new ErrorHandler('Property not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      ...processPropertyData(result.data, baseUrl),
      gallery: processGalleryData(result.data.gallery, baseUrl),
      floorPlans: processFloorPlanData(result.data.floorPlans, baseUrl),
      galleryStats: result.data.galleryStats || null
    }
  });
});

/**
 * Get property by ID
 * @route GET /api/properties/id/:id
 */
export const getPropertyById = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  const result = await PropertyModel.getPropertyById(id);

  if (!result.success || !result.data) {
    return next(new ErrorHandler('Property not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      ...processPropertyData(result.data, baseUrl),
      gallery: processGalleryData(result.data.gallery, baseUrl),
      floorPlans: processFloorPlanData(result.data.floorPlans, baseUrl)
    }
  });
});

/**
 * Get featured properties
 * @route GET /api/properties/featured
 */
export const getFeaturedProperties = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  const limit = getSafeLimit(req.query.limit, CONFIG.FEATURED_LIMIT, 50);

  const result = await PropertyModel.getFeaturedProperties(limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch featured properties', 500));
  }

  res.status(200).json({
    success: true,
    data: processPropertiesData(result.data, baseUrl),
    count: result.data?.length || 0
  });
});

/**
 * Get properties by city
 * @route GET /api/properties/city/:cityId
 */
export const getPropertiesByCity = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  const { cityId } = req.params;
  const limit = getSafeLimit(req.query.limit, 20, 100);

  if (!cityId) {
    return next(new ErrorHandler('City ID is required', 400));
  }

  const result = await PropertyModel.getPropertiesByCity(cityId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch properties', 500));
  }

  res.status(200).json({
    success: true,
    data: processPropertiesData(result.data, baseUrl),
    count: result.data?.length || 0
  });
});

/**
 * Get properties by developer
 * @route GET /api/properties/developer/:developerId
 */
export const getPropertiesByDeveloper = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  const { developerId } = req.params;
  const limit = getSafeLimit(req.query.limit, 20, 100);

  if (!developerId) {
    return next(new ErrorHandler('Developer ID is required', 400));
  }

  const result = await PropertyModel.getPropertiesByDeveloper(developerId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch properties', 500));
  }

  res.status(200).json({
    success: true,
    data: processPropertiesData(result.data, baseUrl),
    count: result.data?.length || 0
  });
});

/**
 * Get properties by community
 * @route GET /api/properties/community/:communityId
 */
export const getPropertiesByCommunity = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  const { communityId } = req.params;
  const limit = getSafeLimit(req.query.limit, 20, 100);

  if (!communityId) {
    return next(new ErrorHandler('Community ID is required', 400));
  }

  const result = await PropertyModel.getPropertiesByCommunity(communityId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch properties', 500));
  }

  res.status(200).json({
    success: true,
    data: processPropertiesData(result.data, baseUrl),
    count: result.data?.length || 0
  });
});

/**
 * Get properties by agent
 * @route GET /api/properties/agent/:agentId
 */
export const getPropertiesByAgent = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  const { agentId } = req.params;
  const limit = getSafeLimit(req.query.limit, 20, 100);

  if (!agentId) {
    return next(new ErrorHandler('Agent ID is required', 400));
  }

  const result = await PropertyModel.getPropertiesByAgent(agentId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch properties', 500));
  }

  res.status(200).json({
    success: true,
    data: processPropertiesData(result.data, baseUrl),
    count: result.data?.length || 0
  });
});

/**
 * Get properties by project
 * @route GET /api/properties/project/:projectId
 */
export const getPropertiesByProject = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  const { projectId } = req.params;
  const limit = getSafeLimit(req.query.limit, 20, 100);

  if (!projectId) {
    return next(new ErrorHandler('Project ID is required', 400));
  }

  const result = await PropertyModel.getPropertiesByProject(projectId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch properties', 500));
  }

  res.status(200).json({
    success: true,
    data: processPropertiesData(result.data, baseUrl),
    count: result.data?.length || 0
  });
});

/**
 * Get similar properties
 * @route GET /api/properties/:propertyId/similar
 */
export const getSimilarProperties = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  const { propertyId } = req.params;
  const limit = getSafeLimit(req.query.limit, CONFIG.SIMILAR_LIMIT, 20);

  if (!propertyId) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  const result = await PropertyModel.getSimilarProperties(propertyId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Property not found', 404));
  }

  res.status(200).json({
    success: true,
    data: processPropertiesData(result.data, baseUrl),
    count: result.data?.length || 0
  });
});

/**
 * Search properties
 * @route GET /api/properties/search
 */
export const searchProperties = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
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

  const result = await PropertyModel.searchProperties(query, {
    limit,
    property_purpose: req.query.property_purpose,
    listing_type: req.query.listing_type
  });

  if (!result.success) {
    return next(new ErrorHandler('Search failed', 500));
  }

  res.status(200).json({
    success: true,
    data: processPropertiesData(result.data, baseUrl),
    count: result.data?.length || 0,
    query: query
  });
});

/**
 * Get properties for rent
 * @route GET /api/properties/for-rent
 */
export const getPropertiesForRent = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  
  const {
    page, limit, city_id, community_id, property_type,
    bedroom, min_price, max_price, furnishing, sortBy, sortOrder
  } = req.query;

  const filters = {
    page: safeParseInt(page, 1),
    limit: getSafeLimit(limit, CONFIG.DEFAULT_LIMIT),
    city_id: city_id || null,
    community_id: community_id || null,
    property_type: property_type || null,
    bedroom: bedroom || null,
    min_price: safeParseInt(min_price),
    max_price: safeParseInt(max_price),
    furnishing: furnishing || null,
    sortBy: sortBy || 'created_at',
    sortOrder: ['ASC', 'DESC'].includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC'
  };

  const result = await PropertyModel.getPropertiesForRent(filters);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch rental properties', 500));
  }

  res.status(200).json({
    success: true,
    data: processPropertiesData(result.data, baseUrl),
    pagination: result.pagination
  });
});

/**
 * Get properties for sale
 * @route GET /api/properties/for-sale
 */
export const getPropertiesForSale = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  
  const {
    page, limit, city_id, community_id, property_type,
    bedroom, min_price, max_price, furnishing, sortBy, sortOrder
  } = req.query;

  const filters = {
    page: safeParseInt(page, 1),
    limit: getSafeLimit(limit, CONFIG.DEFAULT_LIMIT),
    city_id: city_id || null,
    community_id: community_id || null,
    property_type: property_type || null,
    bedroom: bedroom || null,
    min_price: safeParseInt(min_price),
    max_price: safeParseInt(max_price),
    furnishing: furnishing || null,
    sortBy: sortBy || 'created_at',
    sortOrder: ['ASC', 'DESC'].includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC'
  };

  const result = await PropertyModel.getPropertiesForSale(filters);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch sale properties', 500));
  }

  res.status(200).json({
    success: true,
    data: processPropertiesData(result.data, baseUrl),
    pagination: result.pagination
  });
});

/**
 * Get top viewed properties
 * @route GET /api/properties/top-viewed
 */
export const getTopViewedProperties = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  const limit = getSafeLimit(req.query.limit, 10, 50);

  const result = await PropertyModel.getTopViewedProperties(limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch properties', 500));
  }

  res.status(200).json({
    success: true,
    data: processPropertiesData(result.data, baseUrl),
    count: result.data?.length || 0
  });
});

// ============================================
// ADMIN CONTROLLERS
// ============================================

/**
 * Get all properties for admin
 * @route GET /api/admin/properties
 */
export const getAllPropertiesAdmin = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  
  const {
    page, limit, status, city_id, community_id, developer_id,
    agent_id, listing_type, property_type, property_purpose,
    featured, search, q, sortBy, sortOrder
  } = req.query;

  const filters = {
    page: safeParseInt(page, 1),
    limit: getSafeLimit(limit, CONFIG.ADMIN_DEFAULT_LIMIT, 500),
    status: status !== undefined ? safeParseInt(status) : null,
    city_id: city_id || null,
    community_id: community_id || null,
    developer_id: safeParseInt(developer_id),
    agent_id: safeParseInt(agent_id),
    listing_type: listing_type || null,
    property_type: property_type || null,
    property_purpose: property_purpose || null,
    featured_property: featured || null,
    search: search || q || null,
    sortBy: sortBy || 'created_at',
    sortOrder: ['ASC', 'DESC'].includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC'
  };

  const result = await PropertyModel.getAllPropertiesAdmin(filters);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch properties', 500));
  }

  res.status(200).json({
    success: true,
    data: processPropertiesData(result.data, baseUrl),
    pagination: result.pagination
  });
});

/**
 * Get property by ID for admin
 * @route GET /api/admin/properties/:id
 */
export const getPropertyByIdAdmin = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  const result = await PropertyModel.getPropertyByIdAdmin(id);

  if (!result.success || !result.data) {
    return next(new ErrorHandler('Property not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      ...processPropertyData(result.data, baseUrl),
      gallery: processGalleryData(result.data.gallery, baseUrl),
      floorPlans: processFloorPlanData(result.data.floorPlans, baseUrl)
    }
  });
});

/**
 * Create new property
 * @route POST /api/admin/properties
 */
export const createProperty = catchAsyncErrors(async (req, res, next) => {
  const {
    property_name, description, listing_type, property_type,
    property_purpose, price, price_end, askprice, currency_id,
    bedroom, bathrooms, area, area_end, area_size, city_id,
    state_id, community_id, sub_community_id, developer_id,
    agent_id, project_id, location, address, map_latitude,
    map_longitude, pincode, landmark, country, building,
    floor_no, furnishing, flooring, parking, amenities,
    property_features, featured_property, status, video_url,
    whatsapp_url, dld_permit, Spa_number, ReraNumber, keyword,
    seo_title, meta_description, canonical_tags, metadata,
    prices, locationData, gallery, floorPlans
  } = req.body;

  if (!property_name || property_name.trim() === '') {
    return next(new ErrorHandler('Property name is required', 400));
  }

  let featured_image = null;
  if (req.files?.featured_image?.[0]) {
    featured_image = req.files.featured_image[0].filename;
  }

  const propertyData = cleanObject({
    property_name: property_name.trim(),
    description,
    listing_type,
    property_type,
    property_purpose,
    price: safeParseInt(price),
    price_end,
    askprice,
    currency_id: safeParseInt(currency_id),
    bedroom,
    bathrooms,
    area: safeParseInt(area),
    area_end,
    area_size,
    city_id: safeParseInt(city_id),
    state_id: safeParseInt(state_id),
    community_id: safeParseInt(community_id),
    sub_community_id: safeParseInt(sub_community_id),
    developer_id: safeParseInt(developer_id),
    agent_id: safeParseInt(agent_id),
    project_id: safeParseInt(project_id),
    location,
    address,
    map_latitude,
    map_longitude,
    pincode,
    landmark,
    country: country || 'UAE',
    building,
    floor_no: safeParseInt(floor_no),
    furnishing,
    flooring,
    parking,
    amenities: typeof amenities === 'object' ? JSON.stringify(amenities) : amenities,
    property_features: typeof property_features === 'object' ? JSON.stringify(property_features) : property_features,
    featured_property: featured_property || '0',
    status: status !== undefined ? safeParseInt(status, 1) : 1,
    video_url,
    whatsapp_url,
    dld_permit,
    Spa_number,
    ReraNumber,
    keyword,
    seo_title,
    meta_description,
    canonical_tags,
    featured_image,
    property_slug: generateSlug(property_name),
    user_id: req.user?.id || null
  });

  const relatedData = {};
  if (metadata && typeof metadata === 'object') relatedData.metadata = metadata;
  if (prices && typeof prices === 'object') relatedData.prices = prices;
  if (locationData && typeof locationData === 'object') relatedData.location = locationData;
  if (gallery && Array.isArray(gallery)) relatedData.gallery = gallery;
  if (floorPlans && Array.isArray(floorPlans)) relatedData.floorPlans = floorPlans;

  const result = await PropertyModel.createProperty(propertyData, relatedData);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to create property', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Property created successfully',
    propertyId: result.propertyId,
    slug: result.slug,
    refNumber: result.refNumber
  });
});

/**
 * Update property
 * @route PUT /api/admin/properties/:id
 */
export const updateProperty = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  const allowedFields = [
    'property_name', 'description', 'listing_type', 'property_type',
    'property_purpose', 'price', 'price_end', 'askprice', 'currency_id',
    'bedroom', 'bathrooms', 'area', 'area_end', 'area_size', 'city_id',
    'state_id', 'community_id', 'sub_community_id', 'developer_id',
    'agent_id', 'project_id', 'location', 'address', 'map_latitude',
    'map_longitude', 'pincode', 'landmark', 'country', 'building',
    'floor_no', 'furnishing', 'flooring', 'parking', 'amenities',
    'property_features', 'featured_property', 'status', 'video_url',
    'whatsapp_url', 'dld_permit', 'Spa_number', 'ReraNumber', 'keyword',
    'seo_title', 'meta_description', 'canonical_tags', 'property_slug'
  ];

  const intFields = ['price', 'currency_id', 'area', 'city_id', 'state_id', 
    'community_id', 'sub_community_id', 'developer_id', 'agent_id', 
    'project_id', 'floor_no', 'status'];

  const updateData = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (intFields.includes(field)) {
        updateData[field] = safeParseInt(req.body[field]);
      } else if (['amenities', 'property_features'].includes(field) && typeof req.body[field] === 'object') {
        updateData[field] = JSON.stringify(req.body[field]);
      } else {
        updateData[field] = req.body[field];
      }
    }
  });

  if (req.files?.featured_image?.[0]) {
    updateData.featured_image = req.files.featured_image[0].filename;
  }

  const relatedUpdates = {};
  const { metadata, prices, locationData, gallery, floorPlans } = req.body;
  
  if (metadata && typeof metadata === 'object') relatedUpdates.metadata = metadata;
  if (prices && typeof prices === 'object') relatedUpdates.prices = prices;
  if (locationData && typeof locationData === 'object') relatedUpdates.location = locationData;
  if (gallery && Array.isArray(gallery)) relatedUpdates.gallery = gallery;
  if (floorPlans && Array.isArray(floorPlans)) relatedUpdates.floorPlans = floorPlans;

  if (Object.keys(updateData).length === 0 && Object.keys(relatedUpdates).length === 0) {
    return next(new ErrorHandler('No update data provided', 400));
  }

  const result = await PropertyModel.updateProperty(id, updateData, relatedUpdates);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update property', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Property updated successfully'
  });
});

/**
 * Soft delete property
 * @route DELETE /api/admin/properties/:id
 */
export const deleteProperty = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  const result = await PropertyModel.deleteProperty(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete property', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Property deleted successfully'
  });
});

/**
 * Permanently delete property
 * @route DELETE /api/admin/properties/:id/permanent
 */
export const hardDeleteProperty = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  const result = await PropertyModel.hardDeleteProperty(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete property', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Property permanently deleted'
  });
});

/**
 * Update property status
 * @route PATCH /api/admin/properties/:id/status
 */
export const updatePropertyStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  if (status === undefined || status === null) {
    return next(new ErrorHandler('Status is required', 400));
  }

  const result = await PropertyModel.updatePropertyStatus(id, safeParseInt(status, 0));

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update status', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Status updated successfully'
  });
});

/**
 * Toggle featured property
 * @route PATCH /api/admin/properties/:id/featured
 */
export const toggleFeaturedProperty = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { featured } = req.body;

  if (!id) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  const result = await PropertyModel.toggleFeaturedProperty(id, featured);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update featured status', 404));
  }

  res.status(200).json({
    success: true,
    message: result.message || 'Featured status updated'
  });
});

/**
 * Restore deleted property
 * @route PATCH /api/admin/properties/:id/restore
 */
export const restoreProperty = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  const result = await PropertyModel.restoreProperty(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to restore property', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Property restored successfully'
  });
});

/**
 * Bulk update property status
 * @route PATCH /api/admin/properties/bulk/status
 */
export const bulkUpdateStatus = catchAsyncErrors(async (req, res, next) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorHandler('Property IDs array is required', 400));
  }

  if (ids.length > 100) {
    return next(new ErrorHandler('Maximum 100 properties can be updated at once', 400));
  }

  if (status === undefined || status === null) {
    return next(new ErrorHandler('Status is required', 400));
  }

  const result = await PropertyModel.bulkUpdateStatus(ids, safeParseInt(status, 0));

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update properties', 400));
  }

  res.status(200).json({
    success: true,
    message: result.message || 'Properties updated successfully',
    affectedRows: result.affectedRows
  });
});

// ============================================
// GALLERY CONTROLLERS
// ============================================

/**
 * Get gallery by property ID
 * @route GET /api/properties/:propertyId/gallery
 */
export const getGalleryByPropertyId = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  const { propertyId } = req.params;

  if (!propertyId) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  const result = await PropertyModel.getGalleryByPropertyId(propertyId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch gallery', 500));
  }

  res.status(200).json({
    success: true,
    data: processGalleryData(result.data, baseUrl),
    count: result.data?.length || 0
  });
});

/**
 * Add gallery images
 * @route POST /api/admin/properties/:propertyId/gallery
 */
export const addGalleryImages = catchAsyncErrors(async (req, res, next) => {
  const { propertyId } = req.params;

  if (!propertyId) {
    return next(new ErrorHandler('Property ID is required', 400));
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

  const addedBy = req.user ? req.user.email : 'admin';

  const result = await PropertyModel.addGalleryImages(propertyId, images, addedBy);

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

  const result = await PropertyModel.deleteGalleryImage(imageId);

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
 * Get floor plans by property ID
 * @route GET /api/properties/:propertyId/floor-plans
 */
export const getFloorPlansByPropertyId = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  const { propertyId } = req.params;

  if (!propertyId) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  const result = await PropertyModel.getFloorPlansByPropertyId(propertyId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch floor plans', 500));
  }

  res.status(200).json({
    success: true,
    data: processFloorPlanData(result.data, baseUrl),
    count: result.data?.length || 0
  });
});

/**
 * Add floor plan
 * @route POST /api/admin/properties/:propertyId/floor-plans
 */
export const addFloorPlan = catchAsyncErrors(async (req, res, next) => {
  const { propertyId } = req.params;
  const { title, description } = req.body;

  if (!propertyId) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  let image = null;

  if (req.file) {
    image = req.file.filename;
  } else if (req.body.image) {
    image = req.body.image;
  }

  const result = await PropertyModel.addFloorPlan(propertyId, {
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

  const result = await PropertyModel.deleteFloorPlan(floorPlanId);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete floor plan', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Floor plan deleted successfully'
  });
});

// ============================================
// SAVED PROPERTIES (USER FAVORITES)
// ============================================

/**
 * Save property to favorites
 * @route POST /api/properties/:propertyId/save
 */
export const saveProperty = catchAsyncErrors(async (req, res, next) => {
  const { propertyId } = req.params;
  const userId = req.user.id;

  if (!propertyId) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  const result = await PropertyModel.saveProperty(userId, propertyId);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to save property', 400));
  }

  res.status(201).json({
    success: true,
    message: 'Property saved successfully'
  });
});

/**
 * Remove property from favorites
 * @route DELETE /api/properties/:propertyId/save
 */
export const unsaveProperty = catchAsyncErrors(async (req, res, next) => {
  const { propertyId } = req.params;
  const userId = req.user.id;

  if (!propertyId) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  const result = await PropertyModel.unsaveProperty(userId, propertyId);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to unsave property', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Property removed from saved'
  });
});

/**
 * Get user's saved properties
 * @route GET /api/properties/saved
 */
export const getSavedProperties = catchAsyncErrors(async (req, res, next) => {
  const baseUrl = getBaseUrl(req);
  const userId = req.user.id;
  const page = safeParseInt(req.query.page, 1);
  const limit = getSafeLimit(req.query.limit, CONFIG.SAVED_LIMIT, 100);

  const result = await PropertyModel.getSavedProperties(userId, page, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch saved properties', 500));
  }

  res.status(200).json({
    success: true,
    data: processPropertiesData(result.data, baseUrl),
    pagination: result.pagination
  });
});

/**
 * Check if property is saved
 * @route GET /api/properties/:propertyId/saved
 */
export const checkPropertySaved = catchAsyncErrors(async (req, res, next) => {
  const { propertyId } = req.params;
  const userId = req.user.id;

  if (!propertyId) {
    return next(new ErrorHandler('Property ID is required', 400));
  }

  const result = await PropertyModel.checkPropertySaved(userId, propertyId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to check saved status', 500));
  }

  res.status(200).json({
    success: true,
    isSaved: result.isSaved
  });
});

// ============================================
// STATS & UTILITY CONTROLLERS
// ============================================

/**
 * Get property statistics
 * @route GET /api/admin/properties/stats
 */
export const getPropertyStats = catchAsyncErrors(async (req, res, next) => {
  const result = await PropertyModel.getPropertyStats();

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
 * @route GET /api/properties/check-slug
 */
export const checkSlugAvailability = catchAsyncErrors(async (req, res, next) => {
  const { slug, excludeId } = req.query;

  if (!slug || slug.trim() === '') {
    return next(new ErrorHandler('Slug is required', 400));
  }

  const result = await PropertyModel.checkSlugAvailability(slug.trim(), excludeId);

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
// MASTER DATA CONTROLLERS
// ============================================

/**
 * Get property types
 * @route GET /api/property-types
 */
export const getPropertyTypes = catchAsyncErrors(async (req, res, next) => {
  const result = await PropertyModel.getPropertyTypes();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch property types', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data,
    count: result.data?.length || 0
  });
});

/**
 * Get property sub types
 * @route GET /api/property-sub-types
 */
export const getPropertySubTypes = catchAsyncErrors(async (req, res, next) => {
  const result = await PropertyModel.getPropertySubTypes();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch property sub types', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data,
    count: result.data?.length || 0
  });
});

/**
 * Get property list types
 * @route GET /api/property-list-types
 */
export const getPropertyListTypes = catchAsyncErrors(async (req, res, next) => {
  const result = await PropertyModel.getPropertyListTypes();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch property list types', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data,
    count: result.data?.length || 0
  });
});

/**
 * Get private amenities
 * @route GET /api/amenities/private
 */
export const getPrivateAmenities = catchAsyncErrors(async (req, res, next) => {
  const result = await PropertyModel.getPrivateAmenities();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch amenities', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data,
    count: result.data?.length || 0
  });
});

/**
 * Get commercial amenities
 * @route GET /api/amenities/commercial
 */
export const getCommercialAmenities = catchAsyncErrors(async (req, res, next) => {
  const result = await PropertyModel.getCommercialAmenities();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch amenities', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data,
    count: result.data?.length || 0
  });
});

/**
 * Create property type
 * @route POST /api/admin/property-types
 */
export const createPropertyType = catchAsyncErrors(async (req, res, next) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return next(new ErrorHandler('Name is required', 400));
  }

  const result = await PropertyModel.createPropertyType(name.trim());

  if (!result.success) {
    return next(new ErrorHandler('Failed to create property type', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Property type created successfully',
    id: result.id
  });
});

/**
 * Create property sub type
 * @route POST /api/admin/property-sub-types
 */
export const createPropertySubType = catchAsyncErrors(async (req, res, next) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return next(new ErrorHandler('Name is required', 400));
  }

  const result = await PropertyModel.createPropertySubType(name.trim());

  if (!result.success) {
    return next(new ErrorHandler('Failed to create property sub type', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Property sub type created successfully',
    id: result.id
  });
});

/**
 * Create amenity
 * @route POST /api/admin/amenities
 */
export const createAmenity = catchAsyncErrors(async (req, res, next) => {
  const { name, type } = req.body;

  if (!name || name.trim() === '') {
    return next(new ErrorHandler('Name is required', 400));
  }

  const amenityType = ['private', 'commercial'].includes(type) ? type : 'private';

  const result = await PropertyModel.createAmenity(name.trim(), amenityType);

  if (!result.success) {
    return next(new ErrorHandler('Failed to create amenity', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Amenity created successfully',
    id: result.id
  });
});

/**
 * Delete property type
 * @route DELETE /api/admin/property-types/:id
 */
export const deletePropertyType = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Property type ID is required', 400));
  }

  const result = await PropertyModel.deletePropertyType(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete property type', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Property type deleted successfully'
  });
});

/**
 * Delete amenity
 * @route DELETE /api/admin/amenities/:id
 */
export const deleteAmenity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { type } = req.query;

  if (!id) {
    return next(new ErrorHandler('Amenity ID is required', 400));
  }

  const amenityType = ['private', 'commercial'].includes(type) ? type : 'private';

  const result = await PropertyModel.deleteAmenity(id, amenityType);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete amenity', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Amenity deleted successfully'
  });
});

// ============================================
// EXPORT ALL CONTROLLERS
// ============================================

export default {
  // Public APIs
  getActiveProperties,
  getPropertyBySlug,
  getPropertyById,
  getFeaturedProperties,
  getPropertiesByCity,
  getPropertiesByDeveloper,
  getPropertiesByCommunity,
  getPropertiesByAgent,
  getPropertiesByProject,
  getSimilarProperties,
  searchProperties,
  getPropertiesForRent,
  getPropertiesForSale,
  getTopViewedProperties,
  
  // Admin APIs
  getAllPropertiesAdmin,
  getPropertyByIdAdmin,
  createProperty,
  updateProperty,
  deleteProperty,
  hardDeleteProperty,
  updatePropertyStatus,
  toggleFeaturedProperty,
  restoreProperty,
  bulkUpdateStatus,
  
  // Gallery
  getGalleryByPropertyId,
  addGalleryImages,
  deleteGalleryImage,
  
  // Floor Plans
  getFloorPlansByPropertyId,
  addFloorPlan,
  deleteFloorPlan,
  
  // Saved Properties
  saveProperty,
  unsaveProperty,
  getSavedProperties,
  checkPropertySaved,
  
  // Stats & Utility
  getPropertyStats,
  checkSlugAvailability,
  
  // Master Data
  getPropertyTypes,
  getPropertySubTypes,
  getPropertyListTypes,
  getPrivateAmenities,
  getCommercialAmenities,
  createPropertyType,
  createPropertySubType,
  createAmenity,
  deletePropertyType,
  deleteAmenity
};
