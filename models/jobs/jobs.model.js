import pool from '../../config/db.js';

export const createJobsTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100),
        title VARCHAR(255),
        description TEXT,
        sub_title VARCHAR(255),
        sub_description TEXT,
        about_team TEXT,
        about_company TEXT,
        job_title VARCHAR(255),
        city_name VARCHAR(255),
        responsibilities TEXT,
        type VARCHAR(255),
        link VARCHAR(255),
        facilities TEXT,
        social VARCHAR(255),
        seo_title VARCHAR(255),
        seo_description VARCHAR(255),
        seo_keyword VARCHAR(255),
        status INT(1) NOT NULL DEFAULT 1,
        slug VARCHAR(255) UNIQUE,
        created_at VARCHAR(100),
        updated_at VARCHAR(100),
        INDEX idx_status (status),
        INDEX idx_slug (slug),
        INDEX idx_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS applyed_jobs (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(70),
        message TEXT,
        resume VARCHAR(255),
        current_last_employer VARCHAR(255),
        current_job_title TEXT,
        employment_status VARCHAR(100),
        term INT(1),
        status INT(1) NOT NULL DEFAULT 1,
        apply_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getActiveJobs = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 10,
      type,
      city_name,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = ['status = 1'];
    let params = [];

    if (type) {
      whereConditions.push('type = ?');
      params.push(type);
    }

    if (city_name) {
      whereConditions.push('city_name = ?');
      params.push(city_name);
    }

    if (search) {
      whereConditions.push('(title LIKE ? OR description LIKE ? OR job_title LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM jobs ${whereClause}`,
      params
    );

    const [jobs] = await connection.query(
      `SELECT * FROM jobs 
       ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: jobs,
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

export const getJobBySlug = async (slug) => {
  const connection = await pool.getConnection();
  try {
    const [jobRows] = await connection.query(
      'SELECT * FROM jobs WHERE slug = ? AND status = 1',
      [slug]
    );

    if (jobRows.length === 0) {
      return { success: false, message: 'Job not found' };
    }

    return {
      success: true,
      data: jobRows[0]
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getJobById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [jobRows] = await connection.query(
      'SELECT * FROM jobs WHERE id = ?',
      [parseInt(id)]
    );

    if (jobRows.length === 0) {
      return { success: false, message: 'Job not found' };
    }

    return {
      success: true,
      data: jobRows[0]
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createJob = async (jobData) => {
  const connection = await pool.getConnection();
  try {
    if (!jobData.slug && jobData.title) {
      jobData.slug = jobData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();
    }

    // Set timestamps manually as they are VARCHAR in DB
    const now = new Date().toISOString();
    jobData.created_at = now;
    jobData.updated_at = now;

    const fields = Object.keys(jobData);
    const values = Object.values(jobData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO jobs (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      jobId: result.insertId,
      slug: jobData.slug,
      message: 'Job created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateJob = async (id, updateData) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM jobs WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Job not found' };
    }

    // Update timestamp
    updateData.updated_at = new Date().toISOString();

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), parseInt(id)];

    await connection.query(
      `UPDATE jobs SET ${fields} WHERE id = ?`,
      values
    );

    return { success: true, message: 'Job updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteJob = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM jobs WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Job not found' };
    }

    await connection.query(
      'UPDATE jobs SET status = 0, updated_at = ? WHERE id = ?',
      [new Date().toISOString(), parseInt(id)]
    );

    return { success: true, message: 'Job deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const hardDeleteJob = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM jobs WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Job not found' };
    }

    await connection.query('DELETE FROM jobs WHERE id = ?', [parseInt(id)]);

    return { success: true, message: 'Job permanently deleted' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const applyForJob = async (applicationData) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(applicationData);
    const values = Object.values(applicationData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO applyed_jobs (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      applicationId: result.insertId,
      message: 'Application submitted successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getJobApplications = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const { page = 1, limit = 20, status, search } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (status !== undefined && status !== null && status !== '') {
      whereConditions.push('status = ?');
      params.push(parseInt(status));
    }

    if (search) {
      whereConditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR current_job_title LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM applyed_jobs ${whereClause}`,
      params
    );

    const [applications] = await connection.query(
      `SELECT * FROM applyed_jobs 
       ${whereClause}
       ORDER BY apply_date DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: applications,
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

export const updateApplicationStatus = async (id, status) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE applyed_jobs SET status = ? WHERE id = ?',
      [parseInt(status), parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Application not found' };
    }

    return { success: true, message: 'Status updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteApplication = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id, resume FROM applyed_jobs WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Application not found' };
    }

    await connection.query('DELETE FROM applyed_jobs WHERE id = ?', [parseInt(id)]);

    return { 
      success: true, 
      message: 'Application deleted successfully',
      resume: existing[0].resume
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getJobStats = async () => {
  const connection = await pool.getConnection();
  try {
    const [jobStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_jobs,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive_jobs
      FROM jobs
    `);

    const [applicationStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as new_applications,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as reviewed_applications,
        SUM(CASE WHEN apply_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_this_week
      FROM applyed_jobs
    `);

    return {
      success: true,
      data: {
        ...jobStats[0],
        applications: applicationStats[0]
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getJobTypes = async () => {
  const connection = await pool.getConnection();
  try {
    const [types] = await connection.query(
      'SELECT DISTINCT type FROM jobs WHERE status = 1 AND type IS NOT NULL'
    );
    return { success: true, data: types.map(t => t.type) };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getJobLocations = async () => {
  const connection = await pool.getConnection();
  try {
    const [locations] = await connection.query(
      'SELECT DISTINCT city_name FROM jobs WHERE status = 1 AND city_name IS NOT NULL'
    );
    return { success: true, data: locations.map(l => l.city_name) };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const checkSlugAvailability = async (slug, excludeId = null) => {
  const connection = await pool.getConnection();
  try {
    let query = 'SELECT id FROM jobs WHERE slug = ?';
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

export default {
  createJobsTable,
  getActiveJobs,
  getJobBySlug,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  hardDeleteJob,
  applyForJob,
  getJobApplications,
  updateApplicationStatus,
  deleteApplication,
  getJobStats,
  getJobTypes,
  getJobLocations,
  checkSlugAvailability
};