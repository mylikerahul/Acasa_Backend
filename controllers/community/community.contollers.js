import * as CommunityModel from '../../models/community/community.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

const PORT = process.env.PORT || 8080;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath === 'null' || imagePath === 'undefined') return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;

  let cleanPath = imagePath.trim().replace(/^\/+/, '').replace(/^uploads\//, '').replace(/^communities\//, '');

  return `${API_URL}/uploads/communities/${cleanPath}`;
};

const processCommunityData = (community) => {
  if (!community) return null;

  return {
    ...community,
    img: buildImageUrl(community.img),
    school_img: buildImageUrl(community.school_img),
    hotel_img: buildImageUrl(community.hotel_img),
    hospital_img: buildImageUrl(community.hospital_img),
    train_img: buildImageUrl(community.train_img),
    bus_img: buildImageUrl(community.bus_img)
  };
};

const processSubCommunityData = (subCommunity) => {
  if (!subCommunity) return null;

  return {
    ...subCommunity,
    img: buildImageUrl(subCommunity.img)
  };
};

const generateSlug = (name) => {
  if (!name) return 'community-' + Date.now();
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

export const getActiveCommunities = catchAsyncErrors(async (req, res, next) => {
  const result = await CommunityModel.getActiveCommunities({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    city_id: req.query.city_id,
    state_id: req.query.state_id,
    country_id: req.query.country_id,
    featured: req.query.featured,
    search: req.query.search || req.query.q,
    sortBy: req.query.sortBy || 'name',
    sortOrder: req.query.sortOrder || 'ASC'
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch communities', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processCommunityData),
    pagination: result.pagination
  });
});

export const getCommunityBySlug = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.params;

  if (!slug) {
    return next(new ErrorHandler('Community slug is required', 400));
  }

  const result = await CommunityModel.getCommunityBySlug(slug);

  if (!result.success) {
    return next(new ErrorHandler('Community not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      ...processCommunityData(result.data),
      subCommunities: result.data.subCommunities ? result.data.subCommunities.map(processSubCommunityData) : [],
      properties: result.data.properties || [],
      projects: result.data.projects || [],
      relatedBlogs: result.data.relatedBlogs || [],
      similarCommunities: result.data.similarCommunities ? result.data.similarCommunities.map(processCommunityData) : []
    }
  });
});

export const getCommunityById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Community ID is required', 400));
  }

  const result = await CommunityModel.getCommunityById(id);

  if (!result.success) {
    return next(new ErrorHandler('Community not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      ...processCommunityData(result.data),
      subCommunities: result.data.subCommunities ? result.data.subCommunities.map(processSubCommunityData) : []
    }
  });
});

export const getFeaturedCommunities = catchAsyncErrors(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 6;

  const result = await CommunityModel.getFeaturedCommunities(limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch featured communities', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processCommunityData)
  });
});

export const getCommunitiesByCity = catchAsyncErrors(async (req, res, next) => {
  const { cityId } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  if (!cityId) {
    return next(new ErrorHandler('City ID is required', 400));
  }

  const result = await CommunityModel.getCommunitiesByCity(cityId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch communities', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processCommunityData)
  });
});

export const searchCommunities = catchAsyncErrors(async (req, res, next) => {
  const query = req.query.q || req.query.search || '';
  const limit = parseInt(req.query.limit) || 10;

  if (!query.trim()) {
    return res.status(200).json({
      success: true,
      data: []
    });
  }

  const result = await CommunityModel.searchCommunities(query, limit);

  if (!result.success) {
    return next(new ErrorHandler('Search failed', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processCommunityData)
  });
});

export const getCommunityWithHierarchy = catchAsyncErrors(async (req, res, next) => {
  const { communityId } = req.params;

  if (!communityId) {
    return next(new ErrorHandler('Community ID is required', 400));
  }

  const result = await CommunityModel.getCommunityWithHierarchy(communityId);

  if (!result.success) {
    return next(new ErrorHandler('Community not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      ...processCommunityData(result.data),
      subCommunities: result.data.subCommunities ? result.data.subCommunities.map(processSubCommunityData) : [],
      communityData: result.data.communityData || [],
      subCommunityData: result.data.subCommunityData || []
    }
  });
});

