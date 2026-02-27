import pool from '../../config/db.js';

// ==================== TABLE CREATION ====================

export const createSavedPropertyTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS saved_properties (
      id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT(10) UNSIGNED NOT NULL,
      item_id INT(10) UNSIGNED NOT NULL,
      item_type ENUM('property', 'project') NOT NULL DEFAULT 'property',
      item_name VARCHAR(255),
      item_slug VARCHAR(255),
      item_image VARCHAR(500),
      item_price DECIMAL(15,2),
      item_location VARCHAR(255),
      item_bedrooms VARCHAR(50),
      item_area VARCHAR(100),
      type VARCHAR(50) DEFAULT 'wishlist',
      notes TEXT,
      status INT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_item (user_id, item_id, item_type),
      INDEX idx_user_id (user_id),
      INDEX idx_item_type (item_type),
      INDEX idx_status (status),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  await pool.query(query);
  return { success: true, message: 'Saved properties table created' };
};

// ==================== ADD TO SAVED ====================

export const addToSaved = async (data) => {
  const {
    user_id,
    item_id,
    item_type = 'property',
    item_name,
    item_slug,
    item_image,
    item_price,
    item_location,
    item_bedrooms,
    item_area,
    type = 'wishlist',
    notes
  } = data;

  const query = `
    INSERT INTO saved_properties 
    (user_id, item_id, item_type, item_name, item_slug, item_image, item_price, item_location, item_bedrooms, item_area, type, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      item_name = VALUES(item_name),
      item_image = VALUES(item_image),
      item_price = VALUES(item_price),
      item_location = VALUES(item_location),
      status = 1,
      updated_at = CURRENT_TIMESTAMP
  `;

  const [result] = await pool.query(query, [
    user_id, item_id, item_type, item_name, item_slug, item_image, 
    item_price, item_location, item_bedrooms, item_area, type, notes
  ]);

  return result;
};

// ==================== REMOVE FROM SAVED ====================

export const removeFromSaved = async (user_id, item_id, item_type = 'property') => {
  const query = `DELETE FROM saved_properties WHERE user_id = ? AND item_id = ? AND item_type = ?`;
  const [result] = await pool.query(query, [user_id, item_id, item_type]);
  return result;
};

// ==================== TOGGLE SAVED (ADD/REMOVE) ====================

export const toggleSaved = async (data) => {
  const { user_id, item_id, item_type = 'property' } = data;

  const existing = await checkIfSaved(user_id, item_id, item_type);

  if (existing) {
    await removeFromSaved(user_id, item_id, item_type);
    return { action: 'removed', is_saved: false };
  } else {
    await addToSaved(data);
    return { action: 'added', is_saved: true };
  }
};

// ==================== CHECK IF SAVED ====================

export const checkIfSaved = async (user_id, item_id, item_type = 'property') => {
  const query = `SELECT id FROM saved_properties WHERE user_id = ? AND item_id = ? AND item_type = ? AND status = 1`;
  const [rows] = await pool.query(query, [user_id, item_id, item_type]);
  return rows.length > 0 ? rows[0] : null;
};

// ==================== GET ALL SAVED BY USER ====================

export const getSavedByUser = async (user_id, filters = {}) => {
  const { item_type, type = 'wishlist', page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  let whereConditions = ['sp.user_id = ?', 'sp.status = 1'];
  let params = [user_id];

  if (item_type) {
    whereConditions.push('sp.item_type = ?');
    params.push(item_type);
  }

  if (type) {
    whereConditions.push('sp.type = ?');
    params.push(type);
  }

  const whereClause = whereConditions.join(' AND ');

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as total FROM saved_properties sp WHERE ${whereClause}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT 
      sp.*,
      CASE 
        WHEN sp.item_type = 'property' THEN p.property_name
        WHEN sp.item_type = 'project' THEN pr.ProjectName
      END as current_name,
      CASE 
        WHEN sp.item_type = 'property' THEN p.price
        WHEN sp.item_type = 'project' THEN pr.price
      END as current_price,
      CASE 
        WHEN sp.item_type = 'property' THEN p.status
        WHEN sp.item_type = 'project' THEN pr.status
      END as item_status
    FROM saved_properties sp
    LEFT JOIN properties p ON sp.item_id = p.id AND sp.item_type = 'property'
    LEFT JOIN project_listing pr ON sp.item_id = pr.id AND sp.item_type = 'project'
    WHERE ${whereClause}
    ORDER BY sp.created_at DESC
    LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), parseInt(offset)]
  );

  return {
    properties: rows,
    total: countResult[0].total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(countResult[0].total / limit)
  };
};

// ==================== GET SAVED WITH FULL DETAILS ====================

