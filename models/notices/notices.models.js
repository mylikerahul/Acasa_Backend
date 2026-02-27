import pool from '../../config/db.js';

export const createNoticesTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notices (
        id INT(10) AUTO_INCREMENT PRIMARY KEY,
        Headings VARCHAR(100),
        Description VARCHAR(100),
        assign VARCHAR(100),
        date VARCHAR(100),
        title VARCHAR(100),
        heading VARCHAR(100),
        slug VARCHAR(100),
        descriptions VARCHAR(100),
        seo_title VARCHAR(100),
        seo_keywork VARCHAR(100),
        seo_description VARCHAR(100),
        INDEX idx_assign (assign),
        INDEX idx_date (date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getNotices = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const { page = 1, limit = 20, assign, date, search } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (assign) {
      whereConditions.push('assign = ?');
      params.push(assign);
    }

    if (date) {
      whereConditions.push('date = ?');
      params.push(date);
    }

    if (search) {
      whereConditions.push('(Headings LIKE ? OR Description LIKE ? OR assign LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM notices ${whereClause}`,
      params
    );

    const [notices] = await connection.query(
      `SELECT * FROM notices 
       ${whereClause}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: notices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / limit),
        totalItems: countResult[0].total,
        itemsPerPage: parseInt(limit)
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getNoticeById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM notices WHERE id = ?',
      [parseInt(id)]
    );

    if (rows.length === 0) {
      return { success: false, message: 'Notice not found' };
    }

    return { success: true, data: rows[0] };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createNotice = async (noticeData) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(noticeData);
    const values = Object.values(noticeData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO notices (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      noticeId: result.insertId,
      message: 'Notice created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateNotice = async (id, updateData) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM notices WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Notice not found' };
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), parseInt(id)];

    await connection.query(
      `UPDATE notices SET ${fields} WHERE id = ?`,
      values
    );

    return { success: true, message: 'Notice updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteNotice = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'DELETE FROM notices WHERE id = ?',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Notice not found' };
    }

    return { success: true, message: 'Notice deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getNoticesByUser = async (userName) => {
  const connection = await pool.getConnection();
  try {
    const [notices] = await connection.query(
      'SELECT * FROM notices WHERE assign = ? ORDER BY id DESC',
      [userName]
    );

    return { success: true, data: notices };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  createNoticesTable,
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  getNoticesByUser
};