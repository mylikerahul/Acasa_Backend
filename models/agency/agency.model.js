import pool from '../../config/db.js';

export const createAgencyTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS agency (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        cuid VARCHAR(255) NOT NULL UNIQUE,
        owner_name VARCHAR(100),
        office_name VARCHAR(100),
        email VARCHAR(150),
        phone VARCHAR(30),
        orn VARCHAR(100),
        status INT(1) NOT NULL DEFAULT 1,
        create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cuid (cuid),
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

export const createAgentTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200),
        slug VARCHAR(200) UNIQUE,
        sub_title VARCHAR(200),
        cuid VARCHAR(255),
        name VARCHAR(100),
        first_name VARCHAR(200),
        last_name VARCHAR(200),
        nationality VARCHAR(100),
        orn_number VARCHAR(200),
        orn VARCHAR(100),
        brn VARCHAR(100),
        mobile VARCHAR(20),
        designation VARCHAR(255),
        languages VARCHAR(100),
        aos VARCHAR(150),
        company VARCHAR(150),
        email VARCHAR(100),
        descriptions TEXT,
        seo_title VARCHAR(100),
        seo_keywork VARCHAR(100),
        seo_description VARCHAR(100),
        image VARCHAR(255),
        status INT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_cuid (cuid),
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

// ==================== AGENCY OPERATIONS ====================

export const getActiveAgencies = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const { page = 1, limit = 20, search, sortBy = 'create_date', sortOrder = 'DESC' } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = ['status = 1'];
    let params = [];

    if (search) {
      whereConditions.push('(office_name LIKE ? OR owner_name LIKE ? OR orn LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM agency ${whereClause}`,
      params
    );

    const [agencies] = await connection.query(
      `SELECT * FROM agency 
       ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: agencies,
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

export const getAgencyById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [agencyRows] = await connection.query(
      'SELECT * FROM agency WHERE id = ?',
      [parseInt(id)]
    );

    if (agencyRows.length === 0) {
      return { success: false, message: 'Agency not found' };
    }

    const agency = agencyRows[0];

    const [agents] = await connection.query(
      'SELECT * FROM agents WHERE company = ? AND status = 1',
      [agency.office_name]
    );

    return {
      success: true,
      data: {
        ...agency,
        agents
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createAgency = async (agencyData) => {
  const connection = await pool.getConnection();
  try {
    if (!agencyData.cuid) {
      agencyData.cuid = 'AG-' + Date.now();
    }

    const fields = Object.keys(agencyData);
    const values = Object.values(agencyData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO agency (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      agencyId: result.insertId,
      message: 'Agency created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateAgency = async (id, updateData) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM agency WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Agency not found' };
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), parseInt(id)];

    await connection.query(
      `UPDATE agency SET ${fields} WHERE id = ?`,
      values
    );

    return { success: true, message: 'Agency updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteAgency = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM agency WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Agency not found' };
    }

    await connection.query('UPDATE agency SET status = 0 WHERE id = ?', [parseInt(id)]);

    return { success: true, message: 'Agency deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ==================== AGENT OPERATIONS ====================

export const getActiveAgents = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const { page = 1, limit = 20, company, language, search, sortBy = 'name', sortOrder = 'ASC' } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = ['status = 1'];
    let params = [];

    if (company) {
      whereConditions.push('company = ?');
      params.push(company);
    }

    if (language) {
      whereConditions.push('languages LIKE ?');
      params.push(`%${language}%`);
    }

    if (search) {
      whereConditions.push('(name LIKE ? OR designation LIKE ? OR brn LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM agents ${whereClause}`,
      params
    );

    const [agents] = await connection.query(
      `SELECT * FROM agents 
       ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: agents,
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

export const getAgentBySlug = async (slug) => {
  const connection = await pool.getConnection();
  try {
    const [agentRows] = await connection.query(
      'SELECT * FROM agents WHERE slug = ? AND status = 1',
      [slug]
    );

    if (agentRows.length === 0) {
      return { success: false, message: 'Agent not found' };
    }

    return { success: true, data: agentRows[0] };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getAgentById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [agentRows] = await connection.query(
      'SELECT * FROM agents WHERE id = ?',
      [parseInt(id)]
    );

    if (agentRows.length === 0) {
      return { success: false, message: 'Agent not found' };
    }

    return { success: true, data: agentRows[0] };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createAgent = async (agentData) => {
  const connection = await pool.getConnection();
  try {
    if (!agentData.slug && agentData.name) {
      agentData.slug = agentData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();
    }

    if (!agentData.cuid) {
      agentData.cuid = 'AGT-' + Date.now();
    }

    const fields = Object.keys(agentData);
    const values = Object.values(agentData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO agents (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      agentId: result.insertId,
      slug: agentData.slug,
      message: 'Agent created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateAgent = async (id, updateData) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM agents WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Agent not found' };
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), parseInt(id)];

    await connection.query(
      `UPDATE agents SET ${fields} WHERE id = ?`,
      values
    );

    return { success: true, message: 'Agent updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteAgent = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM agents WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Agent not found' };
    }

    await connection.query('UPDATE agents SET status = 0 WHERE id = ?', [parseInt(id)]);

    return { success: true, message: 'Agent deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getStats = async () => {
  const connection = await pool.getConnection();
  try {
    const [agencyStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_agencies,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_agencies
      FROM agency
    `);

    const [agentStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_agents,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_agents
      FROM agents
    `);

    return {
      success: true,
      data: {
        agencies: agencyStats[0],
        agents: agentStats[0]
      }
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
    let query = 'SELECT id FROM agents WHERE slug = ?';
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
  createAgencyTable,
  createAgentTable,
  getActiveAgencies,
  getAgencyById,
  createAgency,
  updateAgency,
  deleteAgency,
  getActiveAgents,
  getAgentBySlug,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  getStats,
  checkSlugAvailability
};