export const getLocationDropdowns = catchAsyncErrors(async (req, res, next) => {
  const result = await CommunityModel.getLocationDropdowns({
    city_id: req.query.city_id,
    community_id: req.query.community_id
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch dropdowns', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const getAllCommunitiesAdmin = catchAsyncErrors(async (req, res, next) => {
  const result = await CommunityModel.getAllCommunitiesAdmin({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    status: req.query.status,
    city_id: req.query.city_id,
    state_id: req.query.state_id,
    country_id: req.query.country_id,
    featured: req.query.featured,
    search: req.query.search || req.query.q,
    sortBy: req.query.sortBy || 'id',
    sortOrder: req.query.sortOrder || 'DESC'
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch communities', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processCommunityData),
    pagination: result.pagination
  });
});

export const getCommunityByIdAdmin = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Community ID is required', 400));
  }

  const result = await CommunityModel.getCommunityById(id);

  if (!result.success) {
    return next(new ErrorHandler('Community not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      ...processCommunityData(result.data),
      subCommunities: result.data.subCommunities ? result.data.subCommunities.map(processSubCommunityData) : []
    }
  });
});

export const createCommunity = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    country_id,
    state_id,
    city_id,
    latitude,
    longitude,
    description,
    top_community,
    top_projects,
    featured_project,
    related_blog,
    properties,
    similar_location,
    sales_diretor,
    seo_slug,
    seo_title,
    seo_keywork,
    seo_description,
    featured,
    status
  } = req.body;

  if (!name) {
    return next(new ErrorHandler('Community name is required', 400));
  }

  if (!country_id || !city_id) {
    return next(new ErrorHandler('Country and city are required', 400));
  }

  let img = null;
  let school_img = null;
  let hotel_img = null;
  let hospital_img = null;
  let train_img = null;
  let bus_img = null;

  if (req.files) {
    if (req.files.img && req.files.img[0]) img = req.files.img[0].filename;
    if (req.files.school_img && req.files.school_img[0]) school_img = req.files.school_img[0].filename;
    if (req.files.hotel_img && req.files.hotel_img[0]) hotel_img = req.files.hotel_img[0].filename;
    if (req.files.hospital_img && req.files.hospital_img[0]) hospital_img = req.files.hospital_img[0].filename;
    if (req.files.train_img && req.files.train_img[0]) train_img = req.files.train_img[0].filename;
    if (req.files.bus_img && req.files.bus_img[0]) bus_img = req.files.bus_img[0].filename;
  }

  const communityData = {
    name,
    slug: generateSlug(name),
    country_id: parseInt(country_id),
    state_id: state_id ? parseInt(state_id) : null,
    city_id: parseInt(city_id),
    latitude,
    longitude,
    img,
    school_img,
    hotel_img,
    hospital_img,
    train_img,
    bus_img,
    description,
    top_community,
    top_projects,
    featured_project,
    related_blog,
    properties,
    similar_location,
    sales_diretor,
    seo_slug,
    seo_title,
    seo_keywork,
    seo_description,
    featured: featured ? parseInt(featured) : 0,
    status: status !== undefined ? parseInt(status) : 1
  };

  Object.keys(communityData).forEach(key => {
    if (communityData[key] === undefined || communityData[key] === '') {
      delete communityData[key];
    }
  });

  const result = await CommunityModel.createCommunity(communityData);

  if (!result.success) {
    return next(new ErrorHandler('Failed to create community', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Community created successfully',
    communityId: result.communityId,
    slug: result.slug
  });
});

