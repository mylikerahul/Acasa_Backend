// backend/middleware/uploads.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const UPLOAD_BASE_PATH = 'uploads';

const DEFAULT_CONFIG = {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
};

const ensureDirectory = (dirPath) => {
  const fullPath = path.join(process.cwd(), UPLOAD_BASE_PATH, dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  return fullPath;
};

const generateFilename = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}${ext}`;
};

const createStorage = (folder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = ensureDirectory(folder);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const filename = generateFilename(file.originalname);
      cb(null, filename);
    }
  });
};

const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: ' + allowedTypes.join(', ')), false);
    }
  };
};

export const createUploader = (folder, options = {}) => {
  const config = { ...DEFAULT_CONFIG, ...options };
  ensureDirectory(folder);

  return multer({
    storage: createStorage(folder),
    limits: { fileSize: config.maxSize },
    fileFilter: createFileFilter(config.allowedTypes)
  });
};

export const deleteImage = async (imagePath) => {
  if (!imagePath) return false;

  try {
    const relativePath = imagePath.replace(/^uploads\//, '');
    const fullPath = path.join(process.cwd(), UPLOAD_BASE_PATH, relativePath);

    await fs.promises.access(fullPath, fs.constants.F_OK);
    await fs.promises.unlink(fullPath);
    return true;
  } catch (error) {
    return false;
  }
};

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is ' + (DEFAULT_CONFIG.maxSize / (1024 * 1024)) + 'MB'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name for file upload'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  if (err && err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next(err);
};