import pool from '../../config/db.js';

const TABLE = 'analytics';

export const createAnalyticsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_type VARCHAR(100) DEFAULT NULL,
      event_name VARCHAR(255) DEFAULT NULL,
      category VARCHAR(100) DEFAULT NULL,
      user_id INT DEFAULT NULL,
      user_name VARCHAR(100) DEFAULT NULL,
      session_id VARCHAR(255) DEFAULT NULL,
      page_url VARCHAR(500) DEFAULT NULL,
      page_title VARCHAR(255) DEFAULT NULL,
      referrer VARCHAR(500) DEFAULT NULL,
      device_type VARCHAR(50) DEFAULT NULL,
      browser VARCHAR(100) DEFAULT NULL,
      os VARCHAR(100) DEFAULT NULL,
      screen_resolution VARCHAR(50) DEFAULT NULL,
      country VARCHAR(100) DEFAULT NULL,
      city VARCHAR(100) DEFAULT NULL,
      ip_address VARCHAR(50) DEFAULT NULL,
      duration INT DEFAULT NULL,
      metadata JSON DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'recorded',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_event_type (event_type),
      INDEX idx_user_id (user_id),
      INDEX idx_session_id (session_id),
      INDEX idx_category (category),
      INDEX idx_created_at (created_at)
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
    conditions.push(`(event_name LIKE ? OR page_url LIKE ? OR page_title LIKE ? OR user_name LIKE ?)`);
    const term = `%${filters.search}%`;
    params.push(term, term, term, term);
  }

  if (filters.event_type) {
    conditions.push('event_type = ?');
    params.push(filters.event_type);
  }

  if (filters.event_name) {
    conditions.push('event_name = ?');
    params.push(filters.event_name);
  }

  if (filters.category) {
    conditions.push('category = ?');
    params.push(filters.category);
  }

  if (filters.user_id) {
    conditions.push('user_id = ?');
    params.push(filters.user_id);
  }

  if (filters.session_id) {
    conditions.push('session_id = ?');
    params.push(filters.session_id);
  }

  if (filters.device_type) {
    conditions.push('device_type = ?');
    params.push(filters.device_type);
  }

  if (filters.browser) {
    conditions.push('browser = ?');
    params.push(filters.browser);
  }

  if (filters.os) {
    conditions.push('os = ?');
    params.push(filters.os);
  }

  if (filters.country) {
    conditions.push('country = ?');
    params.push(filters.country);
  }

  if (filters.city) {
    conditions.push('city = ?');
    params.push(filters.city);
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

export const findBySessionId = async (sessionId) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE session_id = ? ORDER BY created_at DESC`, [sessionId]);
  return rows;
};

export const findByEventType = async (eventType) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE event_type = ? ORDER BY created_at DESC`, [eventType]);
  return rows;
};

export const findByCategory = async (category) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE category = ? ORDER BY created_at DESC`, [category]);
  return rows;
};

export const findByDateRange = async (startDate, endDate) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE} WHERE DATE(created_at) BETWEEN ? AND ? ORDER BY created_at DESC`,
    [startDate, endDate]
  );
  return rows;
};

export const findRecent = async (limit = 20) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} ORDER BY created_at DESC LIMIT ?`, [parseInt(limit)]);
  return rows;
};

export const findByPageUrl = async (pageUrl) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE page_url = ? ORDER BY created_at DESC`, [pageUrl]);
  return rows;
};

export const findByCountry = async (country) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE country = ? ORDER BY created_at DESC`, [country]);
  return rows;
};

export const findByDeviceType = async (deviceType) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE device_type = ? ORDER BY created_at DESC`, [deviceType]);
  return rows;
};

