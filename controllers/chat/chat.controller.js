import path from 'path';
import fs from 'fs';
import * as ChatModel from '../../models/chat/chat.model.js';
import catchAsyncErrors from '../../middleware/catchAsyncErrors.js';
import ErrorHandler from '../../utils/errorHandler.js';

const ITEMS_PER_PAGE = 20;
const API_BASE_URL = process.env.API_URL;

const buildFileUrl = (filePath) => {
  if (!filePath) return null;
  return `${API_BASE_URL}/${filePath.replace(/\\/g, '/')}`;
};

const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

const formatHistoryResponse = (history) => {
  if (!history) return null;
  return {
    ...history,
    resume: buildFileUrl(history.resume)
  };
};

const getClientIp = (req) => {
  return req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
};

export const getAllHistory = catchAsyncErrors(async (req, res, next) => {
  const filters = {
    search: req.query.search,
    status: req.query.status,
    ip: req.query.ip,
    email: req.query.email,
    phone: req.query.phone,
    action: req.query.action,
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    orderBy: req.query.orderBy,
    order: req.query.order
  };

  const pagination = {
    page: req.query.page || 1,
    limit: req.query.limit || ITEMS_PER_PAGE
  };

  const result = await ChatModel.findAllHistory(filters, pagination);

  result.data = result.data.map(formatHistoryResponse);

  res.status(200).json({
    success: true,
    ...result
  });
});

export const getHistoryById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const history = await ChatModel.findHistoryById(id);

  if (!history) {
    return next(new ErrorHandler('Chat history not found', 404));
  }

  res.status(200).json({
    success: true,
    data: formatHistoryResponse(history)
  });
});

export const getHistoryByIp = catchAsyncErrors(async (req, res, next) => {
  const { ip } = req.params;

  const histories = await ChatModel.findHistoryByIp(ip);

  res.status(200).json({
    success: true,
    data: histories.map(formatHistoryResponse)
  });
});

export const getHistoryByEmail = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.params;

  const histories = await ChatModel.findHistoryByEmail(email);

  res.status(200).json({
    success: true,
    data: histories.map(formatHistoryResponse)
  });
});

export const getHistoryByPhone = catchAsyncErrors(async (req, res, next) => {
  const { phone } = req.params;

  const histories = await ChatModel.findHistoryByPhone(phone);

  res.status(200).json({
    success: true,
    data: histories.map(formatHistoryResponse)
  });
});

export const getHistoryByDateRange = catchAsyncErrors(async (req, res, next) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return next(new ErrorHandler('Start date and end date are required', 400));
  }

  const histories = await ChatModel.findHistoryByDateRange(start_date, end_date);

  res.status(200).json({
    success: true,
    data: histories.map(formatHistoryResponse)
  });
});

export const getRecentHistory = catchAsyncErrors(async (req, res, next) => {
  const limit = req.query.limit || 20;

  const histories = await ChatModel.findRecentHistory(limit);

  res.status(200).json({
    success: true,
    data: histories.map(formatHistoryResponse)
  });
});

export const createHistory = catchAsyncErrors(async (req, res, next) => {
  const data = { ...req.body };

  data.ip = data.ip || getClientIp(req);

  if (req.files && req.files.resume && req.files.resume[0]) {
    data.resume = req.files.resume[0].path;
  }

  const history = await ChatModel.createHistory(data);

  res.status(201).json({
    success: true,
    message: 'Chat history created successfully',
    data: formatHistoryResponse(history)
  });
});

export const updateHistory = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const data = { ...req.body };

  const existing = await ChatModel.findHistoryById(id);

  if (!existing) {
    return next(new ErrorHandler('Chat history not found', 404));
  }

  if (req.files && req.files.resume && req.files.resume[0]) {
    deleteFile(existing.resume);
    data.resume = req.files.resume[0].path;
  }

  const history = await ChatModel.updateHistory(id, data);

  res.status(200).json({
    success: true,
    message: 'Chat history updated successfully',
    data: formatHistoryResponse(history)
  });
});

