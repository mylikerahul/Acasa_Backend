import pool from '../config/db.js';

/**
 * Comprehensive Project Location Fix Script
 * Fixes all location-related issues in project_listing table
 * Run: node scripts/fixAllProjectLocations.js
 */

const fixAllProjectLocations = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   PROJECT LOCATION FIX - COMPREHENSIVE CLEANUP         ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // ============================================
    // STEP 1: GET VALID REFERENCE DATA
    // ============================================
    console.log('📊 Step 1: Loading reference data...\n');

    const [validCities] = await connection.query('SELECT id, name FROM cities ORDER BY id');
    const validCityIds = validCities.map(c => c.id);
    console.log(`✅ Valid Cities (${validCities.length}):`);
    validCities.forEach(c => console.log(`   ${c.id}: ${c.name}`));

    const [validCommunities] = await connection.query('SELECT id, name FROM community ORDER BY name');
    const validCommunityIds = validCommunities.map(c => c.id);
    console.log(`\n✅ Valid Communities: ${validCommunities.length} found\n`);

    // Safety check
    if (validCityIds.length === 0 || validCommunityIds.length === 0) {
      throw new Error('No valid cities/communities found in database!');
    }

    // ============================================
    // STEP 2: INITIAL STATISTICS
    // ============================================
    console.log('📊 Step 2: Analyzing current state...\n');

    const [initialStats] = await connection.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN city_id IS NULL OR city_id = '' THEN 1 ELSE 0 END) as null_city,
        SUM(CASE WHEN community_id IS NULL OR community_id = '' THEN 1 ELSE 0 END) as null_community,
        SUM(CASE WHEN city_id NOT IN (${validCityIds.join(',')}) AND city_id IS NOT NULL AND city_id != '' THEN 1 ELSE 0 END) as wrong_city,
        SUM(CASE WHEN community_id NOT IN (${validCommunityIds.join(',')}) AND community_id IS NOT NULL AND community_id != '' THEN 1 ELSE 0 END) as wrong_community
       FROM project_listing`
    );

    console.log('Initial Issues Found:');
    console.log(`   Total Projects: ${initialStats[0].total}`);
    console.log(`   ⚠️  NULL city_id: ${initialStats[0].null_city}`);
    console.log(`   ⚠️  NULL community_id: ${initialStats[0].null_community}`);
    console.log(`   ⚠️  Wrong city_id: ${initialStats[0].wrong_city}`);
    console.log(`   ⚠️  Wrong community_id: ${initialStats[0].wrong_community}\n`);

    // ============================================
    // STEP 3: FIX CITY IDS
    // ============================================
    console.log('🔧 Step 3: Fixing city_id issues...\n');

    // Set NULL/empty city_id to Dubai (ID: 1)
    const [fixedNullCities] = await connection.query(
      `UPDATE project_listing 
       SET city_id = '1' 
       WHERE city_id IS NULL OR city_id = ''`
    );
    console.log(`   ✅ Fixed NULL/empty city_id: ${fixedNullCities.affectedRows}`);

    // Fix wrong city_id (not in valid list)
    const [fixedWrongCities] = await connection.query(
      `UPDATE project_listing 
       SET city_id = '1' 
       WHERE city_id NOT IN (${validCityIds.join(',')}) 
       AND city_id IS NOT NULL 
       AND city_id != ''`
    );
    console.log(`   ✅ Fixed wrong city_id: ${fixedWrongCities.affectedRows}\n`);

    // ============================================
    // STEP 4: FIX WRONG COMMUNITY IDS
    // ============================================
    console.log('🔧 Step 4: Cleaning wrong community_id...\n');

    // Show sample wrong communities
    const [wrongCommunities] = await connection.query(
      `SELECT id, ProjectName, community_id 
       FROM project_listing 
       WHERE community_id NOT IN (${validCommunityIds.join(',')}) 
       AND community_id IS NOT NULL 
       AND community_id != ''
       LIMIT 10`
    );

    if (wrongCommunities.length > 0) {
      console.log('   Sample projects with wrong community_id:');
      wrongCommunities.forEach(p => {
        console.log(`      ${p.id}. ${p.ProjectName} -> Invalid ID: ${p.community_id}`);
      });
      console.log('');
    }

    // Set wrong community_id to NULL
    const [fixedWrongCommunities] = await connection.query(
      `UPDATE project_listing 
       SET community_id = NULL
       WHERE community_id NOT IN (${validCommunityIds.join(',')}) 
       AND community_id IS NOT NULL 
       AND community_id != ''`
    );
    console.log(`   ✅ Fixed wrong community_id: ${fixedWrongCommunities.affectedRows}\n`);

    // ============================================
    // STEP 5: AUTO-DETECT COMMUNITIES FROM DESCRIPTION
    // ============================================
    console.log('🔧 Step 5: Auto-detecting communities from descriptions...\n');

    const communityPatterns = [
      // Major Communities
      { name: 'Motor City', patterns: ['%Motor City%', '%motor city%'] },
      { name: 'Dubai Marina', patterns: ['%Dubai Marina%', '%dubai marina%', '%Marina%'] },
      { name: 'Business Bay', patterns: ['%Business Bay%', '%business bay%'] },
      { name: 'Downtown Dubai', patterns: ['%Downtown Dubai%', '%downtown%'] },
      { name: 'Dubai Hills Estate', patterns: ['%Dubai Hills Estate%', '%dubai hills%'] },
      { name: 'Jumeirah Village Circle', patterns: ['%JVC%', '%Jumeirah Village Circle%', '%jumeirah village%'] },
      { name: 'Dubai Creek Harbour', patterns: ['%Dubai Creek Harbour%', '%creek harbour%'] },
      { name: 'Palm Jumeirah', patterns: ['%Palm Jumeirah%', '%palm jumeirah%'] },
      { name: 'JBR', patterns: ['%JBR%', '%Jumeirah Beach Residence%'] },
      { name: 'DAMAC Hills', patterns: ['%DAMAC Hills%', '%damac hills%'] },
      { name: 'Arabian Ranches', patterns: ['%Arabian Ranches%', '%arabian ranches%'] },
      { name: 'Dubai Sports City', patterns: ['%Dubai Sports City%', '%sports city%'] },
      { name: 'Al Barsha', patterns: ['%Al Barsha%', '%al barsha%', '%Barsha%'] },
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
      { name: 'The Greens', patterns: ['%The Greens%', '%greens%'] },
      { name: 'The Views', patterns: ['%The Views%', '%views%'] },
      { name: 'The Lakes', patterns: ['%The Lakes%', '%lakes%'] },
      { name: 'The Meadows', patterns: ['%The Meadows%', '%meadows%'] },
      { name: 'Dubai Healthcare City', patterns: ['%Dubai Healthcare City%', '%DHCC%'] },
      { name: 'Al Quoz', patterns: ['%Al Quoz%', '%al quoz%'] },
    ];

    let totalFixed = 0;

    for (const { name, patterns } of communityPatterns) {
      // Find community ID
      const [found] = await connection.query(
        `SELECT id FROM community WHERE name LIKE ? LIMIT 1`,
        [`%${name}%`]
      );

      if (!found[0]) {
        continue; // Skip if community not found in database
      }

      const communityId = found[0].id;

      // Build WHERE conditions for all patterns
      const conditions = patterns.map(() => `Description LIKE ?`).join(' OR ');
      
      const [result] = await connection.query(
        `UPDATE project_listing 
         SET community_id = ? 
         WHERE (${conditions})
         AND (community_id IS NULL OR community_id = '')`,
        [communityId, ...patterns]
      );

      if (result.affectedRows > 0) {
        totalFixed += result.affectedRows;
        console.log(`   ✅ ${name}: ${result.affectedRows} projects (ID: ${communityId})`);
      }
    }

    console.log(`\n   Total auto-detected: ${totalFixed} projects\n`);

    // ============================================
    // STEP 6: SET DEFAULT COMMUNITY FOR REMAINING NULL
    // ============================================
    console.log('🔧 Step 6: Setting default community for remaining NULL...\n');

    // Get default community (Business Bay or first available)
    const [defaultCommunity] = await connection.query(
      `SELECT id FROM community WHERE name LIKE '%Business Bay%' LIMIT 1`
    );

    const defaultCommunityId = defaultCommunity[0]?.id || validCommunityIds[0];

    const [setDefaults] = await connection.query(
      `UPDATE project_listing 
       SET community_id = ?
       WHERE (community_id IS NULL OR community_id = '') 
       AND city_id = '1'`,
      [defaultCommunityId]
    );
    console.log(`   ✅ Set default community: ${setDefaults.affectedRows} projects\n`);

    // ============================================
    // STEP 7: VERIFY LocationName AND CityName
    // ============================================
    console.log('🔧 Step 7: Syncing LocationName and CityName...\n');

    // Update CityName based on city_id
    const [syncedCityNames] = await connection.query(
      `UPDATE project_listing pl
       LEFT JOIN cities c ON CAST(pl.city_id AS UNSIGNED) = c.id
       SET pl.CityName = c.name
       WHERE pl.city_id IS NOT NULL AND pl.city_id != ''`
    );
    console.log(`   ✅ Synced CityName: ${syncedCityNames.affectedRows} projects`);

    // Update LocationName based on community_id
    const [syncedLocationNames] = await connection.query(
      `UPDATE project_listing pl
       LEFT JOIN community com ON CAST(pl.community_id AS UNSIGNED) = com.id
       SET pl.LocationName = com.name
       WHERE pl.community_id IS NOT NULL AND pl.community_id != ''`
    );
    console.log(`   ✅ Synced LocationName: ${syncedLocationNames.affectedRows} projects\n`);

    // ============================================
    // STEP 8: FINAL VERIFICATION
    // ============================================
    console.log('📊 Step 8: Final verification...\n');

    const [finalStats] = await connection.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN city_id IS NULL OR city_id = '' THEN 1 ELSE 0 END) as null_city,
        SUM(CASE WHEN community_id IS NULL OR community_id = '' THEN 1 ELSE 0 END) as null_community,
        SUM(CASE WHEN city_id NOT IN (${validCityIds.join(',')}) AND city_id IS NOT NULL AND city_id != '' THEN 1 ELSE 0 END) as wrong_city,
        SUM(CASE WHEN community_id NOT IN (${validCommunityIds.join(',')}) AND community_id IS NOT NULL AND community_id != '' THEN 1 ELSE 0 END) as wrong_community,
        SUM(CASE WHEN city_id IS NOT NULL AND city_id != '' AND community_id IS NOT NULL AND community_id != '' THEN 1 ELSE 0 END) as valid_projects
       FROM project_listing`
    );

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                  FINAL STATISTICS                      ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`   Total Projects: ${finalStats[0].total}`);
    console.log(`   ✅ Valid Projects: ${finalStats[0].valid_projects}`);
    console.log(`   NULL city_id: ${finalStats[0].null_city}`);
    console.log(`   NULL community_id: ${finalStats[0].null_community}`);
    console.log(`   Wrong city_id: ${finalStats[0].wrong_city}`);
    console.log(`   Wrong community_id: ${finalStats[0].wrong_community}\n`);

    // ============================================
    // STEP 9: SHOW SAMPLE FIXED PROJECTS
    // ============================================
    console.log('📋 Sample Fixed Projects:\n');

    const [samples] = await connection.query(
      `SELECT 
         pl.id,
         pl.ProjectName,
         pl.city_id,
         pl.community_id,
         c.name as city_name,
         com.name as community_name
       FROM project_listing pl
       LEFT JOIN cities c ON CAST(pl.city_id AS UNSIGNED) = c.id
       LEFT JOIN community com ON CAST(pl.community_id AS UNSIGNED) = com.id
       WHERE pl.featured_project = '1'
       LIMIT 10`
    );

    samples.forEach(p => {
      console.log(`   ${p.id}. ${p.ProjectName}`);
      console.log(`      City: ${p.city_name} (ID: ${p.city_id})`);
      console.log(`      Community: ${p.community_name} (ID: ${p.community_id})\n`);
    });

    // ============================================
    // STEP 10: IMPROVEMENTS SUMMARY
    // ============================================
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
    console.log(`   ✅ Location Fields Synced: ${syncedCityNames.affectedRows + syncedLocationNames.affectedRows}`);
    console.log('\n✅ All location issues have been fixed!\n');

    // ============================================
    // RECOMMENDATIONS
    // ============================================
    if (finalStats[0].null_community > 0 || finalStats[0].wrong_community > 0) {
      console.log('⚠️  RECOMMENDATIONS:\n');
      
      if (finalStats[0].null_community > 0) {
        console.log(`   • ${finalStats[0].null_community} projects still have NULL community_id`);
        console.log('     Run this script again or manually assign communities\n');
      }
      
      if (finalStats[0].wrong_community > 0) {
        console.log(`   • ${finalStats[0].wrong_community} projects have invalid community_id`);
        console.log('     Check database for orphaned community records\n');
      }
    }

    console.log('Next Steps:');
    console.log('   1. Restart backend server');
    console.log('   2. Test API: GET /api/v1/projects/featured');
    console.log('   3. Check frontend UI for location display\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    connection.release();
    process.exit();
  }
};

// Run the script
fixAllProjectLocations();