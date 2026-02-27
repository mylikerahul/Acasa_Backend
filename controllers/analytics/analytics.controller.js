import * as AnalyticsModel from '../../models/analytics/analytics.models.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

const ITEMS_PER_PAGE = 20;

const getClientInfo = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  
  let device_type = 'desktop';
  if (/mobile/i.test(userAgent)) device_type = 'mobile';
  else if (/tablet|ipad/i.test(userAgent)) device_type = 'tablet';

  let browser = 'unknown';
  if (/chrome/i.test(userAgent)) browser = 'Chrome';
  else if (/firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/safari/i.test(userAgent)) browser = 'Safari';
  else if (/edge/i.test(userAgent)) browser = 'Edge';
  else if (/opera|opr/i.test(userAgent)) browser = 'Opera';

  let os = 'unknown';
  if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/mac/i.test(userAgent)) os = 'MacOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/ios|iphone|ipad/i.test(userAgent)) os = 'iOS';

  return {
    ip_address: req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0],
    device_type,
    browser,
    os
  };
};

export const getAll = catchAsyncErrors(async (req, res, next) => {
  const filters = {
    search: req.query.search,
    event_type: req.query.event_type,
    event_name: req.query.event_name,
    category: req.query.category,
    user_id: req.query.user_id,
    session_id: req.query.session_id,
    device_type: req.query.device_type,
    browser: req.query.browser,
    os: req.query.os,
    country: req.query.country,
    city: req.query.city,
    status: req.query.status,
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    orderBy: req.query.orderBy,
    order: req.query.order
  };

  const pagination = {
    page: req.query.page || 1,
    limit: req.query.limit || ITEMS_PER_PAGE
  };

  const result = await AnalyticsModel.findAll(filters, pagination);

  res.status(200).json({
    success: true,
    ...result
  });
});

export const getById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const analytics = await AnalyticsModel.findById(id);

  if (!analytics) {
    return next(new ErrorHandler('Analytics record not found', 404));
  }

  res.status(200).json({
    success: true,
    data: analytics
  });
});

export const getByUserId = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  const analytics = await AnalyticsModel.findByUserId(userId);

  res.status(200).json({
    success: true,
    data: analytics
  });
});

export const getBySessionId = catchAsyncErrors(async (req, res, next) => {
  const { sessionId } = req.params;

  const analytics = await AnalyticsModel.findBySessionId(sessionId);

  res.status(200).json({
    success: true,
    data: analytics
  });
});

export const getByEventType = catchAsyncErrors(async (req, res, next) => {
  const { eventType } = req.params;

  const analytics = await AnalyticsModel.findByEventType(eventType);

  res.status(200).json({
    success: true,
    data: analytics
  });
});

export const getByCategory = catchAsyncErrors(async (req, res, next) => {
  const { category } = req.params;

  const analytics = await AnalyticsModel.findByCategory(category);

  res.status(200).json({
    success: true,
    data: analytics
  });
});

export const getByDateRange = catchAsyncErrors(async (req, res, next) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return next(new ErrorHandler('Start date and end date are required', 400));
  }

  const analytics = await AnalyticsModel.findByDateRange(start_date, end_date);

  res.status(200).json({
    success: true,
    data: analytics
  });
});

export const getRecent = catchAsyncErrors(async (req, res, next) => {
  const limit = req.query.limit || 20;

  const analytics = await AnalyticsModel.findRecent(limit);

  res.status(200).json({
    success: true,
    data: analytics
  });
});

export const create = catchAsyncErrors(async (req, res, next) => {
  const data = { ...req.body };

  const clientInfo = getClientInfo(req);
  data.ip_address = data.ip_address || clientInfo.ip_address;
  data.device_type = data.device_type || clientInfo.device_type;
  data.browser = data.browser || clientInfo.browser;
  data.os = data.os || clientInfo.os;

  if (req.user) {
    data.user_id = data.user_id || req.user.id;
    data.user_name = data.user_name || req.user.name || req.user.email;
  }

  const analytics = await AnalyticsModel.create(data);

  res.status(201).json({
    success: true,
    message: 'Analytics event created successfully',
    data: analytics
  });
});

export const update = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const data = { ...req.body };

  const existing = await AnalyticsModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Analytics record not found', 404));
  }

  const analytics = await AnalyticsModel.update(id, data);

  res.status(200).json({
    success: true,
    message: 'Analytics event updated successfully',
    data: analytics
  });
});

