import pool from '../../config/db.js';

const TABLE = 'tasks';

export const createTasksTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      Commission VARCHAR(100) DEFAULT NULL,
      assign VARCHAR(100) DEFAULT NULL,
      date VARCHAR(100) DEFAULT NULL,
      title VARCHAR(100) DEFAULT NULL,
      slug VARCHAR(100) DEFAULT NULL,
      descriptions VARCHAR(100) DEFAULT NULL,
      heading VARCHAR(100) DEFAULT NULL,
      seo_title VARCHAR(100) DEFAULT NULL,
      seo_keywork VARCHAR(100) DEFAULT NULL,
      seo_description VARCHAR(100) DEFAULT NULL
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
    conditions.push(`(title LIKE ? OR heading LIKE ? OR descriptions LIKE ? OR assign LIKE ?)`);
    const term = `%${filters.search}%`;
    params.push(term, term, term, term);
  }

  if (filters.assign) {
    conditions.push('assign = ?');
    params.push(filters.assign);
  }

  if (filters.date) {
    conditions.push('date = ?');
    params.push(filters.date);
  }

  if (filters.slug) {
    conditions.push('slug = ?');
    params.push(filters.slug);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = filters.orderBy || 'id';
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

export const findBySlug = async (slug) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE slug = ?`, [slug]);
  return rows[0] || null;
};

export const findByAssign = async (assign) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE assign = ? ORDER BY id DESC`, [assign]);
  return rows;
};

export const findByDate = async (date) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE date = ? ORDER BY id DESC`, [date]);
  return rows;
};

export const findByDateRange = async (startDate, endDate) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE} WHERE date BETWEEN ? AND ? ORDER BY date DESC`,
    [startDate, endDate]
  );
  return rows;
};

export const checkSlugExists = async (slug, excludeId = null) => {
  let query = `SELECT * FROM ${TABLE} WHERE slug = ?`;
  let params = [slug];
  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  const [rows] = await pool.query(query, params);
  return rows[0] || null;
};

export const create = async (data) => {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map(() => '?').join(', ');

  const query = `INSERT INTO ${TABLE} (${fields.join(', ')}) VALUES (${placeholders})`;
  const [result] = await pool.query(query, values);

  return { id: result.insertId, ...data };
};

export const update = async (id, data) => {
  const fields = Object.keys(data);
  const values = Object.values(data);

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

export const updateAssign = async (id, assign) => {
  await pool.query(`UPDATE ${TABLE} SET assign = ? WHERE id = ?`, [assign, id]);
  return findById(id);
};

export const updateCommission = async (id, commission) => {
  await pool.query(`UPDATE ${TABLE} SET Commission = ? WHERE id = ?`, [commission, id]);
  return findById(id);
};

export const bulkUpdateAssign = async (ids, assign) => {
  const placeholders = ids.map(() => '?').join(',');
  await pool.query(`UPDATE ${TABLE} SET assign = ? WHERE id IN (${placeholders})`, [assign, ...ids]);
  return true;
};

export const getStats = async () => {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(DISTINCT assign) as total_assignees,
      COUNT(DISTINCT date) as total_dates
    FROM ${TABLE}
  `;
  const [rows] = await pool.query(query);
  return rows[0];
};

export const getTasksByAssignee = async () => {
  const query = `
    SELECT 
      assign,
      COUNT(*) as task_count
    FROM ${TABLE}
    WHERE assign IS NOT NULL
    GROUP BY assign
    ORDER BY task_count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export default {
  createTasksTable,
  findAll,
  findById,
  findBySlug,
  findByAssign,
  findByDate,
  findByDateRange,
  checkSlugExists,
  create,
  update,
  remove,
  bulkDelete,
  updateAssign,
  updateCommission,
  bulkUpdateAssign,
  getStats,
  getTasksByAssignee
};