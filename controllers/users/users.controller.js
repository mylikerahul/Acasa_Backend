import path from 'path';
import fs from 'fs/promises';
import * as UserModel from "../../models/user/user.model.js";
import { OAuth2Client } from "google-auth-library";
import catchAsyncErrors from "../../middleware/catchAsyncErrors.js";
import ErrorHandler from "../../utils/errorHandler.js";
import { sendToken, logout as jwtLogout, verifyJWT } from "../../utils/jwtToken.js";
import crypto from 'crypto';

const UPLOAD_FOLDERS = {
  user: 'uploads/users',
  admin: 'uploads/admins',
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const googleClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  "postmessage"
);

const PORT = process.env.PORT || 8080;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

// ==================== HELPER FUNCTIONS ====================

const deleteOldImage = async (imagePath) => {
  if (!imagePath || imagePath.startsWith('http')) return;

  try {
    const cleanPath = imagePath.replace(/^\//, '');
    const fullPath = path.join(process.cwd(), 'public', cleanPath);
    await fs.unlink(fullPath);
  } catch (err) {
    // Silent fail
  }
};

const getUploadFolder = (usertype) => {
  const type = usertype?.toLowerCase();
  return type === 'admin' ? UPLOAD_FOLDERS.admin : UPLOAD_FOLDERS.user;
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, confirmation_code, remember_token, ...safeUser } = user;
  return safeUser;
};

const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath === 'null' || imagePath === 'undefined') return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;

  let cleanPath = imagePath.trim().replace(/^\/+/, '').replace(/^uploads\//, '');
  return `${API_URL}/uploads/${cleanPath}`;
};

const processUserData = (user) => {
  if (!user) return null;

  return {
    ...sanitizeUser(user),
    photo: buildImageUrl(user.photo),
    image_icon: buildImageUrl(user.image_icon),
    resume: buildImageUrl(user.resume),
    avatar: buildImageUrl(user.photo || user.image_icon)
  };
};

// ==================== AUTH CONTROLLERS ====================

// Register User
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { full_name, name, email, password, usertype } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required", 400));
  }

  const emailExists = await UserModel.checkEmailExists(email);
  if (emailExists) {
    return next(new ErrorHandler("Email already exists", 400));
  }

  const userData = {
    full_name: full_name || name,
    name: name || full_name,
    email,
    password,
    usertype: usertype || 'user',
    status: 1,
    public_permision: 1
  };

  const user = await UserModel.createUser(userData);

  sendToken(processUserData(user), 201, res, "Registration successful");
});

// Login User
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const user = await UserModel.getUserWithPassword(email);

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  if (user.status === 0) {
    return next(new ErrorHandler("Your account has been deactivated", 403));
  }

  const isPasswordMatched = await UserModel.comparePassword(password, user.password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(processUserData(user), 200, res, "Login successful");
});

// Google Login
export const googleLogin = catchAsyncErrors(async (req, res, next) => {
  const { credential } = req.body;

  if (!credential) {
    return next(new ErrorHandler("Google credential is required", 400));
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: provider_id, email, name, picture } = payload;

    let user = await UserModel.getUserByProviderIdAndProvider(provider_id, 'google');

    if (!user) {
      user = await UserModel.getUserByEmail(email);

      if (user) {
        return next(new ErrorHandler("Email already registered with different login method", 400));
      }

      user = await UserModel.createGoogleUser({
        full_name: name,
        name: name,
        email: email,
        provider_id: provider_id,
        image_icon: picture,
        usertype: 'user',
        status: 1,
        public_permision: 1
      });
    }

    if (user.status === 0) {
      return next(new ErrorHandler("Your account has been deactivated", 403));
    }

    sendToken(processUserData(user), 200, res, "Google login successful");
  } catch (error) {
    return next(new ErrorHandler("Google authentication failed", 401));
  }
});