export const remove = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const existing = await AnalyticsModel.findById(id);

  if (!existing) {
    return next(new ErrorHandler('Analytics record not found', 404));
  }

  await AnalyticsModel.remove(id);

  res.status(200).json({
    success: true,
    message: 'Analytics event deleted successfully'
  });
});

export const bulkDelete = catchAsyncErrors(async (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || !ids.length) {
    return next(new ErrorHandler('Invalid IDs array', 400));
  }

  await AnalyticsModel.bulkDelete(ids);

  res.status(200).json({
    success: true,
    message: 'Analytics events deleted successfully'
  });
});

export const deleteByUserId = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  await AnalyticsModel.deleteByUserId(userId);

  res.status(200).json({
    success: true,
    message: 'User analytics deleted successfully'
  });
});

export const deleteBySessionId = catchAsyncErrors(async (req, res, next) => {
  const { sessionId } = req.params;

  await AnalyticsModel.deleteBySessionId(sessionId);

  res.status(200).json({
    success: true,
    message: 'Session analytics deleted successfully'
  });
});

export const deleteOldAnalytics = catchAsyncErrors(async (req, res, next) => {
  const days = req.query.days || 90;

  const deletedCount = await AnalyticsModel.deleteOldAnalytics(parseInt(days));

  res.status(200).json({
    success: true,
    message: `${deletedCount} old analytics records deleted successfully`
  });
});

export const clearAll = catchAsyncErrors(async (req, res, next) => {
  await AnalyticsModel.clearAll();

  res.status(200).json({
    success: true,
    message: 'All analytics cleared successfully'
  });
});

export const getStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await AnalyticsModel.getStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

export const getCountByEventType = catchAsyncErrors(async (req, res, next) => {
  const data = await AnalyticsModel.getCountByEventType();

  res.status(200).json({
    success: true,
    data
  });
});

export const getCountByCategory = catchAsyncErrors(async (req, res, next) => {
  const data = await AnalyticsModel.getCountByCategory();

  res.status(200).json({
    success: true,
    data
  });
});

export const getCountByDeviceType = catchAsyncErrors(async (req, res, next) => {
  const data = await AnalyticsModel.getCountByDeviceType();

  res.status(200).json({
    success: true,
    data
  });
});

export const getCountByBrowser = catchAsyncErrors(async (req, res, next) => {
  const data = await AnalyticsModel.getCountByBrowser();

  res.status(200).json({
    success: true,
    data
  });
});

export const getCountByOS = catchAsyncErrors(async (req, res, next) => {
  const data = await AnalyticsModel.getCountByOS();

  res.status(200).json({
    success: true,
    data
  });
});

export const getCountByCountry = catchAsyncErrors(async (req, res, next) => {
  const data = await AnalyticsModel.getCountByCountry();

  res.status(200).json({
    success: true,
    data
  });
});

export const getCountByCity = catchAsyncErrors(async (req, res, next) => {
  const data = await AnalyticsModel.getCountByCity();

  res.status(200).json({
    success: true,
    data
  });
});

export const getPopularPages = catchAsyncErrors(async (req, res, next) => {
  const limit = req.query.limit || 10;

  const data = await AnalyticsModel.getPopularPages(limit);

  res.status(200).json({
    success: true,
    data
  });
});

export const getTopReferrers = catchAsyncErrors(async (req, res, next) => {
  const limit = req.query.limit || 10;

  const data = await AnalyticsModel.getTopReferrers(limit);

  res.status(200).json({
    success: true,
    data
  });
});

export const getHourlyDistribution = catchAsyncErrors(async (req, res, next) => {
  const days = req.query.days || 1;

  const data = await AnalyticsModel.getHourlyDistribution(days);

  res.status(200).json({
    success: true,
    data
  });
});

export const getDailyDistribution = catchAsyncErrors(async (req, res, next) => {
  const days = req.query.days || 30;

  const data = await AnalyticsModel.getDailyDistribution(days);

  res.status(200).json({
    success: true,
    data
  });
});

export const getWeeklyDistribution = catchAsyncErrors(async (req, res, next) => {
  const weeks = req.query.weeks || 12;

  const data = await AnalyticsModel.getWeeklyDistribution(weeks);

  res.status(200).json({
    success: true,
    data
  });
});

