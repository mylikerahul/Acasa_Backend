import * as BlogModel from '../../models/blogs/blogs.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

const PORT = process.env.PORT || 8080;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath === 'null' || imagePath === 'undefined') return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;

  let cleanPath = imagePath.trim().replace(/^\/+/, '').replace(/^uploads\//, '').replace(/^blogs\//, '');

  return `${API_URL}/uploads/blogs/${cleanPath}`;
};

const processBlogData = (blog) => {
  if (!blog) return null;

  return {
    ...blog,
    imageurl: buildImageUrl(blog.imageurl),
    featured_image: buildImageUrl(blog.imageurl)
  };
};

const generateSlug = (title) => {
  if (!title) return 'blog-' + Date.now();
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

export const getActiveBlogs = catchAsyncErrors(async (req, res, next) => {
  const result = await BlogModel.getActiveBlogs({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    category: req.query.category,
    writer: req.query.writer,
    search: req.query.search || req.query.q,
    sortBy: req.query.sortBy || 'publish_date',
    sortOrder: req.query.sortOrder || 'DESC'
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch blogs', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processBlogData),
    pagination: result.pagination
  });
});

export const getBlogBySlug = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.params;

  if (!slug) {
    return next(new ErrorHandler('Blog slug is required', 400));
  }

  const result = await BlogModel.getBlogBySlug(slug);

  if (!result.success) {
    return next(new ErrorHandler('Blog not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      ...processBlogData(result.data),
      relatedBlogs: result.data.relatedBlogs ? result.data.relatedBlogs.map(processBlogData) : []
    }
  });
});

export const getBlogById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Blog ID is required', 400));
  }

  const result = await BlogModel.getBlogById(id);

  if (!result.success) {
    return next(new ErrorHandler('Blog not found', 404));
  }

  res.status(200).json({
    success: true,
    data: processBlogData(result.data)
  });
});

export const getRecentBlogs = catchAsyncErrors(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;

  const result = await BlogModel.getRecentBlogs(limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch recent blogs', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processBlogData)
  });
});

export const getBlogsByCategory = catchAsyncErrors(async (req, res, next) => {
  const { category } = req.params;
  const limit = parseInt(req.query.limit) || 10;

  if (!category) {
    return next(new ErrorHandler('Category is required', 400));
  }

  const result = await BlogModel.getBlogsByCategory(category, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch blogs', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processBlogData)
  });
});

export const getBlogsByWriter = catchAsyncErrors(async (req, res, next) => {
  const { writerId } = req.params;
  const limit = parseInt(req.query.limit) || 10;

  if (!writerId) {
    return next(new ErrorHandler('Writer ID is required', 400));
  }

  const result = await BlogModel.getBlogsByWriter(writerId, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch blogs', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processBlogData)
  });
});

export const searchBlogs = catchAsyncErrors(async (req, res, next) => {
  const query = req.query.q || req.query.search || '';
  const limit = parseInt(req.query.limit) || 10;

  if (!query.trim()) {
    return res.status(200).json({
      success: true,
      data: []
    });
  }

  const result = await BlogModel.searchBlogs(query, limit);

  if (!result.success) {
    return next(new ErrorHandler('Search failed', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processBlogData)
  });
});

export const getAllCategories = catchAsyncErrors(async (req, res, next) => {
  const result = await BlogModel.getAllCategories();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch categories', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const getArchiveBlogs = catchAsyncErrors(async (req, res, next) => {
  const result = await BlogModel.getArchiveBlogs();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch archives', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export const getBlogsByArchive = catchAsyncErrors(async (req, res, next) => {
  const { year, month } = req.params;
  const limit = parseInt(req.query.limit) || 10;

  if (!year || !month) {
    return next(new ErrorHandler('Year and month are required', 400));
  }

  const result = await BlogModel.getBlogsByArchive(year, month, limit);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch blogs', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processBlogData)
  });
});

export const getPreviousNextBlog = catchAsyncErrors(async (req, res, next) => {
  const { blogId } = req.params;
  const { category } = req.query;

  if (!blogId) {
    return next(new ErrorHandler('Blog ID is required', 400));
  }

  const result = await BlogModel.getPreviousNextBlog(blogId, category);

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch navigation', 500));
  }

  res.status(200).json({
    success: true,
    data: {
      previous: result.data.previous ? processBlogData(result.data.previous) : null,
      next: result.data.next ? processBlogData(result.data.next) : null
    }
  });
});

export const getAllBlogsAdmin = catchAsyncErrors(async (req, res, next) => {
  const result = await BlogModel.getAllBlogsAdmin({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    status: req.query.status,
    category: req.query.category,
    writer: req.query.writer,
    search: req.query.search || req.query.q,
    sortBy: req.query.sortBy || 'created_at',
    sortOrder: req.query.sortOrder || 'DESC'
  });

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch blogs', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data.map(processBlogData),
    pagination: result.pagination
  });
});

export const getBlogByIdAdmin = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Blog ID is required', 400));
  }

  const result = await BlogModel.getBlogById(id);

  if (!result.success) {
    return next(new ErrorHandler('Blog not found', 404));
  }

  res.status(200).json({
    success: true,
    data: processBlogData(result.data)
  });
});