export const updateHistoryStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const existing = await ChatModel.findHistoryById(id);

  if (!existing) {
    return next(new ErrorHandler('Chat history not found', 404));
  }

  const history = await ChatModel.updateHistoryStatus(id, status);

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: formatHistoryResponse(history)
  });
});

export const updateHistoryAction = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { action } = req.body;

  const existing = await ChatModel.findHistoryById(id);

  if (!existing) {
    return next(new ErrorHandler('Chat history not found', 404));
  }

  const history = await ChatModel.updateHistoryAction(id, action);

  res.status(200).json({
    success: true,
    message: 'Action updated successfully',
    data: formatHistoryResponse(history)
  });
});

export const appendHistory = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { history } = req.body;

  if (!history) {
    return next(new ErrorHandler('History content is required', 400));
  }

  const existing = await ChatModel.findHistoryById(id);

  if (!existing) {
    return next(new ErrorHandler('Chat history not found', 404));
  }

  const updated = await ChatModel.appendChatHistory(id, history);

  res.status(200).json({
    success: true,
    message: 'History appended successfully',
    data: formatHistoryResponse(updated)
  });
});

export const removeHistory = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const existing = await ChatModel.findHistoryById(id);

  if (!existing) {
    return next(new ErrorHandler('Chat history not found', 404));
  }

  deleteFile(existing.resume);

  await ChatModel.removeHistory(id);

  res.status(200).json({
    success: true,
    message: 'Chat history deleted successfully'
  });
});

export const softDeleteHistory = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const existing = await ChatModel.findHistoryById(id);

  if (!existing) {
    return next(new ErrorHandler('Chat history not found', 404));
  }

  await ChatModel.softDeleteHistory(id);

  res.status(200).json({
    success: true,
    message: 'Chat history deleted successfully'
  });
});

export const bulkDeleteHistory = catchAsyncErrors(async (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || !ids.length) {
    return next(new ErrorHandler('Invalid IDs array', 400));
  }

  for (const id of ids) {
    const history = await ChatModel.findHistoryById(id);
    if (history) {
      deleteFile(history.resume);
    }
  }

  await ChatModel.bulkDeleteHistory(ids);

  res.status(200).json({
    success: true,
    message: 'Chat histories deleted successfully'
  });
});

export const bulkUpdateHistoryStatus = catchAsyncErrors(async (req, res, next) => {
  const { ids, status } = req.body;

  if (!Array.isArray(ids) || !ids.length) {
    return next(new ErrorHandler('Invalid IDs array', 400));
  }

  await ChatModel.bulkUpdateHistoryStatus(ids, status);

  res.status(200).json({
    success: true,
    message: 'Status updated successfully'
  });
});

export const deleteOldHistory = catchAsyncErrors(async (req, res, next) => {
  const days = req.query.days || 30;

  const deletedCount = await ChatModel.deleteOldHistory(parseInt(days));

  res.status(200).json({
    success: true,
    message: `${deletedCount} old chat histories deleted successfully`
  });
});

export const clearAllHistory = catchAsyncErrors(async (req, res, next) => {
  await ChatModel.clearAllHistory();

  res.status(200).json({
    success: true,
    message: 'All chat histories cleared successfully'
  });
});

export const getHistoryStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await ChatModel.getHistoryStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

export const getHistoryCountByAction = catchAsyncErrors(async (req, res, next) => {
  const data = await ChatModel.getHistoryCountByAction();

  res.status(200).json({
    success: true,
    data
  });
});

export const getHistoryCountByDate = catchAsyncErrors(async (req, res, next) => {
  const days = req.query.days || 30;

  const data = await ChatModel.getHistoryCountByDate(parseInt(days));

  res.status(200).json({
    success: true,
    data
  });
});

export const getAllQuestions = catchAsyncErrors(async (req, res, next) => {
  const filters = {
    search: req.query.search,
    status: req.query.status,
    next_step: req.query.next_step,
    orderBy: req.query.orderBy,
    order: req.query.order
  };

  const pagination = {
    page: req.query.page || 1,
    limit: req.query.limit || ITEMS_PER_PAGE
  };

  const result = await ChatModel.findAllQuestions(filters, pagination);

  res.status(200).json({
    success: true,
    ...result
  });
});