// Logout
export const logout = catchAsyncErrors(async (req, res, next) => {
  jwtLogout(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

// Get Current User
export const getCurrentUser = catchAsyncErrors(async (req, res, next) => {
  const user = await UserModel.getUserById(req.user.id, true);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user: processUserData(user)
  });
});

// ==================== USER CRUD CONTROLLERS ====================

// Get All Users
export const getUsers = catchAsyncErrors(async (req, res, next) => {
  const filters = {
    usertype: req.query.usertype,
    status: req.query.status,
    country: req.query.country,
    city: req.query.city,
    nationality: req.query.nationality,
    department: req.query.department,
    search: req.query.search,
    orderBy: req.query.orderBy,
    order: req.query.order
  };

  const pagination = {
    page: req.query.page || 1,
    limit: req.query.limit || 20
  };

  const isAdminContext = req.user?.usertype?.toLowerCase() === 'admin';

  const result = await UserModel.getUsers(filters, pagination, isAdminContext);

  res.status(200).json({
    success: true,
    ...result,
    data: result.data.map(processUserData)
  });
});

// Get User By ID
export const getUserById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const isAdminContext = req.user?.usertype?.toLowerCase() === 'admin';

  const user = await UserModel.getUserById(id, isAdminContext);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user: processUserData(user)
  });
});

// Create User (Admin Only)
export const createUser = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  const emailExists = await UserModel.checkEmailExists(email);
  if (emailExists) {
    return next(new ErrorHandler("Email already exists", 400));
  }

  const user = await UserModel.createUser(req.body);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: processUserData(user)
  });
});

// Update User
export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  // Check if user is updating their own profile or is admin
  if (req.user.id !== parseInt(id) && req.user.usertype?.toLowerCase() !== 'admin') {
    return next(new ErrorHandler("You don't have permission to update this user", 403));
  }

  if (req.body.email) {
    const emailExists = await UserModel.checkEmailExists(req.body.email, id);
    if (emailExists) {
      return next(new ErrorHandler("Email already exists", 400));
    }
  }

  const result = await UserModel.updateUser(id, req.body);

  if (!result.success) {
    return next(new ErrorHandler(result.message, 404));
  }

  res.status(200).json({
    success: true,
    message: result.message,
    user: processUserData(result.data)
  });
});

// Update User Password
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  // Check if user is updating their own password or is admin
  if (req.user.id !== parseInt(id) && req.user.usertype?.toLowerCase() !== 'admin') {
    return next(new ErrorHandler("You don't have permission to update this password", 403));
  }

  if (!newPassword) {
    return next(new ErrorHandler("New password is required", 400));
  }

  // If not admin, verify current password
  if (req.user.usertype?.toLowerCase() !== 'admin') {
    if (!currentPassword) {
      return next(new ErrorHandler("Current password is required", 400));
    }

    const user = await UserModel.getUserWithPassword(req.user.email);
    const isPasswordMatched = await UserModel.comparePassword(currentPassword, user.password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Current password is incorrect", 401));
    }
  }

  const result = await UserModel.updateUserPassword(id, newPassword);

  if (!result.success) {
    return next(new ErrorHandler(result.message, 404));
  }

  res.status(200).json({
    success: true,
    message: "Password updated successfully"
  });
});

// Update User Status
export const updateUserStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status === undefined) {
    return next(new ErrorHandler("Status is required", 400));
  }

  const result = await UserModel.updateUserStatus(id, status);

  if (!result.success) {
    return next(new ErrorHandler(result.message, 404));
  }

  res.status(200).json({
    success: true,
    message: result.message
  });
});

// Upload User Photo
export const uploadUserPhoto = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!req.file) {
    return next(new ErrorHandler("Please upload a photo", 400));
  }

  // Check if user is updating their own photo or is admin
  if (req.user.id !== parseInt(id) && req.user.usertype?.toLowerCase() !== 'admin') {
    return next(new ErrorHandler("You don't have permission to update this photo", 403));
  }

  const user = await UserModel.getUserById(id, true);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Delete old photo
  if (user.photo) {
    await deleteOldImage(user.photo);
  }

  const uploadFolder = getUploadFolder(user.usertype);
  const photoPath = `${uploadFolder}/${req.file.filename}`;

  const result = await UserModel.updateUserPhoto(id, photoPath);

  if (!result.success) {
    return next(new ErrorHandler(result.message, 404));
  }

  const updatedUser = await UserModel.getUserById(id, true);

  res.status(200).json({
    success: true,
    message: "Photo uploaded successfully",
    user: processUserData(updatedUser)
  });
});

// Delete User (Soft Delete)
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const result = await UserModel.deleteUser(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message, 404));
  }

  res.status(200).json({
    success: true,
    message: result.message
  });
});

