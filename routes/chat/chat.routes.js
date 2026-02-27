import express from 'express';
import * as ChatController from '../../controllers/chat/chat.controller.js';
import { isAdmin, isAuthenticated } from '../../guards/guards.js';
import { createUploader } from '../../middleware/uploads.js';

const router = express.Router();

const chatUpload = createUploader('chat', {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
});

const uploadFields = chatUpload.fields([
  { name: 'resume', maxCount: 1 }
]);

router.get('/dashboard', isAuthenticated, ChatController.getDashboard);

router.get('/stats', isAuthenticated, ChatController.getChatStats);

router.get('/flow', ChatController.getChatFlow);

router.post('/start', ChatController.startChat);

router.post('/response', ChatController.saveUserResponse);

router.get('/history', isAuthenticated, ChatController.getAllHistory);

router.get('/history/stats', isAuthenticated, ChatController.getHistoryStats);

router.get('/history/recent', isAuthenticated, ChatController.getRecentHistory);

router.get('/history/date-range', isAuthenticated, ChatController.getHistoryByDateRange);

router.get('/history/count/action', isAuthenticated, ChatController.getHistoryCountByAction);

router.get('/history/count/date', isAuthenticated, ChatController.getHistoryCountByDate);

router.get('/history/ip/:ip', isAuthenticated, ChatController.getHistoryByIp);

router.get('/history/email/:email', isAuthenticated, ChatController.getHistoryByEmail);

router.get('/history/phone/:phone', isAuthenticated, ChatController.getHistoryByPhone);

router.get('/history/:id', isAuthenticated, ChatController.getHistoryById);

router.post('/history', uploadFields, ChatController.createHistory);

router.put('/history/:id', isAuthenticated, uploadFields, ChatController.updateHistory);

router.patch('/history/:id/status', isAuthenticated, ChatController.updateHistoryStatus);

router.patch('/history/:id/action', isAuthenticated, ChatController.updateHistoryAction);

router.patch('/history/:id/append', isAuthenticated, ChatController.appendHistory);

router.patch('/history/:id/end', uploadFields, ChatController.endChat);

router.delete('/history/old', isAuthenticated, isAdmin, ChatController.deleteOldHistory);

router.delete('/history/clear-all', isAuthenticated, isAdmin, ChatController.clearAllHistory);

router.delete('/history/:id', isAuthenticated, ChatController.softDeleteHistory);

router.delete('/history/:id/permanent', isAuthenticated, isAdmin, ChatController.removeHistory);

router.post('/history/bulk/delete', isAuthenticated, isAdmin, ChatController.bulkDeleteHistory);

router.patch('/history/bulk/status', isAuthenticated, isAdmin, ChatController.bulkUpdateHistoryStatus);

router.get('/questions', isAuthenticated, ChatController.getAllQuestions);

router.get('/questions/active', ChatController.getAllActiveQuestions);

router.get('/questions/stats', isAuthenticated, ChatController.getQuestionStats);

router.get('/questions/with-answers', ChatController.getAllQuestionsWithAnswers);

router.get('/questions/first', ChatController.getFirstQuestion);

router.get('/questions/:id', ChatController.getQuestionById);

router.get('/questions/:id/with-answers', ChatController.getQuestionWithAnswers);

router.get('/questions/:questionId/next', ChatController.getNextQuestion);

router.post('/questions', isAuthenticated, ChatController.createQuestion);

router.post('/questions/with-answers', isAuthenticated, ChatController.createQuestionWithAnswers);

router.put('/questions/:id', isAuthenticated, ChatController.updateQuestion);

router.patch('/questions/:id/status', isAuthenticated, ChatController.updateQuestionStatus);

router.patch('/questions/:id/next-step', isAuthenticated, ChatController.updateQuestionNextStep);

router.patch('/questions/reorder', isAuthenticated, isAdmin, ChatController.reorderQuestions);

router.delete('/questions/:id', isAuthenticated, ChatController.softDeleteQuestion);

router.delete('/questions/:id/permanent', isAuthenticated, isAdmin, ChatController.removeQuestion);

router.post('/questions/bulk/delete', isAuthenticated, isAdmin, ChatController.bulkDeleteQuestions);

router.patch('/questions/bulk/status', isAuthenticated, isAdmin, ChatController.bulkUpdateQuestionsStatus);

router.get('/answers', isAuthenticated, ChatController.getAllAnswers);

router.get('/answers/stats', isAuthenticated, ChatController.getAnswerStats);

router.get('/answers/count/question', isAuthenticated, ChatController.getAnswerCountByQuestion);

router.get('/answers/question/:questionId', ChatController.getAnswersByQuestionId);

router.get('/answers/:id', ChatController.getAnswerById);

router.post('/answers', isAuthenticated, ChatController.createAnswer);

router.post('/answers/many', isAuthenticated, ChatController.createManyAnswers);

router.put('/answers/:id', isAuthenticated, ChatController.updateAnswer);

router.patch('/answers/:id/status', isAuthenticated, ChatController.updateAnswerStatus);

router.put('/answers/question/:questionId/replace', isAuthenticated, ChatController.replaceAnswers);

router.delete('/answers/question/:questionId', isAuthenticated, isAdmin, ChatController.removeAnswersByQuestionId);

router.delete('/answers/:id', isAuthenticated, ChatController.softDeleteAnswer);

router.delete('/answers/:id/permanent', isAuthenticated, isAdmin, ChatController.removeAnswer);

router.post('/answers/bulk/delete', isAuthenticated, isAdmin, ChatController.bulkDeleteAnswers);

router.patch('/answers/bulk/status', isAuthenticated, isAdmin, ChatController.bulkUpdateAnswersStatus);

export default router;