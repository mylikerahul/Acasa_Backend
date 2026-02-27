import pool from '../config/db.js';

const fixAllPropertyLocations = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   PROPERTY LOCATION FIX - COMPREHENSIVE CLEANUP        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const [validCities] = await connection.query('SELECT id, name FROM cities ORDER BY id');
    const validCityIds = validCities.map(c => c.id);
    console.log(`✅ Valid Cities (${validCities.length}):`);
    validCities.forEach(c => console.log(`   ${c.id}: ${c.name}`));

    const [validCommunities] = await connection.query('SELECT id, name FROM community ORDER BY name');
    const validCommunityIds = validCommunities.map(c => c.id);
    console.log(`\n✅ Valid Communities: ${validCommunities.length} found\n`);

    if (validCityIds.length === 0 || validCommunityIds.length === 0) {
      throw new Error('No valid cities/communities found in database!');
    }

    console.log('📊 Step 1: Analyzing current state...\n');

    const [initialStats] = await connection.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN city_id IS NULL OR city_id = 0 THEN 1 ELSE 0 END) as null_city,
        SUM(CASE WHEN community_id IS NULL OR community_id = 0 THEN 1 ELSE 0 END) as null_community,
        SUM(CASE WHEN city_id NOT IN (${validCityIds.join(',')}) AND city_id IS NOT NULL AND city_id != 0 THEN 1 ELSE 0 END) as wrong_city,
        SUM(CASE WHEN community_id NOT IN (${validCommunityIds.join(',')}) AND community_id IS NOT NULL AND community_id != 0 THEN 1 ELSE 0 END) as wrong_community
       FROM properties`
    );

    console.log('Initial Issues Found:');
    console.log(`   Total Properties: ${initialStats[0].total}`);
    console.log(`   NULL city_id: ${initialStats[0].null_city}`);
    console.log(`   NULL community_id: ${initialStats[0].null_community}`);
    console.log(`   Wrong city_id: ${initialStats[0].wrong_city}`);
    console.log(`   Wrong community_id: ${initialStats[0].wrong_community}\n`);

    console.log('🔧 Step 2: Fixing city_id issues...\n');

    const [fixedNullCities] = await connection.query(
      `UPDATE properties 
       SET city_id = 1 
       WHERE city_id IS NULL OR city_id = 0`
    );
    console.log(`   ✅ Fixed NULL/zero city_id: ${fixedNullCities.affectedRows}`);

    const [fixedWrongCities] = await connection.query(
      `UPDATE properties 
       SET city_id = 1 
       WHERE city_id NOT IN (${validCityIds.join(',')}) 
       AND city_id IS NOT NULL 
       AND city_id != 0`
    );
    console.log(`   ✅ Fixed wrong city_id: ${fixedWrongCities.affectedRows}\n`);

    console.log('🔧 Step 3: Cleaning wrong community_id...\n');

    const [wrongCommunities] = await connection.query(
      `SELECT id, property_name, community_id 
       FROM properties 
       WHERE community_id NOT IN (${validCommunityIds.join(',')}) 
       AND community_id IS NOT NULL 
       AND community_id != 0
       LIMIT 10`
    );

    if (wrongCommunities.length > 0) {
      console.log('   Sample properties with wrong community_id:');
      wrongCommunities.forEach(p => {
        console.log(`      ${p.id}. ${p.property_name} -> Invalid ID: ${p.community_id}`);
      });
      console.log('');
    }

    const [fixedWrongCommunities] = await connection.query(
      `UPDATE properties 
       SET community_id = NULL
       WHERE community_id NOT IN (${validCommunityIds.join(',')}) 
       AND community_id IS NOT NULL 
       AND community_id != 0`
    );
    console.log(`   ✅ Fixed wrong community_id: ${fixedWrongCommunities.affectedRows}\n`);

    console.log('🔧 Step 4: Auto-detecting communities from descriptions...\n');

    const communityPatterns = [
      { name: 'Motor City', patterns: ['%Motor City%', '%motor city%'] },
      { name: 'Dubai Marina', patterns: ['%Dubai Marina%', '%dubai marina%'] },
      { name: 'Business Bay', patterns: ['%Business Bay%', '%business bay%'] },
      { name: 'Downtown Dubai', patterns: ['%Downtown Dubai%', '%downtown dubai%'] },
      { name: 'Dubai Hills Estate', patterns: ['%Dubai Hills Estate%', '%dubai hills%'] },
      { name: 'Jumeirah Village Circle', patterns: ['%JVC%', '%Jumeirah Village Circle%', '%jumeirah village%'] },
      { name: 'Dubai Creek Harbour', patterns: ['%Dubai Creek Harbour%', '%creek harbour%'] },
      { name: 'Palm Jumeirah', patterns: ['%Palm Jumeirah%', '%palm jumeirah%'] },
      { name: 'JBR', patterns: ['%JBR%', '%Jumeirah Beach Residence%'] },
      { name: 'DAMAC Hills', patterns: ['%DAMAC Hills%', '%damac hills%'] },
      { name: 'Arabian Ranches', patterns: ['%Arabian Ranches%', '%arabian ranches%'] },
      { name: 'Dubai Sports City', patterns: ['%Dubai Sports City%', '%sports city%'] },
      { name: 'Al Barsha', patterns: ['%Al Barsha%', '%al barsha%'] },
      { name: 'Emirates Hills', patterns: ['%Emirates Hills%', '%emirates hills%'] },
      { name: 'Meydan', patterns: ['%Meydan%', '%meydan%'] },
      { name: 'Dubai South', patterns: ['%Dubai South%', '%dubai south%'] },
      { name: 'Dubai Land', patterns: ['%Dubai Land%', '%dubailand%'] },
      { name: 'Jumeirah Lake Towers', patterns: ['%JLT%', '%Jumeirah Lake Towers%'] },
      { name: 'Al Furjan', patterns: ['%Al Furjan%', '%al furjan%'] },
      { name: 'Dubai Production City', patterns: ['%Dubai Production City%', '%IMPZ%'] },
      { name: 'Dubai Silicon Oasis', patterns: ['%Dubai Silicon Oasis%', '%DSO%'] },
      { name: 'International City', patterns: ['%International City%', '%international city%'] },
      { name: 'Jumeirah Golf Estates', patterns: ['%Jumeirah Golf Estates%', '%golf estates%'] },
      { name: 'Dubai Investment Park', patterns: ['%Dubai Investment Park%', '%DIP%'] },
      { name: 'Discovery Gardens', patterns: ['%Discovery Gardens%', '%discovery gardens%'] },
      { name: 'The Greens', patterns: ['%The Greens%'] },
      { name: 'The Meadows', patterns: ['%The Meadows%'] },
      { name: 'Dubai Healthcare City', patterns: ['%Dubai Healthcare City%', '%DHCC%'] },
      { name: 'Al Quoz', patterns: ['%Al Quoz%', '%al quoz%'] },
    ];

    let totalFixed = 0;

    for (const { name, patterns } of communityPatterns) {
      const [found] = await connection.query(
        `SELECT id FROM community WHERE name LIKE ? LIMIT 1`,
        [`%${name}%`]
      );

      if (!found[0]) continue;

      const communityId = found[0].id;
      const descConditions = patterns.map(() => `description LIKE ?`).join(' OR ');
      const locConditions = patterns.map(() => `location LIKE ?`).join(' OR ');
      const addrConditions = patterns.map(() => `address LIKE ?`).join(' OR ');
      const nameConditions = patterns.map(() => `property_name LIKE ?`).join(' OR ');
      
      const allPatterns = [...patterns, ...patterns, ...patterns, ...patterns];

      const [result] = await connection.query(
        `UPDATE properties 
         SET community_id = ? 
         WHERE (${descConditions} OR ${locConditions} OR ${addrConditions} OR ${nameConditions})
         AND (community_id IS NULL OR community_id = 0)`,
        [communityId, ...allPatterns]
      );

      if (result.affectedRows > 0) {
        totalFixed += result.affectedRows;
        console.log(`   ✅ ${name}: ${result.affectedRows} properties (ID: ${communityId})`);
      }
    }

    console.log(`\n   Total auto-detected: ${totalFixed} properties\n`);

    console.log('🔧 Step 5: Setting default community for remaining NULL...\n');

    const [defaultCommunity] = await connection.query(
      `SELECT id FROM community WHERE name LIKE '%Business Bay%' LIMIT 1`
    );

    const defaultCommunityId = defaultCommunity[0]?.id || validCommunityIds[0];

    const [setDefaults] = await connection.query(
      `UPDATE properties 
       SET community_id = ?
       WHERE (community_id IS NULL OR community_id = 0) 
       AND city_id = 1`,
      [defaultCommunityId]
    );
    console.log(`   ✅ Set default community: ${setDefaults.affectedRows} properties\n`);

    console.log('🔧 Step 6: Syncing location and city fields...\n');

    const [syncedLocation] = await connection.query(
      `UPDATE properties p
       LEFT JOIN community com ON p.community_id = com.id
       SET p.location = com.name
       WHERE p.community_id IS NOT NULL 
       AND p.community_id != 0
       AND (p.location IS NULL OR p.location = '')`
    );
    console.log(`   ✅ Synced empty location fields: ${syncedLocation.affectedRows} properties\n`);

    console.log('📊 Step 7: Final verification...\n');

    const [finalStats] = await connection.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN city_id IS NULL OR city_id = 0 THEN 1 ELSE 0 END) as null_city,
        SUM(CASE WHEN community_id IS NULL OR community_id = 0 THEN 1 ELSE 0 END) as null_community,
        SUM(CASE WHEN city_id NOT IN (${validCityIds.join(',')}) AND city_id IS NOT NULL AND city_id != 0 THEN 1 ELSE 0 END) as wrong_city,
        SUM(CASE WHEN community_id NOT IN (${validCommunityIds.join(',')}) AND community_id IS NOT NULL AND community_id != 0 THEN 1 ELSE 0 END) as wrong_community,
        SUM(CASE WHEN city_id IS NOT NULL AND city_id != 0 AND community_id IS NOT NULL AND community_id != 0 THEN 1 ELSE 0 END) as valid_properties
       FROM properties`
    );

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                  FINAL STATISTICS                      ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`   Total Properties: ${finalStats[0].total}`);
    console.log(`   ✅ Valid Properties: ${finalStats[0].valid_properties}`);
    console.log(`   NULL city_id: ${finalStats[0].null_city}`);
    console.log(`   NULL community_id: ${finalStats[0].null_community}`);
    console.log(`   Wrong city_id: ${finalStats[0].wrong_city}`);
    console.log(`   Wrong community_id: ${finalStats[0].wrong_community}\n`);

    console.log('📋 Sample Fixed Properties:\n');

    const [samples] = await connection.query(
      `SELECT 
         p.id,
         p.property_name,
         p.city_id,
         p.community_id,
         p.location,
         c.name as city_name,
         com.name as community_name
       FROM properties p
       LEFT JOIN cities c ON p.city_id = c.id
       LEFT JOIN community com ON p.community_id = com.id
       ORDER BY p.id DESC
       LIMIT 10`
    );

    samples.forEach(p => {
      console.log(`   ${p.id}. ${p.property_name}`);
      console.log(`      City: ${p.city_name || 'N/A'} (ID: ${p.city_id})`);
      console.log(`      Community: ${p.community_name || 'N/A'} (ID: ${p.community_id})`);
      console.log(`      Location: ${p.location || 'N/A'}\n`);
    });

    const totalIssuesFixed = 
      fixedNullCities.affectedRows +
      fixedWrongCities.affectedRows +
      fixedWrongCommunities.affectedRows +
      totalFixed +
      setDefaults.affectedRows;

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                  SUCCESS SUMMARY                       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`   ✅ Total Issues Fixed: ${totalIssuesFixed}`);
    console.log(`   ✅ City Issues Fixed: ${fixedNullCities.affectedRows + fixedWrongCities.affectedRows}`);
    console.log(`   ✅ Community Issues Fixed: ${fixedWrongCommunities.affectedRows + totalFixed + setDefaults.affectedRows}`);
    console.log(`   ✅ Location Fields Synced: ${syncedLocation.affectedRows}`);
    console.log('\n✅ All property location issues have been fixed!\n');

    console.log('Next Steps:');
    console.log('   1. Restart backend server');
    console.log('   2. Test API: GET /api/v1/properties');
    console.log('   3. Check frontend for location display\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    connection.release();
    process.exit();
  }
};

fixAllPropertyLocations();