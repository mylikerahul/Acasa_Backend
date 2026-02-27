import pool from '../../config/db.js';

export const createBlogsTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(191) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        sub_title VARCHAR(255),
        writer VARCHAR(255),
        publish_date DATE,
        category VARCHAR(191) NOT NULL,
        imageurl VARCHAR(191) NOT NULL,
        descriptions TEXT NOT NULL,
        status INT(1) DEFAULT 1,
        seo_title VARCHAR(255),
        seo_keywork VARCHAR(255),
        seo_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_publish_date (publish_date),
        INDEX idx_writer (writer)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getActiveBlogs = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 10,
      category,
      writer,
      search,
      sortBy = 'publish_date',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = ['b.status = 1'];
    let params = [];

    if (category) {
      whereConditions.push('b.category = ?');
      params.push(category);
    }

    if (writer) {
      whereConditions.push('b.writer = ?');
      params.push(writer);
    }

    if (search) {
      whereConditions.push('(b.title LIKE ? OR b.slug LIKE ? OR b.sub_title LIKE ? OR b.descriptions LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const allowedSortColumns = ['created_at', 'publish_date', 'title', 'category'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'publish_date';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM blogs b ${whereClause}`,
      params
    );

    const [blogs] = await connection.query(
      `SELECT 
         b.id,
         b.title,
         b.slug,
         b.sub_title,
         b.writer,
         b.publish_date,
         b.category,
         b.imageurl,
         b.descriptions,
         b.status,
         b.seo_title,
         b.seo_keywork,
         b.seo_description,
         b.created_at,
         b.updated_at
       FROM blogs b
       ${whereClause}
       ORDER BY b.${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: blogs,
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

export const getBlogBySlug = async (slug) => {
  const connection = await pool.getConnection();
  try {
    const [blogRows] = await connection.query(
      `SELECT 
         b.*,
         u.name as writer_name,
         u.email as writer_email
       FROM blogs b
       LEFT JOIN users u ON b.writer = u.id
       WHERE b.slug = ? AND b.status = 1`,
      [slug]
    );

    if (blogRows.length === 0) {
      return { success: false, message: 'Blog not found' };
    }

    const blog = blogRows[0];

    const [relatedBlogs] = await connection.query(
      `SELECT 
         id, title, slug, sub_title, imageurl, publish_date, category
       FROM blogs
       WHERE category = ? AND id != ? AND status = 1
       ORDER BY publish_date DESC
       LIMIT 4`,
      [blog.category, blog.id]
    );

    return {
      success: true,
      data: {
        ...blog,
        relatedBlogs
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getBlogById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [blogRows] = await connection.query(
      `SELECT 
         b.*,
         u.name as writer_name,
         u.email as writer_email
       FROM blogs b
       LEFT JOIN users u ON b.writer = u.id
       WHERE b.id = ?`,
      [parseInt(id)]
    );

    if (blogRows.length === 0) {
      return { success: false, message: 'Blog not found' };
    }

    return {
      success: true,
      data: blogRows[0]
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getRecentBlogs = async (limit = 5) => {
  const connection = await pool.getConnection();
  try {
    const [blogs] = await connection.query(
      `SELECT 
         id, title, slug, sub_title, imageurl, publish_date, category, created_at
       FROM blogs
       WHERE status = 1
       ORDER BY publish_date DESC, created_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    return { success: true, data: blogs };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getBlogsByCategory = async (category, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [blogs] = await connection.query(
      `SELECT 
         id, title, slug, sub_title, imageurl, publish_date, category, descriptions, created_at
       FROM blogs
       WHERE category = ? AND status = 1
       ORDER BY publish_date DESC
       LIMIT ?`,
      [category, parseInt(limit)]
    );

    return { success: true, data: blogs };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getBlogsByWriter = async (writerId, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [blogs] = await connection.query(
      `SELECT 
         id, title, slug, sub_title, imageurl, publish_date, category, created_at
       FROM blogs
       WHERE writer = ? AND status = 1
       ORDER BY publish_date DESC
       LIMIT ?`,
      [writerId, parseInt(limit)]
    );

    return { success: true, data: blogs };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const searchBlogs = async (query, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const searchTerm = `%${query}%`;

    const [blogs] = await connection.query(
      `SELECT 
         id, title, slug, sub_title, imageurl, publish_date, category
       FROM blogs
       WHERE status = 1
         AND (title LIKE ? OR sub_title LIKE ? OR descriptions LIKE ? OR seo_keywork LIKE ?)
       ORDER BY 
         CASE 
           WHEN title LIKE ? THEN 1
           WHEN sub_title LIKE ? THEN 2
           ELSE 3 
         END,
         publish_date DESC
       LIMIT ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]
    );

    return { success: true, data: blogs };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getAllCategories = async () => {
  const connection = await pool.getConnection();
  try {
    const [categories] = await connection.query(
      `SELECT 
         category,
         COUNT(*) as blog_count
       FROM blogs
       WHERE status = 1
       GROUP BY category
       ORDER BY blog_count DESC`
    );

    return { success: true, data: categories };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getAllBlogsAdmin = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      writer,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    if (status !== undefined && status !== null && status !== '') {
      whereConditions.push('b.status = ?');
      params.push(parseInt(status));
    }

    if (category) {
      whereConditions.push('b.category = ?');
      params.push(category);
    }

    if (writer) {
      whereConditions.push('b.writer = ?');
      params.push(writer);
    }

    if (search) {
      whereConditions.push('(b.title LIKE ? OR b.slug LIKE ? OR b.sub_title LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const allowedSortColumns = ['created_at', 'updated_at', 'publish_date', 'title', 'category', 'status'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM blogs b ${whereClause}`,
      params
    );

    const [blogs] = await connection.query(
      `SELECT 
         b.*,
         u.name as writer_name
       FROM blogs b
       LEFT JOIN users u ON b.writer = u.id
       ${whereClause}
       ORDER BY b.${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: blogs,
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

export const createBlog = async (blogData) => {
  const connection = await pool.getConnection();
  try {
    if (!blogData.slug && blogData.title) {
      blogData.slug = blogData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const [existingSlug] = await connection.query(
      'SELECT id FROM blogs WHERE slug = ?',
      [blogData.slug]
    );

    if (existingSlug.length > 0) {
      blogData.slug = blogData.slug + '-' + Date.now();
    }

    const fields = Object.keys(blogData);
    const values = Object.values(blogData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO blogs (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      blogId: result.insertId,
      slug: blogData.slug,
      message: 'Blog created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateBlog = async (id, updateData) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM blogs WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Blog not found' };
    }

    if (updateData.slug) {
      const [existingSlug] = await connection.query(
        'SELECT id FROM blogs WHERE slug = ? AND id != ?',
        [updateData.slug, parseInt(id)]
      );

      if (existingSlug.length > 0) {
        return { success: false, message: 'Slug already exists' };
      }
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), parseInt(id)];

    await connection.query(
      `UPDATE blogs SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return { success: true, message: 'Blog updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteBlog = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM blogs WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Blog not found' };
    }

    await connection.query(
      'UPDATE blogs SET status = 0, updated_at = NOW() WHERE id = ?',
      [parseInt(id)]
    );

    return { success: true, message: 'Blog deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const hardDeleteBlog = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id, imageurl FROM blogs WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Blog not found' };
    }

    await connection.query('DELETE FROM blogs WHERE id = ?', [parseInt(id)]);

    return {
      success: true,
      message: 'Blog permanently deleted',
      imageUrl: existing[0].imageurl
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateBlogStatus = async (id, status) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE blogs SET status = ?, updated_at = NOW() WHERE id = ?',
      [parseInt(status), parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Blog not found' };
    }

    return { success: true, message: 'Status updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const restoreBlog = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE blogs SET status = 1, updated_at = NOW() WHERE id = ? AND status = 0',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Blog not found or not deleted' };
    }

    return { success: true, message: 'Blog restored successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const bulkUpdateStatus = async (ids, status) => {
  const connection = await pool.getConnection();
  try {
    if (!ids || ids.length === 0) {
      return { success: false, message: 'No blog IDs provided' };
    }

    const sanitizedIds = ids.map(id => parseInt(id));
    const placeholders = sanitizedIds.map(() => '?').join(',');

    const [result] = await connection.query(
      `UPDATE blogs SET status = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      [parseInt(status), ...sanitizedIds]
    );

    return {
      success: true,
      message: `${result.affectedRows} blogs updated`,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const bulkDelete = async (ids) => {
  const connection = await pool.getConnection();
  try {
    if (!ids || ids.length === 0) {
      return { success: false, message: 'No blog IDs provided' };
    }

    const sanitizedIds = ids.map(id => parseInt(id));
    const placeholders = sanitizedIds.map(() => '?').join(',');

    const [result] = await connection.query(
      `UPDATE blogs SET status = 0, updated_at = NOW() WHERE id IN (${placeholders})`,
      sanitizedIds
    );

    return {
      success: true,
      message: `${result.affectedRows} blogs deleted`,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const checkSlugAvailability = async (slug, excludeId = null) => {
  const connection = await pool.getConnection();
  try {
    let query = 'SELECT id FROM blogs WHERE slug = ?';
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

export const getBlogStats = async () => {
  const connection = await pool.getConnection();
  try {
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_blogs,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_blogs,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive_blogs,
        COUNT(DISTINCT category) as total_categories,
        COUNT(DISTINCT writer) as total_writers
      FROM blogs
    `);

    const [recentStats] = await connection.query(`
      SELECT COUNT(*) as new_blogs_week
      FROM blogs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status = 1
    `);

    const [categoryStats] = await connection.query(`
      SELECT category, COUNT(*) as count
      FROM blogs
      WHERE status = 1
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `);

    const [monthlyStats] = await connection.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM blogs
      WHERE status = 1 AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `);

    return {
      success: true,
      data: {
        ...stats[0],
        new_blogs_week: recentStats[0].new_blogs_week,
        by_category: categoryStats,
        monthly_trend: monthlyStats
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getArchiveBlogs = async () => {
  const connection = await pool.getConnection();
  try {
    const [archives] = await connection.query(`
      SELECT 
        YEAR(publish_date) as year,
        MONTH(publish_date) as month,
        DATE_FORMAT(publish_date, '%M %Y') as label,
        COUNT(*) as count
      FROM blogs
      WHERE status = 1 AND publish_date IS NOT NULL
      GROUP BY YEAR(publish_date), MONTH(publish_date)
      ORDER BY year DESC, month DESC
    `);

    return { success: true, data: archives };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getBlogsByArchive = async (year, month, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [blogs] = await connection.query(
      `SELECT 
         id, title, slug, sub_title, imageurl, publish_date, category
       FROM blogs
       WHERE status = 1 
         AND YEAR(publish_date) = ? 
         AND MONTH(publish_date) = ?
       ORDER BY publish_date DESC
       LIMIT ?`,
      [parseInt(year), parseInt(month), parseInt(limit)]
    );

    return { success: true, data: blogs };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getPreviousNextBlog = async (blogId, category = null) => {
  const connection = await pool.getConnection();
  try {
    let categoryCondition = '';
    let params = [parseInt(blogId)];

    if (category) {
      categoryCondition = 'AND category = ?';
      params.push(category);
    }

    const [previous] = await connection.query(
      `SELECT id, title, slug, imageurl
       FROM blogs
       WHERE status = 1 AND id < ? ${categoryCondition}
       ORDER BY id DESC
       LIMIT 1`,
      params
    );

    params[0] = parseInt(blogId);
    const [next] = await connection.query(
      `SELECT id, title, slug, imageurl
       FROM blogs
       WHERE status = 1 AND id > ? ${categoryCondition}
       ORDER BY id ASC
       LIMIT 1`,
      params
    );

    return {
      success: true,
      data: {
        previous: previous[0] || null,
        next: next[0] || null
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  createBlogsTable,
  getActiveBlogs,
  getBlogBySlug,
  getBlogById,
  getRecentBlogs,
  getBlogsByCategory,
  getBlogsByWriter,
  searchBlogs,
  getAllCategories,
  getAllBlogsAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
  hardDeleteBlog,
  updateBlogStatus,
  restoreBlog,
  bulkUpdateStatus,
  bulkDelete,
  checkSlugAvailability,
  getBlogStats,
  getArchiveBlogs,
  getBlogsByArchive,
  getPreviousNextBlog
};