export const updateCommunity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Community ID is required', 400));
  }

  const {
    name,
    slug,
    country_id,
    state_id,
    city_id,
    latitude,
    longitude,
    description,
    top_community,
    top_projects,
    featured_project,
    related_blog,
    properties,
    similar_location,
    sales_diretor,
    seo_slug,
    seo_title,
    seo_keywork,
    seo_description,
    featured,
    status
  } = req.body;

  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (country_id !== undefined) updateData.country_id = parseInt(country_id);
  if (state_id !== undefined) updateData.state_id = parseInt(state_id);
  if (city_id !== undefined) updateData.city_id = parseInt(city_id);
  if (latitude !== undefined) updateData.latitude = latitude;
  if (longitude !== undefined) updateData.longitude = longitude;
  if (description !== undefined) updateData.description = description;
  if (top_community !== undefined) updateData.top_community = top_community;
  if (top_projects !== undefined) updateData.top_projects = top_projects;
  if (featured_project !== undefined) updateData.featured_project = featured_project;
  if (related_blog !== undefined) updateData.related_blog = related_blog;
  if (properties !== undefined) updateData.properties = properties;
  if (similar_location !== undefined) updateData.similar_location = similar_location;
  if (sales_diretor !== undefined) updateData.sales_diretor = sales_diretor;
  if (seo_slug !== undefined) updateData.seo_slug = seo_slug;
  if (seo_title !== undefined) updateData.seo_title = seo_title;
  if (seo_keywork !== undefined) updateData.seo_keywork = seo_keywork;
  if (seo_description !== undefined) updateData.seo_description = seo_description;
  if (featured !== undefined) updateData.featured = parseInt(featured);
  if (status !== undefined) updateData.status = parseInt(status);

  if (req.files) {
    if (req.files.img && req.files.img[0]) updateData.img = req.files.img[0].filename;
    if (req.files.school_img && req.files.school_img[0]) updateData.school_img = req.files.school_img[0].filename;
    if (req.files.hotel_img && req.files.hotel_img[0]) updateData.hotel_img = req.files.hotel_img[0].filename;
    if (req.files.hospital_img && req.files.hospital_img[0]) updateData.hospital_img = req.files.hospital_img[0].filename;
    if (req.files.train_img && req.files.train_img[0]) updateData.train_img = req.files.train_img[0].filename;
    if (req.files.bus_img && req.files.bus_img[0]) updateData.bus_img = req.files.bus_img[0].filename;
  }

  if (Object.keys(updateData).length === 0) {
    return next(new ErrorHandler('No update data provided', 400));
  }

  const result = await CommunityModel.updateCommunity(id, updateData);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update community', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Community updated successfully'
  });
});

export const deleteCommunity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Community ID is required', 400));
  }

  const result = await CommunityModel.deleteCommunity(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete community', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Community deleted successfully'
  });
});

export const hardDeleteCommunity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Community ID is required', 400));
  }

  const result = await CommunityModel.hardDeleteCommunity(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete community', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Community permanently deleted'
  });
});

export const updateCommunityStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return next(new ErrorHandler('Community ID is required', 400));
  }

  if (status === undefined || status === null) {
    return next(new ErrorHandler('Status is required', 400));
  }

  const result = await CommunityModel.updateCommunityStatus(id, status);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update status', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Status updated successfully'
  });
});

export const toggleFeaturedCommunity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { featured } = req.body;

  if (!id) {
    return next(new ErrorHandler('Community ID is required', 400));
  }

  const result = await CommunityModel.toggleFeaturedCommunity(id, featured);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update featured status', 404));
  }

  res.status(200).json({
    success: true,
    message: result.message
  });
});

export const restoreCommunity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Community ID is required', 400));
  }

  const result = await CommunityModel.restoreCommunity(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to restore community', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Community restored successfully'
  });
});

export const bulkUpdateCommunityStatus = catchAsyncErrors(async (req, res, next) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorHandler('Community IDs array is required', 400));
  }

  if (status === undefined || status === null) {
    return next(new ErrorHandler('Status is required', 400));
  }

  const result = await CommunityModel.bulkUpdateCommunityStatus(ids, status);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update communities', 400));
  }

  res.status(200).json({
    success: true,
    message: result.message,
    affectedRows: result.affectedRows
  });
});

export const getCommunityStats = catchAsyncErrors(async (req, res, next) => {
  const result = await CommunityModel.getCommunityStats();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch stats', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const checkCommunitySlugAvailability = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.query;
  const { excludeId } = req.query;

  if (!slug) {
    return next(new ErrorHandler('Slug is required', 400));
  }

  const result = await CommunityModel.checkCommunitySlugAvailability(slug, excludeId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to check slug', 500));
  }

  res.status(200).json({
    success: true,
    available: result.available
  });
});

export const getActiveSubCommunities = catchAsyncErrors(async (req, res, next) => {
  const result = await CommunityModel.getActiveSubCommunities({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    community_id: req.query.community_id,
    city_id: req.query.city_id,
    state_id: req.query.state_id,
    country_id: req.query.country_id,
    search: req.query.search || req.query.q,
    sortBy: req.query.sortBy || 'name',
    sortOrder: req.query.sortOrder || 'ASC'
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch sub-communities', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processSubCommunityData),
    pagination: result.pagination
  });
});