export const getAllActiveQuestions = catchAsyncErrors(async (req, res, next) => {
  const questions = await ChatModel.findAllActiveQuestions();

  res.status(200).json({
    success: true,
    data: questions
  });
});

export const getQuestionById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const question = await ChatModel.findQuestionById(id);

  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  res.status(200).json({
    success: true,
    data: question
  });
});

export const getQuestionWithAnswers = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const question = await ChatModel.findQuestionWithAnswers(id);

  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  res.status(200).json({
    success: true,
    data: question
  });
});

export const getAllQuestionsWithAnswers = catchAsyncErrors(async (req, res, next) => {
  const questions = await ChatModel.findAllQuestionsWithAnswers();

  res.status(200).json({
    success: true,
    data: questions
  });
});

export const getFirstQuestion = catchAsyncErrors(async (req, res, next) => {
  const question = await ChatModel.findFirstQuestion();

  if (!question) {
    return next(new ErrorHandler('No questions found', 404));
  }

  res.status(200).json({
    success: true,
    data: question
  });
});

export const createQuestion = catchAsyncErrors(async (req, res, next) => {
  const data = { ...req.body };

  if (!data.question) {
    return next(new ErrorHandler('Question is required', 400));
  }

  const question = await ChatModel.createQuestion(data);

  res.status(201).json({
    success: true,
    message: 'Question created successfully',
    data: question
  });
});

export const createQuestionWithAnswers = catchAsyncErrors(async (req, res, next) => {
  const data = { ...req.body };

  if (!data.question) {
    return next(new ErrorHandler('Question is required', 400));
  }

  const question = await ChatModel.createQuestionWithAnswers(data);

  res.status(201).json({
    success: true,
    message: 'Question with answers created successfully',
    data: question
  });
});

export const updateQuestion = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const data = { ...req.body };

  const existing = await ChatModel.findQuestionById(id);

  if (!existing) {
    return next(new ErrorHandler('Question not found', 404));
  }

  const question = await ChatModel.updateQuestion(id, data);

  res.status(200).json({
    success: true,
    message: 'Question updated successfully',
    data: question
  });
});

export const updateQuestionStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const existing = await ChatModel.findQuestionById(id);

  if (!existing) {
    return next(new ErrorHandler('Question not found', 404));
  }

  const question = await ChatModel.updateQuestionStatus(id, status);

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: question
  });
});

export const updateQuestionNextStep = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { next_step } = req.body;

  const existing = await ChatModel.findQuestionById(id);

  if (!existing) {
    return next(new ErrorHandler('Question not found', 404));
  }

  const question = await ChatModel.updateQuestionNextStep(id, next_step);

  res.status(200).json({
    success: true,
    message: 'Next step updated successfully',
    data: question
  });
});

export const removeQuestion = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const existing = await ChatModel.findQuestionById(id);

  if (!existing) {
    return next(new ErrorHandler('Question not found', 404));
  }

  await ChatModel.removeQuestion(id);

  res.status(200).json({
    success: true,
    message: 'Question deleted successfully'
  });
});

export const softDeleteQuestion = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const existing = await ChatModel.findQuestionById(id);

  if (!existing) {
    return next(new ErrorHandler('Question not found', 404));
  }

  await ChatModel.softDeleteQuestion(id);

  res.status(200).json({
    success: true,
    message: 'Question deleted successfully'
  });
});

export const bulkDeleteQuestions = catchAsyncErrors(async (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || !ids.length) {
    return next(new ErrorHandler('Invalid IDs array', 400));
  }

  await ChatModel.bulkDeleteQuestions(ids);

  res.status(200).json({
    success: true,
    message: 'Questions deleted successfully'
  });
});

export const bulkUpdateQuestionsStatus = catchAsyncErrors(async (req, res, next) => {
  const { ids, status } = req.body;

  if (!Array.isArray(ids) || !ids.length) {
    return next(new ErrorHandler('Invalid IDs array', 400));
  }

  await ChatModel.bulkUpdateQuestionsStatus(ids, status);

  res.status(200).json({
    success: true,
    message: 'Status updated successfully'
  });
});

