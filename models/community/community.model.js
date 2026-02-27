import pool from '../../config/db.js';

export const createCommunityTables = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS community (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        community_id INT(11),
        name VARCHAR(255) NOT NULL,
        country_id INT(11) NOT NULL,
        state_id INT(11),
        city_id INT(11) NOT NULL,
        slug VARCHAR(191) UNIQUE,
        latitude VARCHAR(191),
        longitude VARCHAR(191),
        img VARCHAR(255),
        school_img VARCHAR(255) DEFAULT 'school.png',
        hotel_img VARCHAR(255) DEFAULT 'hotal.png',
        hospital_img VARCHAR(255),
        train_img VARCHAR(255),
        bus_img VARCHAR(255),
        description TEXT,
        top_community VARCHAR(255),
        top_projects VARCHAR(255),
        featured_project VARCHAR(255),
        related_blog VARCHAR(255),
        properties VARCHAR(255),
        similar_location VARCHAR(255),
        sales_diretor VARCHAR(255),
        seo_slug VARCHAR(255),
        seo_title VARCHAR(255),
        seo_keywork VARCHAR(255),
        seo_description TEXT,
        featured INT(1),
        status INT(11) NOT NULL,
        INDEX idx_slug (slug),
        INDEX idx_city_id (city_id),
        INDEX idx_country_id (country_id),
        INDEX idx_state_id (state_id),
        INDEX idx_status (status),
        INDEX idx_featured (featured)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS community_data (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        city_id INT(11) NOT NULL,
        name VARCHAR(255),
        status INT(1) NOT NULL DEFAULT 1,
        state_id INT(11),
        INDEX idx_city_id (city_id),
        INDEX idx_state_id (state_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sub_community (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        country_id INT(11),
        state_id INT(11),
        city_id INT(11),
        community_id INT(11),
        direction VARCHAR(255),
        name VARCHAR(255),
        slug VARCHAR(191),
        img VARCHAR(255),
        latitude VARCHAR(191),
        longitude VARCHAR(191),
        description TEXT,
        top_community VARCHAR(255),
        top_projects VARCHAR(255),
        featured_project VARCHAR(255),
        related_blog VARCHAR(255),
        properties VARCHAR(255),
        similar_location VARCHAR(255),
        sales_diretor INT(11),
        seo_slug VARCHAR(255),
        seo_title VARCHAR(255),
        seo_keywork VARCHAR(255),
        seo_description TEXT,
        status INT(11),
        INDEX idx_slug (slug),
        INDEX idx_community_id (community_id),
        INDEX idx_city_id (city_id),
        INDEX idx_country_id (country_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sub_community_data (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        community_id INT(11) NOT NULL,
        name VARCHAR(255) UNIQUE,
        status INT(1) NOT NULL DEFAULT 1,
        INDEX idx_community_id (community_id),
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

export const getActiveCommunities = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 20,
      city_id,
      state_id,
      country_id,
      featured,
      search,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = ['c.status = 1'];
    let params = [];

    if (city_id) {
      whereConditions.push('c.city_id = ?');
      params.push(parseInt(city_id));
    }
    if (state_id) {
      whereConditions.push('c.state_id = ?');
      params.push(parseInt(state_id));
    }
    if (country_id) {
      whereConditions.push('c.country_id = ?');
      params.push(parseInt(country_id));
    }
    if (featured) {
      whereConditions.push('c.featured = ?');
      params.push(parseInt(featured));
    }
    if (search) {
      whereConditions.push('(c.name LIKE ? OR c.slug LIKE ? OR c.description LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const allowedSortColumns = ['name', 'city_id', 'id', 'featured'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM community c ${whereClause}`,
      params
    );

    const [communities] = await connection.query(
      `SELECT 
         c.*,
         (SELECT COUNT(*) FROM sub_community sc WHERE sc.community_id = c.id AND sc.status = 1) as sub_community_count,
         (SELECT COUNT(*) FROM properties p WHERE p.community_id = c.id AND p.status = 1) as property_count
       FROM community c
       ${whereClause}
       ORDER BY c.${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: communities,
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

export const getCommunityBySlug = async (slug) => {
  const connection = await pool.getConnection();
  try {
    const [communityRows] = await connection.query(
      `SELECT c.*
       FROM community c
       WHERE c.slug = ? AND c.status = 1`,
      [slug]
    );

    if (communityRows.length === 0) {
      return { success: false, message: 'Community not found' };
    }

    const community = communityRows[0];

    const [subCommunities] = await connection.query(
      `SELECT id, name, slug, img, latitude, longitude, description, direction
       FROM sub_community
       WHERE community_id = ? AND status = 1
       ORDER BY name ASC`,
      [community.id]
    );

    const [properties] = await connection.query(
      `SELECT id, property_name, property_slug, featured_image, price, property_type, bedroom, area
       FROM properties
       WHERE community_id = ? AND status = 1
       ORDER BY created_at DESC
       LIMIT 10`,
      [community.id]
    );

    const [projects] = await connection.query(
      `SELECT id, ProjectName, project_slug, featured_image, price, property_type, bedroom
       FROM project_listing
       WHERE community_id = ? AND status = 1
       ORDER BY created_at DESC
       LIMIT 10`,
      [community.id]
    );

    let relatedBlogs = [];
    if (community.related_blog && community.related_blog.trim() !== '') {
      const blogIds = community.related_blog
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id) && id > 0);

      if (blogIds.length > 0) {
        const placeholders = blogIds.map(() => '?').join(',');
        const [blogs] = await connection.query(
          `SELECT id, title, slug, imageurl, publish_date, category
           FROM blogs
           WHERE id IN (${placeholders}) AND status = 1`,
          blogIds
        );
        relatedBlogs = blogs;
      }
    }

    let similarCommunities = [];
    if (community.similar_location && community.similar_location.trim() !== '') {
      const communityIds = community.similar_location
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id) && id > 0);

      if (communityIds.length > 0) {
        const placeholders = communityIds.map(() => '?').join(',');
        const [similar] = await connection.query(
          `SELECT id, name, slug, img, city_id
           FROM community
           WHERE id IN (${placeholders}) AND status = 1`,
          communityIds
        );
        similarCommunities = similar;
      }
    }

    return {
      success: true,
      data: {
        ...community,
        subCommunities,
        properties,
        projects,
        relatedBlogs,
        similarCommunities
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getCommunityById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [communityRows] = await connection.query(
      'SELECT * FROM community WHERE id = ?',
      [parseInt(id)]
    );

    if (communityRows.length === 0) {
      return { success: false, message: 'Community not found' };
    }

    const community = communityRows[0];

    const [subCommunities] = await connection.query(
      'SELECT * FROM sub_community WHERE community_id = ? ORDER BY name ASC',
      [parseInt(id)]
    );

    return {
      success: true,
      data: {
        ...community,
        subCommunities
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getFeaturedCommunities = async (limit = 6) => {
  const connection = await pool.getConnection();
  try {
    const [communities] = await connection.query(
      `SELECT 
         c.id, c.name, c.slug, c.img, c.city_id, c.description, c.featured,
         (SELECT COUNT(*) FROM sub_community sc WHERE sc.community_id = c.id AND sc.status = 1) as sub_community_count,
         (SELECT COUNT(*) FROM properties p WHERE p.community_id = c.id AND p.status = 1) as property_count
       FROM community c
       WHERE c.status = 1 AND c.featured = 1
       ORDER BY c.name ASC
       LIMIT ?`,
      [parseInt(limit)]
    );

    return { success: true, data: communities };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getCommunitiesByCity = async (cityId, limit = 50) => {
  const connection = await pool.getConnection();
  try {
    const [communities] = await connection.query(
      `SELECT 
         c.id, c.name, c.slug, c.img, c.city_id, c.description,
         (SELECT COUNT(*) FROM sub_community sc WHERE sc.community_id = c.id AND sc.status = 1) as sub_community_count,
         (SELECT COUNT(*) FROM properties p WHERE p.community_id = c.id AND p.status = 1) as property_count
       FROM community c
       WHERE c.city_id = ? AND c.status = 1
       ORDER BY c.name ASC
       LIMIT ?`,
      [parseInt(cityId), parseInt(limit)]
    );

    return { success: true, data: communities };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const searchCommunities = async (query, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const searchTerm = `%${query}%`;

    const [communities] = await connection.query(
      `SELECT 
         id, name, slug, img, city_id, description
       FROM community
       WHERE status = 1
         AND (name LIKE ? OR slug LIKE ? OR description LIKE ?)
       ORDER BY 
         CASE 
           WHEN name LIKE ? THEN 1
           ELSE 2 
         END,
         name ASC
       LIMIT ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]
    );

    return { success: true, data: communities };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getAllCommunitiesAdmin = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 10,
      status,
      city_id,
      state_id,
      country_id,
      featured,
      search,
      sortBy = 'id',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    if (status !== undefined && status !== null && status !== '') {
      whereConditions.push('c.status = ?');
      params.push(parseInt(status));
    }
    if (city_id) {
      whereConditions.push('c.city_id = ?');
      params.push(parseInt(city_id));
    }
    if (state_id) {
      whereConditions.push('c.state_id = ?');
      params.push(parseInt(state_id));
    }
    if (country_id) {
      whereConditions.push('c.country_id = ?');
      params.push(parseInt(country_id));
    }
    if (featured !== undefined && featured !== null && featured !== '') {
      whereConditions.push('c.featured = ?');
      params.push(parseInt(featured));
    }
    if (search) {
      whereConditions.push('(c.name LIKE ? OR c.slug LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const allowedSortColumns = ['id', 'name', 'city_id', 'status', 'featured'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM community c ${whereClause}`,
      params
    );

    const [communities] = await connection.query(
      `SELECT 
         c.*,
         (SELECT COUNT(*) FROM sub_community sc WHERE sc.community_id = c.id) as sub_community_count,
         (SELECT COUNT(*) FROM properties p WHERE p.community_id = c.id) as property_count,
         (SELECT COUNT(*) FROM project_listing pl WHERE pl.community_id = c.id) as project_count
       FROM community c
       ${whereClause}
       ORDER BY c.${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: communities,
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

export const createCommunity = async (communityData) => {
  const connection = await pool.getConnection();
  try {
    if (!communityData.slug && communityData.name) {
      communityData.slug = communityData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const [existingSlug] = await connection.query(
      'SELECT id FROM community WHERE slug = ?',
      [communityData.slug]
    );

    if (existingSlug.length > 0) {
      communityData.slug = communityData.slug + '-' + Date.now();
    }

    const fields = Object.keys(communityData);
    const values = Object.values(communityData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO community (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      communityId: result.insertId,
      slug: communityData.slug,
      message: 'Community created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateCommunity = async (id, updateData) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM community WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Community not found' };
    }

    if (updateData.slug) {
      const [existingSlug] = await connection.query(
        'SELECT id FROM community WHERE slug = ? AND id != ?',
        [updateData.slug, parseInt(id)]
      );

      if (existingSlug.length > 0) {
        return { success: false, message: 'Slug already exists' };
      }
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), parseInt(id)];

    await connection.query(
      `UPDATE community SET ${fields} WHERE id = ?`,
      values
    );

    return { success: true, message: 'Community updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteCommunity = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM community WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Community not found' };
    }

    await connection.query(
      'UPDATE community SET status = 0 WHERE id = ?',
      [parseInt(id)]
    );

    return { success: true, message: 'Community deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const hardDeleteCommunity = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT id FROM community WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Community not found' };
    }

    await connection.query('DELETE FROM sub_community WHERE community_id = ?', [parseInt(id)]);
    await connection.query('DELETE FROM sub_community_data WHERE community_id = ?', [parseInt(id)]);
    await connection.query('DELETE FROM community WHERE id = ?', [parseInt(id)]);

    await connection.commit();

    return { success: true, message: 'Community permanently deleted' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateCommunityStatus = async (id, status) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE community SET status = ? WHERE id = ?',
      [parseInt(status), parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Community not found' };
    }

    return { success: true, message: 'Status updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const toggleFeaturedCommunity = async (id, featured) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE community SET featured = ? WHERE id = ?',
      [featured ? 1 : 0, parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Community not found' };
    }

    return {
      success: true,
      message: featured ? 'Community marked as featured' : 'Community removed from featured'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const restoreCommunity = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE community SET status = 1 WHERE id = ? AND status = 0',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Community not found or not deleted' };
    }

    return { success: true, message: 'Community restored successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const bulkUpdateCommunityStatus = async (ids, status) => {
  const connection = await pool.getConnection();
  try {
    if (!ids || ids.length === 0) {
      return { success: false, message: 'No community IDs provided' };
    }

    const sanitizedIds = ids.map(id => parseInt(id));
    const placeholders = sanitizedIds.map(() => '?').join(',');

    const [result] = await connection.query(
      `UPDATE community SET status = ? WHERE id IN (${placeholders})`,
      [parseInt(status), ...sanitizedIds]
    );

    return {
      success: true,
      message: `${result.affectedRows} communities updated`,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getCommunityStats = async () => {
  const connection = await pool.getConnection();
  try {
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_communities,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_communities,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive_communities,
        SUM(CASE WHEN featured = 1 AND status = 1 THEN 1 ELSE 0 END) as featured_communities
      FROM community
    `);

    const [subStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_sub_communities,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_sub_communities
      FROM sub_community
    `);

    const [cityStats] = await connection.query(`
      SELECT city_id, COUNT(*) as count
      FROM community
      WHERE status = 1
      GROUP BY city_id
      ORDER BY count DESC
      LIMIT 10
    `);

    return {
      success: true,
      data: {
        ...stats[0],
        ...subStats[0],
        by_city: cityStats
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const checkCommunitySlugAvailability = async (slug, excludeId = null) => {
  const connection = await pool.getConnection();
  try {
    let query = 'SELECT id FROM community WHERE slug = ?';
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

export const getActiveSubCommunities = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 20,
      community_id,
      city_id,
      state_id,
      country_id,
      search,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = ['sc.status = 1'];
    let params = [];

    if (community_id) {
      whereConditions.push('sc.community_id = ?');
      params.push(parseInt(community_id));
    }
    if (city_id) {
      whereConditions.push('sc.city_id = ?');
      params.push(parseInt(city_id));
    }
    if (state_id) {
      whereConditions.push('sc.state_id = ?');
      params.push(parseInt(state_id));
    }
    if (country_id) {
      whereConditions.push('sc.country_id = ?');
      params.push(parseInt(country_id));
    }
    if (search) {
      whereConditions.push('(sc.name LIKE ? OR sc.slug LIKE ? OR sc.description LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const allowedSortColumns = ['name', 'community_id', 'city_id', 'id'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM sub_community sc ${whereClause}`,
      params
    );

    const [subCommunities] = await connection.query(
      `SELECT 
         sc.*,
         c.name as community_name,
         c.slug as community_slug,
         (SELECT COUNT(*) FROM properties p WHERE p.sub_community_id = sc.id AND p.status = 1) as property_count
       FROM sub_community sc
       LEFT JOIN community c ON sc.community_id = c.id
       ${whereClause}
       ORDER BY sc.${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: subCommunities,
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

export const getSubCommunityBySlug = async (slug) => {
  const connection = await pool.getConnection();
  try {
    const [subCommunityRows] = await connection.query(
      `SELECT sc.*, c.name as community_name, c.slug as community_slug
       FROM sub_community sc
       LEFT JOIN community c ON sc.community_id = c.id
       WHERE sc.slug = ? AND sc.status = 1`,
      [slug]
    );

    if (subCommunityRows.length === 0) {
      return { success: false, message: 'Sub-community not found' };
    }

    const subCommunity = subCommunityRows[0];

    const [properties] = await connection.query(
      `SELECT id, property_name, property_slug, featured_image, price, property_type, bedroom, area
       FROM properties
       WHERE sub_community_id = ? AND status = 1
       ORDER BY created_at DESC
       LIMIT 10`,
      [subCommunity.id]
    );

    const [projects] = await connection.query(
      `SELECT id, ProjectName, project_slug, featured_image, price, property_type, bedroom
       FROM project_listing
       WHERE sub_community_id = ? AND status = 1
       ORDER BY created_at DESC
       LIMIT 10`,
      [subCommunity.id]
    );

    let relatedBlogs = [];
    if (subCommunity.related_blog && subCommunity.related_blog.trim() !== '') {
      const blogIds = subCommunity.related_blog
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id) && id > 0);

      if (blogIds.length > 0) {
        const placeholders = blogIds.map(() => '?').join(',');
        const [blogs] = await connection.query(
          `SELECT id, title, slug, imageurl, publish_date, category
           FROM blogs
           WHERE id IN (${placeholders}) AND status = 1`,
          blogIds
        );
        relatedBlogs = blogs;
      }
    }

    return {
      success: true,
      data: {
        ...subCommunity,
        properties,
        projects,
        relatedBlogs
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getSubCommunityById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [subCommunityRows] = await connection.query(
      `SELECT sc.*, c.name as community_name, c.slug as community_slug
       FROM sub_community sc
       LEFT JOIN community c ON sc.community_id = c.id
       WHERE sc.id = ?`,
      [parseInt(id)]
    );

    if (subCommunityRows.length === 0) {
      return { success: false, message: 'Sub-community not found' };
    }

    return {
      success: true,
      data: subCommunityRows[0]
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getSubCommunitiesByCommunity = async (communityId, limit = 50) => {
  const connection = await pool.getConnection();
  try {
    const [subCommunities] = await connection.query(
      `SELECT 
         sc.id, sc.name, sc.slug, sc.img, sc.latitude, sc.longitude, sc.description, sc.direction,
         (SELECT COUNT(*) FROM properties p WHERE p.sub_community_id = sc.id AND p.status = 1) as property_count
       FROM sub_community sc
       WHERE sc.community_id = ? AND sc.status = 1
       ORDER BY sc.name ASC
       LIMIT ?`,
      [parseInt(communityId), parseInt(limit)]
    );

    return { success: true, data: subCommunities };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getSubCommunitiesByCity = async (cityId, limit = 50) => {
  const connection = await pool.getConnection();
  try {
    const [subCommunities] = await connection.query(
      `SELECT 
         sc.id, sc.name, sc.slug, sc.img, sc.community_id,
         c.name as community_name
       FROM sub_community sc
       LEFT JOIN community c ON sc.community_id = c.id
       WHERE sc.city_id = ? AND sc.status = 1
       ORDER BY sc.name ASC
       LIMIT ?`,
      [parseInt(cityId), parseInt(limit)]
    );

    return { success: true, data: subCommunities };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const searchSubCommunities = async (query, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const searchTerm = `%${query}%`;

    const [subCommunities] = await connection.query(
      `SELECT 
         sc.id, sc.name, sc.slug, sc.img, sc.community_id,
         c.name as community_name
       FROM sub_community sc
       LEFT JOIN community c ON sc.community_id = c.id
       WHERE sc.status = 1
         AND (sc.name LIKE ? OR sc.slug LIKE ? OR sc.description LIKE ?)
       ORDER BY 
         CASE WHEN sc.name LIKE ? THEN 1 ELSE 2 END,
         sc.name ASC
       LIMIT ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]
    );

    return { success: true, data: subCommunities };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getAllSubCommunitiesAdmin = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 10,
      status,
      community_id,
      city_id,
      search,
      sortBy = 'id',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    if (status !== undefined && status !== null && status !== '') {
      whereConditions.push('sc.status = ?');
      params.push(parseInt(status));
    }
    if (community_id) {
      whereConditions.push('sc.community_id = ?');
      params.push(parseInt(community_id));
    }
    if (city_id) {
      whereConditions.push('sc.city_id = ?');
      params.push(parseInt(city_id));
    }
    if (search) {
      whereConditions.push('(sc.name LIKE ? OR sc.slug LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const allowedSortColumns = ['id', 'name', 'community_id', 'city_id', 'status'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM sub_community sc ${whereClause}`,
      params
    );

    const [subCommunities] = await connection.query(
      `SELECT 
         sc.*,
         c.name as community_name,
         (SELECT COUNT(*) FROM properties p WHERE p.sub_community_id = sc.id) as property_count
       FROM sub_community sc
       LEFT JOIN community c ON sc.community_id = c.id
       ${whereClause}
       ORDER BY sc.${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: subCommunities,
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

export const createSubCommunity = async (subCommunityData) => {
  const connection = await pool.getConnection();
  try {
    if (!subCommunityData.slug && subCommunityData.name) {
      subCommunityData.slug = subCommunityData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const [existingSlug] = await connection.query(
      'SELECT id FROM sub_community WHERE slug = ?',
      [subCommunityData.slug]
    );

    if (existingSlug.length > 0) {
      subCommunityData.slug = subCommunityData.slug + '-' + Date.now();
    }

    const fields = Object.keys(subCommunityData);
    const values = Object.values(subCommunityData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO sub_community (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      subCommunityId: result.insertId,
      slug: subCommunityData.slug,
      message: 'Sub-community created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateSubCommunity = async (id, updateData) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM sub_community WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Sub-community not found' };
    }

    if (updateData.slug) {
      const [existingSlug] = await connection.query(
        'SELECT id FROM sub_community WHERE slug = ? AND id != ?',
        [updateData.slug, parseInt(id)]
      );

      if (existingSlug.length > 0) {
        return { success: false, message: 'Slug already exists' };
      }
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), parseInt(id)];

    await connection.query(
      `UPDATE sub_community SET ${fields} WHERE id = ?`,
      values
    );

    return { success: true, message: 'Sub-community updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteSubCommunity = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM sub_community WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Sub-community not found' };
    }

    await connection.query(
      'UPDATE sub_community SET status = 0 WHERE id = ?',
      [parseInt(id)]
    );

    return { success: true, message: 'Sub-community deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const hardDeleteSubCommunity = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM sub_community WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Sub-community not found' };
    }

    await connection.query('DELETE FROM sub_community WHERE id = ?', [parseInt(id)]);

    return { success: true, message: 'Sub-community permanently deleted' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateSubCommunityStatus = async (id, status) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE sub_community SET status = ? WHERE id = ?',
      [parseInt(status), parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Sub-community not found' };
    }

    return { success: true, message: 'Status updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const restoreSubCommunity = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE sub_community SET status = 1 WHERE id = ? AND status = 0',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Sub-community not found or not deleted' };
    }

    return { success: true, message: 'Sub-community restored successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const checkSubCommunitySlugAvailability = async (slug, excludeId = null) => {
  const connection = await pool.getConnection();
  try {
    let query = 'SELECT id FROM sub_community WHERE slug = ?';
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

export const getCommunityDataByCity = async (cityId) => {
  const connection = await pool.getConnection();
  try {
    const [data] = await connection.query(
      'SELECT * FROM community_data WHERE city_id = ? AND status = 1 ORDER BY name ASC',
      [parseInt(cityId)]
    );

    return { success: true, data };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createCommunityData = async (dataObj) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO community_data (city_id, name, status, state_id) VALUES (?, ?, ?, ?)',
      [parseInt(dataObj.city_id), dataObj.name, dataObj.status || 1, dataObj.state_id || null]
    );

    return {
      success: true,
      id: result.insertId,
      message: 'Community data created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateCommunityData = async (id, dataObj) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(dataObj).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(dataObj), parseInt(id)];

    const [result] = await connection.query(
      `UPDATE community_data SET ${fields} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Community data not found' };
    }

    return { success: true, message: 'Community data updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteCommunityData = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'DELETE FROM community_data WHERE id = ?',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Community data not found' };
    }

    return { success: true, message: 'Community data deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getSubCommunityDataByCommunity = async (communityId) => {
  const connection = await pool.getConnection();
  try {
    const [data] = await connection.query(
      'SELECT * FROM sub_community_data WHERE community_id = ? AND status = 1 ORDER BY name ASC',
      [parseInt(communityId)]
    );

    return { success: true, data };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createSubCommunityData = async (dataObj) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO sub_community_data (community_id, name, status) VALUES (?, ?, ?)',
      [parseInt(dataObj.community_id), dataObj.name, dataObj.status || 1]
    );

    return {
      success: true,
      id: result.insertId,
      message: 'Sub-community data created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateSubCommunityData = async (id, dataObj) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(dataObj).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(dataObj), parseInt(id)];

    const [result] = await connection.query(
      `UPDATE sub_community_data SET ${fields} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Sub-community data not found' };
    }

    return { success: true, message: 'Sub-community data updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteSubCommunityData = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'DELETE FROM sub_community_data WHERE id = ?',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Sub-community data not found' };
    }

    return { success: true, message: 'Sub-community data deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getCommunityWithHierarchy = async (communityId) => {
  const connection = await pool.getConnection();
  try {
    const [communityRows] = await connection.query(
      'SELECT * FROM community WHERE id = ? AND status = 1',
      [parseInt(communityId)]
    );

    if (communityRows.length === 0) {
      return { success: false, message: 'Community not found' };
    }

    const community = communityRows[0];

    const [subCommunities] = await connection.query(
      'SELECT * FROM sub_community WHERE community_id = ? AND status = 1 ORDER BY name ASC',
      [parseInt(communityId)]
    );

    const [communityDataList] = await connection.query(
      'SELECT * FROM community_data WHERE city_id = ? AND status = 1 ORDER BY name ASC',
      [community.city_id]
    );

    const [subCommunityDataList] = await connection.query(
      'SELECT * FROM sub_community_data WHERE community_id = ? AND status = 1 ORDER BY name ASC',
      [parseInt(communityId)]
    );

    return {
      success: true,
      data: {
        ...community,
        subCommunities,
        communityData: communityDataList,
        subCommunityData: subCommunityDataList
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getLocationDropdowns = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const { city_id, community_id } = filters;

    let communities = [];
    let subCommunities = [];

    if (city_id) {
      const [communityRows] = await connection.query(
        'SELECT id, name FROM community WHERE city_id = ? AND status = 1 ORDER BY name ASC',
        [parseInt(city_id)]
      );
      communities = communityRows;
    }

    if (community_id) {
      const [subCommunityRows] = await connection.query(
        'SELECT id, name FROM sub_community WHERE community_id = ? AND status = 1 ORDER BY name ASC',
        [parseInt(community_id)]
      );
      subCommunities = subCommunityRows;
    }

    return {
      success: true,
      data: {
        communities,
        subCommunities
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  createCommunityTables,
  getActiveCommunities,
  getCommunityBySlug,
  getCommunityById,
  getFeaturedCommunities,
  getCommunitiesByCity,
  searchCommunities,
  getAllCommunitiesAdmin,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  hardDeleteCommunity,
  updateCommunityStatus,
  toggleFeaturedCommunity,
  restoreCommunity,
  bulkUpdateCommunityStatus,
  getCommunityStats,
  checkCommunitySlugAvailability,
  getActiveSubCommunities,
  getSubCommunityBySlug,
  getSubCommunityById,
  getSubCommunitiesByCommunity,
  getSubCommunitiesByCity,
  searchSubCommunities,
  getAllSubCommunitiesAdmin,
  createSubCommunity,
  updateSubCommunity,
  deleteSubCommunity,
  hardDeleteSubCommunity,
  updateSubCommunityStatus,
  restoreSubCommunity,
  checkSubCommunitySlugAvailability,
  getCommunityDataByCity,
  createCommunityData,
  updateCommunityData,
  deleteCommunityData,
  getSubCommunityDataByCommunity,
  createSubCommunityData,
  updateSubCommunityData,
  deleteSubCommunityData,
  getCommunityWithHierarchy,
  getLocationDropdowns
};