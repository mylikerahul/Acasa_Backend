import pool from '../../config/db.js';

const TABLES = {
  HISTORY: 'chat_history',
  QUESTION: 'chat_question',
  ANSWER: 'chat_answer'
};

export const createChatTables = async () => {
  const historyQuery = `
    CREATE TABLE IF NOT EXISTS ${TABLES.HISTORY} (
      id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      ip VARCHAR(20) DEFAULT NULL,
      name VARCHAR(100) DEFAULT NULL,
      email VARCHAR(255) DEFAULT NULL,
      phone VARCHAR(14) DEFAULT NULL,
      resume VARCHAR(255) DEFAULT NULL,
      history TEXT DEFAULT NULL,
      action INT(1) DEFAULT NULL,
      status INT(1) NOT NULL DEFAULT 1,
      create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const questionQuery = `
    CREATE TABLE IF NOT EXISTS ${TABLES.QUESTION} (
      id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      question VARCHAR(255) DEFAULT NULL,
      next_step INT(11) DEFAULT NULL,
      status INT(1) NOT NULL DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const answerQuery = `
    CREATE TABLE IF NOT EXISTS ${TABLES.ANSWER} (
      id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      q_id INT(11) NOT NULL,
      answer TEXT NOT NULL,
      status INT(1) NOT NULL DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await pool.query(historyQuery);
  await pool.query(questionQuery);
  await pool.query(answerQuery);
};

export const findAllHistory = async (filters = {}, pagination = {}) => {
  const page = parseInt(pagination.page) || 1;
  const limit = parseInt(pagination.limit) || 20;
  const offset = (page - 1) * limit;

  let conditions = [];
  let params = [];

  if (filters.status !== undefined) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters.search) {
    conditions.push(`(name LIKE ? OR email LIKE ? OR phone LIKE ? OR ip LIKE ?)`);
    const term = `%${filters.search}%`;
    params.push(term, term, term, term);
  }

  if (filters.ip) {
    conditions.push('ip = ?');
    params.push(filters.ip);
  }

  if (filters.email) {
    conditions.push('email = ?');
    params.push(filters.email);
  }

  if (filters.phone) {
    conditions.push('phone = ?');
    params.push(filters.phone);
  }

  if (filters.action) {
    conditions.push('action = ?');
    params.push(filters.action);
  }

  if (filters.start_date && filters.end_date) {
    conditions.push('DATE(create_date) BETWEEN ? AND ?');
    params.push(filters.start_date, filters.end_date);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = filters.orderBy || 'create_date';
  const order = filters.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const dataQuery = `SELECT * FROM ${TABLES.HISTORY} ${whereClause} ORDER BY ${orderBy} ${order} LIMIT ? OFFSET ?`;
  const countQuery = `SELECT COUNT(*) as total FROM ${TABLES.HISTORY} ${whereClause}`;

  const [rows] = await pool.query(dataQuery, [...params, limit, offset]);
  const [countResult] = await pool.query(countQuery, params);

  return {
    data: rows,
    pagination: {
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit)
    }
  };
};

export const findHistoryById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLES.HISTORY} WHERE id = ?`, [id]);
  return rows[0] || null;
};

export const findHistoryByIp = async (ip) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLES.HISTORY} WHERE ip = ? ORDER BY create_date DESC`, [ip]);
  return rows;
};

export const findHistoryByEmail = async (email) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLES.HISTORY} WHERE email = ? ORDER BY create_date DESC`, [email]);
  return rows;
};

export const findHistoryByPhone = async (phone) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLES.HISTORY} WHERE phone = ? ORDER BY create_date DESC`, [phone]);
  return rows;
};

export const findHistoryByDateRange = async (startDate, endDate) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLES.HISTORY} WHERE DATE(create_date) BETWEEN ? AND ? ORDER BY create_date DESC`,
    [startDate, endDate]
  );
  return rows;
};

export const findRecentHistory = async (limit = 20) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLES.HISTORY} WHERE status = 1 ORDER BY create_date DESC LIMIT ?`, [parseInt(limit)]);
  return rows;
};

export const createHistory = async (data) => {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map(() => '?').join(', ');

  const query = `INSERT INTO ${TABLES.HISTORY} (${fields.join(', ')}) VALUES (${placeholders})`;
  const [result] = await pool.query(query, values);

  return { id: result.insertId, ...data };
};

export const updateHistory = async (id, data) => {
  const fields = Object.keys(data);
  const values = Object.values(data);

  if (!fields.length) return null;

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE ${TABLES.HISTORY} SET ${setClause} WHERE id = ?`;

  await pool.query(query, [...values, id]);
  return findHistoryById(id);
};