// Hard Delete User
export const hardDeleteUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const user = await UserModel.getUserById(id, true);
  if (user) {
    if (user.photo) await deleteOldImage(user.photo);
    if (user.resume) await deleteOldImage(user.resume);
  }

  const result = await UserModel.hardDeleteUser(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message, 404));
  }

  res.status(200).json({
    success: true,
    message: result.message
  });
});

// Restore User
export const restoreUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const result = await UserModel.restoreUser(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message, 404));
  }

  res.status(200).json({
    success: true,
    message: result.message
  });
});

// Bulk Update Status
export const bulkUpdateStatus = catchAsyncErrors(async (req, res, next) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorHandler("User IDs are required", 400));
  }

  if (status === undefined) {
    return next(new ErrorHandler("Status is required", 400));
  }

  const result = await UserModel.bulkUpdateStatus(ids, status);

  res.status(200).json({
    success: true,
    message: result.message,
    affectedRows: result.affectedRows
  });
});

// Search Users
export const searchUsers = catchAsyncErrors(async (req, res, next) => {
  const { q, usertype, limit } = req.query;

  if (!q) {
    return next(new ErrorHandler("Search query is required", 400));
  }

  const filters = { usertype };
  const result = await UserModel.searchUsers(q, filters, limit);

  res.status(200).json({
    success: true,
    data: result.data.map(processUserData)
  });
});

// Get User Stats
export const getUserStats = catchAsyncErrors(async (req, res, next) => {
  const result = await UserModel.getUserStats();

  res.status(200).json({
    success: true,
    stats: result.data
  });
});

// Get Dashboard Stats
export const getDashboardStats = catchAsyncErrors(async (req, res, next) => {
  const result = await UserModel.getDashboardStats();

  res.status(200).json({
    success: true,
    stats: result.data
  });
});

// ==================== PASSWORD RESET CONTROLLERS ====================

// Forgot Password
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Email is required", 400));
  }

  const user = await UserModel.getUserByEmail(email);

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  await UserModel.createPasswordReset(email, hashedToken);

  // TODO: Send email with reset token
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  res.status(200).json({
    success: true,
    message: "Password reset email sent",
    resetToken, // Remove this in production
    resetUrl    // Remove this in production
  });
});

// Reset Password
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new ErrorHandler("Password is required", 400));
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const passwordReset = await UserModel.getPasswordResetByToken(hashedToken);

  if (!passwordReset) {
    return next(new ErrorHandler("Invalid or expired reset token", 400));
  }

  // Check if token is expired (24 hours)
  const tokenAge = Date.now() - new Date(passwordReset.created_at).getTime();
  if (tokenAge > 24 * 60 * 60 * 1000) {
    await UserModel.deletePasswordReset(passwordReset.email);
    return next(new ErrorHandler("Reset token has expired", 400));
  }

  const user = await UserModel.getUserByEmail(passwordReset.email);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  await UserModel.updateUserPassword(user.id, password);
  await UserModel.deletePasswordReset(passwordReset.email);

  res.status(200).json({
    success: true,
    message: "Password reset successful"
  });
});

// ==================== PERMISSION CONTROLLERS ====================

// Get User Permissions by User Type
export const getUserPermissions = catchAsyncErrors(async (req, res, next) => {
  const { userType } = req.params;

  const permissions = await UserModel.getUserPermissionByUserType(userType);

  if (!permissions) {
    return next(new ErrorHandler("Permissions not found", 404));
  }

  res.status(200).json({
    success: true,
    permissions
  });
});

// Create User Permission
export const createUserPermission = catchAsyncErrors(async (req, res, next) => {
  const result = await UserModel.createUserPermission(req.body);

  res.status(201).json({
    success: true,
    message: result.message,
    id: result.id
  });
});

// Update User Permission
export const updateUserPermission = catchAsyncErrors(async (req, res, next) => {
  const { userType } = req.params;

  const result = await UserModel.updateUserPermission(userType, req.body);

  if (!result.success) {
    return next(new ErrorHandler(result.message, 404));
  }

  res.status(200).json({
    success: true,
    message: result.message
  });
});

// Get All User Permissions
export const getAllUserPermissions = catchAsyncErrors(async (req, res, next) => {
  const result = await UserModel.getAllUserPermissions();

  res.status(200).json({
    success: true,
    permissions: result.data
  });
});