export const getSavedWithDetails = async (user_id, item_type = null) => {
  let typeCondition = '';
  let params = [user_id];

  if (item_type) {
    typeCondition = 'AND sp.item_type = ?';
    params.push(item_type);
  }

  const [rows] = await pool.query(
    `SELECT 
      sp.id as saved_id,
      sp.item_id,
      sp.item_type,
      sp.type,
      sp.notes,
      sp.created_at as saved_at,
      CASE 
        WHEN sp.item_type = 'property' THEN p.property_name
        WHEN sp.item_type = 'project' THEN pr.ProjectName
      END as name,
      CASE 
        WHEN sp.item_type = 'property' THEN p.property_slug
        WHEN sp.item_type = 'project' THEN pr.project_slug
      END as slug,
      CASE 
        WHEN sp.item_type = 'property' THEN p.featured_image
        WHEN sp.item_type = 'project' THEN pr.featured_image
      END as image,
      CASE 
        WHEN sp.item_type = 'property' THEN p.price
        WHEN sp.item_type = 'project' THEN pr.price
      END as price,
      CASE 
        WHEN sp.item_type = 'property' THEN p.location
        WHEN sp.item_type = 'project' THEN pr.LocationName
      END as location,
      CASE 
        WHEN sp.item_type = 'property' THEN p.bedroom
        WHEN sp.item_type = 'project' THEN pr.bedroom
      END as bedrooms,
      CASE 
        WHEN sp.item_type = 'property' THEN p.area
        WHEN sp.item_type = 'project' THEN pr.area
      END as area,
      CASE 
        WHEN sp.item_type = 'property' THEN p.status
        WHEN sp.item_type = 'project' THEN pr.status
      END as item_status
    FROM saved_properties sp
    LEFT JOIN properties p ON sp.item_id = p.id AND sp.item_type = 'property'
    LEFT JOIN project_listing pr ON sp.item_id = pr.id AND sp.item_type = 'project'
    WHERE sp.user_id = ? AND sp.status = 1 ${typeCondition}
    ORDER BY sp.created_at DESC`,
    params
  );

  return rows;
};

// ==================== GET SAVED COUNT ====================

export const getSavedCount = async (user_id, type = 'wishlist') => {
  const query = `SELECT COUNT(*) as count FROM saved_properties WHERE user_id = ? AND type = ? AND status = 1`;
  const [rows] = await pool.query(query, [user_id, type]);
  return rows[0].count;
};

// ==================== CLEAR ALL SAVED ====================

export const clearAllSaved = async (user_id, type = 'wishlist') => {
  const query = `DELETE FROM saved_properties WHERE user_id = ? AND type = ?`;
  const [result] = await pool.query(query, [user_id, type]);
  return result;
};

// ==================== GET SAVED IDS BY USER ====================

export const getSavedIds = async (user_id, item_type = null) => {
  let query = `SELECT item_id, item_type FROM saved_properties WHERE user_id = ? AND status = 1`;
  let params = [user_id];

  if (item_type) {
    query += ` AND item_type = ?`;
    params.push(item_type);
  }

  const [rows] = await pool.query(query, params);
  
  return {
    all: rows.map(r => ({ id: r.item_id, type: r.item_type })),
    properties: rows.filter(r => r.item_type === 'property').map(r => r.item_id),
    projects: rows.filter(r => r.item_type === 'project').map(r => r.item_id)
  };
};

// ==================== BULK ADD TO SAVED ====================

export const bulkAddToSaved = async (user_id, items) => {
  if (!items || items.length === 0) return { success: true, added: 0 };

  const values = items.map(item => [
    user_id,
    item.item_id,
    item.item_type || 'property',
    item.item_name,
    item.item_slug,
    item.item_image,
    item.item_price,
    item.item_location,
    item.item_bedrooms,
    item.item_area,
    item.type || 'wishlist',
    item.notes || null
  ]);

  const query = `
    INSERT INTO saved_properties 
    (user_id, item_id, item_type, item_name, item_slug, item_image, item_price, item_location, item_bedrooms, item_area, type, notes)
    VALUES ?
    ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
  `;

  const [result] = await pool.query(query, [values]);
  return { success: true, added: result.affectedRows };
};

// ==================== UPDATE SAVED ITEM ====================

export const updateSavedItem = async (id, user_id, data) => {
  const { notes, type } = data;
  
  const query = `UPDATE saved_properties SET notes = ?, type = ? WHERE id = ? AND user_id = ?`;
  const [result] = await pool.query(query, [notes, type, id, user_id]);
  return result;
};

// ==================== GET SAVED BY ID ====================

export const getSavedById = async (id, user_id) => {
  const query = `SELECT * FROM saved_properties WHERE id = ? AND user_id = ?`;
  const [rows] = await pool.query(query, [id, user_id]);
  return rows[0];
};

// ==================== INIT ====================

export const init = async () => {
  await createSavedPropertyTable();
  return { success: true, message: 'Saved properties model initialized' };
};