export const getMonthlyDistribution = catchAsyncErrors(async (req, res, next) => {
  const months = req.query.months || 12;

  const data = await AnalyticsModel.getMonthlyDistribution(months);

  res.status(200).json({
    success: true,
    data
  });
});

export const getUserJourney = catchAsyncErrors(async (req, res, next) => {
  const { sessionId } = req.params;

  const data = await AnalyticsModel.getUserJourney(sessionId);

  res.status(200).json({
    success: true,
    data
  });
});

export const getActiveUsers = catchAsyncErrors(async (req, res, next) => {
  const minutes = req.query.minutes || 30;

  const data = await AnalyticsModel.getActiveUsers(minutes);

  res.status(200).json({
    success: true,
    data
  });
});

export const getBounceRate = catchAsyncErrors(async (req, res, next) => {
  const days = req.query.days || 30;

  const data = await AnalyticsModel.getBounceRate(days);

  res.status(200).json({
    success: true,
    data
  });
});

export const getAvgSessionDuration = catchAsyncErrors(async (req, res, next) => {
  const days = req.query.days || 30;

  const data = await AnalyticsModel.getAvgSessionDuration(days);

  res.status(200).json({
    success: true,
    data
  });
});

export const getScreenResolutions = catchAsyncErrors(async (req, res, next) => {
  const data = await AnalyticsModel.getScreenResolutions();

  res.status(200).json({
    success: true,
    data
  });
});

export const trackPageView = catchAsyncErrors(async (req, res, next) => {
  const data = { ...req.body };

  const clientInfo = getClientInfo(req);
  data.ip_address = data.ip_address || clientInfo.ip_address;
  data.device_type = data.device_type || clientInfo.device_type;
  data.browser = data.browser || clientInfo.browser;
  data.os = data.os || clientInfo.os;

  if (req.user) {
    data.user_id = data.user_id || req.user.id;
    data.user_name = data.user_name || req.user.name || req.user.email;
  }

  const analytics = await AnalyticsModel.trackPageView(data);

  res.status(201).json({
    success: true,
    message: 'Page view tracked successfully',
    data: analytics
  });
});

export const trackEvent = catchAsyncErrors(async (req, res, next) => {
  const data = { ...req.body };

  const clientInfo = getClientInfo(req);
  data.ip_address = data.ip_address || clientInfo.ip_address;
  data.device_type = data.device_type || clientInfo.device_type;
  data.browser = data.browser || clientInfo.browser;
  data.os = data.os || clientInfo.os;

  if (req.user) {
    data.user_id = data.user_id || req.user.id;
    data.user_name = data.user_name || req.user.name || req.user.email;
  }

  const analytics = await AnalyticsModel.trackEvent(data);

  res.status(201).json({
    success: true,
    message: 'Event tracked successfully',
    data: analytics
  });
});

export const trackClick = catchAsyncErrors(async (req, res, next) => {
  const data = { ...req.body };

  const clientInfo = getClientInfo(req);
  data.ip_address = data.ip_address || clientInfo.ip_address;
  data.device_type = data.device_type || clientInfo.device_type;
  data.browser = data.browser || clientInfo.browser;
  data.os = data.os || clientInfo.os;

  if (req.user) {
    data.user_id = data.user_id || req.user.id;
    data.user_name = data.user_name || req.user.name || req.user.email;
  }

  const analytics = await AnalyticsModel.trackClick(data);

  res.status(201).json({
    success: true,
    message: 'Click tracked successfully',
    data: analytics
  });
});

export const getDashboard = catchAsyncErrors(async (req, res, next) => {
  const [
    stats,
    activeUsers,
    bounceRate,
    avgSessionDuration,
    dailyDistribution,
    deviceStats,
    browserStats,
    popularPages
  ] = await Promise.all([
    AnalyticsModel.getStats(),
    AnalyticsModel.getActiveUsers(30),
    AnalyticsModel.getBounceRate(30),
    AnalyticsModel.getAvgSessionDuration(30),
    AnalyticsModel.getDailyDistribution(7),
    AnalyticsModel.getCountByDeviceType(),
    AnalyticsModel.getCountByBrowser(),
    AnalyticsModel.getPopularPages(5)
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats,
      activeUsers,
      bounceRate,
      avgSessionDuration,
      dailyDistribution,
      deviceStats,
      browserStats,
      popularPages
    }
  });
});