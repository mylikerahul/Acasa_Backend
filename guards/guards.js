import jwt from 'jsonwebtoken';
import * as UserModel from '../models/user/user.model.js';
import ErrorHandler from '../utils/errorHandler.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';

const TOKEN_CONFIG = {
  user: {
    secret: process.env.JWT_USER_SECRET,
    cookieName: 'userToken'
  },
  admin: {
    secret: process.env.JWT_ADMIN_SECRET ,
    cookieName: 'adminToken'
  }
};

const isUserActive = (status) => {
  if (status === 1 || status === '1') return true;
  if (status === true) return true;
  if (typeof status === 'string') {
    const lower = status.toLowerCase();
    if (lower === 'active' || lower === 'yes' || lower === 'enabled') return true;
  }
  return false;
};

const isAdminUser = (usertype) => {
  if (!usertype) return false;
  return usertype.toLowerCase() === 'admin';
};

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  let token = null;
  let tokenType = null;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];

    for (const type of ['admin', 'user']) {
      try {
        const decoded = jwt.verify(token, TOKEN_CONFIG[type].secret);
        tokenType = type;
        
        const user = await UserModel.getUserById(decoded.id);
        
        if (!user) {
          return next(new ErrorHandler('User not found', 404));
        }
        
        if (!isAdminUser(user.usertype) && !isUserActive(user.status)) {
          return next(new ErrorHandler('Your account is inactive', 403));
        }
        
        req.user = user;
        req.tokenType = tokenType;
        return next();
        
      } catch (err) {
        continue;
      }
    }
  }

  if (!token && req.cookies) {
    for (const type of ['admin', 'user']) {
      const cookieToken = req.cookies[TOKEN_CONFIG[type].cookieName];
      
      if (cookieToken) {
        try {
          const decoded = jwt.verify(cookieToken, TOKEN_CONFIG[type].secret);
          
          const user = await UserModel.getUserById(decoded.id);
          
          if (!user) {
            return next(new ErrorHandler('User not found', 404));
          }
          
          if (!isAdminUser(user.usertype) && !isUserActive(user.status)) {
            return next(new ErrorHandler('Your account is inactive', 403));
          }
          
          req.user = user;
          req.tokenType = type;
          return next();
          
        } catch (err) {
          continue;
        }
      }
    }
  }

  return next(new ErrorHandler('Please login to access this resource', 401));
});

export const isAdmin = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler('Please login first', 401));
  }

  if (req.user.usertype?.toLowerCase() !== 'admin') {
    return next(new ErrorHandler('Access denied. Admin only', 403));
  }

  next();
});

export const authorizeRoles = (...roles) => {
  return catchAsyncErrors(async (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler('Please login first', 401));
    }

    const usertype = req.user.usertype?.toLowerCase();
    const normalizedRoles = roles.map(r => r.toLowerCase());

    if (!normalizedRoles.includes(usertype)) {
      return next(new ErrorHandler(`Access denied. Required role: ${roles.join(' or ')}`, 403));
    }

    next();
  });
};

export const optionalAuth = catchAsyncErrors(async (req, res, next) => {
  let token = null;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies) {
    token = req.cookies.adminToken || req.cookies.userToken;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  for (const type of ['admin', 'user']) {
    try {
      const decoded = jwt.verify(token, TOKEN_CONFIG[type].secret);
      const user = await UserModel.getUserById(decoded.id);
      
      if (user) {
        req.user = user;
        req.tokenType = type;
      }
      return next();
    } catch (err) {
      continue;
    }
  }

  req.user = null;
  next();
});

export const isOwnerOrAdmin = (paramName = 'id') => {
  return catchAsyncErrors(async (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler('Please login first', 401));
    }

    const resourceUserId = parseInt(req.params[paramName]);
    const currentUserId = req.user.id;
    const isAdmin = req.user.usertype?.toLowerCase() === 'admin';

    if (currentUserId === resourceUserId || isAdmin) {
      return next();
    }

    return next(new ErrorHandler('Access denied', 403));
  });
};