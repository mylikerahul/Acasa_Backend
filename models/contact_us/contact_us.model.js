import pool from '../../config/db.js';

const TABLE = 'contact_us';

export const createContactUsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      cuid VARCHAR(255) DEFAULT NULL,
      property_id INT(11) DEFAULT NULL,
      agent_id INT(11) DEFAULT NULL,
      individualid INT(11) DEFAULT NULL,
      compnayid INT(11) DEFAULT NULL,
      developerid INT(11) DEFAULT NULL,
      connected_agent VARCHAR(255) DEFAULT NULL,
      connected_agency VARCHAR(255) DEFAULT NULL,
      connected_employee VARCHAR(255) DEFAULT NULL,
      sharing_with VARCHAR(255) DEFAULT NULL,
      item_type VARCHAR(255) DEFAULT NULL,
      sub_item_type VARCHAR(50) DEFAULT NULL,
      type VARCHAR(255) DEFAULT 'B2C',
      represent_type VARCHAR(50) DEFAULT NULL,
      source VARCHAR(255) DEFAULT NULL,
      name VARCHAR(255) DEFAULT NULL,
      first_name VARCHAR(70) DEFAULT NULL,
      last_name VARCHAR(70) DEFAULT NULL,
      surname VARCHAR(200) DEFAULT NULL,
      salutaion VARCHAR(255) DEFAULT NULL,
      drip_marketing VARCHAR(4) DEFAULT NULL,
      designation VARCHAR(255) DEFAULT NULL,
      company VARCHAR(255) DEFAULT NULL,
      nationality VARCHAR(255) DEFAULT NULL,
      whats_app VARCHAR(255) DEFAULT NULL,
      facebook VARCHAR(255) DEFAULT NULL,
      insta VARCHAR(255) DEFAULT NULL,
      linkedin VARCHAR(255) DEFAULT NULL,
      brn_number VARCHAR(100) DEFAULT NULL,
      mortgage VARCHAR(3) DEFAULT NULL,
      landline VARCHAR(255) DEFAULT NULL,
      profile VARCHAR(255) DEFAULT NULL,
      priority VARCHAR(100) DEFAULT NULL,
      contact_type VARCHAR(255) DEFAULT NULL,
      agent_activity VARCHAR(255) DEFAULT NULL,
      admin_activity VARCHAR(255) DEFAULT NULL,
      email TEXT DEFAULT NULL,
      email_status VARCHAR(3) NOT NULL DEFAULT 'yes',
      phone VARCHAR(255) DEFAULT NULL,
      cell_status VARCHAR(3) NOT NULL DEFAULT 'yes',
      verified VARCHAR(100) DEFAULT NULL,
      property_type VARCHAR(100) DEFAULT NULL,
      website VARCHAR(255) DEFAULT NULL,
      message TEXT DEFAULT NULL,
      resume VARCHAR(255) DEFAULT NULL,
      job_role VARCHAR(255) DEFAULT NULL,
      third_party_client_name VARCHAR(100) DEFAULT NULL,
      third_party_client_commission INT(11) DEFAULT NULL,
      third_party_client_email VARCHAR(100) DEFAULT NULL,
      third_party_client_mobile VARCHAR(50) DEFAULT NULL,
      status INT(1) NOT NULL DEFAULT 1,
      contact_date VARCHAR(100) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      lead_status INT(5) DEFAULT 1,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      last_activity_logged VARCHAR(255) DEFAULT NULL,
      last_activity_date_time VARCHAR(255) DEFAULT NULL
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

  if (filters.status !== undefined) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters.search) {
    conditions.push(`(name LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)`);
    const term = `%${filters.search}%`;
    params.push(term, term, term, term, term);
  }

  if (filters.source) {
    conditions.push('source = ?');
    params.push(filters.source);
  }

  if (filters.type) {
    conditions.push('type = ?');
    params.push(filters.type);
  }

  if (filters.lead_status) {
    conditions.push('lead_status = ?');
    params.push(filters.lead_status);
  }

  if (filters.contact_type) {
    conditions.push('contact_type = ?');
    params.push(filters.contact_type);
  }

  if (filters.agent_id) {
    conditions.push('agent_id = ?');
    params.push(filters.agent_id);
  }

  if (filters.property_id) {
    conditions.push('property_id = ?');
    params.push(filters.property_id);
  }

  if (filters.developerid) {
    conditions.push('developerid = ?');
    params.push(filters.developerid);
  }

  if (filters.individualid) {
    conditions.push('individualid = ?');
    params.push(filters.individualid);
  }

  if (filters.compnayid) {
    conditions.push('compnayid = ?');
    params.push(filters.compnayid);
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

export const findByCuid = async (cuid) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE cuid = ?`, [cuid]);
  return rows[0] || null;
};

export const findByEmail = async (email, excludeId = null) => {
  let query = `SELECT * FROM ${TABLE} WHERE email = ?`;
  let params = [email];
  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  const [rows] = await pool.query(query, params);
  return rows[0] || null;
};

export const findByPhone = async (phone, excludeId = null) => {
  let query = `SELECT * FROM ${TABLE} WHERE phone = ?`;
  let params = [phone];
  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  const [rows] = await pool.query(query, params);
  return rows[0] || null;
};

export const findByAgentId = async (agentId) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE agent_id = ? AND status = 1 ORDER BY created_at DESC`, [agentId]);
  return rows;
};

