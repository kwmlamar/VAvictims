import { supabase } from './supabaseClient';

// Check if database tables are accessible
export const checkDatabaseTables = async () => {
  const tables = [
    'va_facilities',
    'scorecards', 
    'user_submitted_complaints',
    'oig_report_entries',
    'visns',
    'analytics',
    'congressional_representatives'
  ];

  const results = {};

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      results[table] = {
        accessible: !error,
        error: error?.message || null
      };
    } catch (err) {
      results[table] = {
        accessible: false,
        error: err.message
      };
    }
  }

  return results;
};

// Fetch national dashboard data
export const fetchNationalDashboardData = async () => {
  try {
    // Fetch national scorecard
    const { data: scorecard, error: scorecardError } = await supabase
      .from('scorecards')
      .select('*')
      .eq('entity_type', 'national')
      .single();

    // Fetch analytics data
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .eq('data_type', 'national_trends')
      .single();

    // Fetch congressional representatives
    const { data: representatives, error: repsError } = await supabase
      .from('congressional_representatives')
      .select('*')
      .order('representative_name');

    // Fetch facility counts
    const { count: totalFacilities } = await supabase
      .from('va_facilities')
      .select('*', { count: 'exact', head: true });

    // Fetch critical facilities (score < 20)
    const { count: criticalFacilities } = await supabase
      .from('va_facilities')
      .select('*', { count: 'exact', head: true })
      .lt('score', 20);

    // Fetch warning facilities (score < 50)
    const { count: warningFacilities } = await supabase
      .from('va_facilities')
      .select('*', { count: 'exact', head: true })
      .lt('score', 50);

    // Fetch complaint counts
    const { count: totalComplaints } = await supabase
      .from('user_submitted_complaints')
      .select('*', { count: 'exact', head: true });

    // Fetch pending cases
    const { count: pendingCases } = await supabase
      .from('user_submitted_complaints')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (scorecardError || analyticsError || repsError) {
      throw new Error("Failed to fetch dashboard data");
    }

    // Transform representatives data
    const transformedReps = (representatives || []).map(rep => ({
      name: rep.representative_name,
      title: rep.office_title,
      party: rep.party,
      state: rep.state,
      contactUrl: rep.contact_url,
      email: rep.email
    }));

    // Extract trends data
    const trends = analytics?.trends || {};

    const result = {
      nationalScore: parseFloat(scorecard?.score || 0),
      nationalIntegrityScore: parseFloat(scorecard?.data_summary?.integrity_score || 0),
      totalFacilities: totalFacilities || 0,
      criticalFacilities: criticalFacilities || 0,
      warningFacilities: warningFacilities || 0,
      totalComplaints: totalComplaints || 0,
      pendingCases: pendingCases || 0,
      trends: {
        score: parseFloat(trends.score || 0),
        integrityScore: parseFloat(trends.integrity_score || 0),
        complaints: parseFloat(trends.complaints || 0),
        resolution: parseFloat(trends.resolution || 0)
      },
      representatives: transformedReps
    };

    return result;
    
  } catch (error) {
    return getDefaultData();
  }
};

// Get default data when database is not available
const getDefaultData = () => {
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

  const { data: complaints } = await supabase
    .from('user_submitted_complaints')
    .select('*')
    .eq('facility_id', facilityId)
    .order('submitted_at', { ascending: false });

  const { data: oigReports } = await supabase
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
};

// Fetch VISN data
export const fetchVISNData = async (visnId) => {
  const { data: visn, error: visnError } = await supabase
    .from('visns')
    .select('*')
    .eq('id', visnId)
    .single();

  const { data: facilities } = await supabase
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
      // Handle errors silently for now
    }
  } catch (error) {
    // Handle errors silently for now
  }
};

// Calculate representative scores based on jurisdiction
export const calculateRepresentativeScore = async () => {
  // This would need to be implemented based on the specific logic
  // for calculating representative scores based on facilities in their jurisdiction
  return 0;
};
