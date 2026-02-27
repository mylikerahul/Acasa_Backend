import pool from '../../config/db.js';

export const createCitiesTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        country_id INT(11),
        state_id INT(11),
        city_data_id INT(11),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE,
        latitude VARCHAR(100),
        longitude VARCHAR(100),
        img VARCHAR(100),
        description TEXT,
        seo_title VARCHAR(255),
        seo_keywork VARCHAR(255),
        seo_description TEXT,
        status CHAR(4) NOT NULL DEFAULT '1',
        INDEX idx_slug (slug),
        INDEX idx_country_id (country_id),
        INDEX idx_state_id (state_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS city_data (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        country_id INT(11) NOT NULL,
        name VARCHAR(255),
        description LONGTEXT,
        status INT(1) NOT NULL DEFAULT 1,
        create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_country_id (country_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getActiveCities = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 20,
      country_id,
      state_id,
      search,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = ['c.status = 1'];
    let params = [];

    if (country_id) {
      whereConditions.push('c.country_id = ?');
      params.push(parseInt(country_id));
    }
    if (state_id) {
      whereConditions.push('c.state_id = ?');
      params.push(parseInt(state_id));
    }
    if (search) {
      whereConditions.push('(c.name LIKE ? OR c.slug LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const allowedSortColumns = ['name', 'id', 'country_id'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM cities c ${whereClause}`,
      params
    );

    const [cities] = await connection.query(
      `SELECT 
         c.*,
         co.name as country_name,
         s.name as state_name,
         (SELECT COUNT(*) FROM properties p WHERE p.city_id = c.id AND p.status = 1) as property_count,
         (SELECT COUNT(*) FROM project_listing pl WHERE pl.city_id = c.id AND pl.status = 1) as project_count
       FROM cities c
       LEFT JOIN country co ON c.country_id = co.id
       LEFT JOIN state s ON c.state_id = s.id
       ${whereClause}
       ORDER BY c.${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: cities,
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

export const getCityBySlug = async (slug) => {
  const connection = await pool.getConnection();
  try {
    const [cityRows] = await connection.query(
      `SELECT c.*, co.name as country_name
       FROM cities c
       LEFT JOIN country co ON c.country_id = co.id
       WHERE c.slug = ? AND c.status = 1`,
      [slug]
    );

    if (cityRows.length === 0) {
      return { success: false, message: 'City not found' };
    }

    const city = cityRows[0];

    const [communities] = await connection.query(
      `SELECT id, name, slug, img
       FROM community
       WHERE city_id = ? AND status = 1
       ORDER BY name ASC`,
      [city.id]
    );

    return {
      success: true,
      data: {
        ...city,
        communities
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getCityById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [cityRows] = await connection.query(
      'SELECT * FROM cities WHERE id = ?',
      [parseInt(id)]
    );

    if (cityRows.length === 0) {
      return { success: false, message: 'City not found' };
    }

    return {
      success: true,
      data: cityRows[0]
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getAllCitiesAdmin = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 10,
      status,
      country_id,
      state_id,
      search,
      sortBy = 'id',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    if (status !== undefined && status !== null && status !== '') {
      whereConditions.push('c.status = ?');
      params.push(status);
    }
    if (country_id) {
      whereConditions.push('c.country_id = ?');
      params.push(parseInt(country_id));
    }
    if (state_id) {
      whereConditions.push('c.state_id = ?');
      params.push(parseInt(state_id));
    }
    if (search) {
      whereConditions.push('(c.name LIKE ? OR c.slug LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const allowedSortColumns = ['id', 'name', 'country_id', 'status'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM cities c ${whereClause}`,
      params
    );

    const [cities] = await connection.query(
      `SELECT 
         c.*,
         co.name as country_name,
         (SELECT COUNT(*) FROM community cm WHERE cm.city_id = c.id) as community_count,
         (SELECT COUNT(*) FROM properties p WHERE p.city_id = c.id) as property_count
       FROM cities c
       LEFT JOIN country co ON c.country_id = co.id
       ${whereClause}
       ORDER BY c.${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: cities,
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

export const createCity = async (cityData) => {
  const connection = await pool.getConnection();
  try {
    if (!cityData.slug && cityData.name) {
      cityData.slug = cityData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const [existingSlug] = await connection.query(
      'SELECT id FROM cities WHERE slug = ?',
      [cityData.slug]
    );

    if (existingSlug.length > 0) {
      cityData.slug = cityData.slug + '-' + Date.now();
    }

    const fields = Object.keys(cityData);
    const values = Object.values(cityData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO cities (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      cityId: result.insertId,
      slug: cityData.slug,
      message: 'City created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateCity = async (id, updateData) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM cities WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'City not found' };
    }

    if (updateData.slug) {
      const [existingSlug] = await connection.query(
        'SELECT id FROM cities WHERE slug = ? AND id != ?',
        [updateData.slug, parseInt(id)]
      );

      if (existingSlug.length > 0) {
        return { success: false, message: 'Slug already exists' };
      }
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), parseInt(id)];

    await connection.query(
      `UPDATE cities SET ${fields} WHERE id = ?`,
      values
    );

    return { success: true, message: 'City updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteCity = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM cities WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'City not found' };
    }

    await connection.query(
      "UPDATE cities SET status = '0' WHERE id = ?",
      [parseInt(id)]
    );

    return { success: true, message: 'City deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const hardDeleteCity = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM cities WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'City not found' };
    }

    await connection.query('DELETE FROM cities WHERE id = ?', [parseInt(id)]);

    return { success: true, message: 'City permanently deleted' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateCityStatus = async (id, status) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE cities SET status = ? WHERE id = ?',
      [status.toString(), parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'City not found' };
    }

    return { success: true, message: 'Status updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const restoreCity = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      "UPDATE cities SET status = '1' WHERE id = ? AND status = '0'",
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'City not found or not deleted' };
    }

    return { success: true, message: 'City restored successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const checkSlugAvailability = async (slug, excludeId = null) => {
  const connection = await pool.getConnection();
  try {
    let query = 'SELECT id FROM cities WHERE slug = ?';
    let params = [slug];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(parseInt(excludeId));
    }

    const [result] = await connection.query(query, params);

    return {
      success: true,
      available: result.length === 0
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getCityData = async (countryId) => {
  const connection = await pool.getConnection();
  try {
    const [data] = await connection.query(
      'SELECT * FROM city_data WHERE country_id = ? AND status = 1 ORDER BY name ASC',
      [parseInt(countryId)]
    );

    return { success: true, data };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getCountries = async () => {
  const connection = await pool.getConnection();
  try {
    const [countries] = await connection.query(
      'SELECT * FROM country WHERE status = 1 ORDER BY name ASC'
    );
    return { success: true, data: countries };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getStates = async (countryId) => {
  const connection = await pool.getConnection();
  try {
    let query = 'SELECT * FROM state WHERE status = 1';
    let params = [];

    if (countryId) {
      query += ' AND country_id = ?';
      params.push(parseInt(countryId));
    }

    query += ' ORDER BY name ASC';

    const [states] = await connection.query(query, params);
    return { success: true, data: states };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getCityStats = async () => {
  const connection = await pool.getConnection();
  try {
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_cities,
        SUM(CASE WHEN status = '1' THEN 1 ELSE 0 END) as active_cities,
        SUM(CASE WHEN status = '0' THEN 1 ELSE 0 END) as inactive_cities
      FROM cities
    `);

    const [countryStats] = await connection.query(`
      SELECT country_id, COUNT(*) as count
      FROM cities
      WHERE status = '1'
      GROUP BY country_id
      ORDER BY count DESC
      LIMIT 10
    `);

    return {
      success: true,
      data: {
        ...stats[0],
        by_country: countryStats
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createCityData = async (dataObj) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO city_data (country_id, name, description, status) VALUES (?, ?, ?, ?)',
      [parseInt(dataObj.country_id), dataObj.name, dataObj.description, dataObj.status || 1]
    );

    return {
      success: true,
      id: result.insertId,
      message: 'City data created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateCityData = async (id, dataObj) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(dataObj).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(dataObj), parseInt(id)];

    const [result] = await connection.query(
      `UPDATE city_data SET ${fields} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'City data not found' };
    }

    return { success: true, message: 'City data updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteCityData = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'DELETE FROM city_data WHERE id = ?',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'City data not found' };
    }

    return { success: true, message: 'City data deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  createCitiesTable,
  getActiveCities,
  getCityBySlug,
  getCityById,
  getAllCitiesAdmin,
  createCity,
  updateCity,
  deleteCity,
  hardDeleteCity,
  updateCityStatus,
  restoreCity,
  checkSlugAvailability,
  getCityData,
  getCountries,
  getStates,
  getCityStats,
  createCityData,
  updateCityData,
  deleteCityData
};