import db from '../../config/db.js';

/**
 * Create a new subscriber or return existing one
 * @param {string} email - Subscriber email
 * @param {string} ip - IP address of subscriber
 * @returns {Promise<Object>} Subscriber object with isNew flag
 */
export const createSubscriber = async (email, ip = '') => {
  try {
    const normalizedEmail = email.toLowerCase();

    // Check for existing subscriber
    const [existing] = await db.query(
      'SELECT * FROM subscriber WHERE email = ?',
      [normalizedEmail]
    );

    if (existing.length > 0) {
      return {
        ...existing[0],
        isNew: false,
        message: 'Already subscribed'
      };
    }

    // Insert new subscriber
    const [result] = await db.query(
      'INSERT INTO subscriber (email, ip) VALUES (?, ?)',
      [normalizedEmail, ip || '']
    );

    // Fetch the newly created subscriber
    const [newSubscriber] = await db.query(
      'SELECT * FROM subscriber WHERE id = ?',
      [result.insertId]
    );

    return {
      ...newSubscriber[0],
      isNew: true
    };

  } catch (error) {
    throw new Error(`Failed to create subscriber: ${error.message}`);
  }
};

/**
 * Remove subscriber by email
 * @param {string} email - Subscriber email to remove
 * @returns {Promise<Object|null>} Deleted subscriber object or null if not found
 */
export const unsubscribeByEmail = async (email) => {
  try {
    const normalizedEmail = email.toLowerCase();

    // Verify subscriber exists
    const [existing] = await db.query(
      'SELECT * FROM subscriber WHERE email = ?',
      [normalizedEmail]
    );

    if (existing.length === 0) {
      return null;
    }

    // Delete subscriber
    await db.query(
      'DELETE FROM subscriber WHERE email = ?',
      [normalizedEmail]
    );

    return existing[0];

  } catch (error) {
    throw new Error(`Failed to unsubscribe: ${error.message}`);
  }
};

/**
 * Get paginated list of subscribers with optional search
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @param {string} search - Search term for email
 * @returns {Promise<Object>} Paginated subscribers data
 */
export const getAllSubscribers = async (page = 1, limit = 10, search = '') => {
  try {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = '';

    if (search) {
      whereClause = 'WHERE email LIKE ?';
      params.push(`%${search}%`);
    }

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM subscriber ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get paginated results
    const [subscribers] = await db.query(
      `SELECT * FROM subscriber ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      subscribers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };

  } catch (error) {
    throw new Error(`Failed to fetch subscribers: ${error.message}`);
  }
};

/**
 * Get single subscriber by ID
 * @param {number} id - Subscriber ID
 * @returns {Promise<Object|null>} Subscriber object or null if not found
 */
export const getSubscriberById = async (id) => {
  try {
    const [subscriber] = await db.query(
      'SELECT * FROM subscriber WHERE id = ?',
      [id]
    );

    return subscriber[0] || null;

  } catch (error) {
    throw new Error(`Failed to fetch subscriber: ${error.message}`);
  }
};

/**
 * Update subscriber status (delete if deactivating)
 * @param {number} id - Subscriber ID
 * @param {boolean} is_active - Active status
 * @returns {Promise<Object>} Updated subscriber or deletion confirmation
 */
export const updateSubscriberStatus = async (id, is_active) => {
  try {
    if (!is_active) {
      await db.query('DELETE FROM subscriber WHERE id = ?', [id]);
      return { id, deleted: true };
    }

    return await getSubscriberById(id);

  } catch (error) {
    throw new Error(`Failed to update subscriber status: ${error.message}`);
  }
};

/**
 * Permanently delete a subscriber
 * @param {number} id - Subscriber ID
 * @returns {Promise<boolean>} True if deleted, false otherwise
 */
export const deleteSubscriber = async (id) => {
  try {
    const [result] = await db.query(
      'DELETE FROM subscriber WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;

  } catch (error) {
    throw new Error(`Failed to delete subscriber: ${error.message}`);
  }
};

/**
 * Get total count of subscribers
 * @returns {Promise<number>} Total subscriber count
 */
export const getActiveSubscribersCount = async () => {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM subscriber'
    );

    return result[0].count;

  } catch (error) {
    throw new Error(`Failed to get subscriber count: ${error.message}`);
  }
};

/**
 * Create subscriber table if it doesn't exist
 * @returns {Promise<boolean>} True if successful
 */
export const createSubscribeTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS subscriber (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(191) NOT NULL UNIQUE,
        ip VARCHAR(191) NOT NULL DEFAULT '',
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await db.query(query);
    return true;

  } catch (error) {
    throw new Error(`Failed to create subscriber table: ${error.message}`);
  }
};

/**
 * Check if email already exists in database
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if exists, false otherwise
 */
export const checkEmailExists = async (email) => {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM subscriber WHERE email = ?',
      [email.toLowerCase()]
    );

    return result[0].count > 0;

  } catch (error) {
    throw new Error(`Failed to check email existence: ${error.message}`);
  }
};