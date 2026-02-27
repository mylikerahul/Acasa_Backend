import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';

// ==================== TABLE CREATION ====================

export const createUserTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        usertype VARCHAR(191),
        cuid VARCHAR(255),
        treatment VARCHAR(10),
        department VARCHAR(255),
        length_of_service VARCHAR(255),
        full_name VARCHAR(255),
        name VARCHAR(100),
        rera_brn VARCHAR(100),
        orn_number VARCHAR(255),
        email VARCHAR(191) UNIQUE,
        other_email VARCHAR(255),
        password VARCHAR(60),
        provider_id VARCHAR(255),
        provider VARCHAR(255),
        phone VARCHAR(191),
        about TEXT,
        mobile_phone VARCHAR(18),
        salutation VARCHAR(255),
        licence VARCHAR(100),
        photo VARCHAR(255),
        resume VARCHAR(255),
        fax VARCHAR(50),
        country INT(11),
        city VARCHAR(100),
        facebook VARCHAR(191),
        twitter VARCHAR(191),
        gplus VARCHAR(191),
        linkedin VARCHAR(191),
        website VARCHAR(100),
        fixed_salary VARCHAR(100),
        basic_commision VARCHAR(10),
        over_target_commission VARCHAR(10),
        recruiting VARCHAR(100),
        joining_date DATE,
        leaving_date DATE,
        public_permision INT(1) NOT NULL DEFAULT 1,
        educatin TEXT,
        category VARCHAR(100) NOT NULL DEFAULT 'Primary; Secondary',
        image_icon VARCHAR(191),
        seo_title VARCHAR(255),
        seo_keywork VARCHAR(255),
        seo_description TEXT,
        confirmation_code VARCHAR(191),
        remember_token VARCHAR(100),
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        status INT(1) NOT NULL DEFAULT 1,
        first_login VARCHAR(1),
        nationality VARCHAR(100) NOT NULL,
        marital_status VARCHAR(100) NOT NULL,
        originality VARCHAR(100) NOT NULL,
        languages VARCHAR(255) NOT NULL,
        contact_type VARCHAR(255),
        instagram VARCHAR(100),
        dob VARCHAR(100),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        marketing_name VARCHAR(255),
        full_legal_name VARCHAR(255),
        gender VARCHAR(50),
        first_name_2 VARCHAR(255),
        last_name_2 VARCHAR(255),
        mobile_phone2 INT(255),
        INDEX idx_email (email),
        INDEX idx_usertype (usertype),
        INDEX idx_status (status),
        INDEX idx_phone (phone),
        INDEX idx_country (country)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createUserPermissionTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_permission (
        id INT(1) AUTO_INCREMENT PRIMARY KEY,
        user_type VARCHAR(100) NOT NULL,
        property_create INT(1) NOT NULL,
        property_update INT(1) NOT NULL,
        property_read INT(1) NOT NULL,
        property_delete INT(1) NOT NULL,
        project_create INT(1) NOT NULL,
        project_update INT(1) NOT NULL,
        project_read INT(1) NOT NULL,
        project_delete INT(1) NOT NULL,
        enquiry_create INT(1) NOT NULL,
        enquiry_update INT(1) NOT NULL,
        enquiry_read INT(1) NOT NULL,
        enquiry_delete INT(1) NOT NULL,
        activity_create INT(1) NOT NULL,
        activity_update INT(1) NOT NULL,
        activity_read INT(1) NOT NULL,
        activity_delete INT(1) NOT NULL,
        transaction_create INT(1) NOT NULL,
        transaction_update INT(1) NOT NULL,
        transaction_read INT(1) NOT NULL,
        transaction_delete INT(1) NOT NULL,
        content_create INT(1) NOT NULL,
        content_update INT(1) NOT NULL,
        content_read INT(1) NOT NULL,
        content_delete INT(1) NOT NULL,
        reporting_create INT(1) NOT NULL,
        reporting_update INT(1) NOT NULL,
        reporting_read INT(1) NOT NULL,
        reporting_delete INT(1) NOT NULL,
        hr_create INT(1) NOT NULL,
        hr_update INT(1) NOT NULL,
        hr_read INT(1) NOT NULL,
        hr_delete INT(1) NOT NULL,
        location_create INT(1) NOT NULL,
        location_update INT(1) NOT NULL,
        location_read INT(1) NOT NULL,
        location_delete INT(1) NOT NULL,
        user_create INT(1) NOT NULL,
        user_update INT(1) NOT NULL,
        user_read INT(1) NOT NULL,
        user_delete INT(1) NOT NULL,
        testimonial_create INT(1) NOT NULL,
        testimonial_update INT(1) NOT NULL,
        testimonial_read INT(1) NOT NULL,
        testimonial_delete INT(1) NOT NULL,
        control_create INT(1) NOT NULL,
        control_update INT(1) NOT NULL,
        control_read INT(1) NOT NULL,
        control_delete INT(1) NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_type (user_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createPermissionIndividualTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS permission_individual (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        user_id INT(11) NOT NULL,
        module VARCHAR(70) NOT NULL,
        cta_key VARCHAR(100) NOT NULL,
        value INT(1) NOT NULL,
        update_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_module (module),
        INDEX idx_cta_key (cta_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createUsersDocumentsTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users_documents (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        user_id INT(11) NOT NULL,
        project_id INT(11) NOT NULL,
        doc_type VARCHAR(100) NOT NULL,
        id_number VARCHAR(255) NOT NULL,
        expiry_date VARCHAR(20) NOT NULL,
        attachment VARCHAR(255) NOT NULL,
        create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        update_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_project_id (project_id),
        INDEX idx_doc_type (doc_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createPasswordResetsTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        email VARCHAR(191) NOT NULL,
        token VARCHAR(191) NOT NULL,
        created_at TIMESTAMP NULL,
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

// ==================== CONSTANTS ====================

export const USER_TYPES = {
  USER: 'user',
  ADMIN: 'Admin'
};

export const VALID_USER_TYPES = Object.values(USER_TYPES);

const PUBLIC_SELECT_FIELDS = `
  id, usertype, full_name, name, first_name, last_name,
  email, phone, about, mobile_phone, salutation,
  photo, image_icon, country, city, 
  facebook, twitter, linkedin, instagram, gplus, website,
  category, seo_title, seo_keywork, seo_description, 
  status, public_permision, nationality, languages, gender,
  rera_brn, orn_number, licence, marketing_name
`;

const ADMIN_SELECT_FIELDS = `
  id, usertype, cuid, treatment, department, length_of_service,
  full_name, name, first_name, last_name, first_name_2, last_name_2,
  rera_brn, orn_number, email, other_email, phone, mobile_phone, mobile_phone2,
  about, salutation, licence, photo, resume, fax,
  country, city, facebook, twitter, gplus, linkedin, instagram, website,
  fixed_salary, basic_commision, over_target_commission,
  recruiting, joining_date, leaving_date,
  public_permision, educatin, category, image_icon,
  seo_title, seo_keywork, seo_description,
  confirmation_code, remember_token,
  status, first_login, nationality, marital_status, originality, languages,
  contact_type, dob, marketing_name, full_legal_name, gender,
  provider, provider_id, created_at, updated_at
`;

// ==================== HELPER FUNCTIONS ====================

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  if (!hashedPassword) return false;
  
  const isHashed = hashedPassword.startsWith('$2a$') || 
                   hashedPassword.startsWith('$2b$') || 
                   hashedPassword.startsWith('$2y$');
  
  if (!isHashed) {
    return plainPassword === hashedPassword;
  }
  
  return bcrypt.compare(plainPassword, hashedPassword);
};

const isEmpty = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
};

// ==================== USER CRUD OPERATIONS ====================

export const createUser = async (data) => {
  const connection = await pool.getConnection();
  try {
    const userData = {};
    
    if (data.full_name && data.full_name.trim()) {
      userData.full_name = data.full_name.trim();
      userData.name = data.name?.trim() || data.full_name.trim();
    } else if (data.name && data.name.trim()) {
      userData.name = data.name.trim();
      userData.full_name = data.full_name?.trim() || data.name.trim();
    } else {
      throw new Error('Name is required');
    }
    
    if (!data.email || !data.email.trim()) {
      throw new Error('Email is required');
    }
    userData.email = data.email.trim().toLowerCase();
    
    if (data.password && data.password.trim()) {
      userData.password = await hashPassword(data.password);
    }
    
    userData.usertype = data.usertype?.trim() || 'user';
    userData.provider = data.provider?.trim() || 'local';
    userData.status = data.status !== undefined ? parseInt(data.status) : 1;
    userData.public_permision = data.public_permision !== undefined ? parseInt(data.public_permision) : 1;
    userData.first_login = data.first_login?.trim() || '0';
    userData.country = data.country !== undefined ? parseInt(data.country) || 0 : 0;
    userData.nationality = data.nationality || '';
    userData.marital_status = data.marital_status || '';
    userData.originality = data.originality || '';
    userData.languages = data.languages || '';
    userData.category = data.category || 'Primary; Secondary';
    
    const optionalFields = [
      'cuid', 'treatment', 'department', 'length_of_service',
      'first_name', 'last_name', 'first_name_2', 'last_name_2',
      'rera_brn', 'orn_number', 'other_email', 'provider_id',
      'phone', 'about', 'mobile_phone', 'mobile_phone2', 'salutation',
      'licence', 'photo', 'resume', 'fax', 'city',
      'facebook', 'twitter', 'gplus', 'linkedin', 'instagram', 'website',
      'fixed_salary', 'basic_commision', 'over_target_commission',
      'recruiting', 'joining_date', 'leaving_date',
      'educatin', 'image_icon', 'seo_title', 'seo_keywork', 'seo_description',
      'confirmation_code', 'remember_token',
      'contact_type', 'dob', 'marketing_name', 'full_legal_name', 'gender'
    ];
    
    for (const field of optionalFields) {
      const value = data[field];
      if (!isEmpty(value)) {
        userData[field] = typeof value === 'string' ? value.trim() : value;
      }
    }
    
    const fields = Object.keys(userData);
    const values = Object.values(userData);
    const placeholders = fields.map(() => '?').join(', ');
    
    const query = `INSERT INTO users (${fields.join(', ')}, created_at, updated_at) VALUES (${placeholders}, NOW(), NOW())`;
    
    const [result] = await connection.query(query, values);
    return getUserById(result.insertId, true);
    
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createGoogleUser = async (userData) => {
  const connection = await pool.getConnection();
  try {
    const {
      full_name,
      name,
      email,
      provider_id,
      image_icon,
      usertype = 'user',
      status = 1,
      public_permision = 1
    } = userData;

    const query = `
      INSERT INTO users (
        full_name, name, email, provider_id, provider,
        image_icon, usertype, status, public_permision,
        nationality, marital_status, originality, languages, category,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'google', ?, ?, ?, ?, '', '', '', '', 'Primary; Secondary', NOW(), NOW())
    `;

    const values = [
      full_name,
      name,
      email.toLowerCase(),
      provider_id,
      image_icon || null,
      usertype,
      status,
      public_permision
    ];

    const [result] = await connection.query(query, values);
    return getUserById(result.insertId, false);
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getUserByProviderIdAndProvider = async (providerId, provider) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE provider_id = ? AND provider = ?',
      [providerId, provider]
    );
    return rows[0] || null;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createAdmin = async (data) => {
  return createUser({ 
    ...data, 
    usertype: USER_TYPES.ADMIN,
    public_permision: 0 
  });
};

export const getUsers = async (filters = {}, pagination = {}, isAdminContext = false) => {
  const connection = await pool.getConnection();
  try {
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 20;
    const offset = (page - 1) * limit;

    const selectFields = isAdminContext ? ADMIN_SELECT_FIELDS : PUBLIC_SELECT_FIELDS;

    let whereConditions = [];
    const params = [];

    if (filters.usertype) {
      if (filters.usertype.toLowerCase() === 'admin') {
        whereConditions.push('(usertype = ? OR usertype = ?)');
        params.push('Admin', 'admin');
      } else if (filters.usertype.toLowerCase() === 'user') {
        whereConditions.push('usertype = ?');
        params.push('user');
      }
    }

    if (filters.status !== undefined && filters.status !== null && filters.status !== '') {
      whereConditions.push('status = ?');
      params.push(parseInt(filters.status));
    } else if (!isAdminContext) {
      whereConditions.push('status = 1');
    }

    if (!isAdminContext) {
      whereConditions.push('public_permision = 1');
    }

    if (filters.country) {
      whereConditions.push('country = ?');
      params.push(parseInt(filters.country));
    }

    if (filters.city) {
      whereConditions.push('city = ?');
      params.push(filters.city);
    }

    if (filters.nationality) {
      whereConditions.push('nationality = ?');
      params.push(filters.nationality);
    }

    if (filters.department) {
      whereConditions.push('department = ?');
      params.push(filters.department);
    }

    if (filters.search) {
      whereConditions.push(`(
        full_name LIKE ? OR 
        name LIKE ? OR 
        email LIKE ? OR 
        phone LIKE ? OR
        mobile_phone LIKE ? OR
        about LIKE ?
      )`);
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const allowedSortColumns = ['created_at', 'updated_at', 'full_name', 'name', 'email', 'status', 'id'];
    const orderBy = allowedSortColumns.includes(filters.orderBy) ? filters.orderBy : 'created_at';
    const order = (filters.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );

    const [rows] = await connection.query(
      `SELECT ${selectFields} FROM users ${whereClause} ORDER BY ${orderBy} ${order} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const total = countResult[0].total;

    return {
      success: true,
      data: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getUserById = async (id, isAdminContext = false) => {
  const connection = await pool.getConnection();
  try {
    const selectFields = isAdminContext ? ADMIN_SELECT_FIELDS : PUBLIC_SELECT_FIELDS;
    
    const [rows] = await connection.query(
      `SELECT ${selectFields} FROM users WHERE id = ?`,
      [parseInt(id)]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0];
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getUserByEmail = async (email) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    return rows[0] || null;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getUserWithPassword = async (email) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, usertype, full_name, name, email, password, 
              status, provider, image_icon, photo
       FROM users WHERE email = ?`,
      [email.toLowerCase()]
    );
    return rows[0] || null;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const checkEmailExists = async (email, excludeId = null) => {
  const connection = await pool.getConnection();
  try {
    let query = 'SELECT id FROM users WHERE email = ?';
    let params = [email.toLowerCase()];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(parseInt(excludeId));
    }

    const [rows] = await connection.query(query, params);
    return rows.length > 0;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateUser = async (id, data) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'User not found' };
    }

    const updateFields = {};
    
    const allowedFields = [
      'usertype', 'cuid', 'treatment', 'department', 'length_of_service',
      'full_name', 'name', 'first_name', 'last_name', 'first_name_2', 'last_name_2',
      'rera_brn', 'orn_number', 'other_email',
      'phone', 'about', 'mobile_phone', 'mobile_phone2', 'salutation',
      'licence', 'photo', 'resume', 'fax', 'country', 'city',
      'facebook', 'twitter', 'gplus', 'linkedin', 'instagram', 'website',
      'fixed_salary', 'basic_commision', 'over_target_commission',
      'recruiting', 'joining_date', 'leaving_date',
      'public_permision', 'educatin', 'category', 'image_icon',
      'seo_title', 'seo_keywork', 'seo_description',
      'status', 'first_login', 'nationality', 'marital_status', 'originality',
      'languages', 'contact_type', 'dob', 'marketing_name', 'full_legal_name', 'gender'
    ];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        const value = data[field];
        
        if (field === 'country' || field === 'mobile_phone2') {
          updateFields[field] = parseInt(value) || 0;
        } else if (field === 'status' || field === 'public_permision') {
          updateFields[field] = value === 1 || value === '1' ? 1 : 0;
        } else {
          updateFields[field] = typeof value === 'string' ? value.trim() : value;
        }
      }
    }
    
    if (data.password && data.password.trim()) {
      updateFields.password = await hashPassword(data.password);
    }
    
    if (Object.keys(updateFields).length === 0) {
      return { success: true, message: 'No changes to update', data: await getUserById(id, true) };
    }
    
    const fields = Object.keys(updateFields).map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(updateFields), parseInt(id)];
    
    await connection.query(
      `UPDATE users SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    return { success: true, message: 'User updated successfully', data: await getUserById(id, true) };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateUserPassword = async (id, newPassword) => {
  const connection = await pool.getConnection();
  try {
    const hashedPassword = await hashPassword(newPassword);
    
    const [result] = await connection.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, parseInt(id)]
    );
    
    return { success: result.affectedRows > 0, message: result.affectedRows > 0 ? 'Password updated' : 'User not found' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateUserStatus = async (id, status) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
      [parseInt(status), parseInt(id)]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'User not found' };
    }
    
    return { success: true, message: 'Status updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateUserPhoto = async (id, photo) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE users SET photo = ?, image_icon = ?, updated_at = NOW() WHERE id = ?',
      [photo, photo, parseInt(id)]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'User not found' };
    }
    
    return { success: true, message: 'Photo updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteUser = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'User not found' };
    }

    await connection.query(
      'UPDATE users SET status = 0, updated_at = NOW() WHERE id = ?',
      [parseInt(id)]
    );
    
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const hardDeleteUser = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'User not found' };
    }

    await connection.query('DELETE FROM users WHERE id = ?', [parseInt(id)]);
    
    return { success: true, message: 'User permanently deleted' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const restoreUser = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE users SET status = 1, updated_at = NOW() WHERE id = ? AND status = 0',
      [parseInt(id)]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'User not found or not deleted' };
    }
    
    return { success: true, message: 'User restored successfully' };
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
      return { success: false, message: 'No user IDs provided' };
    }

    const sanitizedIds = ids.map(id => parseInt(id));
    const placeholders = sanitizedIds.map(() => '?').join(',');

    const [result] = await connection.query(
      `UPDATE users SET status = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      [parseInt(status), ...sanitizedIds]
    );

    return {
      success: true,
      message: `${result.affectedRows} users updated`,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const setConfirmationCode = async (email, code) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE users SET confirmation_code = ?, updated_at = NOW() WHERE email = ?',
      [code, email.toLowerCase()]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getUserByConfirmationCode = async (code) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE confirmation_code = ?',
      [code]
    );
    return rows[0] || null;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const clearConfirmationCode = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE users SET confirmation_code = NULL, updated_at = NOW() WHERE id = ?',
      [parseInt(id)]
    );
    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const setRememberToken = async (id, token) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE users SET remember_token = ?, updated_at = NOW() WHERE id = ?',
      [token, parseInt(id)]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getUserByRememberToken = async (token) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE remember_token = ?',
      [token]
    );
    return rows[0] || null;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const clearRememberToken = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE users SET remember_token = NULL, updated_at = NOW() WHERE id = ?',
      [parseInt(id)]
    );
    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const searchUsers = async (query, filters = {}, limit = 20) => {
  const connection = await pool.getConnection();
  try {
    const searchTerm = `%${query}%`;

    let whereConditions = ['status = 1'];
    let params = [];

    whereConditions.push(`(
      full_name LIKE ? OR 
      name LIKE ? OR 
      email LIKE ? OR 
      phone LIKE ? OR
      mobile_phone LIKE ?
    )`);
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);

    if (filters.usertype) {
      whereConditions.push('usertype = ?');
      params.push(filters.usertype);
    }

    const [rows] = await connection.query(
      `SELECT ${PUBLIC_SELECT_FIELDS}
       FROM users
       WHERE ${whereConditions.join(' AND ')}
       ORDER BY 
         CASE WHEN full_name LIKE ? THEN 1 ELSE 2 END,
         full_name ASC
       LIMIT ?`,
      [...params, searchTerm, parseInt(limit)]
    );

    return { success: true, data: rows };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getUserStats = async () => {
  const connection = await pool.getConnection();
  try {
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive_users,
        SUM(CASE WHEN usertype = 'user' THEN 1 ELSE 0 END) as regular_users,
        SUM(CASE WHEN usertype IN ('Admin', 'admin') THEN 1 ELSE 0 END) as admin_users,
        SUM(CASE WHEN public_permision = 1 AND status = 1 THEN 1 ELSE 0 END) as public_profiles
      FROM users
    `);

    const [recentStats] = await connection.query(`
      SELECT COUNT(*) as new_users_week
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    const [todayStats] = await connection.query(`
      SELECT COUNT(*) as today_registrations
      FROM users
      WHERE DATE(created_at) = CURDATE()
    `);

    const [usertypeStats] = await connection.query(`
      SELECT usertype, COUNT(*) as count
      FROM users
      WHERE status = 1
      GROUP BY usertype
      ORDER BY count DESC
    `);

    const [countryStats] = await connection.query(`
      SELECT country, COUNT(*) as count
      FROM users
      WHERE status = 1 AND country IS NOT NULL AND country > 0
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `);

    return {
      success: true,
      data: {
        ...stats[0],
        new_users_week: recentStats[0].new_users_week,
        today_registrations: todayStats[0].today_registrations,
        by_usertype: usertypeStats,
        by_country: countryStats
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getDashboardStats = async () => {
  return getUserStats();
};

export const getTotalUsers = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT COUNT(*) as total FROM users');
    return rows[0].total;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getAdmins = async (pagination = {}) => {
  return getUsers({ usertype: 'admin' }, pagination, true);
};

export const getActiveUsers = async (pagination = {}) => {
  return getUsers({ status: 1 }, pagination, true);
};

export const getUsersByDepartment = async (department, pagination = {}) => {
  return getUsers({ department }, pagination, true);
};

export const getUsersByCountry = async (country, pagination = {}) => {
  return getUsers({ country }, pagination, true);
};

// ==================== USER PERMISSION OPERATIONS ====================

export const createUserPermission = async (data) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const query = `INSERT INTO user_permission (${fields}) VALUES (${placeholders})`;
    const [result] = await connection.query(query, values);

    return { success: true, id: result.insertId, message: 'Permission created successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getUserPermissionByUserType = async (userType) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM user_permission WHERE user_type = ?',
      [userType]
    );
    return rows[0] || null;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateUserPermission = async (userType, data) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(data).map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(data), userType];

    const [result] = await connection.query(
      `UPDATE user_permission SET ${fields} WHERE user_type = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Permission not found' };
    }

    return { success: true, message: 'Permission updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getAllUserPermissions = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM user_permission');
    return { success: true, data: rows };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ==================== PERMISSION INDIVIDUAL OPERATIONS ====================

export const createIndividualPermission = async (data) => {
  const connection = await pool.getConnection();
  try {
    const { user_id, module, cta_key, value } = data;

    const query = `
      INSERT INTO permission_individual (user_id, module, cta_key, value)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await connection.query(query, [user_id, module, cta_key, value]);
    return { success: true, id: result.insertId, message: 'Individual permission created' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getIndividualPermissionsByUserId = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM permission_individual WHERE user_id = ?',
      [parseInt(userId)]
    );
    return { success: true, data: rows };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateIndividualPermission = async (id, data) => {
  const connection = await pool.getConnection();
  try {
    const { module, cta_key, value } = data;

    const [result] = await connection.query(
      'UPDATE permission_individual SET module = ?, cta_key = ?, value = ? WHERE id = ?',
      [module, cta_key, value, parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Permission not found' };
    }

    return { success: true, message: 'Individual permission updated' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteIndividualPermission = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'DELETE FROM permission_individual WHERE id = ?',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Permission not found' };
    }

    return { success: true, message: 'Individual permission deleted' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteIndividualPermissionsByUserId = async (userId) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'DELETE FROM permission_individual WHERE user_id = ?',
      [parseInt(userId)]
    );
    return { success: true, message: 'All user permissions deleted' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ==================== USER DOCUMENTS OPERATIONS ====================

export const createUserDocument = async (data) => {
  const connection = await pool.getConnection();
  try {
    const { user_id, project_id, doc_type, id_number, expiry_date, attachment } = data;

    const query = `
      INSERT INTO users_documents (user_id, project_id, doc_type, id_number, expiry_date, attachment)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.query(query, [
      user_id,
      project_id,
      doc_type,
      id_number,
      expiry_date,
      attachment
    ]);

    return { success: true, id: result.insertId, message: 'Document created successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getUserDocuments = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM users_documents WHERE user_id = ?',
      [parseInt(userId)]
    );
    return { success: true, data: rows };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getUserDocumentById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM users_documents WHERE id = ?',
      [parseInt(id)]
    );
    return rows[0] || null;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateUserDocument = async (id, data) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(data).map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(data), parseInt(id)];

    const [result] = await connection.query(
      `UPDATE users_documents SET ${fields} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Document not found' };
    }

    return { success: true, message: 'Document updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteUserDocument = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'DELETE FROM users_documents WHERE id = ?',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Document not found' };
    }

    return { success: true, message: 'Document deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getDocumentsByProjectId = async (projectId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM users_documents WHERE project_id = ?',
      [parseInt(projectId)]
    );
    return { success: true, data: rows };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ==================== PASSWORD RESET OPERATIONS ====================

export const createPasswordReset = async (email, token) => {
  const connection = await pool.getConnection();
  try {
    // Delete any existing tokens for this email
    await connection.query('DELETE FROM password_resets WHERE email = ?', [email.toLowerCase()]);

    // Insert new token
    const query = `
      INSERT INTO password_resets (email, token, created_at)
      VALUES (?, ?, NOW())
    `;

    await connection.query(query, [email.toLowerCase(), token]);
    return { success: true, message: 'Password reset token created' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getPasswordResetByEmail = async (email) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM password_resets WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email.toLowerCase()]
    );
    return rows[0] || null;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getPasswordResetByToken = async (token) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM password_resets WHERE token = ?',
      [token]
    );
    return rows[0] || null;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deletePasswordReset = async (email) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('DELETE FROM password_resets WHERE email = ?', [email.toLowerCase()]);
    return { success: true, message: 'Password reset token deleted' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteExpiredPasswordResets = async (hours = 24) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'DELETE FROM password_resets WHERE created_at < DATE_SUB(NOW(), INTERVAL ? HOUR)',
      [hours]
    );

    return {
      success: true,
      message: `${result.affectedRows} expired tokens deleted`,
      deletedCount: result.affectedRows
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// ==================== MIGRATIONS ====================

export const runMigrations = async () => {
  const connection = await pool.getConnection();
  try {
    await createUserTable();
    await createUserPermissionTable();
    await createPermissionIndividualTable();
    await createUsersDocumentsTable();
    await createPasswordResetsTable();
    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const runUserMigrations = runMigrations;

// ==================== EXPORTS ====================

export default {
  // Table Creation
  createUserTable,
  createUserPermissionTable,
  createPermissionIndividualTable,
  createUsersDocumentsTable,
  createPasswordResetsTable,

  // Constants
  USER_TYPES,
  VALID_USER_TYPES,

  // User CRUD
  createUser,
  createGoogleUser,
  getUserByProviderIdAndProvider,
  createAdmin,
  getUsers,
  getUserById,
  getUserByEmail,
  getUserWithPassword,
  checkEmailExists,
  comparePassword,
  updateUser,
  updateUserPassword,
  updateUserStatus,
  updateUserPhoto,
  deleteUser,
  hardDeleteUser,
  restoreUser,
  bulkUpdateStatus,
  
  // User Tokens & Codes
  setConfirmationCode,
  getUserByConfirmationCode,
  clearConfirmationCode,
  setRememberToken,
  getUserByRememberToken,
  clearRememberToken,
  
  // User Search & Stats
  searchUsers,
  getUserStats,
  getDashboardStats,
  getTotalUsers,
  getAdmins,
  getActiveUsers,
  getUsersByDepartment,
  getUsersByCountry,

  // User Permissions
  createUserPermission,
  getUserPermissionByUserType,
  updateUserPermission,
  getAllUserPermissions,

  // Individual Permissions
  createIndividualPermission,
  getIndividualPermissionsByUserId,
  updateIndividualPermission,
  deleteIndividualPermission,
  deleteIndividualPermissionsByUserId,

  // User Documents
  createUserDocument,
  getUserDocuments,
  getUserDocumentById,
  updateUserDocument,
  deleteUserDocument,
  getDocumentsByProjectId,

  // Password Resets
  createPasswordReset,
  getPasswordResetByEmail,
  getPasswordResetByToken,
  deletePasswordReset,
  deleteExpiredPasswordResets,

  // Migrations
  runMigrations,
  runUserMigrations
};