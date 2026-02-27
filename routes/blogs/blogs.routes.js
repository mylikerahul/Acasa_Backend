import express from 'express';
import * as BlogController from '../../controllers/blogs/blogs.controller.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';
import { createUploader, handleUploadError } from '../../middleware/uploads.js';

const router = express.Router();

const blogUpload = createUploader('blogs', { maxSize: 5 * 1024 * 1024 });

router.get('/', BlogController.getActiveBlogs);

router.get('/search', BlogController.searchBlogs);

router.get('/recent', BlogController.getRecentBlogs);

router.get('/categories', BlogController.getAllCategories);

router.get('/archives', BlogController.getArchiveBlogs);

router.get('/check-slug', BlogController.checkSlugAvailability);

router.get('/category/:category', BlogController.getBlogsByCategory);

router.get('/writer/:writerId', BlogController.getBlogsByWriter);

router.get('/archive/:year/:month', BlogController.getBlogsByArchive);

router.get('/navigation/:blogId', BlogController.getPreviousNextBlog);

router.get('/slug/:slug', BlogController.getBlogBySlug);

router.get('/detail/:id', BlogController.getBlogById);

router.get('/admin/list', isAuthenticated, isAdmin, BlogController.getAllBlogsAdmin);

router.get('/admin/stats', isAuthenticated, isAdmin, BlogController.getBlogStats);

router.get('/admin/:id', isAuthenticated, isAdmin, BlogController.getBlogByIdAdmin);

router.post('/admin/create', isAuthenticated, isAdmin, blogUpload.single('image'), handleUploadError, BlogController.createBlog);

router.put('/admin/update/:id', isAuthenticated, isAdmin, blogUpload.single('image'), handleUploadError, BlogController.updateBlog);

router.delete('/admin/delete/:id', isAuthenticated, isAdmin, BlogController.deleteBlog);

router.delete('/admin/hard-delete/:id', isAuthenticated, isAdmin, BlogController.hardDeleteBlog);

router.patch('/admin/status/:id', isAuthenticated, isAdmin, BlogController.updateBlogStatus);

router.patch('/admin/restore/:id', isAuthenticated, isAdmin, BlogController.restoreBlog);

router.patch('/admin/bulk-status', isAuthenticated, isAdmin, BlogController.bulkUpdateStatus);

router.delete('/admin/bulk-delete', isAuthenticated, isAdmin, BlogController.bulkDelete);

export default router;