// Get Individual Permissions by User ID
export const getIndividualPermissions = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  const result = await UserModel.getIndividualPermissionsByUserId(userId);

  res.status(200).json({
    success: true,
    permissions: result.data
  });
});

// Create Individual Permission
export const createIndividualPermission = catchAsyncErrors(async (req, res, next) => {
  const result = await UserModel.createIndividualPermission(req.body);

  res.status(201).json({
    success: true,
    message: result.message,
    id: result.id
  });
});

// Update Individual Permission
export const updateIndividualPermission = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const result = await UserModel.updateIndividualPermission(id, req.body);

  if (!result.success) {
    return next(new ErrorHandler(result.message, 404));
  }

  res.status(200).json({
    success: true,
    message: result.message
  });
});

// Delete Individual Permission
export const deleteIndividualPermission = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const result = await UserModel.deleteIndividualPermission(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message, 404));
  }

  res.status(200).json({
    success: true,
    message: result.message
  });
});

// ==================== USER DOCUMENTS CONTROLLERS ====================

// Create User Document
export const createUserDocument = catchAsyncErrors(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler("Please upload a document", 400));
  }

  const documentData = {
    ...req.body,
    attachment: `uploads/documents/${req.file.filename}`
  };

  const result = await UserModel.createUserDocument(documentData);

  res.status(201).json({
    success: true,
    message: result.message,
    id: result.id
  });
});

// Get User Documents
export const getUserDocuments = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  const result = await UserModel.getUserDocuments(userId);

  res.status(200).json({
    success: true,
    documents: result.data.map(doc => ({
      ...doc,
      attachment: buildImageUrl(doc.attachment)
    }))
  });
});

// Get User Document By ID
export const getUserDocumentById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const document = await UserModel.getUserDocumentById(id);

  if (!document) {
    return next(new ErrorHandler("Document not found", 404));
  }

  res.status(200).json({
    success: true,
    document: {
      ...document,
      attachment: buildImageUrl(document.attachment)
    }
  });
});

// Update User Document
export const updateUserDocument = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const updateData = { ...req.body };

  if (req.file) {
    const oldDocument = await UserModel.getUserDocumentById(id);
    if (oldDocument && oldDocument.attachment) {
      await deleteOldImage(oldDocument.attachment);
    }
    updateData.attachment = `uploads/documents/${req.file.filename}`;
  }

  const result = await UserModel.updateUserDocument(id, updateData);

  if (!result.success) {
    return next(new ErrorHandler(result.message, 404));
  }

  res.status(200).json({
    success: true,
    message: result.message
  });
});

// Delete User Document
export const deleteUserDocument = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const document = await UserModel.getUserDocumentById(id);
  if (document && document.attachment) {
    await deleteOldImage(document.attachment);
  }

  const result = await UserModel.deleteUserDocument(id);

  if (!result.success) {
    return next(new ErrorHandler(result.message, 404));
  }

  res.status(200).json({
    success: true,
    message: result.message
  });
});

// Get Documents By Project ID
export const getDocumentsByProject = catchAsyncErrors(async (req, res, next) => {
  const { projectId } = req.params;

  const result = await UserModel.getDocumentsByProjectId(projectId);

  res.status(200).json({
    success: true,
    documents: result.data.map(doc => ({
      ...doc,
      attachment: buildImageUrl(doc.attachment)
    }))
  });
});

// ==================== EXPORTS ====================

export default {
  // Auth
  registerUser,
  loginUser,
  googleLogin,
  logout,
  getCurrentUser,

  // User CRUD
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updatePassword,
  updateUserStatus,
  uploadUserPhoto,
  deleteUser,
  hardDeleteUser,
  restoreUser,
  bulkUpdateStatus,
  searchUsers,
  getUserStats,
  getDashboardStats,

  // Password Reset
  forgotPassword,
  resetPassword,

  // Permissions
  getUserPermissions,
  createUserPermission,
  updateUserPermission,
  getAllUserPermissions,
  getIndividualPermissions,
  createIndividualPermission,
  updateIndividualPermission,
  deleteIndividualPermission,

  // Documents
  createUserDocument,
  getUserDocuments,
  getUserDocumentById,
  updateUserDocument,
  deleteUserDocument,
  getDocumentsByProject
};