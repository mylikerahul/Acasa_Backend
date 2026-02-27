import * as CitiesModel from '../../models/cities/cities.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

const PORT = process.env.PORT || 8080;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath === 'null' || imagePath === 'undefined') return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;

  let cleanPath = imagePath.trim().replace(/^\/+/, '').replace(/^uploads\//, '').replace(/^cities\//, '');

  return `${API_URL}/uploads/cities/${cleanPath}`;
};

const processCityData = (city) => {
  if (!city) return null;

  return {
    ...city,
    img: buildImageUrl(city.img)
  };
};

const generateSlug = (name) => {
  if (!name) return 'city-' + Date.now();
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

export const getActiveCities = catchAsyncErrors(async (req, res, next) => {
  const result = await CitiesModel.getActiveCities({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    country_id: req.query.country_id,
    state_id: req.query.state_id,
    search: req.query.search || req.query.q,
    sortBy: req.query.sortBy || 'name',
    sortOrder: req.query.sortOrder || 'ASC'
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch cities', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processCityData),
    pagination: result.pagination
  });
});

export const getCityBySlug = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.params;

  if (!slug) {
    return next(new ErrorHandler('City slug is required', 400));
  }

  const result = await CitiesModel.getCityBySlug(slug);

  if (!result.success) {
    return next(new ErrorHandler('City not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      ...processCityData(result.data),
      communities: result.data.communities || []
    }
  });
});

export const getCityById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('City ID is required', 400));
  }

  const result = await CitiesModel.getCityById(id);

  if (!result.success) {
    return next(new ErrorHandler('City not found', 404));
  }

  res.status(200).json({
    success: true,
    data: processCityData(result.data)
  });
});

export const getAllCitiesAdmin = catchAsyncErrors(async (req, res, next) => {
  const result = await CitiesModel.getAllCitiesAdmin({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    status: req.query.status,
    country_id: req.query.country_id,
    state_id: req.query.state_id,
    search: req.query.search || req.query.q,
    sortBy: req.query.sortBy || 'id',
    sortOrder: req.query.sortOrder || 'DESC'
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch cities', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processCityData),
    pagination: result.pagination
  });
});

export const createCity = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    country_id,
    state_id,
    city_data_id,
    latitude,
    longitude,
    description,
    seo_title,
    seo_keywork,
    seo_description,
    status
  } = req.body;

  if (!name) {
    return next(new ErrorHandler('City name is required', 400));
  }

  let img = null;

  if (req.file) {
    img = req.file.filename;
  } else if (req.body.img) {
    img = req.body.img;
  }

  const cityData = {
    name,
    slug: generateSlug(name),
    country_id: country_id ? parseInt(country_id) : null,
    state_id: state_id ? parseInt(state_id) : null,
    city_data_id: city_data_id ? parseInt(city_data_id) : null,
    latitude,
    longitude,
    img,
    description,
    seo_title,
    seo_keywork,
    seo_description,
    status: status || '1'
  };

  Object.keys(cityData).forEach(key => {
    if (cityData[key] === undefined || cityData[key] === '') {
      delete cityData[key];
    }
  });

  const result = await CitiesModel.createCity(cityData);

  if (!result.success) {
    return next(new ErrorHandler('Failed to create city', 500));
  }

  res.status(201).json({
    success: true,
    message: 'City created successfully',
    cityId: result.cityId,
    slug: result.slug
  });
});

export const updateCity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('City ID is required', 400));
  }

  const {
    name,
    slug,
    country_id,
    state_id,
    city_data_id,
    latitude,
    longitude,
    description,
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
  if (city_data_id !== undefined) updateData.city_data_id = parseInt(city_data_id);
  if (latitude !== undefined) updateData.latitude = latitude;
  if (longitude !== undefined) updateData.longitude = longitude;
  if (description !== undefined) updateData.description = description;
  if (seo_title !== undefined) updateData.seo_title = seo_title;
  if (seo_keywork !== undefined) updateData.seo_keywork = seo_keywork;
  if (seo_description !== undefined) updateData.seo_description = seo_description;
  if (status !== undefined) updateData.status = status;

  if (req.file) {
    updateData.img = req.file.filename;
  } else if (req.body.img) {
    updateData.img = req.body.img;
  }

  if (Object.keys(updateData).length === 0) {
    return next(new ErrorHandler('No update data provided', 400));
  }

  const result = await CitiesModel.updateCity(id, updateData);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update city', 404));
  }

  res.status(200).json({
    success: true,
    message: 'City updated successfully'
  });
});