export const getQuestionStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await ChatModel.getQuestionStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

export const reorderQuestions = catchAsyncErrors(async (req, res, next) => {
  const { ordered_ids } = req.body;

  if (!Array.isArray(ordered_ids) || !ordered_ids.length) {
    return next(new ErrorHandler('Invalid ordered IDs array', 400));
  }

  await ChatModel.reorderQuestions(ordered_ids);

  res.status(200).json({
    success: true,
    message: 'Questions reordered successfully'
  });
});

export const getAllAnswers = catchAsyncErrors(async (req, res, next) => {
  const filters = {
    search: req.query.search,
    status: req.query.status,
    q_id: req.query.q_id,
    orderBy: req.query.orderBy,
    order: req.query.order
  };

  const pagination = {
    page: req.query.page || 1,
    limit: req.query.limit || ITEMS_PER_PAGE
  };

  const result = await ChatModel.findAllAnswers(filters, pagination);

  res.status(200).json({
    success: true,
    ...result
  });
});

export const getAnswerById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const answer = await ChatModel.findAnswerById(id);

  if (!answer) {
    return next(new ErrorHandler('Answer not found', 404));
  }

  res.status(200).json({
    success: true,
    data: answer
  });
});

export const getAnswersByQuestionId = catchAsyncErrors(async (req, res, next) => {
  const { questionId } = req.params;

  const answers = await ChatModel.findAnswersByQuestionId(questionId);

  res.status(200).json({
    success: true,
    data: answers
  });
});

export const createAnswer = catchAsyncErrors(async (req, res, next) => {
  const data = { ...req.body };

  if (!data.q_id || !data.answer) {
    return next(new ErrorHandler('Question ID and answer are required', 400));
  }

  const question = await ChatModel.findQuestionById(data.q_id);
  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  const answer = await ChatModel.createAnswer(data);

  res.status(201).json({
    success: true,
    message: 'Answer created successfully',
    data: answer
  });
});

export const createManyAnswers = catchAsyncErrors(async (req, res, next) => {
  const { q_id, answers } = req.body;

  if (!q_id || !answers || !answers.length) {
    return next(new ErrorHandler('Question ID and answers are required', 400));
  }

  const question = await ChatModel.findQuestionById(q_id);
  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  const result = await ChatModel.createManyAnswers(q_id, answers);

  res.status(201).json({
    success: true,
    message: 'Answers created successfully',
    data: result
  });
});

export const updateAnswer = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const data = { ...req.body };

  const existing = await ChatModel.findAnswerById(id);

  if (!existing) {
    return next(new ErrorHandler('Answer not found', 404));
  }

  const answer = await ChatModel.updateAnswer(id, data);

  res.status(200).json({
    success: true,
    message: 'Answer updated successfully',
    data: answer
  });
});

export const updateAnswerStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const existing = await ChatModel.findAnswerById(id);

  if (!existing) {
    return next(new ErrorHandler('Answer not found', 404));
  }

  const answer = await ChatModel.updateAnswerStatus(id, status);

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: answer
  });
});

export const removeAnswer = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const existing = await ChatModel.findAnswerById(id);

  if (!existing) {
    return next(new ErrorHandler('Answer not found', 404));
  }

  await ChatModel.removeAnswer(id);

  res.status(200).json({
    success: true,
    message: 'Answer deleted successfully'
  });
});

export const removeAnswersByQuestionId = catchAsyncErrors(async (req, res, next) => {
  const { questionId } = req.params;

  await ChatModel.removeAnswersByQuestionId(questionId);

  res.status(200).json({
    success: true,
    message: 'Answers deleted successfully'
  });
});

export const softDeleteAnswer = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const existing = await ChatModel.findAnswerById(id);

  if (!existing) {
    return next(new ErrorHandler('Answer not found', 404));
  }

  await ChatModel.softDeleteAnswer(id);

  res.status(200).json({
    success: true,
    message: 'Answer deleted successfully'
  });
});