export const getSubCommunityBySlug = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.params;

  if (!slug) {
    return next(new ErrorHandler('Sub-community slug is required', 400));
  }

  const result = await CommunityModel.getSubCommunityBySlug(slug);

  if (!result.success) {
    return next(new ErrorHandler('Sub-community not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      ...processSubCommunityData(result.data),
      properties: result.data.properties || [],
      projects: result.data.projects || [],
      relatedBlogs: result.data.relatedBlogs || []
    }
  });
});

export const getSubCommunityById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Sub-community ID is required', 400));
  }

  const result = await CommunityModel.getSubCommunityById(id);

  if (!result.success) {
    return next(new ErrorHandler('Sub-community not found', 404));
  }

  res.status(200).json({
    success: true,
    data: processSubCommunityData(result.data)
  });
});

export const getSubCommunitiesByCommunity = catchAsyncErrors(async (req, res, next) => {
  const { communityId } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  if (!communityId) {
    return next(new ErrorHandler('Community ID is required', 400));
  }

  const result = await CommunityModel.getSubCommunitiesByCommunity(communityId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch sub-communities', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processSubCommunityData)
  });
});

export const getSubCommunitiesByCity = catchAsyncErrors(async (req, res, next) => {
  const { cityId } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  if (!cityId) {
    return next(new ErrorHandler('City ID is required', 400));
  }

  const result = await CommunityModel.getSubCommunitiesByCity(cityId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch sub-communities', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processSubCommunityData)
  });
});

export const searchSubCommunities = catchAsyncErrors(async (req, res, next) => {
  const query = req.query.q || req.query.search || '';
  const limit = parseInt(req.query.limit) || 10;

  if (!query.trim()) {
    return res.status(200).json({
      success: true,
      data: []
    });
  }

  const result = await CommunityModel.searchSubCommunities(query, limit);

  if (!result.success) {
    return next(new ErrorHandler('Search failed', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processSubCommunityData)
  });
});

export const getAllSubCommunitiesAdmin = catchAsyncErrors(async (req, res, next) => {
  const result = await CommunityModel.getAllSubCommunitiesAdmin({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    status: req.query.status,
    community_id: req.query.community_id,
    city_id: req.query.city_id,
    search: req.query.search || req.query.q,
    sortBy: req.query.sortBy || 'id',
    sortOrder: req.query.sortOrder || 'DESC'
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch sub-communities', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processSubCommunityData),
    pagination: result.pagination
  });
});

export const getSubCommunityByIdAdmin = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Sub-community ID is required', 400));
  }

  const result = await CommunityModel.getSubCommunityById(id);

  if (!result.success) {
    return next(new ErrorHandler('Sub-community not found', 404));
  }

  res.status(200).json({
    success: true,
    data: processSubCommunityData(result.data)
  });
});

export const createSubCommunity = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    country_id,
    state_id,
    city_id,
    community_id,
    direction,
    latitude,
    longitude,
    description,
    top_community,
    top_projects,
    featured_project,
    related_blog,
    properties,
    similar_location,
    sales_diretor,
    seo_slug,
    seo_title,
    seo_keywork,
    seo_description,
    status
  } = req.body;

  if (!name) {
    return next(new ErrorHandler('Sub-community name is required', 400));
  }

  if (!community_id) {
    return next(new ErrorHandler('Community ID is required', 400));
  }

  let img = null;

  if (req.file) {
    img = req.file.filename;
  } else if (req.body.img) {
    img = req.body.img;
  }

  const subCommunityData = {
    name,
    slug: generateSlug(name),
    country_id: country_id ? parseInt(country_id) : null,
    state_id: state_id ? parseInt(state_id) : null,
    city_id: city_id ? parseInt(city_id) : null,
    community_id: parseInt(community_id),
    direction,
    latitude,
    longitude,
    img,
    description,
    top_community,
    top_projects,
    featured_project,
    related_blog,
    properties,
    similar_location,
    sales_diretor: sales_diretor ? parseInt(sales_diretor) : null,
    seo_slug,
    seo_title,
    seo_keywork,
    seo_description,
    status: status !== undefined ? parseInt(status) : 1
  };

  Object.keys(subCommunityData).forEach(key => {
    if (subCommunityData[key] === undefined || subCommunityData[key] === '') {
      delete subCommunityData[key];
    }
  });

  const result = await CommunityModel.createSubCommunity(subCommunityData);

  if (!result.success) {
    return next(new ErrorHandler('Failed to create sub-community', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Sub-community created successfully',
    subCommunityId: result.subCommunityId,
    slug: result.slug
  });
});