export const createBlog = catchAsyncErrors(async (req, res, next) => {
  const {
    title,
    sub_title,
    writer,
    publish_date,
    category,
    descriptions,
    status,
    seo_title,
    seo_keywork,
    seo_description
  } = req.body;

  if (!title) {
    return next(new ErrorHandler('Title is required', 400));
  }

  if (!category) {
    return next(new ErrorHandler('Category is required', 400));
  }

  if (!descriptions) {
    return next(new ErrorHandler('Description is required', 400));
  }

  let imageurl = null;

  if (req.file) {
    imageurl = req.file.filename;
  } else if (req.body.imageurl) {
    imageurl = req.body.imageurl;
  }

  if (!imageurl) {
    return next(new ErrorHandler('Image is required', 400));
  }

  const blogData = {
    title,
    slug: generateSlug(title),
    sub_title,
    writer: writer || (req.user ? req.user.id : null),
    publish_date: publish_date || new Date().toISOString().split('T')[0],
    category,
    imageurl,
    descriptions,
    status: status !== undefined ? parseInt(status) : 1,
    seo_title: seo_title || title,
    seo_keywork,
    seo_description: seo_description || sub_title
  };

  Object.keys(blogData).forEach(key => {
    if (blogData[key] === undefined || blogData[key] === '') {
      delete blogData[key];
    }
  });

  const result = await BlogModel.createBlog(blogData);

  if (!result.success) {
    return next(new ErrorHandler('Failed to create blog', 500));
  }

  res.status(201).json({
    success: true,
    message: 'Blog created successfully',
    blogId: result.blogId,
    slug: result.slug
  });
});

export const updateBlog = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Blog ID is required', 400));
  }

  const {
    title,
    slug,
    sub_title,
    writer,
    publish_date,
    category,
    descriptions,
    status,
    seo_title,
    seo_keywork,
    seo_description
  } = req.body;

  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (slug !== undefined) updateData.slug = slug;
  if (sub_title !== undefined) updateData.sub_title = sub_title;
  if (writer !== undefined) updateData.writer = writer;
  if (publish_date !== undefined) updateData.publish_date = publish_date;
  if (category !== undefined) updateData.category = category;
  if (descriptions !== undefined) updateData.descriptions = descriptions;
  if (status !== undefined) updateData.status = parseInt(status);
  if (seo_title !== undefined) updateData.seo_title = seo_title;
  if (seo_keywork !== undefined) updateData.seo_keywork = seo_keywork;
  if (seo_description !== undefined) updateData.seo_description = seo_description;

  if (req.file) {
    updateData.imageurl = req.file.filename;
  } else if (req.body.imageurl) {
    updateData.imageurl = req.body.imageurl;
  }

  if (Object.keys(updateData).length === 0) {
    return next(new ErrorHandler('No update data provided', 400));
  }

  const result = await BlogModel.updateBlog(id, updateData);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update blog', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Blog updated successfully'
  });
});

export const deleteBlog = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Blog ID is required', 400));
  }

  const result = await BlogModel.deleteBlog(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete blog', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Blog deleted successfully'
  });
});

export const hardDeleteBlog = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Blog ID is required', 400));
  }

  const result = await BlogModel.hardDeleteBlog(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete blog', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Blog permanently deleted'
  });
});

export const updateBlogStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return next(new ErrorHandler('Blog ID is required', 400));
  }

  if (status === undefined || status === null) {
    return next(new ErrorHandler('Status is required', 400));
  }

  const result = await BlogModel.updateBlogStatus(id, status);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update status', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Status updated successfully'
  });
});

export const restoreBlog = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler('Blog ID is required', 400));
  }

  const result = await BlogModel.restoreBlog(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to restore blog', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Blog restored successfully'
  });
});

export const bulkUpdateStatus = catchAsyncErrors(async (req, res, next) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorHandler('Blog IDs array is required', 400));
  }

  if (status === undefined || status === null) {
    return next(new ErrorHandler('Status is required', 400));
  }

  const result = await BlogModel.bulkUpdateStatus(ids, status);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to update blogs', 400));
  }

  res.status(200).json({
    success: true,
    message: result.message,
    affectedRows: result.affectedRows
  });
});

export const bulkDelete = catchAsyncErrors(async (req, res, next) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorHandler('Blog IDs array is required', 400));
  }

  const result = await BlogModel.bulkDelete(ids);

  if (!result.success) {
    return next(new ErrorHandler(result.message || 'Failed to delete blogs', 400));
  }

  res.status(200).json({
    success: true,
    message: result.message,
    affectedRows: result.affectedRows
  });
});

export const checkSlugAvailability = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.query;
  const { excludeId } = req.query;

  if (!slug) {
    return next(new ErrorHandler('Slug is required', 400));
  }

  const result = await BlogModel.checkSlugAvailability(slug, excludeId);

  if (!result.success) {
    return next(new ErrorHandler('Failed to check slug', 500));
  }

  res.status(200).json({
    success: true,
    available: result.available
  });
});

export const getBlogStats = catchAsyncErrors(async (req, res, next) => {
  const result = await BlogModel.getBlogStats();

  if (!result.success) {
    return next(new ErrorHandler('Failed to fetch stats', 500));
  }

  res.status(200).json({
    success: true,
    data: result.data
  });
});

export default {
  getActiveBlogs,
  getBlogBySlug,
  getBlogById,
  getRecentBlogs,
  getBlogsByCategory,
  getBlogsByWriter,
  searchBlogs,
  getAllCategories,
  getArchiveBlogs,
  getBlogsByArchive,
  getPreviousNextBlog,
  getAllBlogsAdmin,
  getBlogByIdAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
  hardDeleteBlog,
  updateBlogStatus,
  restoreBlog,
  bulkUpdateStatus,
  bulkDelete,
  checkSlugAvailability,
  getBlogStats
};