export const bulkDeleteAnswers = catchAsyncErrors(async (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || !ids.length) {
    return next(new ErrorHandler('Invalid IDs array', 400));
  }

  await ChatModel.bulkDeleteAnswers(ids);

  res.status(200).json({
    success: true,
    message: 'Answers deleted successfully'
  });
});

export const bulkUpdateAnswersStatus = catchAsyncErrors(async (req, res, next) => {
  const { ids, status } = req.body;

  if (!Array.isArray(ids) || !ids.length) {
    return next(new ErrorHandler('Invalid IDs array', 400));
  }

  await ChatModel.bulkUpdateAnswersStatus(ids, status);

  res.status(200).json({
    success: true,
    message: 'Status updated successfully'
  });
});

export const replaceAnswers = catchAsyncErrors(async (req, res, next) => {
  const { questionId } = req.params;
  const { answers } = req.body;

  const question = await ChatModel.findQuestionById(questionId);
  if (!question) {
    return next(new ErrorHandler('Question not found', 404));
  }

  await ChatModel.replaceAnswers(questionId, answers);

  const updated = await ChatModel.findQuestionWithAnswers(questionId);

  res.status(200).json({
    success: true,
    message: 'Answers replaced successfully',
    data: updated
  });
});

export const getAnswerStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await ChatModel.getAnswerStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

export const getAnswerCountByQuestion = catchAsyncErrors(async (req, res, next) => {
  const data = await ChatModel.getAnswerCountByQuestion();

  res.status(200).json({
    success: true,
    data
  });
});

export const getChatFlow = catchAsyncErrors(async (req, res, next) => {
  const flow = await ChatModel.getChatFlow();

  res.status(200).json({
    success: true,
    data: flow
  });
});

export const getNextQuestion = catchAsyncErrors(async (req, res, next) => {
  const { questionId } = req.params;

  const question = await ChatModel.getNextQuestion(questionId);

  res.status(200).json({
    success: true,
    data: question
  });
});

export const startChat = catchAsyncErrors(async (req, res, next) => {
  const ipAddress = getClientIp(req);

  const result = await ChatModel.startChat(ipAddress);

  res.status(201).json({
    success: true,
    message: 'Chat started successfully',
    data: result
  });
});

export const saveUserResponse = catchAsyncErrors(async (req, res, next) => {
  const { chat_id, question_id, answer_id, answer_text } = req.body;

  if (!chat_id || !question_id) {
    return next(new ErrorHandler('Chat ID and Question ID are required', 400));
  }

  const history = await ChatModel.findHistoryById(chat_id);
  if (!history) {
    return next(new ErrorHandler('Chat not found', 404));
  }

  await ChatModel.saveUserResponse(chat_id, question_id, answer_id, answer_text);

  const nextQuestion = await ChatModel.getNextQuestion(question_id);

  res.status(200).json({
    success: true,
    message: 'Response saved successfully',
    data: {
      next_question: nextQuestion
    }
  });
});

export const endChat = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const userData = { ...req.body };

  const existing = await ChatModel.findHistoryById(id);

  if (!existing) {
    return next(new ErrorHandler('Chat not found', 404));
  }

  if (req.files && req.files.resume && req.files.resume[0]) {
    userData.resume = req.files.resume[0].path;
  }

  const history = await ChatModel.endChat(id, userData);

  res.status(200).json({
    success: true,
    message: 'Chat ended successfully',
    data: formatHistoryResponse(history)
  });
});

export const getChatStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await ChatModel.getChatStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

export const getDashboard = catchAsyncErrors(async (req, res, next) => {
  const [chatStats, historyStats, questionStats, answerStats, recentChats] = await Promise.all([
    ChatModel.getChatStats(),
    ChatModel.getHistoryStats(),
    ChatModel.getQuestionStats(),
    ChatModel.getAnswerStats(),
    ChatModel.findRecentHistory(10)
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: chatStats,
      history: historyStats,
      questions: questionStats,
      answers: answerStats,
      recent_chats: recentChats.map(formatHistoryResponse)
    }
  });
});