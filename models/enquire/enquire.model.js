import pool from '../../config/db.js';

export const createEnquireTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS enquire (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        contact_id INT(11),
        property_id INT(11),
        project_item_id INT(11),
        item_type VARCHAR(60),
        type VARCHAR(60),
        source VARCHAR(100),
        agent_id INT(11),
        country INT(11),
        priority VARCHAR(100),
        quality VARCHAR(100),
        contact_type VARCHAR(100),
        agent_activity VARCHAR(100),
        admin_activity VARCHAR(100),
        listing_type VARCHAR(100),
        exclusive_status VARCHAR(100),
        construction_status VARCHAR(100),
        state_id INT(11),
        community_id INT(11),
        sub_community_id INT(11),
        project_id INT(11),
        building VARCHAR(255),
        price_min VARCHAR(100),
        price_max VARCHAR(100),
        bedroom_min VARCHAR(100),
        bedroom_max VARCHAR(100),
        contact_source VARCHAR(100),
        lead_source VARCHAR(100),
        property_image VARCHAR(255),
        message TEXT,
        resume VARCHAR(255),
        drip_marketing VARCHAR(4),
        status INT(11) NOT NULL DEFAULT 1,
        contact_date VARCHAR(100),
        lead_status INT(5) NOT NULL DEFAULT 1,
        lost_status VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_contact_id (contact_id),
        INDEX idx_property_id (property_id),
        INDEX idx_project_id (project_id),
        INDEX idx_agent_id (agent_id),
        INDEX idx_status (status),
        INDEX idx_lead_status (lead_status),
        INDEX idx_type (type),
        INDEX idx_source (source),
        INDEX idx_priority (priority),
        INDEX idx_community_id (community_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getActiveEnquiries = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 20,
      type,
      source,
      priority,
      quality,
      status,
      lead_status,
      agent_id,
      property_id,
      project_id,
      community_id,
      contact_type,
      listing_type,
      date_from,
      date_to,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = ['e.status != 0'];
    let params = [];

    if (type) {
      whereConditions.push('e.type = ?');
      params.push(type);
    }
    if (source) {
      whereConditions.push('e.source = ?');
      params.push(source);
    }
    if (priority) {
      whereConditions.push('e.priority = ?');
      params.push(priority);
    }
    if (quality) {
      whereConditions.push('e.quality = ?');
      params.push(quality);
    }
    if (status !== undefined && status !== null && status !== '') {
      whereConditions.push('e.status = ?');
      params.push(parseInt(status));
    }
    if (lead_status !== undefined && lead_status !== null && lead_status !== '') {
      whereConditions.push('e.lead_status = ?');
      params.push(parseInt(lead_status));
    }
    if (agent_id) {
      whereConditions.push('e.agent_id = ?');
      params.push(parseInt(agent_id));
    }
    if (property_id) {
      whereConditions.push('e.property_id = ?');
      params.push(parseInt(property_id));
    }
    if (project_id) {
      whereConditions.push('e.project_id = ?');
      params.push(parseInt(project_id));
    }
    if (community_id) {
      whereConditions.push('e.community_id = ?');
      params.push(parseInt(community_id));
    }
    if (contact_type) {
      whereConditions.push('e.contact_type = ?');
      params.push(contact_type);
    }
    if (listing_type) {
      whereConditions.push('e.listing_type = ?');
      params.push(listing_type);
    }
    if (date_from) {
      whereConditions.push('DATE(e.created_at) >= ?');
      params.push(date_from);
    }
    if (date_to) {
      whereConditions.push('DATE(e.created_at) <= ?');
      params.push(date_to);
    }
    if (search) {
      whereConditions.push('(e.message LIKE ? OR e.building LIKE ? OR e.contact_source LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const allowedSortColumns = ['created_at', 'updated_at', 'priority', 'status', 'lead_status', 'type'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM enquire e ${whereClause}`,
      params
    );

    const [enquiries] = await connection.query(
      `SELECT 
         e.*,
         p.property_name,
         p.property_slug,
         p.featured_image as property_featured_image,
         pr.ProjectName as project_name,
         pr.project_slug,
         a.name as agent_name,
         a.email as agent_email,
         a.phone as agent_phone,
         c.name as community_name,
         sc.name as sub_community_name
       FROM enquire e
       LEFT JOIN properties p ON e.property_id = p.id
       LEFT JOIN project_listing pr ON e.project_id = pr.id
       LEFT JOIN agents a ON e.agent_id = a.id
       LEFT JOIN community c ON e.community_id = c.id
       LEFT JOIN sub_community sc ON e.sub_community_id = sc.id
       ${whereClause}
       ORDER BY e.${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: enquiries,
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

export const getEnquiryById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [enquiryRows] = await connection.query(
      `SELECT 
         e.*,
         p.property_name,
         p.property_slug,
         p.featured_image as property_featured_image,
         p.price as property_price,
         p.bedroom as property_bedroom,
         p.area as property_area,
         p.location as property_location,
         pr.ProjectName as project_name,
         pr.project_slug,
         pr.featured_image as project_featured_image,
         pr.price as project_price,
         a.name as agent_name,
         a.email as agent_email,
         a.phone as agent_phone,
         a.image as agent_image,
         c.name as community_name,
         sc.name as sub_community_name,
         cu.name as contact_name,
         cu.email as contact_email,
         cu.phone as contact_phone
       FROM enquire e
       LEFT JOIN properties p ON e.property_id = p.id
       LEFT JOIN project_listing pr ON e.project_id = pr.id
       LEFT JOIN agents a ON e.agent_id = a.id
       LEFT JOIN community c ON e.community_id = c.id
       LEFT JOIN sub_community sc ON e.sub_community_id = sc.id
       LEFT JOIN users cu ON e.contact_id = cu.id
       WHERE e.id = ?`,
      [parseInt(id)]
    );

    if (enquiryRows.length === 0) {
      return { success: false, message: 'Enquiry not found' };
    }

    return {
      success: true,
      data: enquiryRows[0]
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getEnquiriesByProperty = async (propertyId, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [enquiries] = await connection.query(
      `SELECT 
         e.*,
         cu.name as contact_name,
         cu.email as contact_email,
         cu.phone as contact_phone
       FROM enquire e
       LEFT JOIN users cu ON e.contact_id = cu.id
       WHERE e.property_id = ? AND e.status != 0
       ORDER BY e.created_at DESC
       LIMIT ?`,
      [parseInt(propertyId), parseInt(limit)]
    );

    return { success: true, data: enquiries };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getEnquiriesByProject = async (projectId, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [enquiries] = await connection.query(
      `SELECT 
         e.*,
         cu.name as contact_name,
         cu.email as contact_email,
         cu.phone as contact_phone
       FROM enquire e
       LEFT JOIN users cu ON e.contact_id = cu.id
       WHERE e.project_id = ? AND e.status != 0
       ORDER BY e.created_at DESC
       LIMIT ?`,
      [parseInt(projectId), parseInt(limit)]
    );

    return { success: true, data: enquiries };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getEnquiriesByAgent = async (agentId, filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const { page = 1, limit = 20, status, lead_status } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = ['e.agent_id = ?', 'e.status != 0'];
    let params = [parseInt(agentId)];

    if (status !== undefined && status !== null && status !== '') {
      whereConditions.push('e.status = ?');
      params.push(parseInt(status));
    }
    if (lead_status !== undefined && lead_status !== null && lead_status !== '') {
      whereConditions.push('e.lead_status = ?');
      params.push(parseInt(lead_status));
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM enquire e ${whereClause}`,
      params
    );

    const [enquiries] = await connection.query(
      `SELECT 
         e.*,
         p.property_name,
         p.property_slug,
         pr.ProjectName as project_name,
         pr.project_slug,
         cu.name as contact_name,
         cu.email as contact_email,
         cu.phone as contact_phone
       FROM enquire e
       LEFT JOIN properties p ON e.property_id = p.id
       LEFT JOIN project_listing pr ON e.project_id = pr.id
       LEFT JOIN users cu ON e.contact_id = cu.id
       ${whereClause}
       ORDER BY e.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: enquiries,
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

export const getEnquiriesByContact = async (contactId, limit = 20) => {
  const connection = await pool.getConnection();
  try {
    const [enquiries] = await connection.query(
      `SELECT 
         e.*,
         p.property_name,
         p.property_slug,
         pr.ProjectName as project_name,
         pr.project_slug,
         a.name as agent_name
       FROM enquire e
       LEFT JOIN properties p ON e.property_id = p.id
       LEFT JOIN project_listing pr ON e.project_id = pr.id
       LEFT JOIN agents a ON e.agent_id = a.id
       WHERE e.contact_id = ? AND e.status != 0
       ORDER BY e.created_at DESC
       LIMIT ?`,
      [parseInt(contactId), parseInt(limit)]
    );

    return { success: true, data: enquiries };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createEnquiry = async (enquiryData) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(enquiryData);
    const values = Object.values(enquiryData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO enquire (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      enquiryId: result.insertId,
      message: 'Enquiry created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateEnquiry = async (id, updateData) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM enquire WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Enquiry not found' };
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), parseInt(id)];

    await connection.query(
      `UPDATE enquire SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return { success: true, message: 'Enquiry updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteEnquiry = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM enquire WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Enquiry not found' };
    }

    await connection.query(
      'UPDATE enquire SET status = 0, updated_at = NOW() WHERE id = ?',
      [parseInt(id)]
    );

    return { success: true, message: 'Enquiry deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const hardDeleteEnquiry = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM enquire WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Enquiry not found' };
    }

    await connection.query('DELETE FROM enquire WHERE id = ?', [parseInt(id)]);

    return { success: true, message: 'Enquiry permanently deleted' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateEnquiryStatus = async (id, status) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE enquire SET status = ?, updated_at = NOW() WHERE id = ?',
      [parseInt(status), parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Enquiry not found' };
    }

    return { success: true, message: 'Status updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateLeadStatus = async (id, leadStatus, lostStatus = null) => {
  const connection = await pool.getConnection();
  try {
    let query = 'UPDATE enquire SET lead_status = ?, updated_at = NOW()';
    let params = [parseInt(leadStatus)];

    if (lostStatus) {
      query += ', lost_status = ?';
      params.push(lostStatus);
    }

    query += ' WHERE id = ?';
    params.push(parseInt(id));

    const [result] = await connection.query(query, params);

    if (result.affectedRows === 0) {
      return { success: false, message: 'Enquiry not found' };
    }

    return { success: true, message: 'Lead status updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updatePriority = async (id, priority) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE enquire SET priority = ?, updated_at = NOW() WHERE id = ?',
      [priority, parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Enquiry not found' };
    }

    return { success: true, message: 'Priority updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateQuality = async (id, quality) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE enquire SET quality = ?, updated_at = NOW() WHERE id = ?',
      [quality, parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Enquiry not found' };
    }

    return { success: true, message: 'Quality updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const assignAgent = async (id, agentId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE enquire SET agent_id = ?, updated_at = NOW() WHERE id = ?',
      [parseInt(agentId), parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Enquiry not found' };
    }

    return { success: true, message: 'Agent assigned successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateAgentActivity = async (id, activity) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE enquire SET agent_activity = ?, updated_at = NOW() WHERE id = ?',
      [activity, parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Enquiry not found' };
    }

    return { success: true, message: 'Agent activity updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateAdminActivity = async (id, activity) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE enquire SET admin_activity = ?, updated_at = NOW() WHERE id = ?',
      [activity, parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Enquiry not found' };
    }

    return { success: true, message: 'Admin activity updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const restoreEnquiry = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE enquire SET status = 1, updated_at = NOW() WHERE id = ? AND status = 0',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Enquiry not found or not deleted' };
    }

    return { success: true, message: 'Enquiry restored successfully' };
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
      return { success: false, message: 'No enquiry IDs provided' };
    }

    const sanitizedIds = ids.map(id => parseInt(id));
    const placeholders = sanitizedIds.map(() => '?').join(',');

    const [result] = await connection.query(
      `UPDATE enquire SET status = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      [parseInt(status), ...sanitizedIds]
    );

    return {
      success: true,
      message: `${result.affectedRows} enquiries updated`,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const bulkAssignAgent = async (ids, agentId) => {
  const connection = await pool.getConnection();
  try {
    if (!ids || ids.length === 0) {
      return { success: false, message: 'No enquiry IDs provided' };
    }

    const sanitizedIds = ids.map(id => parseInt(id));
    const placeholders = sanitizedIds.map(() => '?').join(',');

    const [result] = await connection.query(
      `UPDATE enquire SET agent_id = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      [parseInt(agentId), ...sanitizedIds]
    );

    return {
      success: true,
      message: `${result.affectedRows} enquiries assigned`,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const bulkUpdateLeadStatus = async (ids, leadStatus) => {
  const connection = await pool.getConnection();
  try {
    if (!ids || ids.length === 0) {
      return { success: false, message: 'No enquiry IDs provided' };
    }

    const sanitizedIds = ids.map(id => parseInt(id));
    const placeholders = sanitizedIds.map(() => '?').join(',');

    const [result] = await connection.query(
      `UPDATE enquire SET lead_status = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      [parseInt(leadStatus), ...sanitizedIds]
    );

    return {
      success: true,
      message: `${result.affectedRows} enquiries updated`,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getEnquiryStats = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const { agent_id, date_from, date_to } = filters;

    let whereConditions = ['status != 0'];
    let params = [];

    if (agent_id) {
      whereConditions.push('agent_id = ?');
      params.push(parseInt(agent_id));
    }
    if (date_from) {
      whereConditions.push('DATE(created_at) >= ?');
      params.push(date_from);
    }
    if (date_to) {
      whereConditions.push('DATE(created_at) <= ?');
      params.push(date_to);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_enquiries,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_enquiries,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as deleted_enquiries,
        SUM(CASE WHEN lead_status = 1 THEN 1 ELSE 0 END) as new_leads,
        SUM(CASE WHEN lead_status = 2 THEN 1 ELSE 0 END) as in_progress_leads,
        SUM(CASE WHEN lead_status = 3 THEN 1 ELSE 0 END) as converted_leads,
        SUM(CASE WHEN lead_status = 4 THEN 1 ELSE 0 END) as lost_leads,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium_priority,
        SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low_priority
      FROM enquire
      ${whereClause}
    `, params);

    const [recentStats] = await connection.query(`
      SELECT COUNT(*) as new_enquiries_week
      FROM enquire
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status != 0
    `);

    const [typeStats] = await connection.query(`
      SELECT type, COUNT(*) as count
      FROM enquire
      WHERE status != 0 AND type IS NOT NULL AND type != ''
      GROUP BY type
      ORDER BY count DESC
    `);

    const [sourceStats] = await connection.query(`
      SELECT source, COUNT(*) as count
      FROM enquire
      WHERE status != 0 AND source IS NOT NULL AND source != ''
      GROUP BY source
      ORDER BY count DESC
      LIMIT 10
    `);

    const [agentStats] = await connection.query(`
      SELECT 
        e.agent_id,
        a.name as agent_name,
        COUNT(*) as total_enquiries,
        SUM(CASE WHEN e.lead_status = 3 THEN 1 ELSE 0 END) as converted
      FROM enquire e
      LEFT JOIN agents a ON e.agent_id = a.id
      WHERE e.status != 0 AND e.agent_id IS NOT NULL
      GROUP BY e.agent_id
      ORDER BY total_enquiries DESC
      LIMIT 10
    `);

    const [dailyStats] = await connection.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM enquire
      WHERE status != 0 AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    return {
      success: true,
      data: {
        ...stats[0],
        new_enquiries_week: recentStats[0].new_enquiries_week,
        by_type: typeStats,
        by_source: sourceStats,
        by_agent: agentStats,
        daily_trend: dailyStats
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getRecentEnquiries = async (limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [enquiries] = await connection.query(
      `SELECT 
         e.*,
         p.property_name,
         pr.ProjectName as project_name,
         a.name as agent_name,
         cu.name as contact_name,
         cu.email as contact_email
       FROM enquire e
       LEFT JOIN properties p ON e.property_id = p.id
       LEFT JOIN project_listing pr ON e.project_id = pr.id
       LEFT JOIN agents a ON e.agent_id = a.id
       LEFT JOIN users cu ON e.contact_id = cu.id
       WHERE e.status != 0
       ORDER BY e.created_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    return { success: true, data: enquiries };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getUnassignedEnquiries = async (limit = 50) => {
  const connection = await pool.getConnection();
  try {
    const [enquiries] = await connection.query(
      `SELECT 
         e.*,
         p.property_name,
         pr.ProjectName as project_name,
         cu.name as contact_name,
         cu.email as contact_email
       FROM enquire e
       LEFT JOIN properties p ON e.property_id = p.id
       LEFT JOIN project_listing pr ON e.project_id = pr.id
       LEFT JOIN users cu ON e.contact_id = cu.id
       WHERE e.status != 0 AND (e.agent_id IS NULL OR e.agent_id = 0)
       ORDER BY e.created_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    return { success: true, data: enquiries };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getHighPriorityEnquiries = async (limit = 20) => {
  const connection = await pool.getConnection();
  try {
    const [enquiries] = await connection.query(
      `SELECT 
         e.*,
         p.property_name,
         pr.ProjectName as project_name,
         a.name as agent_name,
         cu.name as contact_name,
         cu.email as contact_email
       FROM enquire e
       LEFT JOIN properties p ON e.property_id = p.id
       LEFT JOIN project_listing pr ON e.project_id = pr.id
       LEFT JOIN agents a ON e.agent_id = a.id
       LEFT JOIN users cu ON e.contact_id = cu.id
       WHERE e.status != 0 AND e.priority = 'high'
       ORDER BY e.created_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    return { success: true, data: enquiries };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const searchEnquiries = async (query, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const searchTerm = `%${query}%`;

    const [enquiries] = await connection.query(
      `SELECT 
         e.*,
         p.property_name,
         pr.ProjectName as project_name,
         a.name as agent_name,
         cu.name as contact_name,
         cu.email as contact_email
       FROM enquire e
       LEFT JOIN properties p ON e.property_id = p.id
       LEFT JOIN project_listing pr ON e.project_id = pr.id
       LEFT JOIN agents a ON e.agent_id = a.id
       LEFT JOIN users cu ON e.contact_id = cu.id
       WHERE e.status != 0
         AND (e.message LIKE ? OR e.building LIKE ? OR cu.name LIKE ? OR cu.email LIKE ? OR p.property_name LIKE ?)
       ORDER BY e.created_at DESC
       LIMIT ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]
    );

    return { success: true, data: enquiries };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const toggleDripMarketing = async (id, enabled) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE enquire SET drip_marketing = ?, updated_at = NOW() WHERE id = ?',
      [enabled ? 'yes' : 'no', parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Enquiry not found' };
    }

    return {
      success: true,
      message: enabled ? 'Drip marketing enabled' : 'Drip marketing disabled'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  createEnquireTable,
  getActiveEnquiries,
  getEnquiryById,
  getEnquiriesByProperty,
  getEnquiriesByProject,
  getEnquiriesByAgent,
  getEnquiriesByContact,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  hardDeleteEnquiry,
  updateEnquiryStatus,
  updateLeadStatus,
  updatePriority,
  updateQuality,
  assignAgent,
  updateAgentActivity,
  updateAdminActivity,
  restoreEnquiry,
  bulkUpdateStatus,
  bulkAssignAgent,
  bulkUpdateLeadStatus,
  getEnquiryStats,
  getRecentEnquiries,
  getUnassignedEnquiries,
  getHighPriorityEnquiries,
  searchEnquiries,
  toggleDripMarketing
};