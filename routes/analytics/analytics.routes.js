import express from 'express';
import * as AnalyticsController from '../../controllers/analytics/analytics.controller.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';

const router = express.Router();

router.get('/', isAuthenticated, AnalyticsController.getAll);

router.get('/dashboard', isAuthenticated, AnalyticsController.getDashboard);

router.get('/stats', isAuthenticated, AnalyticsController.getStats);

router.get('/recent', isAuthenticated, AnalyticsController.getRecent);

router.get('/date-range', isAuthenticated, AnalyticsController.getByDateRange);

router.get('/active-users', isAuthenticated, AnalyticsController.getActiveUsers);

router.get('/bounce-rate', isAuthenticated, AnalyticsController.getBounceRate);

router.get('/avg-session-duration', isAuthenticated, AnalyticsController.getAvgSessionDuration);

router.get('/popular-pages', isAuthenticated, AnalyticsController.getPopularPages);

router.get('/top-referrers', isAuthenticated, AnalyticsController.getTopReferrers);

router.get('/screen-resolutions', isAuthenticated, AnalyticsController.getScreenResolutions);

router.get('/count/event-type', isAuthenticated, AnalyticsController.getCountByEventType);

router.get('/count/category', isAuthenticated, AnalyticsController.getCountByCategory);

router.get('/count/device-type', isAuthenticated, AnalyticsController.getCountByDeviceType);

router.get('/count/browser', isAuthenticated, AnalyticsController.getCountByBrowser);

router.get('/count/os', isAuthenticated, AnalyticsController.getCountByOS);

router.get('/count/country', isAuthenticated, AnalyticsController.getCountByCountry);

router.get('/count/city', isAuthenticated, AnalyticsController.getCountByCity);

router.get('/distribution/hourly', isAuthenticated, AnalyticsController.getHourlyDistribution);

router.get('/distribution/daily', isAuthenticated, AnalyticsController.getDailyDistribution);

router.get('/distribution/weekly', isAuthenticated, AnalyticsController.getWeeklyDistribution);

router.get('/distribution/monthly', isAuthenticated, AnalyticsController.getMonthlyDistribution);

router.get('/user/:userId', isAuthenticated, AnalyticsController.getByUserId);

router.get('/session/:sessionId', isAuthenticated, AnalyticsController.getBySessionId);

router.get('/journey/:sessionId', isAuthenticated, AnalyticsController.getUserJourney);

router.get('/event-type/:eventType', isAuthenticated, AnalyticsController.getByEventType);

router.get('/category/:category', isAuthenticated, AnalyticsController.getByCategory);

router.get('/:id', isAuthenticated, AnalyticsController.getById);

router.post('/', AnalyticsController.create);

router.post('/track/pageview', AnalyticsController.trackPageView);

router.post('/track/event', AnalyticsController.trackEvent);

router.post('/track/click', AnalyticsController.trackClick);

router.put('/:id', isAuthenticated, isAdmin, AnalyticsController.update);

router.delete('/old', isAuthenticated, isAdmin, AnalyticsController.deleteOldAnalytics);

router.delete('/clear-all', isAuthenticated, isAdmin, AnalyticsController.clearAll);

router.delete('/user/:userId', isAuthenticated, isAdmin, AnalyticsController.deleteByUserId);

router.delete('/session/:sessionId', isAuthenticated, isAdmin, AnalyticsController.deleteBySessionId);

router.delete('/:id', isAuthenticated, isAdmin, AnalyticsController.remove);

router.post('/bulk/delete', isAuthenticated, isAdmin, AnalyticsController.bulkDelete);

export default router;