export const findByBrowser = async (browser) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE browser = ? ORDER BY created_at DESC`, [browser]);
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

export const deleteBySessionId = async (sessionId) => {
  await pool.query(`DELETE FROM ${TABLE} WHERE session_id = ?`, [sessionId]);
  return true;
};

export const deleteOldAnalytics = async (days = 90) => {
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
      COUNT(*) as total_events,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(DISTINCT session_id) as total_sessions,
      COUNT(DISTINCT page_url) as unique_pages,
      SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_events,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as week_events,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as month_events,
      ROUND(AVG(duration), 2) as avg_duration
    FROM ${TABLE}
  `;
  const [rows] = await pool.query(query);
  return rows[0];
};

export const getCountByEventType = async () => {
  const query = `
    SELECT event_type, COUNT(*) as count 
    FROM ${TABLE} 
    WHERE event_type IS NOT NULL
    GROUP BY event_type 
    ORDER BY count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export const getCountByCategory = async () => {
  const query = `
    SELECT category, COUNT(*) as count 
    FROM ${TABLE} 
    WHERE category IS NOT NULL
    GROUP BY category 
    ORDER BY count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export const getCountByDeviceType = async () => {
  const query = `
    SELECT 
      device_type,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ${TABLE}), 2) as percentage
    FROM ${TABLE} 
    WHERE device_type IS NOT NULL
    GROUP BY device_type
    ORDER BY count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export const getCountByBrowser = async () => {
  const query = `
    SELECT 
      browser,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ${TABLE}), 2) as percentage
    FROM ${TABLE} 
    WHERE browser IS NOT NULL
    GROUP BY browser
    ORDER BY count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export const getCountByOS = async () => {
  const query = `
    SELECT 
      os,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ${TABLE}), 2) as percentage
    FROM ${TABLE} 
    WHERE os IS NOT NULL
    GROUP BY os
    ORDER BY count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export const getCountByCountry = async () => {
  const query = `
    SELECT 
      country,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ${TABLE}), 2) as percentage
    FROM ${TABLE} 
    WHERE country IS NOT NULL
    GROUP BY country
    ORDER BY count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export const getCountByCity = async () => {
  const query = `
    SELECT 
      city,
      country,
      COUNT(*) as count
    FROM ${TABLE} 
    WHERE city IS NOT NULL
    GROUP BY city, country
    ORDER BY count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export const getPopularPages = async (limit = 10) => {
  const query = `
    SELECT 
      page_url, 
      page_title, 
      COUNT(*) as views,
      COUNT(DISTINCT user_id) as unique_visitors,
      ROUND(AVG(duration), 2) as avg_duration
    FROM ${TABLE} 
    WHERE page_url IS NOT NULL
    GROUP BY page_url, page_title
    ORDER BY views DESC
    LIMIT ?
  `;
  const [rows] = await pool.query(query, [parseInt(limit)]);
  return rows;
};

export const getTopReferrers = async (limit = 10) => {
  const query = `
    SELECT 
      referrer, 
      COUNT(*) as count,
      COUNT(DISTINCT user_id) as unique_users
    FROM ${TABLE} 
    WHERE referrer IS NOT NULL AND referrer != ''
    GROUP BY referrer
    ORDER BY count DESC
    LIMIT ?
  `;
  const [rows] = await pool.query(query, [parseInt(limit)]);
  return rows;
};

export const getHourlyDistribution = async (days = 1) => {
  const query = `
    SELECT 
      HOUR(created_at) as hour,
      COUNT(*) as count
    FROM ${TABLE} 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY HOUR(created_at)
    ORDER BY hour
  `;
  const [rows] = await pool.query(query, [days]);
  return rows;
};

export const getDailyDistribution = async (days = 30) => {
  const query = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as count,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(DISTINCT session_id) as sessions
    FROM ${TABLE} 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `;
  const [rows] = await pool.query(query, [days]);
  return rows;
};

export const getWeeklyDistribution = async (weeks = 12) => {
  const query = `
    SELECT 
      YEARWEEK(created_at) as week,
      MIN(DATE(created_at)) as week_start,
      COUNT(*) as count,
      COUNT(DISTINCT user_id) as unique_users
    FROM ${TABLE} 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? WEEK)
    GROUP BY YEARWEEK(created_at)
    ORDER BY week DESC
  `;
  const [rows] = await pool.query(query, [weeks]);
  return rows;
};