export const updateHistoryStatus = async (id, status) => {
  await pool.query(`UPDATE ${TABLES.HISTORY} SET status = ? WHERE id = ?`, [status, id]);
  return findHistoryById(id);
};

export const updateHistoryAction = async (id, action) => {
  await pool.query(`UPDATE ${TABLES.HISTORY} SET action = ? WHERE id = ?`, [action, id]);
  return findHistoryById(id);
};

export const appendChatHistory = async (id, newHistory) => {
  const existing = await findHistoryById(id);
  if (!existing) return null;

  const updatedHistory = existing.history
    ? `${existing.history}\n${newHistory}`
    : newHistory;

  await pool.query(`UPDATE ${TABLES.HISTORY} SET history = ? WHERE id = ?`, [updatedHistory, id]);
  return findHistoryById(id);
};

export const removeHistory = async (id) => {
  await pool.query(`DELETE FROM ${TABLES.HISTORY} WHERE id = ?`, [id]);
  return true;
};

export const softDeleteHistory = async (id) => {
  await pool.query(`UPDATE ${TABLES.HISTORY} SET status = 0 WHERE id = ?`, [id]);
  return true;
};

export const bulkDeleteHistory = async (ids) => {
  const placeholders = ids.map(() => '?').join(',');
  await pool.query(`DELETE FROM ${TABLES.HISTORY} WHERE id IN (${placeholders})`, ids);
  return true;
};

export const bulkUpdateHistoryStatus = async (ids, status) => {
  const placeholders = ids.map(() => '?').join(',');
  await pool.query(`UPDATE ${TABLES.HISTORY} SET status = ? WHERE id IN (${placeholders})`, [status, ...ids]);
  return true;
};

export const deleteOldHistory = async (days = 30) => {
  const [result] = await pool.query(
    `DELETE FROM ${TABLES.HISTORY} WHERE create_date < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [days]
  );
  return result.affectedRows;
};

export const clearAllHistory = async () => {
  await pool.query(`TRUNCATE TABLE ${TABLES.HISTORY}`);
  return true;
};

export const getHistoryStats = async () => {
  const query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive,
      SUM(CASE WHEN DATE(create_date) = CURDATE() THEN 1 ELSE 0 END) as today,
      SUM(CASE WHEN create_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as last_week,
      SUM(CASE WHEN create_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as last_month,
      COUNT(DISTINCT ip) as unique_ips,
      COUNT(DISTINCT email) as unique_emails
    FROM ${TABLES.HISTORY}
  `;
  const [rows] = await pool.query(query);
  return rows[0];
};

export const getHistoryCountByAction = async () => {
  const query = `
    SELECT action, COUNT(*) as count 
    FROM ${TABLES.HISTORY} 
    WHERE action IS NOT NULL
    GROUP BY action 
    ORDER BY count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export const getHistoryCountByDate = async (days = 30) => {
  const query = `
    SELECT DATE(create_date) as date, COUNT(*) as count 
    FROM ${TABLES.HISTORY} 
    WHERE create_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(create_date) 
    ORDER BY date DESC
  `;
  const [rows] = await pool.query(query, [days]);
  return rows;
};

export const findAllQuestions = async (filters = {}, pagination = {}) => {
  const page = parseInt(pagination.page) || 1;
  const limit = parseInt(pagination.limit) || 20;
  const offset = (page - 1) * limit;

  let conditions = [];
  let params = [];

  if (filters.status !== undefined) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters.search) {
    conditions.push('question LIKE ?');
    params.push(`%${filters.search}%`);
  }

  if (filters.next_step) {
    conditions.push('next_step = ?');
    params.push(filters.next_step);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = filters.orderBy || 'id';
  const order = filters.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const dataQuery = `SELECT * FROM ${TABLES.QUESTION} ${whereClause} ORDER BY ${orderBy} ${order} LIMIT ? OFFSET ?`;
  const countQuery = `SELECT COUNT(*) as total FROM ${TABLES.QUESTION} ${whereClause}`;

  const [rows] = await pool.query(dataQuery, [...params, limit, offset]);
  const [countResult] = await pool.query(countQuery, params);

  return {
    data: rows,
    pagination: {
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit)
    }
  };
};

export const findAllActiveQuestions = async () => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLES.QUESTION} WHERE status = 1 ORDER BY id ASC`);
  return rows;
};

export const findQuestionById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLES.QUESTION} WHERE id = ?`, [id]);
  return rows[0] || null;
};

export const findQuestionByNextStep = async (nextStep) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLES.QUESTION} WHERE next_step = ? AND status = 1`, [nextStep]);
  return rows;
};

