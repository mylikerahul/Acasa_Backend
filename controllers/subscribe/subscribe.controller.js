import * as SubscribesModel from '../../models/subscribe/subscribe.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';
import { sendEmail } from '../../utils/sendEmail.js';

/**
 * Email validation helper
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} IP address
 */
const getClientIP = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.connection?.remoteAddress || 
         '';
};

/**
 * Initialize subscriber table
 * @route POST /api/v1/subscribe/init-table
 * @access Private/Admin
 */
export const initSubscribeTable = catchAsyncErrors(async (req, res, next) => {
  await SubscribesModel.createSubscribeTable();
  
  res.status(200).json({
    success: true,
    message: 'Subscribe table initialized successfully'
  });
});

/**
 * Subscribe to newsletter
 * @route POST /api/v1/subscribe
 * @access Public
 */
export const subscribe = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler('Email is required', 400));
  }

  if (!validateEmail(email)) {
    return next(new ErrorHandler('Please provide a valid email', 400));
  }

  // Check if already subscribed
  const exists = await SubscribesModel.checkEmailExists(email);
  
  if (exists) {
    return res.status(200).json({
      success: true,
      message: 'You are already subscribed to our newsletter',
      alreadySubscribed: true
    });
  }

  // Get client IP and create subscriber
  const ip = getClientIP(req);
  const subscriber = await SubscribesModel.createSubscriber(email, ip);

  // Send welcome email (non-blocking)
  sendWelcomeEmail(subscriber.email).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Subscribed successfully!',
    data: {
      id: subscriber.id,
      email: subscriber.email
    }
  });
});

/**
 * Unsubscribe from newsletter
 * @route POST /api/v1/subscribe/unsubscribe
 * @access Public
 */
export const unsubscribe = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler('Email is required', 400));
  }

  const subscriber = await SubscribesModel.unsubscribeByEmail(email);

  if (!subscriber) {
    return next(new ErrorHandler('Email not found in subscribers', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Unsubscribed successfully'
  });
});

/**
 * Get all subscribers with pagination
 * @route GET /api/v1/subscribe/all
 * @access Private/Admin
 */
export const getAllSubscribers = catchAsyncErrors(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const search = req.query.search?.trim() || '';

  const data = await SubscribesModel.getAllSubscribers(page, limit, search);

  res.status(200).json({
    success: true,
    ...data
  });
});

/**
 * Get single subscriber by ID
 * @route GET /api/v1/subscribe/:id
 * @access Private/Admin
 */
export const getSubscriber = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return next(new ErrorHandler('Valid subscriber ID is required', 400));
  }

  const subscriber = await SubscribesModel.getSubscriberById(parseInt(id));

  if (!subscriber) {
    return next(new ErrorHandler('Subscriber not found', 404));
  }

  res.status(200).json({
    success: true,
    data: subscriber
  });
});

/**
 * Update subscriber status
 * @route PATCH /api/v1/subscribe/:id/status
 * @access Private/Admin
 */
export const updateSubscriberStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (!id || isNaN(id)) {
    return next(new ErrorHandler('Valid subscriber ID is required', 400));
  }

  if (typeof is_active !== 'boolean') {
    return next(new ErrorHandler('is_active must be a boolean value', 400));
  }

  const existing = await SubscribesModel.getSubscriberById(parseInt(id));
  
  if (!existing) {
    return next(new ErrorHandler('Subscriber not found', 404));
  }

  const subscriber = await SubscribesModel.updateSubscriberStatus(parseInt(id), is_active);

  res.status(200).json({
    success: true,
    message: `Subscriber ${is_active ? 'activated' : 'deactivated'} successfully`,
    data: subscriber
  });
});

/**
 * Delete subscriber permanently
 * @route DELETE /api/v1/subscribe/:id
 * @access Private/Admin
 */
export const deleteSubscriber = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return next(new ErrorHandler('Valid subscriber ID is required', 400));
  }

  const existing = await SubscribesModel.getSubscriberById(parseInt(id));
  
  if (!existing) {
    return next(new ErrorHandler('Subscriber not found', 404));
  }

  await SubscribesModel.deleteSubscriber(parseInt(id));

  res.status(200).json({
    success: true,
    message: 'Subscriber deleted successfully'
  });
});

/**
 * Get subscriber statistics
 * @route GET /api/v1/subscribe/stats
 * @access Private/Admin
 */
export const getSubscriberStats = catchAsyncErrors(async (req, res, next) => {
  const totalCount = await SubscribesModel.getActiveSubscribersCount();

  res.status(200).json({
    success: true,
    data: {
      total: totalCount,
      active: totalCount,
      inactive: 0
    }
  });
});

/**
 * Send newsletter to all subscribers
 * @route POST /api/v1/subscribe/send-newsletter
 * @access Private/Admin
 */
export const sendNewsletter = catchAsyncErrors(async (req, res, next) => {
  const { subject, content } = req.body;

  if (!subject?.trim()) {
    return next(new ErrorHandler('Subject is required', 400));
  }

  if (!content?.trim()) {
    return next(new ErrorHandler('Content is required', 400));
  }

  // Get all subscribers
  const data = await SubscribesModel.getAllSubscribers(1, 100000, '');
  const subscribers = data.subscribers;

  if (subscribers.length === 0) {
    return next(new ErrorHandler('No subscribers found', 404));
  }

  // Send emails in batches
  const results = await sendBulkNewsletter(subscribers, subject.trim(), content.trim());

  res.status(200).json({
    success: true,
    message: `Newsletter sent! Success: ${results.success}, Failed: ${results.failed}`,
    data: results
  });
});

/**
 * Send welcome email to new subscriber
 * @param {string} email - Subscriber email
 * @returns {Promise<void>}
 */
const sendWelcomeEmail = async (email) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  await sendEmail({
    email,
    subject: 'Welcome to Our Newsletter!',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thank you for subscribing!</h2>
        <p style="color: #666; line-height: 1.6;">
          You will now receive our latest updates and news directly in your inbox.
        </p>
        <p style="color: #666; line-height: 1.6;">
          If you didn't subscribe, you can 
          <a href="${frontendUrl}/unsubscribe?email=${email}" style="color: #007bff;">
            unsubscribe here
          </a>.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          &copy; ${new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    `
  });
};

/**
 * Send newsletter to multiple subscribers
 * @param {Array} subscribers - Array of subscriber objects
 * @param {string} subject - Email subject
 * @param {string} content - Email content
 * @returns {Promise<Object>} Results with success and failed counts
 */
const sendBulkNewsletter = async (subscribers, subject, content) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  let success = 0;
  let failed = 0;
  const failedEmails = [];

  // Process in batches of 10 to avoid overwhelming the email server
  const batchSize = 10;
  
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);
    
    const promises = batch.map(async (subscriber) => {
      try {
        await sendEmail({
          email: subscriber.email,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
              ${content}
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 20px;">
              <p style="font-size: 12px; color: #999; text-align: center;">
                <a href="${frontendUrl}/unsubscribe?email=${subscriber.email}" style="color: #666;">
                  Unsubscribe
                </a>
              </p>
            </div>
          `
        });
        success++;
      } catch (error) {
        failed++;
        failedEmails.push(subscriber.email);
      }
    });

    await Promise.allSettled(promises);
    
    // Small delay between batches
    if (i + batchSize < subscribers.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return { success, failed, failedEmails };
};