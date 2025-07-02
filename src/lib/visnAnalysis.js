import { supabase } from './supabaseClient';

// Quick VISN analysis to check data consistency
export const analyzeVISNData = async () => {
  // Get all VISNs
  const { data: visns, error: visnsError } = await supabase
    .from('visns')
    .select('*');
  
  if (visnsError) {
    return { error: visnsError.message };
  }

  // Get all facilities with their VISN info
  const { data: facilities, error: facilitiesError } = await supabase
    .from('va_facilities')
    .select('*');
  
  if (facilitiesError) {
    return { error: facilitiesError.message };
  }

  // Analyze VISN distribution
  const visnAnalysis = {
    totalVISNs: visns?.length || 0,
    totalFacilities: facilities?.length || 0,
    visnList: visns || [],
    facilityDistribution: {},
    issues: []
  };

  // Group facilities by VISN
  if (facilities) {
    facilities.forEach(facility => {
      const visnName = facility.visn || facility.visn_id || 'Unknown';
      if (!visnAnalysis.facilityDistribution[visnName]) {
        visnAnalysis.facilityDistribution[visnName] = {
          count: 0,
          facilities: []
        };
      }
      visnAnalysis.facilityDistribution[visnName].count++;
      visnAnalysis.facilityDistribution[visnName].facilities.push({
        id: facility.id,
        name: facility.name,
        city: facility.city,
        state: facility.state
      });
    });
  }

  // Check for issues
  if (visnAnalysis.totalVISNs > 1) {
    visnAnalysis.issues.push(`Multiple VISNs found (${visnAnalysis.totalVISNs}). Expected only VISN 7.`);
  }

  if (visnAnalysis.totalVISNs === 0) {
    visnAnalysis.issues.push('No VISNs found in database.');
  }

  // Check if facilities are properly linked to VISNs
  const unlinkedFacilities = facilities?.filter(f => !f.visn && !f.visn_id) || [];
  if (unlinkedFacilities.length > 0) {
    visnAnalysis.issues.push(`${unlinkedFacilities.length} facilities are not linked to any VISN.`);
  }

  return visnAnalysis;
};

// Get detailed VISN breakdown
export const getVISNBreakdown = async () => {
  const analysis = await analyzeVISNData();
  
  if (analysis.error) {
    return { error: analysis.error };
  }

  const breakdown = {
    summary: {
      totalVISNs: analysis.totalVISNs,
      totalFacilities: analysis.totalFacilities,
      issuesFound: analysis.issues.length
    },
    visnDetails: Object.entries(analysis.facilityDistribution).map(([visnName, data]) => ({
      visn: visnName,
      facilityCount: data.count,
      facilities: data.facilities.slice(0, 5), // Show first 5 facilities
      hasMore: data.facilities.length > 5
    })),
    issues: analysis.issues
  };

  return breakdown;
}; 