export const findQuestionWithAnswers = async (id) => {
  const question = await findQuestionById(id);
  if (!question) return null;

  const [answers] = await pool.query(`SELECT * FROM ${TABLES.ANSWER} WHERE q_id = ? AND status = 1 ORDER BY id ASC`, [id]);

  return {
    ...question,
    answers
  };
};

export const findAllQuestionsWithAnswers = async () => {
  const [questions] = await pool.query(`SELECT * FROM ${TABLES.QUESTION} WHERE status = 1 ORDER BY id ASC`);

  const result = [];
  for (const question of questions) {
    const [answers] = await pool.query(`SELECT * FROM ${TABLES.ANSWER} WHERE q_id = ? AND status = 1 ORDER BY id ASC`, [question.id]);
    result.push({
      ...question,
      answers
    });
  }

  return result;
};

export const findFirstQuestion = async () => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLES.QUESTION} WHERE status = 1 ORDER BY id ASC LIMIT 1`);
  if (!rows[0]) return null;

  const [answers] = await pool.query(`SELECT * FROM ${TABLES.ANSWER} WHERE q_id = ? AND status = 1 ORDER BY id ASC`, [rows[0].id]);

  return {
    ...rows[0],
    answers
  };
};

export const createQuestion = async (data) => {
  const { question, next_step, status = 1 } = data;

  const query = `INSERT INTO ${TABLES.QUESTION} (question, next_step, status) VALUES (?, ?, ?)`;
  const [result] = await pool.query(query, [question, next_step || null, status]);

  return { id: result.insertId, question, next_step, status };
};

export const createQuestionWithAnswers = async (data) => {
  const { question, next_step, status = 1, answers = [] } = data;

  const questionResult = await createQuestion({ question, next_step, status });

  if (answers.length) {
    await createManyAnswers(questionResult.id, answers);
  }

  return findQuestionWithAnswers(questionResult.id);
};

export const updateQuestion = async (id, data) => {
  const fields = Object.keys(data);
  const values = Object.values(data);

  if (!fields.length) return null;

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE ${TABLES.QUESTION} SET ${setClause} WHERE id = ?`;

  await pool.query(query, [...values, id]);
  return findQuestionById(id);
};

export const updateQuestionStatus = async (id, status) => {
  await pool.query(`UPDATE ${TABLES.QUESTION} SET status = ? WHERE id = ?`, [status, id]);
  return findQuestionById(id);
};

export const updateQuestionNextStep = async (id, nextStep) => {
  await pool.query(`UPDATE ${TABLES.QUESTION} SET next_step = ? WHERE id = ?`, [nextStep, id]);
  return findQuestionById(id);
};

export const removeQuestion = async (id) => {
  await pool.query(`DELETE FROM ${TABLES.ANSWER} WHERE q_id = ?`, [id]);
  await pool.query(`DELETE FROM ${TABLES.QUESTION} WHERE id = ?`, [id]);
  return true;
};

export const softDeleteQuestion = async (id) => {
  await pool.query(`UPDATE ${TABLES.QUESTION} SET status = 0 WHERE id = ?`, [id]);
  return true;
};

export const bulkDeleteQuestions = async (ids) => {
  const placeholders = ids.map(() => '?').join(',');
  await pool.query(`DELETE FROM ${TABLES.ANSWER} WHERE q_id IN (${placeholders})`, ids);
  await pool.query(`DELETE FROM ${TABLES.QUESTION} WHERE id IN (${placeholders})`, ids);
  return true;
};

export const bulkUpdateQuestionsStatus = async (ids, status) => {
  const placeholders = ids.map(() => '?').join(',');
  await pool.query(`UPDATE ${TABLES.QUESTION} SET status = ? WHERE id IN (${placeholders})`, [status, ...ids]);
  return true;
};

