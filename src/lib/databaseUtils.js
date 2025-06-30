import { supabase } from './supabaseClient';

// Check if database tables exist and are accessible
export const checkDatabaseTables = async () => {
  console.log('🔍 Checking database table accessibility...');
  
  const tables = [
    'visns',
    'va_facilities', 
    'scorecards',
    'user_submitted_complaints',
    'analytics',
    'congressional_representatives',
    'oig_report_entries'
  ];
  
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ ${table}: ${error.message}`);
        results[table] = { accessible: false, error: error.message };
      } else {
        console.log(`✅ ${table}: Accessible`);
        results[table] = { accessible: true };
      }
    } catch (error) {
      console.error(`❌ ${table}: ${error.message}`);
      results[table] = { accessible: false, error: error.message };
    }
  }
  
  const accessibleTables = Object.keys(results).filter(table => results[table].accessible);
  const inaccessibleTables = Object.keys(results).filter(table => !results[table].accessible);
  
  console.log(`📊 Summary: ${accessibleTables.length}/${tables.length} tables accessible`);
  
  if (inaccessibleTables.length > 0) {
    console.warn('⚠️ Inaccessible tables:', inaccessibleTables);
    console.log('💡 This might be normal if tables haven\'t been created yet');
  }
  
  return results;
};

// Safe database query wrapper
const safeQuery = async (tableName, queryFn) => {
  try {
    const result = await queryFn();
    return { success: true, data: result.data, count: result.count, error: null };
  } catch (error) {
    console.error(`❌ ${tableName} query failed:`, error);
    return { success: false, data: null, count: 0, error };
  }
};

// Fetch national dashboard data
export const fetchNationalDashboardData = async () => {
  try {
    console.log('🔍 Fetching national dashboard data...');
    
    // Check table accessibility first
    const tableStatus = await checkDatabaseTables();
    const accessibleTables = Object.keys(tableStatus).filter(table => tableStatus[table].accessible);
    
    if (accessibleTables.length === 0) {
      console.warn('⚠️ No tables are accessible. Database may be empty or tables may not exist.');
      return getDefaultData();
    }
    
    // Fetch national scorecard
    console.log('📊 Fetching national scorecard...');
    let nationalScorecard = null;
    if (tableStatus.scorecards?.accessible) {
      const { data, error } = await supabase
        .from('scorecards')
        .select('*')
        .eq('entity_type', 'national')
        .single();
      
      if (!error) {
        nationalScorecard = data;
      } else if (error.code !== 'PGRST116') {
        console.error('❌ Scorecard error:', error);
      }
    }

    // Fetch facility counts
    console.log('🏥 Fetching facility counts...');
    let totalFacilities = 0;
    if (tableStatus.va_facilities?.accessible) {
      const { count, error } = await supabase
        .from('va_facilities')
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        totalFacilities = count || 0;
      } else {
        console.error('❌ Facilities error:', error);
      }
    }

    // Fetch complaint counts
    console.log('📝 Fetching complaint counts...');
    let totalComplaints = 0;
    let pendingCases = 0;
    
    if (tableStatus.user_submitted_complaints?.accessible) {
      const { count: complaintsCount, error: complaintsError } = await supabase
        .from('user_submitted_complaints')
        .select('*', { count: 'exact', head: true });

      const { count: pendingCount, error: pendingError } = await supabase
        .from('user_submitted_complaints')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (!complaintsError) {
        totalComplaints = complaintsCount || 0;
      } else {
        console.error('❌ Complaints error:', complaintsError);
      }
      
      if (!pendingError) {
        pendingCases = pendingCount || 0;
      } else {
        console.error('❌ Pending cases error:', pendingError);
      }
    }

    // Fetch analytics trends
    console.log('📈 Fetching analytics trends...');
    let analyticsData = null;
    if (tableStatus.analytics?.accessible) {
      const { data, error } = await supabase
        .from('analytics')
        .select('trends')
        .eq('data_type', 'national_trends')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!error) {
        analyticsData = data;
      } else if (error.code !== 'PGRST116') {
        console.error('❌ Analytics error:', error);
      }
    }

    // Fetch facility score distributions
    console.log('📊 Fetching facility score distributions...');
    let criticalFacilities = 0;
    let warningFacilities = 0;
    
    if (tableStatus.scorecards?.accessible) {
      const { count: criticalCount, error: criticalError } = await supabase
        .from('scorecards')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', 'facility')
        .lt('score', 20);

      const { count: warningCount, error: warningError } = await supabase
        .from('scorecards')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', 'facility')
        .gte('score', 20)
        .lt('score', 50);
      
      if (!criticalError) {
        criticalFacilities = criticalCount || 0;
      } else {
        console.error('❌ Critical facilities error:', criticalError);
      }
      
      if (!warningError) {
        warningFacilities = warningCount || 0;
      } else {
        console.error('❌ Warning facilities error:', warningError);
      }
    }

    // Fetch congressional representatives
    console.log('🏛️ Fetching congressional representatives...');
    let representatives = [];
    if (tableStatus.congressional_representatives?.accessible) {
      const { data, error } = await supabase
        .from('congressional_representatives')
        .select('*')
        .or('office_title.ilike.%VA Committee%,office_title.ilike.%Veterans%')
        .limit(4);
      
      if (!error) {
        representatives = data || [];
      } else {
        console.error('❌ Representatives error:', error);
      }
    }

    // Calculate national scores from scorecard data
    const nationalScore = nationalScorecard?.score || 0;
    const nationalIntegrityScore = nationalScorecard?.data_summary?.integrity_score || 0;

    // Extract trends from analytics data
    const trends = analyticsData?.trends || {
      score: 0,
      integrityScore: 0,
      complaints: 0,
      resolution: 0
    };

    // Transform representatives data
    const transformedReps = representatives.map(rep => ({
      name: rep.representative_name,
      role: rep.office_title,
      party: rep.party,
      state: rep.state,
      district: rep.district,
      contactUrl: rep.contact_url,
      email: rep.email,
      phone: rep.phone,
      score: 0 // Would need calculation based on jurisdiction
    }));

    const result = {
      nationalScore: parseFloat(nationalScore),
      nationalIntegrityScore: parseFloat(nationalIntegrityScore),
      totalFacilities: totalFacilities,
      criticalFacilities: criticalFacilities,
      warningFacilities: warningFacilities,
      totalComplaints: totalComplaints,
      pendingCases: pendingCases,
      trends: {
        score: parseFloat(trends.score || 0),
        integrityScore: parseFloat(trends.integrity_score || 0),
        complaints: parseFloat(trends.complaints || 0),
        resolution: parseFloat(trends.resolution || 0)
      },
      representatives: transformedReps
    };

    console.log('✅ Dashboard data fetched successfully:', result);
    return result;
    
  } catch (error) {
    console.error("❌ Error in fetchNationalDashboardData:", error);
    return getDefaultData();
  }
};

// Get default data when database is not available
const getDefaultData = () => {
  console.log('📋 Using default data (database not available)');
  return {
    nationalScore: 0,
    nationalIntegrityScore: 0,
    totalFacilities: 0,
    criticalFacilities: 0,
    warningFacilities: 0,
    totalComplaints: 0,
    pendingCases: 0,
    trends: {
      score: 0,
      integrityScore: 0,
      complaints: 0,
      resolution: 0
    },
    representatives: []
  };
};

// Fetch facility data
export const fetchFacilityData = async (facilityId) => {
  try {
    const { data: facility, error: facilityError } = await supabase
      .from('va_facilities')
      .select('*')
      .eq('id', facilityId)
      .single();

    const { data: scorecard, error: scorecardError } = await supabase
      .from('scorecards')
      .select('*')
      .eq('entity_type', 'facility')
      .eq('entity_id', facilityId)
      .single();

    const { data: complaints, error: complaintsError } = await supabase
      .from('user_submitted_complaints')
      .select('*')
      .eq('facility_id', facilityId)
      .order('submitted_at', { ascending: false });

    const { data: oigReports, error: oigError } = await supabase
      .from('oig_report_entries')
      .select('*')
      .eq('facility_id', facilityId)
      .order('report_date', { ascending: false });

    if (facilityError || scorecardError) {
      throw new Error("Failed to fetch facility data");
    }

    return {
      facility,
      scorecard,
      complaints: complaints || [],
      oigReports: oigReports || []
    };
  } catch (error) {
    console.error("Error in fetchFacilityData:", error);
    throw error;
  }
};

// Fetch VISN data
export const fetchVISNData = async (visnId) => {
  try {
    const { data: visn, error: visnError } = await supabase
      .from('visns')
      .select('*')
      .eq('id', visnId)
      .single();

    const { data: facilities, error: facilitiesError } = await supabase
      .from('va_facilities')
      .select('*')
      .eq('visn_id', visnId);

    const { data: scorecard, error: scorecardError } = await supabase
      .from('scorecards')
      .select('*')
      .eq('entity_type', 'visn')
      .eq('entity_id', visnId)
      .single();

    if (visnError || scorecardError) {
      throw new Error("Failed to fetch VISN data");
    }

    return {
      visn,
      facilities: facilities || [],
      scorecard
    };
  } catch (error) {
    console.error("Error in fetchVISNData:", error);
    throw error;
  }
};

// Insert sample data for testing
export const insertSampleData = async () => {
  try {
    // Insert sample national scorecard
    const { error: scorecardError } = await supabase
      .from('scorecards')
      .upsert({
        entity_type: 'national',
        entity_id: '00000000-0000-0000-0000-000000000000',
        score: 42.3,
        data_summary: {
          integrity_score: 35.5,
          total_facilities: 1255,
          critical_facilities: 89,
          warning_facilities: 234
        },
        criteria: {
          performance_weight: 0.6,
          integrity_weight: 0.4
        }
      });

    // Insert sample analytics data
    const { error: analyticsError } = await supabase
      .from('analytics')
      .upsert({
        data_type: 'national_trends',
        trends: {
          score: -5.2,
          integrity_score: -8.1,
          complaints: 12.4,
          resolution: -8.1
        }
      });

    // Insert sample congressional representatives
    const { error: repsError } = await supabase
      .from('congressional_representatives')
      .upsert([
        {
          representative_name: 'House Veterans Affairs Committee',
          office_title: 'House Veterans Affairs Committee',
          party: 'Bipartisan',
          state: 'DC',
          contact_url: 'https://veterans.house.gov/',
          email: 'veterans@house.gov'
        },
        {
          representative_name: 'Senate Veterans Affairs Committee',
          office_title: 'Senate Veterans Affairs Committee',
          party: 'Bipartisan',
          state: 'DC',
          contact_url: 'https://www.veterans.senate.gov/',
          email: 'veterans@senate.gov'
        }
      ]);

    if (scorecardError || analyticsError || repsError) {
      console.error("Errors inserting sample data:", { scorecardError, analyticsError, repsError });
    } else {
      console.log("Sample data inserted successfully");
    }
  } catch (error) {
    console.error("Error inserting sample data:", error);
  }
};

// Calculate representative scores based on jurisdiction
export const calculateRepresentativeScore = async (representativeId) => {
  try {
    // This would need to be implemented based on the specific logic
    // for calculating representative scores based on facilities in their jurisdiction
    return 0;
  } catch (error) {
    console.error("Error calculating representative score:", error);
    return 0;
  }
}; 