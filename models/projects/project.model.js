import pool from '../../config/db.js';

export const createProjectTables = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_listing (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        user_id INT(11),
        state_id VARCHAR(255),
        city_id VARCHAR(255),
        community_id VARCHAR(255),
        sub_community_id VARCHAR(255),
        listing_type VARCHAR(60),
        occupancy VARCHAR(60),
        qc VARCHAR(10),
        completion_date VARCHAR(20),
        vacating_date VARCHAR(20),
        exclusive_status VARCHAR(60),
        property_ids VARCHAR(255),
        floor_media_ids VARCHAR(255),
        gallery_media_ids TEXT,
        developer_id INT(11),
        ProjectId VARCHAR(255),
        ProjectNumber VARCHAR(255),
        MemberId INT(11),
        ProjectName VARCHAR(255),
        Description TEXT,
        featured_project VARCHAR(255),
        dld_permit VARCHAR(100),
        views VARCHAR(255),
        title_deep VARCHAR(255),
        Spa_number VARCHAR(50),
        from_duration VARCHAR(20),
        to_duration VARCHAR(20),
        availability_type VARCHAR(20),
        price VARCHAR(100),
        price_end VARCHAR(200),
        askprice VARCHAR(10),
        currency_id INT(11),
        property_type VARCHAR(255),
        unit VARCHAR(100),
        bedroom VARCHAR(255),
        area VARCHAR(100),
        area_end VARCHAR(200),
        area_size VARCHAR(11),
        agent_id VARCHAR(255),
        Specifications VARCHAR(255),
        StartDate VARCHAR(255),
        EndDate VARCHAR(255),
        BuildingName VARCHAR(255),
        StreetName VARCHAR(255),
        LocationName VARCHAR(255),
        CityName VARCHAR(255),
        StateName VARCHAR(255),
        PinCode VARCHAR(100),
        LandMark VARCHAR(255),
        country VARCHAR(255),
        floors INT(11),
        rooms INT(11),
        total_building INT(11),
        kitchen_type VARCHAR(255),
        amenities VARCHAR(255),
        Vaastu INT(11),
        Lift INT(11),
        Club INT(11),
        RainWaterHaresting INT(11),
        PowerBackup INT(11),
        GasConnection INT(11),
        SwimmingPool INT(11),
        Parking INT(11),
        Security INT(11),
        InternetConnection INT(11),
        Gym INT(11),
        ServantQuarters INT(11),
        Balcony INT(11),
        PlayArea INT(11),
        CCTV INT(11),
        ReservedPark INT(11),
        Intercom INT(11),
        Lawn INT(11),
        Terrace INT(11),
        Garden INT(11),
        EarthquakeConstruction INT(11),
        LogoUrl VARCHAR(255),
        Url VARCHAR(255),
        video_url VARCHAR(255),
        whatsapp_url VARCHAR(255),
        featured_image VARCHAR(255),
        IsFeatured VARCHAR(10),
        LastUpdated VARCHAR(255),
        keyword TEXT,
        seo_title TEXT,
        meta_description TEXT,
        canonical_tags VARCHAR(255),
        project_slug VARCHAR(255) UNIQUE,
        listing_agent_id VARCHAR(110),
        identifying_channel VARCHAR(100),
        marketing_channel VARCHAR(100),
        contact_channel VARCHAR(100),
        owner_id VARCHAR(255),
        owner_developer_id VARCHAR(255),
        owner_agreement VARCHAR(100),
        owner_commision VARCHAR(100),
        owner_creation_date DATE,
        owner_listing_date DATE,
        documents_id VARCHAR(255),
        status INT(11) DEFAULT 0,
        verified INT(1),
        template INT(1) DEFAULT 1,
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_project_slug (project_slug),
        INDEX idx_user_id (user_id),
        INDEX idx_developer_id (developer_id),
        INDEX idx_city_id (city_id),
        INDEX idx_community_id (community_id),
        INDEX idx_status (status),
        INDEX idx_listing_type (listing_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_data (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        sub_community_id INT(11) NOT NULL,
        name VARCHAR(255),
        status INT(1) DEFAULT 1,
        INDEX idx_sub_community (sub_community_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_specs (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        project_id INT(11),
        ReraNumber VARCHAR(55),
        EmployeeName VARCHAR(255),
        EmployeeMobile VARCHAR(255),
        EmployeeEmail VARCHAR(255),
        MemberName VARCHAR(255),
        MemberMobile VARCHAR(255),
        ReplyEmail VARCHAR(255),
        ReplyMobile VARCHAR(255),
        Title VARCHAR(255),
        CompanyName VARCHAR(255),
        MaxArea VARCHAR(255),
        MinArea VARCHAR(255),
        MaxPrice VARCHAR(255),
        MinPrice VARCHAR(255),
        ProjectPlanText VARCHAR(255),
        TotalRoomCsv VARCHAR(255),
        PropertyTypeCsv VARCHAR(100),
        Latitude VARCHAR(100),
        Longitude VARCHAR(100),
        WebsiteKeyword VARCHAR(255),
        DeveloperName VARCHAR(255),
        OtherAmenities VARCHAR(255),
        TransactionName VARCHAR(255),
        PossessionName VARCHAR(255),
        VirtualTour VARCHAR(255),
        YouTubeUrl VARCHAR(255),
        TotalRecords INT(11),
        IsCommencement TINYINT(1),
        IsOccupancy VARCHAR(100),
        ApprovedBy VARCHAR(100),
        TotalArea VARCHAR(100),
        OpenSpace VARCHAR(100),
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_project_id (project_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_gallery (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        project_id INT(11),
        Url VARCHAR(255),
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_project_id (project_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_contacts (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        project_id INT(11),
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_project_id (project_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS floor_plan (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        property_id INT(11),
        title VARCHAR(255),
        description TEXT,
        image VARCHAR(255),
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

const getGalleryThumbQuery = (tableAlias = 'pl') => {
  return `(SELECT pg.Url FROM project_gallery pg WHERE pg.project_id = ${tableAlias}.id ORDER BY pg.id ASC LIMIT 1)`;
};

const getMediaThumbQuery = (tableAlias = 'pl') => {
  return `(SELECT m.path FROM media m WHERE m.module_id = ${tableAlias}.id AND m.module_type = 'project' AND m.status = 1 ORDER BY m.id ASC LIMIT 1)`;
};

const getGalleryCountQuery = (tableAlias = 'pl') => {
  return `(SELECT COUNT(*) FROM project_gallery pg WHERE pg.project_id = ${tableAlias}.id)`;
};

const getMediaCountQuery = (tableAlias = 'pl') => {
  return `(SELECT COUNT(*) FROM media m WHERE m.module_id = ${tableAlias}.id AND m.module_type = 'project' AND m.status = 1)`;
};

export const getActiveProjects = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 12,
      city_id,
      community_id,
      sub_community_id,
      developer_id,
      listing_type,
      property_type,
      bedroom,
      min_price,
      max_price,
      min_area,
      max_area,
      featured_project,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = ['pl.status = 1'];
    let params = [];

    if (city_id) {
      whereConditions.push('pl.city_id = ?');
      params.push(city_id);
    }
    if (community_id) {
      whereConditions.push('pl.community_id = ?');
      params.push(community_id);
    }
    if (sub_community_id) {
      whereConditions.push('pl.sub_community_id = ?');
      params.push(sub_community_id);
    }
    if (developer_id) {
      whereConditions.push('pl.developer_id = ?');
      params.push(parseInt(developer_id));
    }
    if (listing_type) {
      whereConditions.push('pl.listing_type = ?');
      params.push(listing_type);
    }
    if (property_type) {
      whereConditions.push('pl.property_type = ?');
      params.push(property_type);
    }
    if (bedroom) {
      whereConditions.push('pl.bedroom LIKE ?');
      params.push(`%${bedroom}%`);
    }
    if (min_price) {
      whereConditions.push('CAST(pl.price AS DECIMAL(15,2)) >= ?');
      params.push(parseFloat(min_price));
    }
    if (max_price) {
      whereConditions.push('CAST(pl.price AS DECIMAL(15,2)) <= ?');
      params.push(parseFloat(max_price));
    }
    if (min_area) {
      whereConditions.push('CAST(pl.area AS DECIMAL(10,2)) >= ?');
      params.push(parseFloat(min_area));
    }
    if (max_area) {
      whereConditions.push('CAST(pl.area AS DECIMAL(10,2)) <= ?');
      params.push(parseFloat(max_area));
    }
    if (featured_project) {
      whereConditions.push('pl.featured_project = ?');
      params.push(featured_project);
    }
    if (search) {
      whereConditions.push('(pl.ProjectName LIKE ? OR pl.project_slug LIKE ? OR pl.LocationName LIKE ? OR pl.CityName LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const allowedSortColumns = ['created_at', 'price', 'views', 'ProjectName', 'area'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM project_listing pl ${whereClause}`,
      params
    );

    const [projects] = await connection.query(
      `SELECT 
         pl.id, 
         pl.ProjectName, 
         pl.project_slug, 
         pl.Description,
         pl.featured_image,
         pl.LogoUrl,
         pl.gallery_media_ids,
         pl.price, 
         pl.price_end, 
         pl.askprice,
         pl.property_type, 
         pl.bedroom, 
         pl.area, 
         pl.area_end, 
         pl.area_size,
         pl.LocationName, 
         pl.CityName, 
         pl.city_id, 
         pl.community_id,
         pl.sub_community_id,
         pl.developer_id, 
         pl.listing_type, 
         pl.views, 
         pl.featured_project,
         pl.amenities, 
         pl.floors, 
         pl.completion_date, 
         pl.status, 
         pl.created_at,
         pl.video_url,
         COALESCE(c.name, '') AS city_name,
         COALESCE(com.name, '') AS community_name,
         COALESCE(sc.name, '') AS sub_community_name,
         ${getGalleryThumbQuery('pl')} as gallery_thumb,
         ${getMediaThumbQuery('pl')} as media_thumb,
         ${getGalleryCountQuery('pl')} as gallery_count,
         ${getMediaCountQuery('pl')} as media_count
       FROM project_listing pl
       LEFT JOIN cities c ON CAST(pl.city_id AS UNSIGNED) = c.id
       LEFT JOIN community com ON CAST(pl.community_id AS UNSIGNED) = com.id
       LEFT JOIN sub_community sc ON CAST(pl.sub_community_id AS UNSIGNED) = sc.id
       ${whereClause}
       ORDER BY pl.${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const processedProjects = projects.map(project => {
      const primaryImage = project.featured_image || project.gallery_thumb || project.media_thumb || null;
      let imageSource = 'none';
      if (project.featured_image) imageSource = 'featured';
      else if (project.gallery_thumb) imageSource = 'gallery';
      else if (project.media_thumb) imageSource = 'media';

      return {
        ...project,
        primaryImage,
        imageSource,
        display_image: primaryImage
      };
    });

    return {
      success: true,
      data: processedProjects,
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

export const getProjectBySlug = async (slug) => {
  const connection = await pool.getConnection();
  try {
    const [projectRows] = await connection.query(
      `SELECT pl.*, 
         COALESCE(c.name, '') AS city_name,
         COALESCE(com.name, '') AS community_name,
         COALESCE(sc.name, '') AS sub_community_name,
         ps.ReraNumber, ps.EmployeeName, ps.EmployeeMobile, ps.EmployeeEmail,
         ps.MemberName, ps.MemberMobile, ps.ReplyEmail, ps.ReplyMobile,
         ps.Title as SpecTitle, ps.CompanyName, ps.MaxArea, ps.MinArea,
         ps.MaxPrice, ps.MinPrice, ps.ProjectPlanText, ps.TotalRoomCsv,
         ps.PropertyTypeCsv, ps.Latitude, ps.Longitude, ps.WebsiteKeyword,
         ps.DeveloperName, ps.OtherAmenities, ps.TransactionName, ps.PossessionName,
         ps.VirtualTour, ps.YouTubeUrl, ps.TotalRecords, ps.IsCommencement,
         ps.IsOccupancy, ps.ApprovedBy, ps.TotalArea, ps.OpenSpace
       FROM project_listing pl 
       LEFT JOIN cities c ON CAST(pl.city_id AS UNSIGNED) = c.id
       LEFT JOIN community com ON CAST(pl.community_id AS UNSIGNED) = com.id
       LEFT JOIN sub_community sc ON CAST(pl.sub_community_id AS UNSIGNED) = sc.id
       LEFT JOIN project_specs ps ON pl.id = ps.project_id
       WHERE pl.project_slug = ? AND pl.status = 1`,
      [slug]
    );

    if (projectRows.length === 0) {
      return { success: false, message: 'Project not found' };
    }

    const project = projectRows[0];

    await connection.query(
      'UPDATE project_listing SET views = COALESCE(views, 0) + 1 WHERE id = ?',
      [project.id]
    );

    const [galleryRows] = await connection.query(
      'SELECT id, Url, "gallery" as source FROM project_gallery WHERE project_id = ? ORDER BY id ASC',
      [project.id]
    );

    const [mediaRows] = await connection.query(
      'SELECT id, path as Url, title, "media" as source FROM media WHERE module_id = ? AND module_type = "project" AND status = 1 ORDER BY id ASC',
      [project.id]
    );

    let mediaIdsRows = [];
    if (project.gallery_media_ids && project.gallery_media_ids.trim() !== '') {
      const mediaIds = project.gallery_media_ids
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
      [project.id]
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

    const primaryImage = project.featured_image || 
                        (galleryRows[0]?.Url) || 
                        (mediaRows[0]?.Url) || 
                        (mediaIdsRows[0]?.Url) || 
                        null;

    let imageSource = 'none';
    if (project.featured_image) imageSource = 'featured';
    else if (galleryRows[0]?.Url) imageSource = 'gallery';
    else if (mediaRows[0]?.Url) imageSource = 'media';
    else if (mediaIdsRows[0]?.Url) imageSource = 'media_ids';

    return {
      success: true,
      data: {
        ...project,
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

export const getFeaturedProjects = async (limit = 6) => {
  const connection = await pool.getConnection();
  try {
    const [projects] = await connection.query(
      `SELECT 
         pl.id, pl.ProjectName, pl.project_slug, pl.featured_image,
         pl.price, pl.property_type, pl.bedroom, pl.area, pl.area_size,
         pl.LocationName, pl.CityName, pl.listing_type, pl.completion_date,
         pl.developer_id, pl.featured_project, pl.city_id, pl.community_id,
         COALESCE(c.name, '') AS city_name,
         COALESCE(com.name, '') AS community_name,
         ${getGalleryThumbQuery('pl')} as gallery_thumb,
         ${getMediaThumbQuery('pl')} as media_thumb
       FROM project_listing pl
       LEFT JOIN cities c ON CAST(pl.city_id AS UNSIGNED) = c.id
       LEFT JOIN community com ON CAST(pl.community_id AS UNSIGNED) = com.id
       WHERE pl.status = 1 AND pl.featured_project = '1'
       ORDER BY pl.created_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    const processedProjects = projects.map(project => {
      const primaryImage = project.featured_image || project.gallery_thumb || project.media_thumb || null;
      return { ...project, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProjects };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getProjectsByCity = async (cityId, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [projects] = await connection.query(
      `SELECT 
         pl.id, pl.ProjectName, pl.project_slug, pl.featured_image,
         pl.price, pl.property_type, pl.bedroom, pl.area,
         pl.LocationName, pl.listing_type, pl.completion_date,
         pl.city_id, pl.community_id,
         COALESCE(c.name, '') AS city_name,
         COALESCE(com.name, '') AS community_name,
         ${getGalleryThumbQuery('pl')} as gallery_thumb,
         ${getMediaThumbQuery('pl')} as media_thumb
       FROM project_listing pl
       LEFT JOIN cities c ON CAST(pl.city_id AS UNSIGNED) = c.id
       LEFT JOIN community com ON CAST(pl.community_id AS UNSIGNED) = com.id
       WHERE pl.city_id = ? AND pl.status = 1
       ORDER BY pl.created_at DESC
       LIMIT ?`,
      [cityId, parseInt(limit)]
    );

    const processedProjects = projects.map(project => {
      const primaryImage = project.featured_image || project.gallery_thumb || project.media_thumb || null;
      return { ...project, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProjects };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getProjectsByDeveloper = async (developerId, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [projects] = await connection.query(
      `SELECT 
         pl.id, pl.ProjectName, pl.project_slug, pl.featured_image,
         pl.price, pl.property_type, pl.bedroom, pl.area,
         pl.LocationName, pl.CityName, pl.listing_type, pl.completion_date,
         pl.city_id, pl.community_id,
         COALESCE(c.name, '') AS city_name,
         COALESCE(com.name, '') AS community_name,
         ${getGalleryThumbQuery('pl')} as gallery_thumb,
         ${getMediaThumbQuery('pl')} as media_thumb
       FROM project_listing pl
       LEFT JOIN cities c ON CAST(pl.city_id AS UNSIGNED) = c.id
       LEFT JOIN community com ON CAST(pl.community_id AS UNSIGNED) = com.id
       WHERE pl.developer_id = ? AND pl.status = 1
       ORDER BY pl.created_at DESC
       LIMIT ?`,
      [parseInt(developerId), parseInt(limit)]
    );

    const processedProjects = projects.map(project => {
      const primaryImage = project.featured_image || project.gallery_thumb || project.media_thumb || null;
      return { ...project, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProjects };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getProjectsByCommunity = async (communityId, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [projects] = await connection.query(
      `SELECT 
         pl.id, pl.ProjectName, pl.project_slug, pl.featured_image,
         pl.price, pl.property_type, pl.bedroom, pl.area,
         pl.LocationName, pl.listing_type, pl.completion_date,
         pl.city_id, pl.community_id,
         COALESCE(c.name, '') AS city_name,
         COALESCE(com.name, '') AS community_name,
         ${getGalleryThumbQuery('pl')} as gallery_thumb,
         ${getMediaThumbQuery('pl')} as media_thumb
       FROM project_listing pl
       LEFT JOIN cities c ON CAST(pl.city_id AS UNSIGNED) = c.id
       LEFT JOIN community com ON CAST(pl.community_id AS UNSIGNED) = com.id
       WHERE pl.community_id = ? AND pl.status = 1
       ORDER BY pl.created_at DESC
       LIMIT ?`,
      [communityId, parseInt(limit)]
    );

    const processedProjects = projects.map(project => {
      const primaryImage = project.featured_image || project.gallery_thumb || project.media_thumb || null;
      return { ...project, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProjects };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getSimilarProjects = async (projectId, limit = 4) => {
  const connection = await pool.getConnection();
  try {
    const [current] = await connection.query(
      'SELECT city_id, property_type, price, community_id, developer_id FROM project_listing WHERE id = ? AND status = 1',
      [parseInt(projectId)]
    );

    if (current.length === 0) {
      return { success: false, message: 'Project not found' };
    }

    const { city_id, property_type, price, community_id, developer_id } = current[0];
    const priceRange = price ? parseFloat(price) * 0.3 : 0;

    let query = `
      SELECT 
        pl.id, pl.ProjectName, pl.project_slug, pl.featured_image,
        pl.price, pl.property_type, pl.bedroom, pl.area, pl.LocationName,
        pl.completion_date, pl.city_id, pl.community_id,
        COALESCE(c.name, '') AS city_name,
        COALESCE(com.name, '') AS community_name,
        ${getGalleryThumbQuery('pl')} as gallery_thumb,
        ${getMediaThumbQuery('pl')} as media_thumb
      FROM project_listing pl
      LEFT JOIN cities c ON CAST(pl.city_id AS UNSIGNED) = c.id
      LEFT JOIN community com ON CAST(pl.community_id AS UNSIGNED) = com.id
      WHERE pl.id != ? AND pl.status = 1
        AND (pl.city_id = ? OR pl.developer_id = ? OR pl.community_id = ?)
    `;
    
    let params = [parseInt(projectId), city_id, developer_id, community_id];

    if (price && priceRange > 0) {
      query += ' AND CAST(pl.price AS DECIMAL(15,2)) BETWEEN ? AND ?';
      params.push(parseFloat(price) - priceRange, parseFloat(price) + priceRange);
    }

    query += `
      ORDER BY 
        CASE 
          WHEN pl.community_id = ? THEN 1
          WHEN pl.developer_id = ? THEN 2
          WHEN pl.city_id = ? THEN 3
          ELSE 4 
        END,
        pl.created_at DESC
      LIMIT ?
    `;
    params.push(community_id, developer_id, city_id, parseInt(limit));

    const [projects] = await connection.query(query, params);

    const processedProjects = projects.map(project => {
      const primaryImage = project.featured_image || project.gallery_thumb || project.media_thumb || null;
      return { ...project, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProjects };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const searchProjects = async (query, limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const searchTerm = `%${query}%`;
    
    const [projects] = await connection.query(
      `SELECT 
         pl.id, pl.ProjectName, pl.project_slug, pl.featured_image,
         pl.price, pl.property_type, pl.LocationName, pl.CityName,
         pl.listing_type, pl.city_id, pl.community_id,
         COALESCE(c.name, '') AS city_name,
         COALESCE(com.name, '') AS community_name,
         ${getGalleryThumbQuery('pl')} as gallery_thumb,
         ${getMediaThumbQuery('pl')} as media_thumb
       FROM project_listing pl
       LEFT JOIN cities c ON CAST(pl.city_id AS UNSIGNED) = c.id
       LEFT JOIN community com ON CAST(pl.community_id AS UNSIGNED) = com.id
       WHERE pl.status = 1
         AND (pl.ProjectName LIKE ? OR pl.LocationName LIKE ? OR pl.CityName LIKE ? OR pl.keyword LIKE ?)
       ORDER BY 
         CASE 
           WHEN pl.ProjectName LIKE ? THEN 1
           WHEN pl.LocationName LIKE ? THEN 2
           ELSE 3 
         END,
         CAST(pl.views AS UNSIGNED) DESC
       LIMIT ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]
    );

    const processedProjects = projects.map(project => {
      const primaryImage = project.featured_image || project.gallery_thumb || project.media_thumb || null;
      return { ...project, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProjects };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getAllProjectsAdmin = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 10,
      status,
      city_id,
      developer_id,
      listing_type,
      featured_project,
      verified,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    if (status !== undefined && status !== null && status !== '') {
      whereConditions.push('pl.status = ?');
      params.push(parseInt(status));
    }
    if (city_id) {
      whereConditions.push('pl.city_id = ?');
      params.push(city_id);
    }
    if (developer_id) {
      whereConditions.push('pl.developer_id = ?');
      params.push(parseInt(developer_id));
    }
    if (listing_type) {
      whereConditions.push('pl.listing_type = ?');
      params.push(listing_type);
    }
    if (featured_project) {
      whereConditions.push('pl.featured_project = ?');
      params.push(featured_project);
    }
    if (verified !== undefined && verified !== null && verified !== '') {
      whereConditions.push('pl.verified = ?');
      params.push(parseInt(verified));
    }
    if (search) {
      whereConditions.push('(pl.ProjectName LIKE ? OR pl.project_slug LIKE ? OR pl.ProjectId LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const allowedSortColumns = ['created_at', 'updated_at', 'price', 'views', 'ProjectName', 'status'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM project_listing pl ${whereClause}`,
      params
    );

    const [projects] = await connection.query(
      `SELECT 
         pl.*,
         COALESCE(c.name, '') AS city_name,
         COALESCE(com.name, '') AS community_name,
         COALESCE(sc.name, '') AS sub_community_name,
         ${getGalleryThumbQuery('pl')} as gallery_thumb,
         ${getMediaThumbQuery('pl')} as media_thumb,
         ${getGalleryCountQuery('pl')} as gallery_count,
         ${getMediaCountQuery('pl')} as media_count
       FROM project_listing pl
       LEFT JOIN cities c ON CAST(pl.city_id AS UNSIGNED) = c.id
       LEFT JOIN community com ON CAST(pl.community_id AS UNSIGNED) = com.id
       LEFT JOIN sub_community sc ON CAST(pl.sub_community_id AS UNSIGNED) = sc.id
       ${whereClause}
       ORDER BY pl.${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const processedProjects = projects.map(project => {
      const primaryImage = project.featured_image || project.gallery_thumb || project.media_thumb || null;
      return { ...project, primaryImage, display_image: primaryImage };
    });

    return {
      success: true,
      data: processedProjects,
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

export const getProjectByIdAdmin = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [projectRows] = await connection.query(
      `SELECT pl.*, 
         COALESCE(c.name, '') AS city_name,
         COALESCE(com.name, '') AS community_name,
         COALESCE(sc.name, '') AS sub_community_name,
         ps.id as spec_id, ps.ReraNumber, ps.EmployeeName, ps.EmployeeMobile,
         ps.EmployeeEmail, ps.MemberName, ps.MemberMobile, ps.ReplyEmail,
         ps.ReplyMobile, ps.Title as SpecTitle, ps.CompanyName, ps.MaxArea,
         ps.MinArea, ps.MaxPrice, ps.MinPrice, ps.ProjectPlanText, ps.TotalRoomCsv,
         ps.PropertyTypeCsv, ps.Latitude, ps.Longitude, ps.WebsiteKeyword,
         ps.DeveloperName, ps.OtherAmenities, ps.TransactionName, ps.PossessionName,
         ps.VirtualTour, ps.YouTubeUrl, ps.TotalRecords, ps.IsCommencement,
         ps.IsOccupancy, ps.ApprovedBy, ps.TotalArea, ps.OpenSpace
       FROM project_listing pl
       LEFT JOIN cities c ON CAST(pl.city_id AS UNSIGNED) = c.id
       LEFT JOIN community com ON CAST(pl.community_id AS UNSIGNED) = com.id
       LEFT JOIN sub_community sc ON CAST(pl.sub_community_id AS UNSIGNED) = sc.id
       LEFT JOIN project_specs ps ON pl.id = ps.project_id
       WHERE pl.id = ?`,
      [parseInt(id)]
    );

    if (projectRows.length === 0) {
      return { success: false, message: 'Project not found' };
    }

    const project = projectRows[0];

    const [galleryRows] = await connection.query(
      'SELECT id, Url, "gallery" as source FROM project_gallery WHERE project_id = ? ORDER BY id ASC',
      [parseInt(id)]
    );

    const [mediaRows] = await connection.query(
      'SELECT id, path as Url, title, "media" as source FROM media WHERE module_id = ? AND module_type = "project" AND status = 1 ORDER BY id ASC',
      [parseInt(id)]
    );

    const [floorPlans] = await connection.query(
      'SELECT id, title, description, image FROM floor_plan WHERE property_id = ? ORDER BY id ASC',
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

    const primaryImage = project.featured_image || 
                        (galleryRows[0]?.Url) || 
                        (mediaRows[0]?.Url) || 
                        null;

    return {
      success: true,
      data: {
        ...project,
        primaryImage,
        display_image: primaryImage,
        gallery: allGallery,
        floorPlans: floorPlans
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createProject = async (projectData, relatedData = {}) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (!projectData.project_slug && projectData.ProjectName) {
      projectData.project_slug = projectData.ProjectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();
    }

    const fields = Object.keys(projectData);
    const values = Object.values(projectData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await connection.query(
      `INSERT INTO project_listing (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );
    const projectId = result.insertId;

    if (relatedData.specs && Object.keys(relatedData.specs).length > 0) {
      const specsData = { project_id: projectId, ...relatedData.specs };
      const specFields = Object.keys(specsData);
      const specValues = Object.values(specsData);
      const specPlaceholders = specFields.map(() => '?').join(', ');

      await connection.query(
        `INSERT INTO project_specs (${specFields.join(', ')}) VALUES (${specPlaceholders})`,
        specValues
      );
    }

    if (relatedData.gallery && relatedData.gallery.length > 0) {
      const galleryValues = relatedData.gallery.map((img) => [
        projectId, 
        typeof img === 'string' ? img : img.Url
      ]);
      await connection.query(
        'INSERT INTO project_gallery (project_id, Url) VALUES ?',
        [galleryValues]
      );
    }

    if (relatedData.floorPlans && relatedData.floorPlans.length > 0) {
      const floorValues = relatedData.floorPlans.map((plan) => [
        projectId,
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
      projectId, 
      slug: projectData.project_slug,
      message: 'Project created successfully' 
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateProject = async (id, updateData, relatedUpdates = {}) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT id FROM project_listing WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Project not found' };
    }

    if (Object.keys(updateData).length > 0) {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updateData), parseInt(id)];
      await connection.query(
        `UPDATE project_listing SET ${fields}, updated_at = NOW() WHERE id = ?`,
        values
      );
    }

    if (relatedUpdates.specs && Object.keys(relatedUpdates.specs).length > 0) {
      const [existingSpecs] = await connection.query(
        'SELECT id FROM project_specs WHERE project_id = ?',
        [parseInt(id)]
      );

      if (existingSpecs.length > 0) {
        const specFields = Object.keys(relatedUpdates.specs).map(key => `${key} = ?`).join(', ');
        const specValues = [...Object.values(relatedUpdates.specs), parseInt(id)];
        await connection.query(
          `UPDATE project_specs SET ${specFields}, updated_at = NOW() WHERE project_id = ?`,
          specValues
        );
      } else {
        const specsData = { project_id: parseInt(id), ...relatedUpdates.specs };
        const specFields = Object.keys(specsData);
        const specValues = Object.values(specsData);
        const specPlaceholders = specFields.map(() => '?').join(', ');
        await connection.query(
          `INSERT INTO project_specs (${specFields.join(', ')}) VALUES (${specPlaceholders})`,
          specValues
        );
      }
    }

    if (relatedUpdates.gallery && relatedUpdates.gallery.length > 0) {
      const galleryValues = relatedUpdates.gallery.map((img) => [
        parseInt(id), 
        typeof img === 'string' ? img : img.Url
      ]);
      await connection.query(
        'INSERT INTO project_gallery (project_id, Url) VALUES ?',
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

    return { success: true, message: 'Project updated successfully' };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteProject = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM project_listing WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return { success: false, message: 'Project not found' };
    }

    await connection.query(
      'UPDATE project_listing SET status = 0, updated_at = NOW() WHERE id = ?',
      [parseInt(id)]
    );

    return { success: true, message: 'Project deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const hardDeleteProject = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT id FROM project_listing WHERE id = ?',
      [parseInt(id)]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Project not found' };
    }

    await connection.query('DELETE FROM project_gallery WHERE project_id = ?', [parseInt(id)]);
    await connection.query('DELETE FROM project_specs WHERE project_id = ?', [parseInt(id)]);
    await connection.query('DELETE FROM project_contacts WHERE project_id = ?', [parseInt(id)]);
    await connection.query('DELETE FROM floor_plan WHERE property_id = ?', [parseInt(id)]);
    await connection.query('DELETE FROM project_listing WHERE id = ?', [parseInt(id)]);

    await connection.commit();

    return { success: true, message: 'Project permanently deleted' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateProjectStatus = async (id, status) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE project_listing SET status = ?, updated_at = NOW() WHERE id = ?',
      [parseInt(status), parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Project not found' };
    }

    return { success: true, message: 'Status updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const verifyProject = async (id, verified) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE project_listing SET verified = ?, updated_at = NOW() WHERE id = ?',
      [verified ? 1 : 0, parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Project not found' };
    }

    return { 
      success: true, 
      message: verified ? 'Project verified successfully' : 'Project unverified successfully'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const toggleFeaturedProject = async (id, featured) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE project_listing SET featured_project = ?, updated_at = NOW() WHERE id = ?',
      [featured ? '1' : '0', parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Project not found' };
    }

    return { 
      success: true, 
      message: featured ? 'Project marked as featured' : 'Project removed from featured'
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const restoreProject = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE project_listing SET status = 1, updated_at = NOW() WHERE id = ? AND status = 0',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Project not found or not deleted' };
    }

    return { success: true, message: 'Project restored successfully' };
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
      return { success: false, message: 'No project IDs provided' };
    }

    const sanitizedIds = ids.map(id => parseInt(id));
    const placeholders = sanitizedIds.map(() => '?').join(',');
    const [result] = await connection.query(
      `UPDATE project_listing SET status = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      [parseInt(status), ...sanitizedIds]
    );

    return { 
      success: true, 
      message: `${result.affectedRows} projects updated`,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const addGalleryImages = async (projectId, images) => {
  const connection = await pool.getConnection();
  try {
    if (!images || images.length === 0) {
      return { success: false, message: 'No images provided' };
    }

    const values = images.map((img) => [
      parseInt(projectId), 
      typeof img === 'string' ? img : img.Url
    ]);

    await connection.query(
      'INSERT INTO project_gallery (project_id, Url) VALUES ?',
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
      'SELECT * FROM project_gallery WHERE id = ?',
      [parseInt(imageId)]
    );

    if (imageInfo.length === 0) {
      return { success: false, message: 'Image not found', imageData: null };
    }

    await connection.query('DELETE FROM project_gallery WHERE id = ?', [parseInt(imageId)]);

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

export const getGalleryByProjectId = async (projectId) => {
  const connection = await pool.getConnection();
  try {
    const [galleryRows] = await connection.query(
      'SELECT id, Url, "gallery" as source, created_at FROM project_gallery WHERE project_id = ? ORDER BY id ASC',
      [parseInt(projectId)]
    );

    const [mediaRows] = await connection.query(
      'SELECT id, path as Url, title, "media" as source, update_date as created_at FROM media WHERE module_id = ? AND module_type = "project" AND status = 1 ORDER BY id ASC',
      [parseInt(projectId)]
    );

    const allGallery = [...galleryRows, ...mediaRows];

    return { success: true, data: allGallery };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const addFloorPlan = async (projectId, floorPlanData) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO floor_plan (property_id, title, description, image) VALUES (?, ?, ?, ?)',
      [parseInt(projectId), floorPlanData.title, floorPlanData.description, floorPlanData.image]
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

export const getFloorPlansByProjectId = async (projectId) => {
  const connection = await pool.getConnection();
  try {
    const [floorPlans] = await connection.query(
      'SELECT id, title, description, image FROM floor_plan WHERE property_id = ? ORDER BY id ASC',
      [parseInt(projectId)]
    );

    return { success: true, data: floorPlans };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createProjectContact = async (contactData) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO project_contacts (project_id, name, email, phone, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [parseInt(contactData.project_id), contactData.name, contactData.email, contactData.phone, contactData.message]
    );

    return { 
      success: true, 
      contactId: result.insertId,
      message: 'Contact inquiry submitted successfully' 
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getProjectContacts = async (projectId) => {
  const connection = await pool.getConnection();
  try {
    const [contacts] = await connection.query(
      'SELECT * FROM project_contacts WHERE project_id = ? ORDER BY created_at DESC',
      [parseInt(projectId)]
    );

    return { success: true, data: contacts };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getAllProjectContacts = async (filters = {}) => {
  const connection = await pool.getConnection();
  try {
    const { page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const [countResult] = await connection.query(
      'SELECT COUNT(*) as total FROM project_contacts'
    );

    const [contacts] = await connection.query(
      `SELECT pc.*, pl.ProjectName, pl.project_slug 
       FROM project_contacts pc
       LEFT JOIN project_listing pl ON pc.project_id = pl.id
       ORDER BY pc.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    return {
      success: true,
      data: contacts,
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

export const getProjectStats = async () => {
  const connection = await pool.getConnection();
  try {
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_projects,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as deleted_projects,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as draft_projects,
        SUM(CASE WHEN featured_project = '1' AND status = 1 THEN 1 ELSE 0 END) as featured_projects,
        SUM(CASE WHEN verified = 1 AND status = 1 THEN 1 ELSE 0 END) as verified_projects,
        SUM(CAST(COALESCE(views, '0') AS UNSIGNED)) as total_views,
        AVG(CASE WHEN CAST(price AS DECIMAL(15,2)) > 0 THEN CAST(price AS DECIMAL(15,2)) ELSE NULL END) as average_price
      FROM project_listing
    `);

    const [recentStats] = await connection.query(`
      SELECT COUNT(*) as new_projects_week
      FROM project_listing
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status = 1
    `);

    const [typeStats] = await connection.query(`
      SELECT listing_type, COUNT(*) as count
      FROM project_listing
      WHERE status = 1 AND listing_type IS NOT NULL AND listing_type != ''
      GROUP BY listing_type
    `);

    const [contactStats] = await connection.query(`
      SELECT COUNT(*) as total_inquiries
      FROM project_contacts
    `);

    return { 
      success: true, 
      data: {
        ...stats[0],
        new_projects_week: recentStats[0].new_projects_week,
        total_inquiries: contactStats[0].total_inquiries,
        by_listing_type: typeStats
      }
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const getTopViewedProjects = async (limit = 10) => {
  const connection = await pool.getConnection();
  try {
    const [projects] = await connection.query(
      `SELECT 
         pl.id, pl.ProjectName, pl.project_slug, pl.views, pl.featured_image, pl.created_at,
         pl.city_id, pl.community_id,
         COALESCE(c.name, '') AS city_name,
         COALESCE(com.name, '') AS community_name,
         ${getGalleryThumbQuery('pl')} as gallery_thumb,
         ${getMediaThumbQuery('pl')} as media_thumb
       FROM project_listing pl
       LEFT JOIN cities c ON CAST(pl.city_id AS UNSIGNED) = c.id
       LEFT JOIN community com ON CAST(pl.community_id AS UNSIGNED) = com.id
       WHERE pl.status = 1
       ORDER BY CAST(COALESCE(pl.views, '0') AS UNSIGNED) DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    const processedProjects = projects.map(project => {
      const primaryImage = project.featured_image || project.gallery_thumb || project.media_thumb || null;
      return { ...project, primaryImage, display_image: primaryImage };
    });

    return { success: true, data: processedProjects };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const checkSlugAvailability = async (slug, excludeId = null) => {
  const connection = await pool.getConnection();
  try {
    let query = 'SELECT id FROM project_listing WHERE project_slug = ?';
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

export const getProjectDataBySubCommunity = async (subCommunityId) => {
  const connection = await pool.getConnection();
  try {
    const [data] = await connection.query(
      'SELECT * FROM project_data WHERE sub_community_id = ? AND status = 1 ORDER BY name ASC',
      [parseInt(subCommunityId)]
    );

    return { success: true, data };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const createProjectData = async (dataObj) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO project_data (sub_community_id, name, status) VALUES (?, ?, ?)',
      [parseInt(dataObj.sub_community_id), dataObj.name, dataObj.status || 1]
    );

    return { 
      success: true, 
      id: result.insertId,
      message: 'Project data created successfully' 
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const updateProjectData = async (id, dataObj) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(dataObj).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(dataObj), parseInt(id)];
    
    const [result] = await connection.query(
      `UPDATE project_data SET ${fields} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Project data not found' };
    }

    return { success: true, message: 'Project data updated successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteProjectData = async (id) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'DELETE FROM project_data WHERE id = ?',
      [parseInt(id)]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Project data not found' };
    }

    return { success: true, message: 'Project data deleted successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  createProjectTables,
  getActiveProjects,
  getProjectBySlug,
  getFeaturedProjects,
  getProjectsByCity,
  getProjectsByDeveloper,
  getProjectsByCommunity,
  getSimilarProjects,
  searchProjects,
  getAllProjectsAdmin,
  getProjectByIdAdmin,
  createProject,
  updateProject,
  deleteProject,
  hardDeleteProject,
  updateProjectStatus,
  verifyProject,
  toggleFeaturedProject,
  restoreProject,
  bulkUpdateStatus,
  addGalleryImages,
  deleteGalleryImage,
  getGalleryByProjectId,
  addFloorPlan,
  deleteFloorPlan,
  getFloorPlansByProjectId,
  createProjectContact,
  getProjectContacts,
  getAllProjectContacts,
  getProjectStats,
  getTopViewedProjects,
  checkSlugAvailability,
  getProjectDataBySubCommunity,
  createProjectData,
  updateProjectData,
  deleteProjectData
};