import pool from '../../config/db.js';

// ============================================
// CREATE TABLE
// ============================================
export const createSellTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sell (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(70),
        last_name VARCHAR(70),
        mobile VARCHAR(13),
        email VARCHAR(200),
        address VARCHAR(255),
        city VARCHAR(70),
        community VARCHAR(255),
        idea_price VARCHAR(255),
        additional_info VARCHAR(255),
        bedrooms VARCHAR(200),
        sqr_ft VARCHAR(100),
        building_name VARCHAR(200),
        add_document VARCHAR(255),
        stubscribe INT(1),
        status INT(1) DEFAULT 0,
        create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_city (city),
        INDEX idx_email (email),
        INDEX idx_create_date (create_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// GET ALL SELL LISTINGS (Admin)
// ============================================
export const getAllSellListings = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 20,
      status,
      city,
      bedrooms,
      search,
      sortBy = 'create_date',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    // Status filter
    if (status !== undefined && status !== null && status !== '') {
      whereConditions.push('status = ?');
      params.push(parseInt(status));
    }

    // City filter
    if (city) {
      whereConditions.push('city = ?');
      params.push(city);
    }

    // Bedrooms filter
    if (bedrooms) {
      whereConditions.push('bedrooms LIKE ?');
      params.push(`%${bedrooms}%`);
    }

    // Search filter
    if (search) {
      whereConditions.push(
        '(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR mobile LIKE ? OR building_name LIKE ?)'
      );
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Safe sort columns
    const allowedSortColumns = ['create_date', 'update_date', 'first_name', 'city', 'status'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'create_date';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM sell ${whereClause}`,
      params
    );

    // Get listings
    const [listings] = await connection.query(
      `SELECT * FROM sell 
       ${whereClause}
       ORDER BY ${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: listings,
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

// ============================================
// GET SINGLE SELL LISTING BY ID
// ============================================
export const getSellListingById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [listings] = await connection.query(
      'SELECT * FROM sell WHERE id = ?',
      [parseInt(id)]
    );

    if (listings.length === 0) {
      return { success: false, message: 'Listing not found' };
    }

    return {
      success: true,
      data: listings[0]
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// CREATE SELL LISTING
// ============================================
export const createSellListing = async (listingData) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(listingData);
    const values = Object.values(listingData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO sell (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      listingId: result.insertId,
      message: 'Sell listing created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// UPDATE SELL LISTING
// ============================================
export const updateSellListing = async (id, updateData) => {
  const connection = await pool.getConnection();
  try {
    // Check if listing exists
    const [existing] = await connection.query(
      'SELECT id FROM sell WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Listing not found' };
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, message: 'No data to update' };
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), parseInt(id)];

    await connection.query(
      `UPDATE sell SET ${fields} WHERE id = ?`,
      values
    );

    return {
      success: true,
      message: 'Listing updated successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// DELETE SELL LISTING (Soft Delete)
// ============================================
export const deleteSellListing = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE sell SET status = 0 WHERE id = ?',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Listing not found' };
    }

    return {
      success: true,
      message: 'Listing deleted successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// HARD DELETE SELL LISTING
// ============================================
export const hardDeleteSellListing = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'DELETE FROM sell WHERE id = ?',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Listing not found' };
    }

    return {
      success: true,
      message: 'Listing permanently deleted'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// UPDATE STATUS
// ============================================
export const updateSellStatus = async (id, status) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE sell SET status = ? WHERE id = ?',
      [parseInt(status), parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Listing not found' };
    }

    return {
      success: true,
      message: 'Status updated successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// BULK UPDATE STATUS
// ============================================
export const bulkUpdateSellStatus = async (ids, status) => {
  const connection = await pool.getConnection();
  try {
    if (!ids || ids.length === 0) {
      return { success: false, message: 'No listing IDs provided' };
    }

    const sanitizedIds = ids.map(id => parseInt(id));
    const placeholders = sanitizedIds.map(() => '?').join(',');

    const [result] = await connection.query(
      `UPDATE sell SET status = ? WHERE id IN (${placeholders})`,
      [parseInt(status), ...sanitizedIds]
    );

    return {
      success: true,
      message: `${result.affectedRows} listings updated`,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// BULK DELETE
// ============================================
export const bulkDeleteSellListings = async (ids) => {
  const connection = await pool.getConnection();
  try {
    if (!ids || ids.length === 0) {
      return { success: false, message: 'No listing IDs provided' };
    }

    const sanitizedIds = ids.map(id => parseInt(id));
    const placeholders = sanitizedIds.map(() => '?').join(',');

    const [result] = await connection.query(
      `DELETE FROM sell WHERE id IN (${placeholders})`,
      sanitizedIds
    );

    return {
      success: true,
      message: `${result.affectedRows} listings deleted`,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// GET SELL STATS (Analytics)
// ============================================
export const getSellStats = async () => {
  const connection = await pool.getConnection();
  try {
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_listings,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_listings,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive_listings,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as pending_listings,
        SUM(CASE WHEN stubscribe = 1 THEN 1 ELSE 0 END) as subscribed_users
      FROM sell
    `);

    const [recentStats] = await connection.query(`
      SELECT COUNT(*) as new_listings_week
      FROM sell
      WHERE create_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    const [cityStats] = await connection.query(`
      SELECT city, COUNT(*) as count
      FROM sell
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city
      ORDER BY count DESC
      LIMIT 10
    `);

    return {
      success: true,
      data: {
        ...stats[0],
        new_listings_week: recentStats[0].new_listings_week,
        by_city: cityStats
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// GET RECENT SELL LISTINGS
// ============================================
export const getRecentSellListings = async (limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [listings] = await connection.query(
      `SELECT * FROM sell 
       ORDER BY create_date DESC 
       LIMIT ?`,
      [parseInt(limit)]
    );

    return {
      success: true,
      data: listings
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// SEARCH SELL LISTINGS
// ============================================
export const searchSellListings = async (searchTerm, limit = 20) => {
  const connection = await pool.getConnection();
  try {
    const term = `%${searchTerm}%`;

    const [listings] = await connection.query(
      `SELECT * FROM sell 
       WHERE first_name LIKE ? 
          OR last_name LIKE ? 
          OR email LIKE ? 
          OR mobile LIKE ? 
          OR city LIKE ?
          OR building_name LIKE ?
       ORDER BY create_date DESC 
       LIMIT ?`,
      [term, term, term, term, term, term, parseInt(limit)]
    );

    return {
      success: true,
      data: listings
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// GET LISTINGS BY CITY
// ============================================
export const getSellListingsByCity = async (city, limit = 20) => {
  const connection = await pool.getConnection();
  try {
    const [listings] = await connection.query(
      `SELECT * FROM sell 
       WHERE city = ? 
       ORDER BY create_date DESC 
       LIMIT ?`,
      [city, parseInt(limit)]
    );

    return {
      success: true,
      data: listings
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// GET LISTINGS BY STATUS
// ============================================
export const getSellListingsByStatus = async (status, limit = 20) => {
  const connection = await pool.getConnection();
  try {
    const [listings] = await connection.query(
      `SELECT * FROM sell 
       WHERE status = ? 
       ORDER BY create_date DESC 
       LIMIT ?`,
      [parseInt(status), parseInt(limit)]
    );

    return {
      success: true,
      data: listings
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// GET LISTINGS BY DATE RANGE
// ============================================
export const getSellListingsByDateRange = async (startDate, endDate) => {
  const connection = await pool.getConnection();
  try {
    const [listings] = await connection.query(
      `SELECT * FROM sell 
       WHERE create_date BETWEEN ? AND ? 
       ORDER BY create_date DESC`,
      [startDate, endDate]
    );

    return {
      success: true,
      data: listings
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// COUNT BY CITY
// ============================================
export const countSellListingsByCity = async () => {
  const connection = await pool.getConnection();
  try {
    const [counts] = await connection.query(`
      SELECT city, COUNT(*) as count 
      FROM sell 
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city 
      ORDER BY count DESC
    `);

    return {
      success: true,
      data: counts
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// COUNT BY STATUS
// ============================================
export const countSellListingsByStatus = async () => {
  const connection = await pool.getConnection();
  try {
    const [counts] = await connection.query(`
      SELECT status, COUNT(*) as count 
      FROM sell 
      GROUP BY status 
      ORDER BY status ASC
    `);

    return {
      success: true,
      data: counts
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// EXPORT DEFAULT
// ============================================
export default {
  createSellTable,
  getAllSellListings,
  getSellListingById,
  createSellListing,
  updateSellListing,
  deleteSellListing,
  hardDeleteSellListing,
  updateSellStatus,
  bulkUpdateSellStatus,
  bulkDeleteSellListings,
  getSellStats,
  getRecentSellListings,
  searchSellListings,
  getSellListingsByCity,
  getSellListingsByStatus,
  getSellListingsByDateRange,
  countSellListingsByCity,
  countSellListingsByStatus
};