export const findByPropertyId = async (propertyId) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE property_id = ? AND status = 1 ORDER BY created_at DESC`, [propertyId]);
  return rows;
};

export const findByDeveloperId = async (developerId) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE developerid = ? AND status = 1 ORDER BY created_at DESC`, [developerId]);
  return rows;
};

export const findByIndividualId = async (individualId) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE individualid = ? AND status = 1 ORDER BY created_at DESC`, [individualId]);
  return rows;
};

export const findByCompanyId = async (companyId) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE compnayid = ? AND status = 1 ORDER BY created_at DESC`, [companyId]);
  return rows;
};

export const create = async (data) => {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map(() => '?').join(', ');

  const query = `INSERT INTO ${TABLE} (${fields.join(', ')}) VALUES (${placeholders})`;
  const [result] = await pool.query(query, values);

  return { id: result.insertId, ...data };
};

export const update = async (id, data) => {
  const fields = Object.keys(data);
  const values = Object.values(data);

  if (!fields.length) return null;

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE ${TABLE} SET ${setClause} WHERE id = ?`;

  await pool.query(query, [...values, id]);
  return findById(id);
};

export const softDelete = async (id) => {
  await pool.query(`UPDATE ${TABLE} SET status = 0 WHERE id = ?`, [id]);
  return true;
};

export const hardDelete = async (id) => {
  await pool.query(`DELETE FROM ${TABLE} WHERE id = ?`, [id]);
  return true;
};

export const bulkUpdateStatus = async (ids, status) => {
  const placeholders = ids.map(() => '?').join(',');
  await pool.query(`UPDATE ${TABLE} SET status = ? WHERE id IN (${placeholders})`, [status, ...ids]);
  return true;
};

export const bulkUpdateLeadStatus = async (ids, leadStatus) => {
  const placeholders = ids.map(() => '?').join(',');
  await pool.query(`UPDATE ${TABLE} SET lead_status = ? WHERE id IN (${placeholders})`, [leadStatus, ...ids]);
  return true;
};

export const bulkDelete = async (ids) => {
  const placeholders = ids.map(() => '?').join(',');
  await pool.query(`UPDATE ${TABLE} SET status = 0 WHERE id IN (${placeholders})`, ids);
  return true;
};

export const bulkHardDelete = async (ids) => {
  const placeholders = ids.map(() => '?').join(',');
  await pool.query(`DELETE FROM ${TABLE} WHERE id IN (${placeholders})`, ids);
  return true;
};

export const getStats = async () => {
  const query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive,
      SUM(CASE WHEN lead_status = 1 THEN 1 ELSE 0 END) as new_leads,
      SUM(CASE WHEN lead_status = 2 THEN 1 ELSE 0 END) as contacted,
      SUM(CASE WHEN lead_status = 3 THEN 1 ELSE 0 END) as qualified,
      SUM(CASE WHEN lead_status = 4 THEN 1 ELSE 0 END) as won,
      SUM(CASE WHEN lead_status = 5 THEN 1 ELSE 0 END) as lost
    FROM ${TABLE}
  `;
  const [rows] = await pool.query(query);
  return rows[0];
};

export const getBySource = async (source) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE source = ? AND status = 1 ORDER BY created_at DESC`, [source]);
  return rows;
};

export const getByType = async (type) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE type = ? AND status = 1 ORDER BY created_at DESC`, [type]);
  return rows;
};

export const getByDateRange = async (startDate, endDate) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE} WHERE created_at BETWEEN ? AND ? AND status = 1 ORDER BY created_at DESC`,
    [startDate, endDate]
  );
  return rows;
};

export const updateLeadStatus = async (id, leadStatus) => {
  await pool.query(`UPDATE ${TABLE} SET lead_status = ? WHERE id = ?`, [leadStatus, id]);
  return findById(id);
};

export const updateActivityLog = async (id, activityLog, activityDateTime) => {
  await pool.query(
    `UPDATE ${TABLE} SET last_activity_logged = ?, last_activity_date_time = ? WHERE id = ?`,
    [activityLog, activityDateTime, id]
  );
  return findById(id);
};

export const assignAgent = async (id, agentId) => {
  await pool.query(`UPDATE ${TABLE} SET agent_id = ? WHERE id = ?`, [agentId, id]);
  return findById(id);
};

export const assignConnectedAgent = async (id, connectedAgent) => {
  await pool.query(`UPDATE ${TABLE} SET connected_agent = ? WHERE id = ?`, [connectedAgent, id]);
  return findById(id);
};

export const assignConnectedAgency = async (id, connectedAgency) => {
  await pool.query(`UPDATE ${TABLE} SET connected_agency = ? WHERE id = ?`, [connectedAgency, id]);
  return findById(id);
};

export const assignConnectedEmployee = async (id, connectedEmployee) => {
  await pool.query(`UPDATE ${TABLE} SET connected_employee = ? WHERE id = ?`, [connectedEmployee, id]);
  return findById(id);
};

export default {
  createContactUsTable,
  findAll,
  findById,
  findByCuid,
  findByEmail,
  findByPhone,
  findByAgentId,
  findByPropertyId,
  findByDeveloperId,
  findByIndividualId,
  findByCompanyId,
  create,
  update,
  softDelete,
  hardDelete,
  bulkUpdateStatus,
  bulkUpdateLeadStatus,
  bulkDelete,
  bulkHardDelete,
  getStats,
  getBySource,
  getByType,
  getByDateRange,
  updateLeadStatus,
  updateActivityLog,
  assignAgent,
  assignConnectedAgent,
  assignConnectedAgency,
  assignConnectedEmployee
};