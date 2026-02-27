import express from 'express';
import * as UserController from '../../controllers/users/users.controller.js';
import { isAuthenticated, isAdmin } from '../../guards/guards.js';
import { createUploader, handleUploadError } from '../../middleware/uploads.js';

const router = express.Router();

// ==================== UPLOAD CONFIGURATIONS ====================

const avatarUpload = createUploader('users', {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
});

const userUpload = createUploader('users', { maxSize: 5 * 1024 * 1024 });

const documentUpload = createUploader('documents', { maxSize: 10 * 1024 * 1024 });

const uploadFields = userUpload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]);

// ==================== PUBLIC ROUTES ====================

// Auth Routes
router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.post('/google-login', UserController.googleLogin);

// Password Reset Routes
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password/:token', UserController.resetPassword);

// Public User Routes
router.get('/public', UserController.getUsers); // Get public users (status=1, public_permision=1)
router.get('/public/:id', UserController.getUserById); // Get public user by ID

// ==================== AUTHENTICATED ROUTES ====================

// Current User Routes
router.get('/me', isAuthenticated, UserController.getCurrentUser);
router.put('/me', isAuthenticated, UserController.updateUser);
router.put('/me/password', isAuthenticated, UserController.updatePassword);
router.post(
  '/me/photo',
  isAuthenticated,
  avatarUpload.single('photo'),
  handleUploadError,
  UserController.uploadUserPhoto
);

// Logout
router.post('/logout', isAuthenticated, UserController.logout);

// Search Users
router.get('/search', isAuthenticated, UserController.searchUsers);

// User Documents - Authenticated User
router.get('/me/documents', isAuthenticated, UserController.getUserDocuments);
router.post(
  '/me/documents',
  isAuthenticated,
  documentUpload.single('attachment'),
  handleUploadError,
  UserController.createUserDocument
);

// ==================== ADMIN ROUTES ====================

// User Management
router.get('/', isAuthenticated, isAdmin, UserController.getUsers);
router.get('/stats', isAuthenticated, isAdmin, UserController.getUserStats);
router.get('/dashboard-stats', isAuthenticated, isAdmin, UserController.getDashboardStats);
router.post('/', isAuthenticated, isAdmin, UserController.createUser);
router.get('/:id', isAuthenticated, isAdmin, UserController.getUserById);
router.put('/:id', isAuthenticated, isAdmin, UserController.updateUser);
router.delete('/:id', isAuthenticated, isAdmin, UserController.deleteUser);
router.delete('/:id/hard', isAuthenticated, isAdmin, UserController.hardDeleteUser);
router.post('/:id/restore', isAuthenticated, isAdmin, UserController.restoreUser);

// Password Management - Admin
router.put('/:id/password', isAuthenticated, isAdmin, UserController.updatePassword);

// Status Management
router.patch('/:id/status', isAuthenticated, isAdmin, UserController.updateUserStatus);
router.post('/bulk/status', isAuthenticated, isAdmin, UserController.bulkUpdateStatus);

// Photo Upload - Admin
router.post(
  '/:id/photo',
  isAuthenticated,
  isAdmin,
  avatarUpload.single('photo'),
  handleUploadError,
  UserController.uploadUserPhoto
);

// ==================== PERMISSION ROUTES ====================

// User Type Permissions
router.get('/permissions/all', isAuthenticated, isAdmin, UserController.getAllUserPermissions);
router.get('/permissions/:userType', isAuthenticated, isAdmin, UserController.getUserPermissions);
router.post('/permissions', isAuthenticated, isAdmin, UserController.createUserPermission);
router.put('/permissions/:userType', isAuthenticated, isAdmin, UserController.updateUserPermission);

// Individual User Permissions
router.get('/:userId/permissions', isAuthenticated, isAdmin, UserController.getIndividualPermissions);
router.post('/permissions/individual', isAuthenticated, isAdmin, UserController.createIndividualPermission);
router.put('/permissions/individual/:id', isAuthenticated, isAdmin, UserController.updateIndividualPermission);
router.delete('/permissions/individual/:id', isAuthenticated, isAdmin, UserController.deleteIndividualPermission);

// ==================== USER DOCUMENTS ROUTES ====================

// Admin access to user documents
router.get('/:userId/documents', isAuthenticated, isAdmin, UserController.getUserDocuments);
router.get('/documents/:id', isAuthenticated, isAdmin, UserController.getUserDocumentById);
router.post(
  '/:userId/documents',
  isAuthenticated,
  isAdmin,
  documentUpload.single('attachment'),
  handleUploadError,
  UserController.createUserDocument
);
router.put(
  '/documents/:id',
  isAuthenticated,
  isAdmin,
  documentUpload.single('attachment'),
  handleUploadError,
  UserController.updateUserDocument
);
router.delete('/documents/:id', isAuthenticated, isAdmin, UserController.deleteUserDocument);

// Get documents by project
router.get('/projects/:projectId/documents', isAuthenticated, isAdmin, UserController.getDocumentsByProject);

export default router;