import pool from '../../config/db.js';

export const createPropertyTables = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        p_id VARCHAR(255),
        project_id INT(11),
        listing_type VARCHAR(60),
        occupancy VARCHAR(60),
        qc VARCHAR(10),
        dld_permit VARCHAR(255),
        views VARCHAR(255),
        bathrooms VARCHAR(255),
        title_deep VARCHAR(100),
        Spa_number VARCHAR(50),
        from_duration VARCHAR(20),
        to_duration VARCHAR(20),
        availability_type VARCHAR(20),
        RefNumber VARCHAR(191),
        user_id INT(11),
        developer INT(11),
        featured_property VARCHAR(255),
        property_name VARCHAR(191),
        keyword TEXT,
        seo_title TEXT,
        meta_description TEXT,
        canonical_tags VARCHAR(255),
        property_slug VARCHAR(191) UNIQUE,
        property_type VARCHAR(255),
        location VARCHAR(191),
        property_purpose VARCHAR(191),
        address TEXT,
        map_latitude VARCHAR(191),
        map_longitude VARCHAR(191),
        pincode VARCHAR(191),
        landmark VARCHAR(191),
        country VARCHAR(255),
        state_id INT(11),
        city_id INT(11),
        community_id INT(11),
        sub_community_id INT(11),
        agent_id INT(11),
        building VARCHAR(255),
        description LONGTEXT,
        property_features TEXT,
        featured_image VARCHAR(191),
        floor_media_ids VARCHAR(255),
        gallery_media_ids VARCHAR(255),
        developer_id INT(11),
        video_url VARCHAR(255),
        whatsapp_url VARCHAR(255),
        flooring VARCHAR(191),
        furnishing VARCHAR(191),
        video_code TEXT,
        price INT(11),
        price_end VARCHAR(200),
        askprice VARCHAR(10),
        currency_id INT(11),
        bedroom VARCHAR(255),
        kitchen_room INT(11),
        guest_room INT(11),
        other_room INT(11),
        total_room VARCHAR(100),
        floor_no INT(11),
        lift INT(11),
        max_area VARCHAR(255),
        min_area VARCHAR(255),
        area INT(11),
        area_end VARCHAR(200),
        area_size VARCHAR(100),
        amenities VARCHAR(191),
        parking VARCHAR(255),
        property_status VARCHAR(255),
        ReraNumber VARCHAR(191),
        unit VARCHAR(255),
        complete_date TIMESTAMP NULL,
        listing_agent_id INT(11),
        modify_by_admin INT(11) DEFAULT 0,
        identifying_channel VARCHAR(100),
        marketing_channel VARCHAR(100),
        contact_channel VARCHAR(100),
        owner_id INT(11),
        owner_developer_id VARCHAR(255),
        owner_agreement VARCHAR(100),
        owner_commision VARCHAR(100),
        owner_creation_date DATE,
        owner_listing_date DATE,
        exclusive_status VARCHAR(100),
        completion_date VARCHAR(20),
        vacating_date VARCHAR(60),
        documents_id VARCHAR(255),
        status INT(11) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        more_filter VARCHAR(255),
        property_locations VARCHAR(255),
        INDEX idx_property_slug (property_slug),
        INDEX idx_user_id (user_id),
        INDEX idx_developer_id (developer_id),
        INDEX idx_city_id (city_id),
        INDEX idx_community_id (community_id),
        INDEX idx_agent_id (agent_id),
        INDEX idx_status (status),
        INDEX idx_listing_type (listing_type),
        INDEX idx_property_type (property_type),
        INDEX idx_property_purpose (property_purpose)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS properties_metadata (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        property_id INT(11) NOT NULL UNIQUE,
        completion_date VARCHAR(100),
        completion_status VARCHAR(191),
        construction_completion_date VARCHAR(100),
        devloper_description VARCHAR(191),
        meta_developer VARCHAR(191),
        developer_name VARCHAR(191),
        developers_details VARCHAR(191),
        display_address VARCHAR(191),
        exclusive VARCHAR(191),
        floor_type VARCHAR(191),
        furnished VARCHAR(191),
        mandate VARCHAR(191),
        construction_type VARCHAR(191),
        ownership_type VARCHAR(191),
        owner_type VARCHAR(191),
        property_sub_type VARCHAR(191),
        property_type VARCHAR(191),
        rera_permit_number VARCHAR(191),
        unit_level VARCHAR(191),
        unit_no VARCHAR(100),
        video_link VARCHAR(191),
        year_built VARCHAR(191),
        zipcode VARCHAR(191),
        avalabilty_status VARCHAR(191),
        meta_title VARCHAR(191),
        meta_keywords VARCHAR(191),
        meta_description VARCHAR(191),
        measurment VARCHAR(100),
        size VARCHAR(100),
        internal_notes VARCHAR(100),
        starting_price VARCHAR(100),
        no_of_bhk VARCHAR(100),
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_property_id (property_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS properties_prices (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        property_id INT(11) NOT NULL,
        type VARCHAR(10),
        number_of_cheques VARCHAR(100),
        diposit_amount VARCHAR(100),
        agency_fee VARCHAR(100),
        rental_per_year VARCHAR(100),
        viewing_time VARCHAR(60),
        viewing_possible_rental VARCHAR(100),
        viewing_possible_sale VARCHAR(100),
        rental_price VARCHAR(191),
        sale_price VARCHAR(100),
        listing_price VARCHAR(100),
        currency_id INT(11),
        rental_period VARCHAR(191),
        price_on_application INT(1),
        commision_from_landlord VARCHAR(11),
        payment_plan_ids VARCHAR(255),
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_property_id (property_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS properties_sub_type (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS property_gallery (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        property_id INT(11),
        image_name VARCHAR(191),
        added_by VARCHAR(50),
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_property_id (property_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS property_list_type (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS property_locations (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        property_id INT(11) NOT NULL,
        type VARCHAR(50),
        construction VARCHAR(100),
        occupancy VARCHAR(100),
        country_id INT(11),
        state_id INT(11),
        city_id INT(11),
        community_id INT(11),
        sub_community_id INT(11),
        available_from VARCHAR(100),
        available_apartment VARCHAR(3),
        address VARCHAR(255),
        ownPlaces VARCHAR(255),
        latitude VARCHAR(100),
        longitude VARCHAR(100),
        unit_number VARCHAR(100),
        floor_number VARCHAR(100),
        lifestyle_id VARCHAR(255),
        apartment VARCHAR(255),
        villa VARCHAR(255),
        user_commercial VARCHAR(255),
        land VARCHAR(255),
        residential VARCHAR(255),
        commercial VARCHAR(255),
        healthcare VARCHAR(255),
        educational VARCHAR(255),
        hotel_leisure VARCHAR(255),
        industrial VARCHAR(255),
        alternative_investment VARCHAR(255),
        status INT(1),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_property_id (property_id),
        INDEX idx_city_id (city_id),
        INDEX idx_community_id (community_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS property_types (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        status INT(1) DEFAULT 1,
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS private_amenities (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS commercial_amenities (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS saved_property (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT(11) NOT NULL,
        property_id INT(11) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_property_id (property_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return true;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

const getGalleryThumbQuery = (tableAlias = 'p') => {
  return `(SELECT pg.image_name FROM property_gallery pg WHERE pg.property_id = ${tableAlias}.id ORDER BY pg.id ASC LIMIT 1)`;
};

const getMediaThumbQuery = (tableAlias = 'p') => {
  return `(SELECT m.path FROM media m WHERE m.module_id = ${tableAlias}.id AND m.module_type = 'property' AND m.status = 1 ORDER BY m.id ASC LIMIT 1)`;
};

const getGalleryCountQuery = (tableAlias = 'p') => {
  return `(SELECT COUNT(*) FROM property_gallery pg WHERE pg.property_id = ${tableAlias}.id)`;
};

const getMediaCountQuery = (tableAlias = 'p') => {
  return `(SELECT COUNT(*) FROM media m WHERE m.module_id = ${tableAlias}.id AND m.module_type = 'property' AND m.status = 1)`;
};

export const getActiveProperties = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 12,
      city_id,
      community_id,
      sub_community_id,
      developer_id,
      agent_id,
      listing_type,
      property_type,
      property_purpose,
      bedroom,
      bathrooms,
      min_price,
      max_price,
      min_area,
      max_area,
      furnishing,
      featured_property,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = ['p.status = 1'];
    let params = [];

    if (city_id) {
      whereConditions.push('p.city_id = ?');
      params.push(parseInt(city_id));
    }
    if (community_id) {
      whereConditions.push('p.community_id = ?');
      params.push(parseInt(community_id));
    }
    if (sub_community_id) {
      whereConditions.push('p.sub_community_id = ?');
      params.push(parseInt(sub_community_id));
    }
    if (developer_id) {
      whereConditions.push('p.developer_id = ?');
      params.push(parseInt(developer_id));
    }
    if (agent_id) {
      whereConditions.push('p.agent_id = ?');
      params.push(parseInt(agent_id));
    }
    if (listing_type) {
      whereConditions.push('p.listing_type = ?');
      params.push(listing_type);
    }
    if (property_type) {
      whereConditions.push('p.property_type = ?');
      params.push(property_type);
    }
    if (property_purpose) {
      whereConditions.push('p.property_purpose = ?');
      params.push(property_purpose);
    }
    if (bedroom) {
      whereConditions.push('p.bedroom = ?');
      params.push(bedroom);
    }
    if (bathrooms) {
      whereConditions.push('p.bathrooms = ?');
      params.push(bathrooms);
    }
    if (min_price) {
      whereConditions.push('p.price >= ?');
      params.push(parseInt(min_price));
    }
    if (max_price) {
      whereConditions.push('p.price <= ?');
      params.push(parseInt(max_price));
    }
    if (min_area) {
      whereConditions.push('p.area >= ?');
      params.push(parseInt(min_area));
    }
    if (max_area) {
      whereConditions.push('p.area <= ?');
      params.push(parseInt(max_area));
    }
    if (furnishing) {
      whereConditions.push('p.furnishing = ?');
      params.push(furnishing);
    }
    if (featured_property) {
      whereConditions.push('p.featured_property = ?');
      params.push(featured_property);
    }
    if (search) {
      whereConditions.push('(p.property_name LIKE ? OR p.property_slug LIKE ? OR p.location LIKE ? OR p.address LIKE ? OR p.RefNumber LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const allowedSortColumns = ['created_at', 'price', 'views', 'property_name', 'area', 'bedroom'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM properties p ${whereClause}`,
      params
    );

    const [properties] = await connection.query(
      `SELECT 
         p.id,
         p.p_id,
         p.RefNumber,
         p.property_name,
         p.property_slug,
         p.description,
         p.featured_image,
         p.gallery_media_ids,
         p.price,
         p.price_end,
         p.askprice,
         p.property_type,
         p.property_purpose,
         p.listing_type,
         p.bedroom,
         p.bathrooms,
         p.area,
         p.area_end,
         p.area_size,
         p.location,
         p.address,
         p.city_id,
         p.community_id,
         p.sub_community_id,
         p.developer_id,
         p.agent_id,
         p.building,
         p.views,
         p.featured_property,
         p.amenities,
         p.furnishing,
         p.parking,
         p.floor_no,
         p.completion_date,
         p.status,
         p.created_at,
         p.video_url,
         p.map_latitude,
         p.map_longitude,
         c.name AS city_name,
         com.name AS community_name,
         sc.name AS sub_community_name,
         ${getGalleryThumbQuery('p')} as gallery_thumb,
         ${getMediaThumbQuery('p')} as media_thumb,
         ${getGalleryCountQuery('p')} as gallery_count,
         ${getMediaCountQuery('p')} as media_count
       FROM properties p
       LEFT JOIN cities c ON p.city_id = c.id
       LEFT JOIN community com ON p.community_id = com.id
       LEFT JOIN sub_community sc ON p.sub_community_id = sc.id
       ${whereClause}
       ORDER BY p.${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const processedProperties = properties.map(property => {
      const primaryImage = property.featured_image || property.gallery_thumb || property.media_thumb || null;
      let imageSource = 'none';
      if (property.featured_image) imageSource = 'featured';
      else if (property.gallery_thumb) imageSource = 'gallery';
      else if (property.media_thumb) imageSource = 'media';

      return {
        ...property,
        primaryImage,
        imageSource,
        display_image: primaryImage
      };
    });

    return {
      success: true,
      data: processedProperties,
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

export const getPropertyBySlug = async (slug) => {
  const connection = await pool.getConnection();
  try {
    const [propertyRows] = await connection.query(
      `SELECT p.*,
         c.name AS city_name,
         com.name AS community_name,
         sc.name AS sub_community_name,
         pm.completion_date as meta_completion_date,
         pm.completion_status,
         pm.construction_completion_date,
         pm.devloper_description,
         pm.meta_developer,
         pm.developer_name,
         pm.developers_details,
         pm.display_address,
         pm.exclusive,
         pm.floor_type,
         pm.furnished as meta_furnished,
         pm.mandate,
         pm.construction_type,
         pm.ownership_type,
         pm.owner_type,
         pm.property_sub_type,
         pm.rera_permit_number,
         pm.unit_level,
         pm.unit_no,
         pm.video_link,
         pm.year_built,
         pm.zipcode,
         pm.avalabilty_status,
         pm.meta_title,
         pm.meta_keywords,
         pm.meta_description as pm_meta_description,
         pm.measurment,
         pm.size,
         pm.internal_notes,
         pm.starting_price,
         pm.no_of_bhk,
         pp.type as price_type,
         pp.number_of_cheques,
         pp.diposit_amount,
         pp.agency_fee,
         pp.rental_per_year,
         pp.viewing_time,
         pp.viewing_possible_rental,
         pp.viewing_possible_sale,
         pp.rental_price,
         pp.sale_price,
         pp.listing_price,
         pp.rental_period,
         pp.price_on_application,
         pp.commision_from_landlord,
         pp.payment_plan_ids,
         pl.type as location_type,
         pl.construction as location_construction,
         pl.occupancy as location_occupancy,
         pl.available_from,
         pl.available_apartment,
         pl.latitude,
         pl.longitude,
         pl.unit_number,
         pl.floor_number,
         pl.lifestyle_id
       FROM properties p
       LEFT JOIN cities c ON p.city_id = c.id
       LEFT JOIN community com ON p.community_id = com.id
       LEFT JOIN sub_community sc ON p.sub_community_id = sc.id
       LEFT JOIN properties_metadata pm ON p.id = pm.property_id
       LEFT JOIN properties_prices pp ON p.id = pp.property_id
       LEFT JOIN property_locations pl ON p.id = pl.property_id
       WHERE p.property_slug = ? AND p.status = 1`,
      [slug]
    );

    if (propertyRows.length === 0) {
      return { success: false, message: 'Property not found' };
    }

    const property = propertyRows[0];

    await connection.query(
      'UPDATE properties SET views = COALESCE(views, 0) + 1 WHERE id = ?',
      [property.id]
    );

    const [galleryRows] = await connection.query(
      'SELECT id, image_name as Url, added_by, "gallery" as source FROM property_gallery WHERE property_id = ? ORDER BY id ASC',
      [property.id]
    );

    const [mediaRows] = await connection.query(
      'SELECT id, path as Url, title, "media" as source FROM media WHERE module_id = ? AND module_type = "property" AND status = 1 ORDER BY id ASC',
      [property.id]
    );

    let mediaIdsRows = [];
    if (property.gallery_media_ids && property.gallery_media_ids.trim() !== '') {
      const mediaIds = property.gallery_media_ids
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id) && id > 0);

      if (mediaIds.length > 0) {
        const placeholders = mediaIds.map(() => '?').join(',');
        const [rows] = await connection.query(
          `SELECT id, path as Url, title, "media_ids" as source FROM media WHERE id IN (${placeholders}) AND status = 1`,
          mediaIds
        );
        mediaIdsRows = rows;
      }
    }

    const [floorPlans] = await connection.query(
      'SELECT id, title, description, image FROM floor_plan WHERE property_id = ? ORDER BY id ASC',
      [property.id]
    );

    const allGallery = [];
    const seenUrls = new Set();

    galleryRows.forEach(img => {
      if (img.Url && !seenUrls.has(img.Url)) {
        seenUrls.add(img.Url);
        allGallery.push(img);
      }
    });

    mediaRows.forEach(img => {
      if (img.Url && !seenUrls.has(img.Url)) {
        seenUrls.add(img.Url);
        allGallery.push(img);
      }
    });

    mediaIdsRows.forEach(img => {
      if (img.Url && !seenUrls.has(img.Url)) {
        seenUrls.add(img.Url);
        allGallery.push(img);
      }
    });

    const primaryImage = property.featured_image ||
      (galleryRows[0]?.Url) ||
      (mediaRows[0]?.Url) ||
      (mediaIdsRows[0]?.Url) ||
      null;

    let imageSource = 'none';
    if (property.featured_image) imageSource = 'featured';
    else if (galleryRows[0]?.Url) imageSource = 'gallery';
    else if (mediaRows[0]?.Url) imageSource = 'media';
    else if (mediaIdsRows[0]?.Url) imageSource = 'media_ids';

    return {
      success: true,
      data: {
        ...property,
        primaryImage,
        imageSource,
        display_image: primaryImage,
        gallery: allGallery,
        floorPlans: floorPlans,
        galleryStats: {
          fromGalleryTable: galleryRows.length,
          fromMediaTable: mediaRows.length,
          fromMediaIds: mediaIdsRows.length,
          total: allGallery.length
        }
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getPropertyById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [propertyRows] = await connection.query(
      `SELECT p.*,
         c.name AS city_name,
         com.name AS community_name,
         sc.name AS sub_community_name,
         pm.completion_date as meta_completion_date,
         pm.completion_status,
         pm.construction_completion_date,
         pm.devloper_description,
         pm.meta_developer,
         pm.developer_name,
         pm.developers_details,
         pm.display_address,
         pm.exclusive,
         pm.floor_type,
         pm.furnished as meta_furnished,
         pm.mandate,
         pm.construction_type,
         pm.ownership_type,
         pm.owner_type,
         pm.property_sub_type,
         pm.rera_permit_number,
         pm.unit_level,
         pm.unit_no,
         pm.video_link,
         pm.year_built,
         pm.zipcode,
         pm.avalabilty_status,
         pm.meta_title,
         pm.meta_keywords,
         pm.meta_description as pm_meta_description,
         pm.measurment,
         pm.size,
         pm.internal_notes,
         pm.starting_price,
         pm.no_of_bhk,
         pp.type as price_type,
         pp.number_of_cheques,
         pp.diposit_amount,
         pp.agency_fee,
         pp.rental_per_year,
         pp.viewing_time,
         pp.viewing_possible_rental,
         pp.viewing_possible_sale,
         pp.rental_price,
         pp.sale_price,
         pp.listing_price,
         pp.rental_period,
         pp.price_on_application,
         pp.commision_from_landlord,
         pp.payment_plan_ids
       FROM properties p
       LEFT JOIN cities c ON p.city_id = c.id
       LEFT JOIN community com ON p.community_id = com.id
       LEFT JOIN sub_community sc ON p.sub_community_id = sc.id
       LEFT JOIN properties_metadata pm ON p.id = pm.property_id
       LEFT JOIN properties_prices pp ON p.id = pp.property_id
       WHERE p.id = ?`,
      [parseInt(id)]
    );

    if (propertyRows.length === 0) {
      return { success: false, message: 'Property not found' };
    }

    const property = propertyRows[0];

    const [galleryRows] = await connection.query(
      'SELECT id, image_name as Url, added_by, "gallery" as source FROM property_gallery WHERE property_id = ? ORDER BY id ASC',
      [parseInt(id)]
    );

    const [mediaRows] = await connection.query(
      'SELECT id, path as Url, title, "media" as source FROM media WHERE module_id = ? AND module_type = "property" AND status = 1 ORDER BY id ASC',
      [parseInt(id)]
    );

    const [floorPlans] = await connection.query(
      'SELECT id, title, description, image FROM floor_plan WHERE property_id = ? ORDER BY id ASC',
      [parseInt(id)]
    );

    const [locationData] = await connection.query(
      'SELECT * FROM property_locations WHERE property_id = ?',
      [parseInt(id)]
    );

    const allGallery = [];
    const seenUrls = new Set();

    galleryRows.forEach(img => {
      if (img.Url && !seenUrls.has(img.Url)) {
        seenUrls.add(img.Url);
        allGallery.push(img);
      }
    });

    mediaRows.forEach(img => {
      if (img.Url && !seenUrls.has(img.Url)) {
        seenUrls.add(img.Url);
        allGallery.push(img);
      }
    });

    const primaryImage = property.featured_image ||
      (galleryRows[0]?.Url) ||
      (mediaRows[0]?.Url) ||
      null;

    return {
      success: true,
      data: {
        ...property,
        primaryImage,
        display_image: primaryImage,
        gallery: allGallery,
        floorPlans: floorPlans,
        locationData: locationData[0] || null
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getFeaturedProperties = async (limit = 6) => {
  const connection = await pool.getConnection();
  try {
    const [properties] = await connection.query(
      `SELECT 
         p.id, p.property_name, p.property_slug, p.featured_image,
         p.price, p.property_type, p.property_purpose, p.bedroom, p.bathrooms,
         p.area, p.area_size, p.location, p.listing_type, p.completion_date,
         p.developer_id, p.featured_property, p.furnishing,
         c.name AS city_name,
         com.name AS community_name,
         sc.name AS sub_community_name,
         ${getGalleryThumbQuery('p')} as gallery_thumb,
         ${getMediaThumbQuery('p')} as media_thumb
       FROM properties p
       LEFT JOIN cities c ON p.city_id = c.id
       LEFT JOIN community com ON p.community_id = com.id
       LEFT JOIN sub_community sc ON p.sub_community_id = sc.id
       WHERE p.status = 1 AND p.featured_property = '1'
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    const processedProperties = properties.map(property => {
      const primaryImage = property.featured_image || property.gallery_thumb || property.media_thumb || null;
      return { ...property, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProperties };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getPropertiesByCity = async (cityId, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [properties] = await connection.query(
      `SELECT 
         p.id, p.property_name, p.property_slug, p.featured_image,
         p.price, p.property_type, p.property_purpose, p.bedroom, p.bathrooms,
         p.area, p.location, p.listing_type, p.completion_date,
         c.name AS city_name,
         com.name AS community_name,
         ${getGalleryThumbQuery('p')} as gallery_thumb,
         ${getMediaThumbQuery('p')} as media_thumb
       FROM properties p
       LEFT JOIN cities c ON p.city_id = c.id
       LEFT JOIN community com ON p.community_id = com.id
       WHERE p.city_id = ? AND p.status = 1
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [parseInt(cityId), parseInt(limit)]
    );

    const processedProperties = properties.map(property => {
      const primaryImage = property.featured_image || property.gallery_thumb || property.media_thumb || null;
      return { ...property, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProperties };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getPropertiesByDeveloper = async (developerId, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [properties] = await connection.query(
      `SELECT 
         p.id, p.property_name, p.property_slug, p.featured_image,
         p.price, p.property_type, p.property_purpose, p.bedroom, p.bathrooms,
         p.area, p.location, p.listing_type, p.completion_date,
         c.name AS city_name,
         com.name AS community_name,
         ${getGalleryThumbQuery('p')} as gallery_thumb,
         ${getMediaThumbQuery('p')} as media_thumb
       FROM properties p
       LEFT JOIN cities c ON p.city_id = c.id
       LEFT JOIN community com ON p.community_id = com.id
       WHERE p.developer_id = ? AND p.status = 1
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [parseInt(developerId), parseInt(limit)]
    );

    const processedProperties = properties.map(property => {
      const primaryImage = property.featured_image || property.gallery_thumb || property.media_thumb || null;
      return { ...property, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProperties };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getPropertiesByCommunity = async (communityId, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [properties] = await connection.query(
      `SELECT 
         p.id, p.property_name, p.property_slug, p.featured_image,
         p.price, p.property_type, p.property_purpose, p.bedroom, p.bathrooms,
         p.area, p.location, p.listing_type, p.completion_date,
         c.name AS city_name,
         com.name AS community_name,
         ${getGalleryThumbQuery('p')} as gallery_thumb,
         ${getMediaThumbQuery('p')} as media_thumb
       FROM properties p
       LEFT JOIN cities c ON p.city_id = c.id
       LEFT JOIN community com ON p.community_id = com.id
       WHERE p.community_id = ? AND p.status = 1
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [parseInt(communityId), parseInt(limit)]
    );

    const processedProperties = properties.map(property => {
      const primaryImage = property.featured_image || property.gallery_thumb || property.media_thumb || null;
      return { ...property, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProperties };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getPropertiesByAgent = async (agentId, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [properties] = await connection.query(
      `SELECT 
         p.id, p.property_name, p.property_slug, p.featured_image,
         p.price, p.property_type, p.property_purpose, p.bedroom, p.bathrooms,
         p.area, p.location, p.listing_type, p.completion_date,
         c.name AS city_name,
         com.name AS community_name,
         ${getGalleryThumbQuery('p')} as gallery_thumb,
         ${getMediaThumbQuery('p')} as media_thumb
       FROM properties p
       LEFT JOIN cities c ON p.city_id = c.id
       LEFT JOIN community com ON p.community_id = com.id
       WHERE p.agent_id = ? AND p.status = 1
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [parseInt(agentId), parseInt(limit)]
    );

    const processedProperties = properties.map(property => {
      const primaryImage = property.featured_image || property.gallery_thumb || property.media_thumb || null;
      return { ...property, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProperties };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getPropertiesByProject = async (projectId, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [properties] = await connection.query(
      `SELECT 
         p.id, p.property_name, p.property_slug, p.featured_image,
         p.price, p.property_type, p.property_purpose, p.bedroom, p.bathrooms,
         p.area, p.location, p.listing_type, p.completion_date,
         c.name AS city_name,
         com.name AS community_name,
         ${getGalleryThumbQuery('p')} as gallery_thumb,
         ${getMediaThumbQuery('p')} as media_thumb
       FROM properties p
       LEFT JOIN cities c ON p.city_id = c.id
       LEFT JOIN community com ON p.community_id = com.id
       WHERE p.project_id = ? AND p.status = 1
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [parseInt(projectId), parseInt(limit)]
    );

    const processedProperties = properties.map(property => {
      const primaryImage = property.featured_image || property.gallery_thumb || property.media_thumb || null;
      return { ...property, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProperties };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getSimilarProperties = async (propertyId, limit = 4) => {
  const connection = await pool.getConnection();
  try {
    const [current] = await connection.query(
      'SELECT city_id, property_type, property_purpose, price, community_id, bedroom FROM properties WHERE id = ? AND status = 1',
      [parseInt(propertyId)]
    );

    if (current.length === 0) {
      return { success: false, message: 'Property not found' };
    }

    const { city_id, property_type, property_purpose, price, community_id, bedroom } = current[0];
    const priceRange = price ? price * 0.3 : 0;

    let query = `
      SELECT 
        p.id, p.property_name, p.property_slug, p.featured_image,
        p.price, p.property_type, p.property_purpose, p.bedroom, p.bathrooms,
        p.area, p.location, p.completion_date,
        c.name AS city_name,
        com.name AS community_name,
        ${getGalleryThumbQuery('p')} as gallery_thumb,
        ${getMediaThumbQuery('p')} as media_thumb
      FROM properties p
      LEFT JOIN cities c ON p.city_id = c.id
      LEFT JOIN community com ON p.community_id = com.id
      WHERE p.id != ? AND p.status = 1
        AND (p.city_id = ? OR p.community_id = ? OR p.property_type = ?)
    `;

    let params = [parseInt(propertyId), city_id, community_id, property_type];

    if (price && priceRange > 0) {
      query += ' AND p.price BETWEEN ? AND ?';
      params.push(price - priceRange, price + priceRange);
    }

    query += `
      ORDER BY 
        CASE 
          WHEN p.community_id = ? THEN 1
          WHEN p.property_type = ? AND p.bedroom = ? THEN 2
          WHEN p.city_id = ? THEN 3
          ELSE 4 
        END,
        p.created_at DESC
      LIMIT ?
    `;
    params.push(community_id, property_type, bedroom, city_id, parseInt(limit));

    const [properties] = await connection.query(query, params);

    const processedProperties = properties.map(property => {
      const primaryImage = property.featured_image || property.gallery_thumb || property.media_thumb || null;
      return { ...property, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProperties };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const searchProperties = async (query, filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const { limit = 10, property_purpose, listing_type } = filters;
    const searchTerm = `%${query}%`;

    let whereConditions = ['p.status = 1'];
    let params = [];

    whereConditions.push('(p.property_name LIKE ? OR p.location LIKE ? OR p.address LIKE ? OR p.RefNumber LIKE ? OR p.keyword LIKE ?)');
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);

    if (property_purpose) {
      whereConditions.push('p.property_purpose = ?');
      params.push(property_purpose);
    }

    if (listing_type) {
      whereConditions.push('p.listing_type = ?');
      params.push(listing_type);
    }

    const [properties] = await connection.query(
      `SELECT 
         p.id, p.property_name, p.property_slug, p.featured_image,
         p.price, p.property_type, p.property_purpose, p.location,
         p.listing_type, p.bedroom, p.bathrooms, p.area,
         c.name AS city_name,
         com.name AS community_name,
         ${getGalleryThumbQuery('p')} as gallery_thumb,
         ${getMediaThumbQuery('p')} as media_thumb
       FROM properties p
       LEFT JOIN cities c ON p.city_id = c.id
       LEFT JOIN community com ON p.community_id = com.id
       WHERE ${whereConditions.join(' AND ')}
       ORDER BY 
         CASE 
           WHEN p.property_name LIKE ? THEN 1
           WHEN p.location LIKE ? THEN 2
           ELSE 3 
         END,
         CAST(p.views AS UNSIGNED) DESC
       LIMIT ?`,
      [...params, searchTerm, searchTerm, parseInt(limit)]
    );

    const processedProperties = properties.map(property => {
      const primaryImage = property.featured_image || property.gallery_thumb || property.media_thumb || null;
      return { ...property, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProperties };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getPropertiesForRent = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const modifiedFilters = { ...filters, property_purpose: 'rent' };
    return await getActiveProperties(modifiedFilters);
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getPropertiesForSale = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const modifiedFilters = { ...filters, property_purpose: 'sale' };
    return await getActiveProperties(modifiedFilters);
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getAllPropertiesAdmin = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 10,
      status,
      city_id,
      community_id,
      developer_id,
      agent_id,
      listing_type,
      property_type,
      property_purpose,
      featured_property,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    if (status !== undefined && status !== null && status !== '') {
      whereConditions.push('p.status = ?');
      params.push(parseInt(status));
    }
    if (city_id) {
      whereConditions.push('p.city_id = ?');
      params.push(parseInt(city_id));
    }
    if (community_id) {
      whereConditions.push('p.community_id = ?');
      params.push(parseInt(community_id));
    }
    if (developer_id) {
      whereConditions.push('p.developer_id = ?');
      params.push(parseInt(developer_id));
    }
    if (agent_id) {
      whereConditions.push('p.agent_id = ?');
      params.push(parseInt(agent_id));
    }
    if (listing_type) {
      whereConditions.push('p.listing_type = ?');
      params.push(listing_type);
    }
    if (property_type) {
      whereConditions.push('p.property_type = ?');
      params.push(property_type);
    }
    if (property_purpose) {
      whereConditions.push('p.property_purpose = ?');
      params.push(property_purpose);
    }
    if (featured_property) {
      whereConditions.push('p.featured_property = ?');
      params.push(featured_property);
    }
    if (search) {
      whereConditions.push('(p.property_name LIKE ? OR p.property_slug LIKE ? OR p.RefNumber LIKE ? OR p.p_id LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const allowedSortColumns = ['created_at', 'updated_at', 'price', 'views', 'property_name', 'status', 'bedroom', 'area'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM properties p ${whereClause}`,
      params
    );

    const [properties] = await connection.query(
      `SELECT 
         p.*,
         c.name AS city_name,
         com.name AS community_name,
         sc.name AS sub_community_name,
         ${getGalleryThumbQuery('p')} as gallery_thumb,
         ${getMediaThumbQuery('p')} as media_thumb,
         ${getGalleryCountQuery('p')} as gallery_count,
         ${getMediaCountQuery('p')} as media_count
       FROM properties p
       LEFT JOIN cities c ON p.city_id = c.id
       LEFT JOIN community com ON p.community_id = com.id
       LEFT JOIN sub_community sc ON p.sub_community_id = sc.id
       ${whereClause}
       ORDER BY p.${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const processedProperties = properties.map(property => {
      const primaryImage = property.featured_image || property.gallery_thumb || property.media_thumb || null;
      return { ...property, primaryImage, display_image: primaryImage };
    });

    return {
      success: true,
      data: processedProperties,
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

export const getPropertyByIdAdmin = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [propertyRows] = await connection.query(
      `SELECT p.*,
         c.name AS city_name,
         com.name AS community_name,
         sc.name AS sub_community_name,
         pm.id as metadata_id,
         pm.completion_date as meta_completion_date,
         pm.completion_status,
         pm.construction_completion_date,
         pm.devloper_description,
         pm.meta_developer,
         pm.developer_name,
         pm.developers_details,
         pm.display_address,
         pm.exclusive,
         pm.floor_type,
         pm.furnished as meta_furnished,
         pm.mandate,
         pm.construction_type,
         pm.ownership_type,
         pm.owner_type,
         pm.property_sub_type,
         pm.rera_permit_number,
         pm.unit_level,
         pm.unit_no,
         pm.video_link,
         pm.year_built,
         pm.zipcode,
         pm.avalabilty_status,
         pm.meta_title,
         pm.meta_keywords,
         pm.meta_description as pm_meta_description,
         pm.measurment,
         pm.size,
         pm.internal_notes,
         pm.starting_price,
         pm.no_of_bhk,
         pp.id as price_id,
         pp.type as price_type,
         pp.number_of_cheques,
         pp.diposit_amount,
         pp.agency_fee,
         pp.rental_per_year,
         pp.viewing_time,
         pp.viewing_possible_rental,
         pp.viewing_possible_sale,
         pp.rental_price,
         pp.sale_price,
         pp.listing_price,
         pp.rental_period,
         pp.price_on_application,
         pp.commision_from_landlord,
         pp.payment_plan_ids
       FROM properties p
       LEFT JOIN cities c ON p.city_id = c.id
       LEFT JOIN community com ON p.community_id = com.id
       LEFT JOIN sub_community sc ON p.sub_community_id = sc.id
       LEFT JOIN properties_metadata pm ON p.id = pm.property_id
       LEFT JOIN properties_prices pp ON p.id = pp.property_id
       WHERE p.id = ?`,
      [parseInt(id)]
    );

    if (propertyRows.length === 0) {
      return { success: false, message: 'Property not found' };
    }

    const property = propertyRows[0];

    const [galleryRows] = await connection.query(
      'SELECT id, image_name as Url, added_by, "gallery" as source FROM property_gallery WHERE property_id = ? ORDER BY id ASC',
      [parseInt(id)]
    );

    const [mediaRows] = await connection.query(
      'SELECT id, path as Url, title, "media" as source FROM media WHERE module_id = ? AND module_type = "property" AND status = 1 ORDER BY id ASC',
      [parseInt(id)]
    );

    const [floorPlans] = await connection.query(
      'SELECT id, title, description, image FROM floor_plan WHERE property_id = ? ORDER BY id ASC',
      [parseInt(id)]
    );

    const [locationData] = await connection.query(
      'SELECT * FROM property_locations WHERE property_id = ?',
      [parseInt(id)]
    );

    const allGallery = [];
    const seenUrls = new Set();

    galleryRows.forEach(img => {
      if (img.Url && !seenUrls.has(img.Url)) {
        seenUrls.add(img.Url);
        allGallery.push(img);
      }
    });

    mediaRows.forEach(img => {
      if (img.Url && !seenUrls.has(img.Url)) {
        seenUrls.add(img.Url);
        allGallery.push(img);
      }
    });

    const primaryImage = property.featured_image ||
      (galleryRows[0]?.Url) ||
      (mediaRows[0]?.Url) ||
      null;

    return {
      success: true,
      data: {
        ...property,
        primaryImage,
        display_image: primaryImage,
        gallery: allGallery,
        floorPlans: floorPlans,
        locationData: locationData[0] || null
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Remaining CRUD functions remain the same as before
export const createProperty = async (propertyData, relatedData = {}) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (!propertyData.property_slug && propertyData.property_name) {
      propertyData.property_slug = propertyData.property_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();
    }

    if (!propertyData.RefNumber) {
      propertyData.RefNumber = 'REF-' + Date.now();
    }

    const fields = Object.keys(propertyData);
    const values = Object.values(propertyData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO properties (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );
    const propertyId = result.insertId;

    if (relatedData.metadata && Object.keys(relatedData.metadata).length > 0) {
      const metaData = { property_id: propertyId, ...relatedData.metadata };
      const metaFields = Object.keys(metaData);
      const metaValues = Object.values(metaData);
      const metaPlaceholders = metaFields.map(() => '?').join(', ');

      await connection.query(
        `INSERT INTO properties_metadata (${metaFields.join(', ')}) VALUES (${metaPlaceholders})`,
        metaValues
      );
    }

    if (relatedData.prices && Object.keys(relatedData.prices).length > 0) {
      const priceData = { property_id: propertyId, ...relatedData.prices };
      const priceFields = Object.keys(priceData);
      const priceValues = Object.values(priceData);
      const pricePlaceholders = priceFields.map(() => '?').join(', ');

      await connection.query(
        `INSERT INTO properties_prices (${priceFields.join(', ')}) VALUES (${pricePlaceholders})`,
        priceValues
      );
    }

    if (relatedData.location && Object.keys(relatedData.location).length > 0) {
      const locationData = { property_id: propertyId, ...relatedData.location };
      const locationFields = Object.keys(locationData);
      const locationValues = Object.values(locationData);
      const locationPlaceholders = locationFields.map(() => '?').join(', ');

      await connection.query(
        `INSERT INTO property_locations (${locationFields.join(', ')}) VALUES (${locationPlaceholders})`,
        locationValues
      );
    }

    if (relatedData.gallery && relatedData.gallery.length > 0) {
      const galleryValues = relatedData.gallery.map((img) => [
        propertyId,
        typeof img === 'string' ? img : img.image_name,
        relatedData.added_by || 'admin'
      ]);
      await connection.query(
        'INSERT INTO property_gallery (property_id, image_name, added_by) VALUES ?',
        [galleryValues]
      );
    }

    if (relatedData.floorPlans && relatedData.floorPlans.length > 0) {
      const floorValues = relatedData.floorPlans.map((plan) => [
        propertyId,
        plan.title || null,
        plan.description || null,
        plan.image || null
      ]);
      await connection.query(
        'INSERT INTO floor_plan (property_id, title, description, image) VALUES ?',
        [floorValues]
      );
    }

    await connection.commit();

    return {
      success: true,
      propertyId,
      slug: propertyData.property_slug,
      refNumber: propertyData.RefNumber,
      message: 'Property created successfully'
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateProperty = async (id, updateData, relatedUpdates = {}) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT id FROM properties WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Property not found' };
    }

    if (Object.keys(updateData).length > 0) {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updateData), parseInt(id)];
      await connection.query(
        `UPDATE properties SET ${fields}, updated_at = NOW() WHERE id = ?`,
        values
      );
    }

    if (relatedUpdates.metadata && Object.keys(relatedUpdates.metadata).length > 0) {
      const [existingMeta] = await connection.query(
        'SELECT id FROM properties_metadata WHERE property_id = ?',
        [parseInt(id)]
      );

      if (existingMeta.length > 0) {
        const metaFields = Object.keys(relatedUpdates.metadata).map(key => `${key} = ?`).join(', ');
        const metaValues = [...Object.values(relatedUpdates.metadata), parseInt(id)];
        await connection.query(
          `UPDATE properties_metadata SET ${metaFields}, updated_at = NOW() WHERE property_id = ?`,
          metaValues
        );
      } else {
        const metaData = { property_id: parseInt(id), ...relatedUpdates.metadata };
        const metaFields = Object.keys(metaData);
        const metaValues = Object.values(metaData);
        const metaPlaceholders = metaFields.map(() => '?').join(', ');
        await connection.query(
          `INSERT INTO properties_metadata (${metaFields.join(', ')}) VALUES (${metaPlaceholders})`,
          metaValues
        );
      }
    }

    if (relatedUpdates.prices && Object.keys(relatedUpdates.prices).length > 0) {
      const [existingPrice] = await connection.query(
        'SELECT id FROM properties_prices WHERE property_id = ?',
        [parseInt(id)]
      );

      if (existingPrice.length > 0) {
        const priceFields = Object.keys(relatedUpdates.prices).map(key => `${key} = ?`).join(', ');
        const priceValues = [...Object.values(relatedUpdates.prices), parseInt(id)];
        await connection.query(
          `UPDATE properties_prices SET ${priceFields}, updated_at = NOW() WHERE property_id = ?`,
          priceValues
        );
      } else {
        const priceData = { property_id: parseInt(id), ...relatedUpdates.prices };
        const priceFields = Object.keys(priceData);
        const priceValues = Object.values(priceData);
        const pricePlaceholders = priceFields.map(() => '?').join(', ');
        await connection.query(
          `INSERT INTO properties_prices (${priceFields.join(', ')}) VALUES (${pricePlaceholders})`,
          priceValues
        );
      }
    }

    if (relatedUpdates.location && Object.keys(relatedUpdates.location).length > 0) {
      const [existingLocation] = await connection.query(
        'SELECT id FROM property_locations WHERE property_id = ?',
        [parseInt(id)]
      );

      if (existingLocation.length > 0) {
        const locationFields = Object.keys(relatedUpdates.location).map(key => `${key} = ?`).join(', ');
        const locationValues = [...Object.values(relatedUpdates.location), parseInt(id)];
        await connection.query(
          `UPDATE property_locations SET ${locationFields}, updated_at = NOW() WHERE property_id = ?`,
          locationValues
        );
      } else {
        const locationData = { property_id: parseInt(id), ...relatedUpdates.location };
        const locationFields = Object.keys(locationData);
        const locationValues = Object.values(locationData);
        const locationPlaceholders = locationFields.map(() => '?').join(', ');
        await connection.query(
          `INSERT INTO property_locations (${locationFields.join(', ')}) VALUES (${locationPlaceholders})`,
          locationValues
        );
      }
    }

    if (relatedUpdates.gallery && relatedUpdates.gallery.length > 0) {
      const galleryValues = relatedUpdates.gallery.map((img) => [
        parseInt(id),
        typeof img === 'string' ? img : img.image_name,
        relatedUpdates.added_by || 'admin'
      ]);
      await connection.query(
        'INSERT INTO property_gallery (property_id, image_name, added_by) VALUES ?',
        [galleryValues]
      );
    }

    if (relatedUpdates.floorPlans && relatedUpdates.floorPlans.length > 0) {
      const floorValues = relatedUpdates.floorPlans.map((plan) => [
        parseInt(id),
        plan.title || null,
        plan.description || null,
        plan.image || null
      ]);
      await connection.query(
        'INSERT INTO floor_plan (property_id, title, description, image) VALUES ?',
        [floorValues]
      );
    }

    await connection.commit();

    return { success: true, message: 'Property updated successfully' };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteProperty = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM properties WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Property not found' };
    }

    await connection.query(
      'UPDATE properties SET status = 0, updated_at = NOW() WHERE id = ?',
      [parseInt(id)]
    );

    return { success: true, message: 'Property deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const hardDeleteProperty = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT id FROM properties WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Property not found' };
    }

    await connection.query('DELETE FROM property_gallery WHERE property_id = ?', [parseInt(id)]);
    await connection.query('DELETE FROM properties_metadata WHERE property_id = ?', [parseInt(id)]);
    await connection.query('DELETE FROM properties_prices WHERE property_id = ?', [parseInt(id)]);
    await connection.query('DELETE FROM property_locations WHERE property_id = ?', [parseInt(id)]);
    await connection.query('DELETE FROM floor_plan WHERE property_id = ?', [parseInt(id)]);
    await connection.query('DELETE FROM saved_property WHERE property_id = ?', [parseInt(id)]);
    await connection.query('DELETE FROM properties WHERE id = ?', [parseInt(id)]);

    await connection.commit();

    return { success: true, message: 'Property permanently deleted' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updatePropertyStatus = async (id, status) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE properties SET status = ?, updated_at = NOW() WHERE id = ?',
      [parseInt(status), parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Property not found' };
    }

    return { success: true, message: 'Status updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const toggleFeaturedProperty = async (id, featured) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE properties SET featured_property = ?, updated_at = NOW() WHERE id = ?',
      [featured ? '1' : '0', parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Property not found' };
    }

    return {
      success: true,
      message: featured ? 'Property marked as featured' : 'Property removed from featured'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const restoreProperty = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE properties SET status = 1, updated_at = NOW() WHERE id = ? AND status = 0',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Property not found or not deleted' };
    }

    return { success: true, message: 'Property restored successfully' };
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
      return { success: false, message: 'No property IDs provided' };
    }

    const sanitizedIds = ids.map(id => parseInt(id));
    const placeholders = sanitizedIds.map(() => '?').join(',');
    const [result] = await connection.query(
      `UPDATE properties SET status = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      [parseInt(status), ...sanitizedIds]
    );

    return {
      success: true,
      message: `${result.affectedRows} properties updated`,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const addGalleryImages = async (propertyId, images, addedBy = 'admin') => {
  const connection = await pool.getConnection();
  try {
    if (!images || images.length === 0) {
      return { success: false, message: 'No images provided' };
    }

    const values = images.map((img) => [
      parseInt(propertyId),
      typeof img === 'string' ? img : img.image_name,
      addedBy
    ]);

    await connection.query(
      'INSERT INTO property_gallery (property_id, image_name, added_by) VALUES ?',
      [values]
    );

    return { success: true, message: 'Gallery images added successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteGalleryImage = async (imageId) => {
  const connection = await pool.getConnection();
  try {
    const [imageInfo] = await connection.query(
      'SELECT * FROM property_gallery WHERE id = ?',
      [parseInt(imageId)]
    );

    if (imageInfo.length === 0) {
      return { success: false, message: 'Image not found', imageData: null };
    }

    await connection.query('DELETE FROM property_gallery WHERE id = ?', [parseInt(imageId)]);

    return {
      success: true,
      message: 'Image deleted successfully',
      imageData: imageInfo[0]
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getGalleryByPropertyId = async (propertyId) => {
  const connection = await pool.getConnection();
  try {
    const [galleryRows] = await connection.query(
      'SELECT id, image_name as Url, added_by, "gallery" as source, created_at FROM property_gallery WHERE property_id = ? ORDER BY id ASC',
      [parseInt(propertyId)]
    );

    const [mediaRows] = await connection.query(
      'SELECT id, path as Url, title, "media" as source, update_date as created_at FROM media WHERE module_id = ? AND module_type = "property" AND status = 1 ORDER BY id ASC',
      [parseInt(propertyId)]
    );

    const allGallery = [...galleryRows, ...mediaRows];

    return { success: true, data: allGallery };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const addFloorPlan = async (propertyId, floorPlanData) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO floor_plan (property_id, title, description, image) VALUES (?, ?, ?, ?)',
      [parseInt(propertyId), floorPlanData.title, floorPlanData.description, floorPlanData.image]
    );

    return {
      success: true,
      floorPlanId: result.insertId,
      message: 'Floor plan added successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteFloorPlan = async (floorPlanId) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT * FROM floor_plan WHERE id = ?',
      [parseInt(floorPlanId)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Floor plan not found' };
    }

    await connection.query('DELETE FROM floor_plan WHERE id = ?', [parseInt(floorPlanId)]);

    return {
      success: true,
      message: 'Floor plan deleted successfully',
      floorPlanData: existing[0]
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getFloorPlansByPropertyId = async (propertyId) => {
  const connection = await pool.getConnection();
  try {
    const [floorPlans] = await connection.query(
      'SELECT id, title, description, image FROM floor_plan WHERE property_id = ? ORDER BY id ASC',
      [parseInt(propertyId)]
    );

    return { success: true, data: floorPlans };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const saveProperty = async (userId, propertyId) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM saved_property WHERE user_id = ? AND property_id = ?',
      [parseInt(userId), parseInt(propertyId)]
    );

    if (existing.length > 0) {
      return { success: false, message: 'Property already saved' };
    }

    await connection.query(
      'INSERT INTO saved_property (user_id, property_id) VALUES (?, ?)',
      [parseInt(userId), parseInt(propertyId)]
    );

    return { success: true, message: 'Property saved successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const unsaveProperty = async (userId, propertyId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'DELETE FROM saved_property WHERE user_id = ? AND property_id = ?',
      [parseInt(userId), parseInt(propertyId)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Saved property not found' };
    }

    return { success: true, message: 'Property removed from saved' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getSavedProperties = async (userId, page = 1, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const offset = (page - 1) * limit;

    const [countResult] = await connection.query(
      'SELECT COUNT(*) as total FROM saved_property WHERE user_id = ?',
      [parseInt(userId)]
    );

    const [properties] = await connection.query(
      `SELECT 
         p.id, p.property_name, p.property_slug, p.featured_image,
         p.price, p.property_type, p.property_purpose, p.bedroom, p.bathrooms,
         p.area, p.location, p.listing_type,
         sp.created_at as saved_at,
         c.name AS city_name,
         com.name AS community_name,
         ${getGalleryThumbQuery('p')} as gallery_thumb,
         ${getMediaThumbQuery('p')} as media_thumb
       FROM saved_property sp
       JOIN properties p ON sp.property_id = p.id
       LEFT JOIN cities c ON p.city_id = c.id
       LEFT JOIN community com ON p.community_id = com.id
       WHERE sp.user_id = ? AND p.status = 1
       ORDER BY sp.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(userId), parseInt(limit), parseInt(offset)]
    );

    const processedProperties = properties.map(property => {
      const primaryImage = property.featured_image || property.gallery_thumb || property.media_thumb || null;
      return { ...property, primaryImage, display_image: primaryImage };
    });

    return {
      success: true,
      data: processedProperties,
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

export const checkPropertySaved = async (userId, propertyId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'SELECT id FROM saved_property WHERE user_id = ? AND property_id = ?',
      [parseInt(userId), parseInt(propertyId)]
    );

    return {
      success: true,
      isSaved: result.length > 0
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getPropertyStats = async () => {
  const connection = await pool.getConnection();
  try {
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_properties,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_properties,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as deleted_properties,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as draft_properties,
        SUM(CASE WHEN featured_property = '1' AND status = 1 THEN 1 ELSE 0 END) as featured_properties,
        SUM(CASE WHEN property_purpose = 'rent' AND status = 1 THEN 1 ELSE 0 END) as rental_properties,
        SUM(CASE WHEN property_purpose = 'sale' AND status = 1 THEN 1 ELSE 0 END) as sale_properties,
        SUM(CAST(COALESCE(views, '0') AS UNSIGNED)) as total_views,
        AVG(CASE WHEN price > 0 THEN price ELSE NULL END) as average_price
      FROM properties
    `);

    const [recentStats] = await connection.query(`
      SELECT COUNT(*) as new_properties_week
      FROM properties
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status = 1
    `);

    const [typeStats] = await connection.query(`
      SELECT property_type, COUNT(*) as count
      FROM properties
      WHERE status = 1 AND property_type IS NOT NULL AND property_type != ''
      GROUP BY property_type
      ORDER BY count DESC
      LIMIT 10
    `);

    const [purposeStats] = await connection.query(`
      SELECT property_purpose, COUNT(*) as count
      FROM properties
      WHERE status = 1 AND property_purpose IS NOT NULL AND property_purpose != ''
      GROUP BY property_purpose
    `);

    const [bedroomStats] = await connection.query(`
      SELECT bedroom, COUNT(*) as count
      FROM properties
      WHERE status = 1 AND bedroom IS NOT NULL AND bedroom != ''
      GROUP BY bedroom
      ORDER BY CAST(bedroom AS UNSIGNED)
    `);

    return {
      success: true,
      data: {
        ...stats[0],
        new_properties_week: recentStats[0].new_properties_week,
        by_property_type: typeStats,
        by_purpose: purposeStats,
        by_bedroom: bedroomStats
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getTopViewedProperties = async (limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [properties] = await connection.query(
      `SELECT 
         p.id, p.property_name, p.property_slug, p.views, p.featured_image, p.created_at,
         p.price, p.property_type, p.bedroom, p.location,
         c.name AS city_name,
         com.name AS community_name,
         ${getGalleryThumbQuery('p')} as gallery_thumb,
         ${getMediaThumbQuery('p')} as media_thumb
       FROM properties p
       LEFT JOIN cities c ON p.city_id = c.id
       LEFT JOIN community com ON p.community_id = com.id
       WHERE p.status = 1
       ORDER BY CAST(COALESCE(p.views, '0') AS UNSIGNED) DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    const processedProperties = properties.map(property => {
      const primaryImage = property.featured_image || property.gallery_thumb || property.media_thumb || null;
      return { ...property, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProperties };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const checkSlugAvailability = async (slug, excludeId = null) => {
  const connection = await pool.getConnection();
  try {
    let query = 'SELECT id FROM properties WHERE property_slug = ?';
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

export const getPropertyTypes = async () => {
  const connection = await pool.getConnection();
  try {
    const [types] = await connection.query(
      'SELECT id, name FROM property_types WHERE status = 1 ORDER BY name ASC'
    );

    return { success: true, data: types };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getPropertySubTypes = async () => {
  const connection = await pool.getConnection();
  try {
    const [subTypes] = await connection.query(
      'SELECT id, name FROM properties_sub_type ORDER BY name ASC'
    );

    return { success: true, data: subTypes };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getPropertyListTypes = async () => {
  const connection = await pool.getConnection();
  try {
    const [listTypes] = await connection.query(
      'SELECT id, name FROM property_list_type ORDER BY name ASC'
    );

    return { success: true, data: listTypes };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getPrivateAmenities = async () => {
  const connection = await pool.getConnection();
  try {
    const [amenities] = await connection.query(
      'SELECT id, name FROM private_amenities ORDER BY name ASC'
    );

    return { success: true, data: amenities };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getCommercialAmenities = async () => {
  const connection = await pool.getConnection();
  try {
    const [amenities] = await connection.query(
      'SELECT id, name FROM commercial_amenities ORDER BY name ASC'
    );

    return { success: true, data: amenities };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createPropertyType = async (name) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO property_types (name, status) VALUES (?, 1)',
      [name]
    );

    return {
      success: true,
      id: result.insertId,
      message: 'Property type created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createPropertySubType = async (name) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO properties_sub_type (name) VALUES (?)',
      [name]
    );

    return {
      success: true,
      id: result.insertId,
      message: 'Property sub type created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createAmenity = async (name, type = 'private') => {
  const connection = await pool.getConnection();
  try {
    const table = type === 'commercial' ? 'commercial_amenities' : 'private_amenities';
    const [result] = await connection.query(
      `INSERT INTO ${table} (name) VALUES (?)`,
      [name]
    );

    return {
      success: true,
      id: result.insertId,
      message: 'Amenity created successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deletePropertyType = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'DELETE FROM property_types WHERE id = ?',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Property type not found' };
    }

    return { success: true, message: 'Property type deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteAmenity = async (id, type = 'private') => {
  const connection = await pool.getConnection();
  try {
    const table = type === 'commercial' ? 'commercial_amenities' : 'private_amenities';
    const [result] = await connection.query(
      `DELETE FROM ${table} WHERE id = ?`,
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Amenity not found' };
    }

    return { success: true, message: 'Amenity deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  createPropertyTables,
  getActiveProperties,
  getPropertyBySlug,
  getPropertyById,
  getFeaturedProperties,
  getPropertiesByCity,
  getPropertiesByDeveloper,
  getPropertiesByCommunity,
  getPropertiesByAgent,
  getPropertiesByProject,
  getSimilarProperties,
  searchProperties,
  getPropertiesForRent,
  getPropertiesForSale,
  getAllPropertiesAdmin,
  getPropertyByIdAdmin,
  createProperty,
  updateProperty,
  deleteProperty,
  hardDeleteProperty,
  updatePropertyStatus,
  toggleFeaturedProperty,
  restoreProperty,
  bulkUpdateStatus,
  addGalleryImages,
  deleteGalleryImage,
  getGalleryByPropertyId,
  addFloorPlan,
  deleteFloorPlan,
  getFloorPlansByPropertyId,
  saveProperty,
  unsaveProperty,
  getSavedProperties,
  checkPropertySaved,
  getPropertyStats,
  getTopViewedProperties,
  checkSlugAvailability,
  getPropertyTypes,
  getPropertySubTypes,
  getPropertyListTypes,
  getPrivateAmenities,
  getCommercialAmenities,
  createPropertyType,
  createPropertySubType,
  createAmenity,
  deletePropertyType,
  deleteAmenity
};