export const updateSubCommunity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Sub-community ID is required', 400));
  }

  const {
    name,
    slug,
    country_id,
    state_id,
    city_id,
    community_id,
    direction,
    latitude,
    longitude,
    description,
    top_community,
    top_projects,
    featured_project,
    related_blog,
    properties,
    similar_location,
    sales_diretor,
    seo_slug,
    seo_title,
    seo_keywork,
    seo_description,
    status
  } = req.body;

  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (country_id !== undefined) updateData.country_id = parseInt(country_id);
  if (state_id !== undefined) updateData.state_id = parseInt(state_id);
  if (city_id !== undefined) updateData.city_id = parseInt(city_id);
  if (community_id !== undefined) updateData.community_id = parseInt(community_id);
  if (direction !== undefined) updateData.direction = direction;
  if (latitude !== undefined) updateData.latitude = latitude;
  if (longitude !== undefined) updateData.longitude = longitude;
  if (description !== undefined) updateData.description = description;
  if (top_community !== undefined) updateData.top_community = top_community;
  if (top_projects !== undefined) updateData.top_projects = top_projects;
  if (featured_project !== undefined) updateData.featured_project = featured_project;
  if (related_blog !== undefined) updateData.related_blog = related_blog;
  if (properties !== undefined) updateData.properties = properties;
  if (similar_location !== undefined) updateData.similar_location = similar_location;
  if (sales_diretor !== undefined) updateData.sales_diretor = parseInt(sales_diretor);
  if (seo_slug !== undefined) updateData.seo_slug = seo_slug;
  if (seo_title !== undefined) updateData.seo_title = seo_title;
  if (seo_keywork !== undefined) updateData.seo_keywork = seo_keywork;
  if (seo_description !== undefined) updateData.seo_description = seo_description;
  if (status !== undefined) updateData.status = parseInt(status);

  if (req.file) {
    updateData.img = req.file.filename;
  } else if (req.body.img) {
    updateData.img = req.body.img;
  }

  if (Object.keys(updateData).length === 0) {
    return next(new ErrorHandler('No update data provided', 400));
  }

  const result = await CommunityModel.updateSubCommunity(id, updateData);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update sub-community', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Sub-community updated successfully'
  });
});

export const deleteSubCommunity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Sub-community ID is required', 400));
  }

  const result = await CommunityModel.deleteSubCommunity(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete sub-community', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Sub-community deleted successfully'
  });
});

export const hardDeleteSubCommunity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Sub-community ID is required', 400));
  }

  const result = await CommunityModel.hardDeleteSubCommunity(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete sub-community', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Sub-community permanently deleted'
  });
});

export const updateSubCommunityStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return next(new ErrorHandler('Sub-community ID is required', 400));
  }

  if (status === undefined || status === null) {
    return next(new ErrorHandler('Status is required', 400));
  }

  const result = await CommunityModel.updateSubCommunityStatus(id, status);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update status', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Status updated successfully'
  });
});

export const restoreSubCommunity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Sub-community ID is required', 400));
  }

  const result = await CommunityModel.restoreSubCommunity(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to restore sub-community', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Sub-community restored successfully'
  });
});

export const checkSubCommunitySlugAvailability = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.query;
  const { excludeId } = req.query;

  if (!slug) {
    return next(new ErrorHandler('Slug is required', 400));
  }

  const result = await CommunityModel.checkSubCommunitySlugAvailability(slug, excludeId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to check slug', 500));
  }

  res.status(200).json({
    success: true,
    available: result.available
  });
});