export const getMonthlyDistribution = async (months = 12) => {
  const query = `
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      COUNT(*) as count,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(DISTINCT session_id) as sessions
    FROM ${TABLE} 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month DESC
  `;
  const [rows] = await pool.query(query, [months]);
  return rows;
};

export const getUserJourney = async (sessionId) => {
  const query = `
    SELECT 
      page_url,
      page_title,
      event_type,
      event_name,
      duration,
      created_at
    FROM ${TABLE} 
    WHERE session_id = ?
    ORDER BY created_at ASC
  `;
  const [rows] = await pool.query(query, [sessionId]);
  return rows;
};

export const getActiveUsers = async (minutes = 30) => {
  const query = `
    SELECT 
      COUNT(DISTINCT user_id) as active_users,
      COUNT(DISTINCT session_id) as active_sessions
    FROM ${TABLE} 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
  `;
  const [rows] = await pool.query(query, [minutes]);
  return rows[0];
};

export const getBounceRate = async (days = 30) => {
  const query = `
    SELECT 
      ROUND(
        (SELECT COUNT(DISTINCT session_id) FROM ${TABLE} 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY session_id HAVING COUNT(*) = 1) * 100.0 /
        NULLIF(COUNT(DISTINCT session_id), 0), 2
      ) as bounce_rate
    FROM ${TABLE}
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
  `;
  const [rows] = await pool.query(query, [days, days]);
  return rows[0];
};

export const getAvgSessionDuration = async (days = 30) => {
  const query = `
    SELECT 
      ROUND(AVG(session_duration), 2) as avg_session_duration
    FROM (
      SELECT 
        session_id,
        TIMESTAMPDIFF(SECOND, MIN(created_at), MAX(created_at)) as session_duration
      FROM ${TABLE}
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY session_id
      HAVING COUNT(*) > 1
    ) as sessions
  `;
  const [rows] = await pool.query(query, [days]);
  return rows[0];
};

export const getScreenResolutions = async () => {
  const query = `
    SELECT 
      screen_resolution,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ${TABLE}), 2) as percentage
    FROM ${TABLE} 
    WHERE screen_resolution IS NOT NULL
    GROUP BY screen_resolution
    ORDER BY count DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
};

export const trackPageView = async (data) => {
  const pageViewData = {
    event_type: 'pageview',
    event_name: 'Page View',
    ...data
  };
  return create(pageViewData);
};

export const trackEvent = async (data) => {
  const eventData = {
    event_type: 'event',
    ...data
  };
  return create(eventData);
};

export const trackClick = async (data) => {
  const clickData = {
    event_type: 'click',
    event_name: 'Click Event',
    ...data
  };
  return create(clickData);
};

export default {
  createAnalyticsTable,
  findAll,
  findById,
  findByUserId,
  findBySessionId,
  findByEventType,
  findByCategory,
  findByDateRange,
  findRecent,
  findByPageUrl,
  findByCountry,
  findByDeviceType,
  findByBrowser,
  create,
  update,
  remove,
  bulkDelete,
  deleteByUserId,
  deleteBySessionId,
  deleteOldAnalytics,
  clearAll,
  getStats,
  getCountByEventType,
  getCountByCategory,
  getCountByDeviceType,
  getCountByBrowser,
  getCountByOS,
  getCountByCountry,
  getCountByCity,
  getPopularPages,
  getTopReferrers,
  getHourlyDistribution,
  getDailyDistribution,
  getWeeklyDistribution,
  getMonthlyDistribution,
  getUserJourney,
  getActiveUsers,
  getBounceRate,
  getAvgSessionDuration,
  getScreenResolutions,
  trackPageView,
  trackEvent,
  trackClick
};