import pool from '../../config/db.js';

export const createDealsTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS deals (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        Closing_IDs VARCHAR(200),
        Listing VARCHAR(150),
        Buyers VARCHAR(150),
        Sellers VARCHAR(150),
        Sales_Price VARCHAR(150),
        Target_Closing VARCHAR(150),
        Closing VARCHAR(200),
        Closing_Status VARCHAR(100),
        unknown VARCHAR(200),
        AML VARCHAR(100),
        Contract_Generating_User VARCHAR(100),
        Documentation_Check_In_Process VARCHAR(100),
        Documentation_Check_Approved VARCHAR(100),
        Contact_Details_Verification_In_Process VARCHAR(100),
        Contact_Details_Verified VARCHAR(100),
        Contact_Details_Not_Verified VARCHAR(50),
        KYC_Completed VARCHAR(50),
        AM_KYC_Not_Completed VARCHAR(20),
        Client_Type VARCHAR(20),
        Purchase_as VARCHAR(20),
        Case_with_AMI_Consultants VARCHAR(50),
        Brith VARCHAR(100),
        Age VARCHAR(50),
        Residence VARCHAR(50),
        Passport VARCHAR(50),
        Severity VARCHAR(50),
        Representing VARCHAR(50),
        Probabiltiy VARCHAR(50),
        Developer VARCHAR(50),
        Original_Price VARCHAR(50),
        Tenanat VARCHAR(50),
        Landlord VARCHAR(50),
        Party_Commision VARCHAR(50),
        Agency_Contact VARCHAR(50),
        Party_Name VARCHAR(50),
        Closing_Broker VARCHAR(50),
        Third_broker_split_amount VARCHAR(50),
        Second_Broker VARCHAR(50),
        Second_broker_split_amount VARCHAR(50),
        Fourth_broker_split_amount VARCHAR(50),
        Fourth_broker VARCHAR(50),
        Deposit_Date VARCHAR(50),
        Money_Amount VARCHAR(50),
        Agreement_Date VARCHAR(50),
        Created_By VARCHAR(50),
        closing_name VARCHAR(50),
        wining_inquiry VARCHAR(50),
        lead_source VARCHAR(50),
        wining_inquiry_status VARCHAR(50),
        buyer_nationality VARCHAR(50),
        buyer_second_nationality VARCHAR(50),
        transfer_fee VARCHAR(50),
        seller_nationality VARCHAR(50),
        seller_second_nationality VARCHAR(50),
        listing_type VARCHAR(50),
        listing_city VARCHAR(50),
        commission VARCHAR(50),
        listing_community VARCHAR(50),
        listing_property_address VARCHAR(50),
        furnished VARCHAR(50),
        closing_date VARCHAR(50),
        listng_unit_number VARCHAR(50),
        documentation VARCHAR(50),
        transaction_type VARCHAR(50),
        freehold VARCHAR(50),
        title_dead VARCHAR(50),
        status_on_transfer VARCHAR(50),
        conveyancing_fee VARCHAR(50),
        representation VARCHAR(50),
        security_requested VARCHAR(50),
        success_probability VARCHAR(50),
        success_probability_amount VARCHAR(50),
        partial_payment VARCHAR(50),
        full_payment VARCHAR(50),
        accounted_date VARCHAR(50),
        passport_issued_city VARCHAR(50),
        seller VARCHAR(50),
        Documentation_Check_Not_Approved VARCHAR(50),
        Sold_As VARCHAR(20),
        Due_to_Developer VARCHAR(20),
        Amount INT(100),
        split_amount INT(100),
        Third_Broker VARCHAR(100),
        title VARCHAR(20),
        slug VARCHAR(20),
        sub_title VARCHAR(20),
        descriptions VARCHAR(20),
        seo_title VARCHAR(20),
        seo_keywork VARCHAR(20),
        seo_description VARCHAR(20),
        closing_checklist VARCHAR(200),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_closing_ids (Closing_IDs),
        INDEX idx_closing_status (Closing_Status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getActiveDeals = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 20,
      status,
      closing_status,
      search,
      sortBy = 'updated_at',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    if (closing_status) {
      whereConditions.push('d.Closing_Status = ?');
      params.push(closing_status);
    }

    if (search) {
      whereConditions.push('(d.Closing_IDs LIKE ? OR d.Listing LIKE ? OR d.Buyers LIKE ? OR d.Sellers LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM deals d ${whereClause}`,
      params
    );

    const [deals] = await connection.query(
      `SELECT * FROM deals d
       ${whereClause}
       ORDER BY d.${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: deals,
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

export const getDealById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [dealRows] = await connection.query(
      'SELECT * FROM deals WHERE id = ?',
      [parseInt(id)]
    );

    if (dealRows.length === 0) {
      return { success: false, message: 'Deal not found' };
    }

    return {
      success: true,
      data: dealRows[0]
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getDealsByClosingId = async (closingId) => {
  const connection = await pool.getConnection();
  try {
    const [dealRows] = await connection.query(
      'SELECT * FROM deals WHERE Closing_IDs = ?',
      [closingId]
    );

    if (dealRows.length === 0) {
      return { success: false, message: 'Deal not found' };
    }

    return {
      success: true,
      data: dealRows[0]
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createDeal = async (dealData) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(dealData);
    const values = Object.values(dealData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO deals (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      dealId: result.insertId,
      message: 'Deal created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateDeal = async (id, updateData) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM deals WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Deal not found' };
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), parseInt(id)];

    await connection.query(
      `UPDATE deals SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return { success: true, message: 'Deal updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteDeal = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM deals WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Deal not found' };
    }

    await connection.query('DELETE FROM deals WHERE id = ?', [parseInt(id)]);

    return { success: true, message: 'Deal deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getDealStats = async () => {
  const connection = await pool.getConnection();
  try {
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_deals,
        SUM(CASE WHEN Closing_Status = 'Completed' THEN 1 ELSE 0 END) as completed_deals,
        SUM(CASE WHEN Closing_Status = 'In Process' THEN 1 ELSE 0 END) as in_process_deals,
        SUM(CASE WHEN Closing_Status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_deals
      FROM deals
    `);

    const [recentStats] = await connection.query(`
      SELECT COUNT(*) as new_deals_week
      FROM deals
      WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    return {
      success: true,
      data: {
        ...stats[0],
        new_deals_week: recentStats[0].new_deals_week
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  createDealsTable,
  getActiveDeals,
  getDealById,
  getDealsByClosingId,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealStats
};