export const getQuestionStats = async () => {
  const query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive
    FROM ${TABLES.QUESTION}
  `;
  const [rows] = await pool.query(query);
  return rows[0];
};

export const reorderQuestions = async (orderedIds) => {
  for (let i = 0; i < orderedIds.length; i++) {
    await pool.query(`UPDATE ${TABLES.QUESTION} SET next_step = ? WHERE id = ?`, [orderedIds[i + 1] || null, orderedIds[i]]);
  }
  return true;
};

export const findAllAnswers = async (filters = {}, pagination = {}) => {
  const page = parseInt(pagination.page) || 1;
  const limit = parseInt(pagination.limit) || 20;
  const offset = (page - 1) * limit;

  let conditions = [];
  let params = [];

  if (filters.status !== undefined) {
    conditions.push('a.status = ?');
    params.push(filters.status);
  }

  if (filters.q_id) {
    conditions.push('a.q_id = ?');
    params.push(filters.q_id);
  }

  if (filters.search) {
    conditions.push('a.answer LIKE ?');
    params.push(`%${filters.search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = filters.orderBy || 'a.id';
  const order = filters.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const dataQuery = `
    SELECT a.*, q.question 
    FROM ${TABLES.ANSWER} a
    LEFT JOIN ${TABLES.QUESTION} q ON a.q_id = q.id
    ${whereClause} 
    ORDER BY ${orderBy} ${order} 
    LIMIT ? OFFSET ?
  `;
  const countQuery = `SELECT COUNT(*) as total FROM ${TABLES.ANSWER} a ${whereClause}`;

  const [rows] = await pool.query(dataQuery, [...params, limit, offset]);
  const [countResult] = await pool.query(countQuery, params);

  return {
    data: rows,
    pagination: {
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit)
    }
  };
};

export const findAnswerById = async (id) => {
  const query = `
    SELECT a.*, q.question 
    FROM ${TABLES.ANSWER} a
    LEFT JOIN ${TABLES.QUESTION} q ON a.q_id = q.id
    WHERE a.id = ?
  `;
  const [rows] = await pool.query(query, [id]);
  return rows[0] || null;
};

export const findAnswersByQuestionId = async (qId) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLES.ANSWER} WHERE q_id = ? AND status = 1 ORDER BY id ASC`, [qId]);
  return rows;
};

export const findAllAnswersByQuestionId = async (qId) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLES.ANSWER} WHERE q_id = ? ORDER BY id ASC`, [qId]);
  return rows;
};

export const createAnswer = async (data) => {
  const { q_id, answer, status = 1 } = data;

  if (!q_id || !answer) {
    throw new Error('Question ID and answer are required');
  }

  const query = `INSERT INTO ${TABLES.ANSWER} (q_id, answer, status) VALUES (?, ?, ?)`;
  const [result] = await pool.query(query, [q_id, answer, status]);

  return { id: result.insertId, q_id, answer, status };
};

export const createManyAnswers = async (qId, answers) => {
  if (!answers || !answers.length) return [];

  const values = answers.map(answer => [qId, typeof answer === 'string' ? answer : answer.answer, 1]);
  const placeholders = values.map(() => '(?, ?, ?)').join(', ');
  const flatValues = values.flat();

  const query = `INSERT INTO ${TABLES.ANSWER} (q_id, answer, status) VALUES ${placeholders}`;
  const [result] = await pool.query(query, flatValues);

  return { insertId: result.insertId, affectedRows: result.affectedRows };
};

export const updateAnswer = async (id, data) => {
  const fields = Object.keys(data);
  const values = Object.values(data);

  if (!fields.length) return null;

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE ${TABLES.ANSWER} SET ${setClause} WHERE id = ?`;

  await pool.query(query, [...values, id]);
  return findAnswerById(id);
};

export const updateAnswerStatus = async (id, status) => {
  await pool.query(`UPDATE ${TABLES.ANSWER} SET status = ? WHERE id = ?`, [status, id]);
  return findAnswerById(id);
};

export const removeAnswer = async (id) => {
  await pool.query(`DELETE FROM ${TABLES.ANSWER} WHERE id = ?`, [id]);
  return true;
};

export const removeAnswersByQuestionId = async (qId) => {
  await pool.query(`DELETE FROM ${TABLES.ANSWER} WHERE q_id = ?`, [qId]);
  return true;
};

export const softDeleteAnswer = async (id) => {
  await pool.query(`UPDATE ${TABLES.ANSWER} SET status = 0 WHERE id = ?`, [id]);
  return true;
};

export const bulkDeleteAnswers = async (ids) => {
  const placeholders = ids.map(() => '?').join(',');
  await pool.query(`DELETE FROM ${TABLES.ANSWER} WHERE id IN (${placeholders})`, ids);
  return true;
};

export const bulkUpdateAnswersStatus = async (ids, status) => {
  const placeholders = ids.map(() => '?').join(',');
  await pool.query(`UPDATE ${TABLES.ANSWER} SET status = ? WHERE id IN (${placeholders})`, [status, ...ids]);
  return true;
};

export const replaceAnswers = async (qId, answers) => {
  await pool.query(`DELETE FROM ${TABLES.ANSWER} WHERE q_id = ?`, [qId]);
  if (answers && answers.length) {
    return createManyAnswers(qId, answers);
  }
  return { affectedRows: 0 };
};

export const getAnswerStats = async () => {
  const query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive,
      COUNT(DISTINCT q_id) as questions_with_answers
    FROM ${TABLES.ANSWER}
  `;
  const [rows] = await pool.query(query);
  return rows[0];
};