export const getCommunityDataByCity = catchAsyncErrors(async (req, res, next) => {
  const { cityId } = req.params;

  if (!cityId) {
    return next(new ErrorHandler('City ID is required', 400));
  }

  const result = await CommunityModel.getCommunityDataByCity(cityId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch community data', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const createCommunityData = catchAsyncErrors(async (req, res, next) => {
  const { city_id, name, status, state_id } = req.body;

  if (!city_id || !name) {
    return next(new ErrorHandler('City ID and name are required', 400));
  }

  const result = await CommunityModel.createCommunityData({ city_id, name, status, state_id });

  if (!result.success) {
    return next(new ErrorHandler('Failed to create community data', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Community data created successfully',
    id: result.id
  });
});

export const updateCommunityData = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Community data ID is required', 400));
  }

  const updateObj = {};
  if (req.body.city_id !== undefined) updateObj.city_id = req.body.city_id;
  if (req.body.name !== undefined) updateObj.name = req.body.name;
  if (req.body.status !== undefined) updateObj.status = req.body.status;
  if (req.body.state_id !== undefined) updateObj.state_id = req.body.state_id;

  if (Object.keys(updateObj).length === 0) {
    return next(new ErrorHandler('No update data provided', 400));
  }

  const result = await CommunityModel.updateCommunityData(id, updateObj);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update community data', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Community data updated successfully'
  });
});

export const deleteCommunityData = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Community data ID is required', 400));
  }

  const result = await CommunityModel.deleteCommunityData(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete community data', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Community data deleted successfully'
  });
});

export const getSubCommunityDataByCommunity = catchAsyncErrors(async (req, res, next) => {
  const { communityId } = req.params;

  if (!communityId) {
    return next(new ErrorHandler('Community ID is required', 400));
  }

  const result = await CommunityModel.getSubCommunityDataByCommunity(communityId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch sub-community data', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const createSubCommunityData = catchAsyncErrors(async (req, res, next) => {
  const { community_id, name, status } = req.body;

  if (!community_id || !name) {
    return next(new ErrorHandler('Community ID and name are required', 400));
  }

  const result = await CommunityModel.createSubCommunityData({ community_id, name, status });

  if (!result.success) {
    return next(new ErrorHandler('Failed to create sub-community data', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Sub-community data created successfully',
    id: result.id
  });
});

export const updateSubCommunityData = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Sub-community data ID is required', 400));
  }

  const updateObj = {};
  if (req.body.community_id !== undefined) updateObj.community_id = req.body.community_id;
  if (req.body.name !== undefined) updateObj.name = req.body.name;
  if (req.body.status !== undefined) updateObj.status = req.body.status;

  if (Object.keys(updateObj).length === 0) {
    return next(new ErrorHandler('No update data provided', 400));
  }

  const result = await CommunityModel.updateSubCommunityData(id, updateObj);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update sub-community data', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Sub-community data updated successfully'
  });
});

export const deleteSubCommunityData = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Sub-community data ID is required', 400));
  }

  const result = await CommunityModel.deleteSubCommunityData(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete sub-community data', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Sub-community data deleted successfully'
  });
});

export default {
  getActiveCommunities,
  getCommunityBySlug,
  getCommunityById,
  getFeaturedCommunities,
  getCommunitiesByCity,
  searchCommunities,
  getCommunityWithHierarchy,
  getLocationDropdowns,
  getAllCommunitiesAdmin,
  getCommunityByIdAdmin,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  hardDeleteCommunity,
  updateCommunityStatus,
  toggleFeaturedCommunity,
  restoreCommunity,
  bulkUpdateCommunityStatus,
  getCommunityStats,
  checkCommunitySlugAvailability,
  getActiveSubCommunities,
  getSubCommunityBySlug,
  getSubCommunityById,
  getSubCommunitiesByCommunity,
  getSubCommunitiesByCity,
  searchSubCommunities,
  getAllSubCommunitiesAdmin,
  getSubCommunityByIdAdmin,
  createSubCommunity,
  updateSubCommunity,
  deleteSubCommunity,
  hardDeleteSubCommunity,
  updateSubCommunityStatus,
  restoreSubCommunity,
  checkSubCommunitySlugAvailability,
  getCommunityDataByCity,
  createCommunityData,
  updateCommunityData,
  deleteCommunityData,
  getSubCommunityDataByCommunity,
  createSubCommunityData,
  updateSubCommunityData,
  deleteSubCommunityData
};