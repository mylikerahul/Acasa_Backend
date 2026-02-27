import pool from '../../config/db.js';

const TABLE = 'recent_activity';

export const createRecentActivityTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      activity_type VARCHAR(100) DEFAULT NULL,
      activity_title VARCHAR(255) DEFAULT NULL,
      activity_description TEXT DEFAULT NULL,
      user_name VARCHAR(100) DEFAULT NULL,
      user_id INT DEFAULT NULL,
      module VARCHAR(100) DEFAULT NULL,
      module_id INT DEFAULT NULL,
      action VARCHAR(50) DEFAULT NULL,
      ip_address VARCHAR(50) DEFAULT NULL,
      user_agent TEXT DEFAULT NULL,
      metadata JSON DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  await pool.query(query);
};

export const findAll = async (filters = {}, pagination = {}) => {
  const page = parseInt(pagination.page) || 1;
  const limit = parseInt(pagination.limit) || 20;
  const offset = (page - 1) * limit;

  let conditions = [];
  let params = [];

  if (filters.search) {
    conditions.push(`(activity_title LIKE ? OR activity_description LIKE ? OR user_name LIKE ? OR module LIKE ?)`);
    const term = `%${filters.search}%`;
    params.push(term, term, term, term);
  }

  if (filters.activity_type) {
    conditions.push('activity_type = ?');
    params.push(filters.activity_type);
  }

  if (filters.user_id) {
    conditions.push('user_id = ?');
    params.push(filters.user_id);
  }

  if (filters.user_name) {
    conditions.push('user_name = ?');
    params.push(filters.user_name);
  }

  if (filters.module) {
    conditions.push('module = ?');
    params.push(filters.module);
  }

  if (filters.module_id) {
    conditions.push('module_id = ?');
    params.push(filters.module_id);
  }

  if (filters.action) {
    conditions.push('action = ?');
    params.push(filters.action);
  }

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters.start_date && filters.end_date) {
    conditions.push('DATE(created_at) BETWEEN ? AND ?');
    params.push(filters.start_date, filters.end_date);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = filters.orderBy || 'created_at';
  const order = filters.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const dataQuery = `SELECT * FROM ${TABLE} ${whereClause} ORDER BY ${orderBy} ${order} LIMIT ? OFFSET ?`;
  const countQuery = `SELECT COUNT(*) as total FROM ${TABLE} ${whereClause}`;

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

export const findById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE id = ?`, [id]);
  return rows[0] || null;
};

export const findByUserId = async (userId) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
  return rows;
};

export const findByUserName = async (userName) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE user_name = ? ORDER BY created_at DESC`, [userName]);
  return rows;
};

export const findByModule = async (module) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE module = ? ORDER BY created_at DESC`, [module]);
  return rows;
};

export const findByModuleAndId = async (module, moduleId) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE module = ? AND module_id = ? ORDER BY created_at DESC`, [module, moduleId]);
  return rows;
};

export const findByAction = async (action) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE action = ? ORDER BY created_at DESC`, [action]);
  return rows;
};

export const findByType = async (activityType) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE activity_type = ? ORDER BY created_at DESC`, [activityType]);
  return rows;
};

export const findByDateRange = async (startDate, endDate) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE} WHERE DATE(created_at) BETWEEN ? AND ? ORDER BY created_at DESC`,
    [startDate, endDate]
  );
  return rows;
};

export const findRecent = async (limit = 10) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} ORDER BY created_at DESC LIMIT ?`, [parseInt(limit)]);
  return rows;
};

export const create = async (data) => {
  const fields = Object.keys(data);
  const values = Object.values(data).map(val => {
    if (typeof val === 'object' && val !== null) {
      return JSON.stringify(val);
    }
    return val;
  });
  const placeholders = fields.map(() => '?').join(', ');

  const query = `INSERT INTO ${TABLE} (${fields.join(', ')}) VALUES (${placeholders})`;
  const [result] = await pool.query(query, values);

  return { id: result.insertId, ...data };
};

export const update = async (id, data) => {
  const fields = Object.keys(data);
  const values = Object.values(data).map(val => {
    if (typeof val === 'object' && val !== null) {
      return JSON.stringify(val);
    }
    return val;
  });

  if (!fields.length) return null;

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE ${TABLE} SET ${setClause} WHERE id = ?`;

  await pool.query(query, [...values, id]);
  return findById(id);
};

export const remove = async (id) => {
  await pool.query(`DELETE FROM ${TABLE} WHERE id = ?`, [id]);
  return true;
};

export const bulkDelete = async (ids) => {
  const placeholders = ids.map(() => '?').join(',');
  await pool.query(`DELETE FROM ${TABLE} WHERE id IN (${placeholders})`, ids);
  return true;
};

export const deleteByUserId = async (userId) => {
  await pool.query(`DELETE FROM ${TABLE} WHERE user_id = ?`, [userId]);
  return true;
};

export const deleteByModule = async (module, moduleId = null) => {
  if (moduleId) {
    await pool.query(`DELETE FROM ${TABLE} WHERE module = ? AND module_id = ?`, [module, moduleId]);
  } else {
    await pool.query(`DELETE FROM ${TABLE} WHERE module = ?`, [module]);
  }
  return true;
};

export const deleteOldActivities = async (days = 30) => {
  const [result] = await pool.query(
    `DELETE FROM ${TABLE} WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [days]
  );
  return result.affectedRows;
};

export const clearAll = async () => {
  await pool.query(`TRUNCATE TABLE ${TABLE}`);
  return true;
};

export const getStats = async () => {
  const query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as last_week,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as last_month
    FROM ${TABLE}
  `;
  const [rows] = await pool.query(query);
  return rows[0];
};

export const getCountByModule = async () => {
  const query = `
    SELECT module, COUNT(*) as count 
    FROM ${TABLE} 
    WHERE module IS NOT NULL
    GROUP BY module 
    ORDER BY count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export const getCountByAction = async () => {
  const query = `
    SELECT action, COUNT(*) as count 
    FROM ${TABLE} 
    WHERE action IS NOT NULL
    GROUP BY action 
    ORDER BY count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export const getCountByType = async () => {
  const query = `
    SELECT activity_type, COUNT(*) as count 
    FROM ${TABLE} 
    WHERE activity_type IS NOT NULL
    GROUP BY activity_type 
    ORDER BY count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export const getCountByUser = async () => {
  const query = `
    SELECT user_id, user_name, COUNT(*) as count 
    FROM ${TABLE} 
    WHERE user_id IS NOT NULL
    GROUP BY user_id, user_name 
    ORDER BY count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export const getCountByDate = async (days = 30) => {
  const query = `
    SELECT DATE(created_at) as date, COUNT(*) as count 
    FROM ${TABLE} 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(created_at) 
    ORDER BY date DESC
  `;
  const [rows] = await pool.query(query, [days]);
  return rows;
};

export const getCountByStatus = async () => {
  const query = `
    SELECT status, COUNT(*) as count 
    FROM ${TABLE} 
    GROUP BY status 
    ORDER BY count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export default {
  createRecentActivityTable,
  findAll,
  findById,
  findByUserId,
  findByUserName,
  findByModule,
  findByModuleAndId,
  findByAction,
  findByType,
  findByDateRange,
  findRecent,
  create,
  update,
  remove,
  bulkDelete,
  deleteByUserId,
  deleteByModule,
  deleteOldActivities,
  clearAll,
  getStats,
  getCountByModule,
  getCountByAction,
  getCountByType,
  getCountByUser,
  getCountByDate,
  getCountByStatus
};