export const getAnswerCountByQuestion = async () => {
  const query = `
    SELECT 
      a.q_id,
      q.question,
      COUNT(*) as answer_count
    FROM ${TABLES.ANSWER} a
    LEFT JOIN ${TABLES.QUESTION} q ON a.q_id = q.id
    GROUP BY a.q_id, q.question
    ORDER BY answer_count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export const getChatFlow = async () => {
  return findAllQuestionsWithAnswers();
};

export const getNextQuestion = async (currentQuestionId) => {
  const current = await findQuestionById(currentQuestionId);

  if (!current || !current.next_step) return null;

  return findQuestionWithAnswers(current.next_step);
};

export const startChat = async (ipAddress) => {
  const history = await createHistory({ ip: ipAddress, status: 1 });
  const firstQuestion = await findFirstQuestion();

  return {
    chat_id: history.id,
    question: firstQuestion
  };
};

export const saveUserResponse = async (chatId, questionId, answerId, answerText) => {
  const existing = await findHistoryById(chatId);
  if (!existing) return null;

  const newEntry = JSON.stringify({
    question_id: questionId,
    answer_id: answerId,
    answer_text: answerText,
    timestamp: new Date().toISOString()
  });

  const history = existing.history
    ? `${existing.history},${newEntry}`
    : newEntry;

  await pool.query(`UPDATE ${TABLES.HISTORY} SET history = ? WHERE id = ?`, [history, chatId]);

  return true;
};

export const endChat = async (chatId, userData) => {
  const { name, email, phone, resume } = userData;

  await pool.query(
    `UPDATE ${TABLES.HISTORY} SET name = ?, email = ?, phone = ?, resume = ?, action = 1 WHERE id = ?`,
    [name || null, email || null, phone || null, resume || null, chatId]
  );

  return findHistoryById(chatId);
};

export const getChatStats = async () => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM ${TABLES.QUESTION} WHERE status = 1) as total_questions,
      (SELECT COUNT(*) FROM ${TABLES.ANSWER} WHERE status = 1) as total_answers,
      (SELECT COUNT(*) FROM ${TABLES.HISTORY}) as total_chats,
      (SELECT COUNT(*) FROM ${TABLES.HISTORY} WHERE action = 1) as completed_chats,
      (SELECT COUNT(*) FROM ${TABLES.HISTORY} WHERE DATE(create_date) = CURDATE()) as today_chats,
      (SELECT COUNT(DISTINCT ip) FROM ${TABLES.HISTORY}) as unique_users
  `;
  const [rows] = await pool.query(query);
  return rows[0];
};

export default {
  createChatTables,
  findAllHistory,
  findHistoryById,
  findHistoryByIp,
  findHistoryByEmail,
  findHistoryByPhone,
  findHistoryByDateRange,
  findRecentHistory,
  createHistory,
  updateHistory,
  updateHistoryStatus,
  updateHistoryAction,
  appendChatHistory,
  removeHistory,
  softDeleteHistory,
  bulkDeleteHistory,
  bulkUpdateHistoryStatus,
  deleteOldHistory,
  clearAllHistory,
  getHistoryStats,
  getHistoryCountByAction,
  getHistoryCountByDate,
  findAllQuestions,
  findAllActiveQuestions,
  findQuestionById,
  findQuestionByNextStep,
  findQuestionWithAnswers,
  findAllQuestionsWithAnswers,
  findFirstQuestion,
  createQuestion,
  createQuestionWithAnswers,
  updateQuestion,
  updateQuestionStatus,
  updateQuestionNextStep,
  removeQuestion,
  softDeleteQuestion,
  bulkDeleteQuestions,
  bulkUpdateQuestionsStatus,
  getQuestionStats,
  reorderQuestions,
  findAllAnswers,
  findAnswerById,
  findAnswersByQuestionId,
  findAllAnswersByQuestionId,
  createAnswer,
  createManyAnswers,
  updateAnswer,
  updateAnswerStatus,
  removeAnswer,
  removeAnswersByQuestionId,
  softDeleteAnswer,
  bulkDeleteAnswers,
  bulkUpdateAnswersStatus,
  replaceAnswers,
  getAnswerStats,
  getAnswerCountByQuestion,
  getChatFlow,
  getNextQuestion,
  startChat,
  saveUserResponse,
  endChat,
  getChatStats
};