export const deleteCity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('City ID is required', 400));
  }

  const result = await CitiesModel.deleteCity(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete city', 404));
  }

  res.status(200).json({
    success: true,
    message: 'City deleted successfully'
  });
});

export const hardDeleteCity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('City ID is required', 400));
  }

  const result = await CitiesModel.hardDeleteCity(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete city', 404));
  }

  res.status(200).json({
    success: true,
    message: 'City permanently deleted'
  });
});

export const updateCityStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return next(new ErrorHandler('City ID is required', 400));
  }

  if (status === undefined || status === null) {
    return next(new ErrorHandler('Status is required', 400));
  }

  const result = await CitiesModel.updateCityStatus(id, status);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update status', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Status updated successfully'
  });
});

export const restoreCity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('City ID is required', 400));
  }

  const result = await CitiesModel.restoreCity(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to restore city', 404));
  }

  res.status(200).json({
    success: true,
    message: 'City restored successfully'
  });
});

export const checkSlugAvailability = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.query;
  const { excludeId } = req.query;

  if (!slug) {
    return next(new ErrorHandler('Slug is required', 400));
  }

  const result = await CitiesModel.checkSlugAvailability(slug, excludeId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to check slug', 500));
  }

  res.status(200).json({
    success: true,
    available: result.available
  });
});

export const getCityData = catchAsyncErrors(async (req, res, next) => {
  const { countryId } = req.params;

  if (!countryId) {
    return next(new ErrorHandler('Country ID is required', 400));
  }

  const result = await CitiesModel.getCityData(countryId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch city data', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const getCountries = catchAsyncErrors(async (req, res, next) => {
  const result = await CitiesModel.getCountries();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch countries', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const getStates = catchAsyncErrors(async (req, res, next) => {
  const { countryId } = req.query;

  const result = await CitiesModel.getStates(countryId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch states', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const getCityStats = catchAsyncErrors(async (req, res, next) => {
  const result = await CitiesModel.getCityStats();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch stats', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const createCityData = catchAsyncErrors(async (req, res, next) => {
  const { country_id, name, description, status } = req.body;

  if (!country_id || !name) {
    return next(new ErrorHandler('Country ID and name are required', 400));
  }

  const result = await CitiesModel.createCityData({ country_id, name, description, status });

  if (!result.success) {
    return next(new ErrorHandler('Failed to create city data', 500));
  }

  res.status(201).json({
    success: true,
    message: 'City data created successfully',
    id: result.id
  });
});

export const updateCityData = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('City data ID is required', 400));
  }

  const updateObj = {};
  if (req.body.country_id !== undefined) updateObj.country_id = req.body.country_id;
  if (req.body.name !== undefined) updateObj.name = req.body.name;
  if (req.body.description !== undefined) updateObj.description = req.body.description;
  if (req.body.status !== undefined) updateObj.status = req.body.status;

  if (Object.keys(updateObj).length === 0) {
    return next(new ErrorHandler('No update data provided', 400));
  }

  const result = await CitiesModel.updateCityData(id, updateObj);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update city data', 404));
  }

  res.status(200).json({
    success: true,
    message: 'City data updated successfully'
  });
});

export const deleteCityData = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('City data ID is required', 400));
  }

  const result = await CitiesModel.deleteCityData(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete city data', 404));
  }

  res.status(200).json({
    success: true,
    message: 'City data deleted successfully'
  });
});

export default {
  getActiveCities,
  getCityBySlug,
  getCityById,
  getAllCitiesAdmin,
  createCity,
  updateCity,
  deleteCity,
  hardDeleteCity,
  updateCityStatus,
  restoreCity,
  checkSlugAvailability,
  getCityData,
  getCountries,
  getStates,
  getCityStats,
  createCityData,
  updateCityData,
  deleteCityData
};