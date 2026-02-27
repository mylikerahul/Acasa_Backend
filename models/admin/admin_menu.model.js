import pool from '../../config/db.js';

export const createAdminMenuTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_menus (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        menu_url VARCHAR(100),
        order_num INT(11),
        menu_type INT(1) NOT NULL DEFAULT 1,
        column_num INT(11),
        status INT(11) DEFAULT 1,
        for_country VARCHAR(70),
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_status (status),
        INDEX idx_order (order_num)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createAdminMenuItemTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_menu_items (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        label VARCHAR(191),
        link VARCHAR(191),
        parent INT(10) UNSIGNED NOT NULL DEFAULT 0,
        sort INT(11) NOT NULL DEFAULT 0,
        class VARCHAR(191),
        menu INT(10) UNSIGNED NOT NULL,
        depth INT(11) NOT NULL DEFAULT 0,
        property_type VARCHAR(100),
        property_zone VARCHAR(100),
        price VARCHAR(100),
        title VARCHAR(100),
        bedrooms VARCHAR(50),
        block VARCHAR(100),
        location VARCHAR(100),
        image_icon VARCHAR(100),
        status INT(5) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_menu (menu),
        INDEX idx_parent (parent),
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

export const createAdminSubmenuTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_submenu (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        item_type VARCHAR(255),
        label VARCHAR(191),
        item_link TEXT,
        parent INT(10) UNSIGNED NOT NULL DEFAULT 0,
        col_num INT(1),
        item_order INT(11) NOT NULL DEFAULT 0,
        thumbnail INT(1) NOT NULL DEFAULT 0,
        status INT(5) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_parent (parent),
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

// ==================== ADMIN MENUS OPERATIONS ====================

export const getActiveMenus = async () => {
  const connection = await pool.getConnection();
  try {
    const [menus] = await connection.query(
      'SELECT * FROM admin_menus WHERE status = 1 ORDER BY order_num ASC'
    );

    for (const menu of menus) {
      const [items] = await connection.query(
        'SELECT * FROM admin_menu_items WHERE menu = ? AND status = 1 ORDER BY sort ASC',
        [menu.id]
      );

      for (const item of items) {
        const [subItems] = await connection.query(
          'SELECT * FROM admin_submenu WHERE parent = ? AND status = 1 ORDER BY item_order ASC',
          [item.id]
        );
        item.subItems = subItems;
      }
      menu.items = items;
    }

    return { success: true, data: menus };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getMenuHierarchy = async (menuId) => {
  const connection = await pool.getConnection();
  try {
    const [menu] = await connection.query(
      'SELECT * FROM admin_menus WHERE id = ?',
      [parseInt(menuId)]
    );

    if (menu.length === 0) {
      return { success: false, message: 'Menu not found' };
    }

    const [items] = await connection.query(
      'SELECT * FROM admin_menu_items WHERE menu = ? ORDER BY sort ASC',
      [parseInt(menuId)]
    );

    for (const item of items) {
      const [subItems] = await connection.query(
        'SELECT * FROM admin_submenu WHERE parent = ? ORDER BY item_order ASC',
        [item.id]
      );
      item.children = subItems;
    }

    return { 
      success: true, 
      data: {
        ...menu[0],
        items
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createMenu = async (menuData) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(menuData);
    const values = Object.values(menuData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO admin_menus (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      menuId: result.insertId,
      message: 'Menu created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateMenu = async (id, updateData) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), parseInt(id)];

    await connection.query(
      `UPDATE admin_menus SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return { success: true, message: 'Menu updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteMenu = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get items to delete subitems
    const [items] = await connection.query(
      'SELECT id FROM admin_menu_items WHERE menu = ?',
      [parseInt(id)]
    );

    const itemIds = items.map(item => item.id);

    if (itemIds.length > 0) {
      const placeholders = itemIds.map(() => '?').join(',');
      await connection.query(
        `DELETE FROM admin_submenu WHERE parent IN (${placeholders})`,
        itemIds
      );
    }

    await connection.query('DELETE FROM admin_menu_items WHERE menu = ?', [parseInt(id)]);
    await connection.query('DELETE FROM admin_menus WHERE id = ?', [parseInt(id)]);

    await connection.commit();
    return { success: true, message: 'Menu and all its items deleted successfully' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ==================== MENU ITEMS OPERATIONS ====================

export const createMenuItem = async (itemData) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(itemData);
    const values = Object.values(itemData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO admin_menu_items (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      itemId: result.insertId,
      message: 'Menu item created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateMenuItem = async (id, updateData) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), parseInt(id)];

    await connection.query(
      `UPDATE admin_menu_items SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return { success: true, message: 'Menu item updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteMenuItem = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query('DELETE FROM admin_submenu WHERE parent = ?', [parseInt(id)]);
    await connection.query('DELETE FROM admin_menu_items WHERE id = ?', [parseInt(id)]);

    await connection.commit();
    return { success: true, message: 'Menu item deleted successfully' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ==================== SUBMENU OPERATIONS ====================

export const createSubmenuItem = async (subData) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(subData);
    const values = Object.values(subData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO admin_submenu (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      success: true,
      submenuId: result.insertId,
      message: 'Submenu item created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateSubmenuItem = async (id, updateData) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), parseInt(id)];

    await connection.query(
      `UPDATE admin_submenu SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return { success: true, message: 'Submenu item updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteSubmenuItem = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('DELETE FROM admin_submenu WHERE id = ?', [parseInt(id)]);
    return { success: true, message: 'Submenu item deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateMenuOrder = async (orderData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const item of orderData) {
      await connection.query(
        'UPDATE admin_menus SET order_num = ? WHERE id = ?',
        [item.order, item.id]
      );
    }

    await connection.commit();
    return { success: true, message: 'Menu order updated' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  createAdminMenuTable,
  createAdminMenuItemTable,
  createAdminSubmenuTable,
  getActiveMenus,
  getMenuHierarchy,
  createMenu,
  updateMenu,
  deleteMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createSubmenuItem,
  updateSubmenuItem,
  deleteSubmenuItem,
  updateMenuOrder
};