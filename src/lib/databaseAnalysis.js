import { supabase } from './supabaseClient';

// Comprehensive database analysis
export const analyzeDatabaseData = async () => {
  const analysis = {
    tables: {},
    dataCounts: {},
    relationships: {},
    sampleData: {},
    issues: []
  };

  try {
    // 1. Check table accessibility and basic counts
    const tables = [
      'visns',
      'va_facilities',
      'user_submitted_complaints',
      'oig_report_entries',
      'scorecards',
      'analytics',
      'congressional_representatives'
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        analysis.tables[table] = {
          accessible: !error,
          error: error?.message || null
        };
      } catch (err) {
        analysis.tables[table] = {
          accessible: false,
          error: err.message
        };
      }
    }

    // 2. Analyze facility data
    if (analysis.tables.va_facilities?.accessible) {
      const { data: facilities, error } = await supabase
        .from('va_facilities')
        .select('*');
      
      if (!error && facilities) {
        analysis.sampleData.facilities = facilities.slice(0, 5);
        
        // Group by VISN
        const visnGroups = facilities.reduce((acc, facility) => {
          const visn = facility.visn || 'Unknown';
          acc[visn] = (acc[visn] || 0) + 1;
          return acc;
        }, {});
        
        analysis.relationships.facilitiesByVISN = visnGroups;
      }
    }

    // 3. Analyze complaint data
    if (analysis.tables.user_submitted_complaints?.accessible) {
      const { data: complaints, error } = await supabase
        .from('user_submitted_complaints')
        .select('*');
      
      if (!error && complaints) {
        analysis.sampleData.complaints = complaints.slice(0, 5);
        
        // Status distribution
        const statusGroups = complaints.reduce((acc, complaint) => {
          const status = complaint.status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        
        // Category distribution
        const categoryGroups = complaints.reduce((acc, complaint) => {
          const category = complaint.category || 'unknown';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});
        
        // Facility linking
        const withFacilityId = complaints.filter(c => c.facility_id).length;
        const withoutFacilityId = complaints.filter(c => !c.facility_id).length;
        
        analysis.relationships.complaints = {
          statusDistribution: statusGroups,
          categoryDistribution: categoryGroups,
          facilityLinking: {
            withFacilityId,
            withoutFacilityId,
            linkingRate: complaints.length > 0 ? (withFacilityId / complaints.length * 100).toFixed(1) : 0
          }
        };
      }
    }

    // 4. Analyze OIG report data
    if (analysis.tables.oig_report_entries?.accessible) {
      const { data: oigReports, error } = await supabase
        .from('oig_report_entries')
        .select('*');
      
      if (!error && oigReports) {
        analysis.sampleData.oigReports = oigReports.slice(0, 5);
        
        // Facility linking
        const withFacilityId = oigReports.filter(r => r.facility_id).length;
        const withoutFacilityId = oigReports.filter(r => !r.facility_id).length;
        
        analysis.relationships.oigReports = {
          facilityLinking: {
            withFacilityId,
            withoutFacilityId,
            linkingRate: oigReports.length > 0 ? (withFacilityId / oigReports.length * 100).toFixed(1) : 0
          }
        };
      }
    }

    // 5. Analyze scorecard data
    if (analysis.tables.scorecards?.accessible) {
      const { data: scorecards, error } = await supabase
        .from('scorecards')
        .select('*');
      
      if (!error && scorecards) {
        analysis.sampleData.scorecards = scorecards.slice(0, 5);
        
        // Score distribution by entity type
        const scoreDistribution = scorecards.reduce((acc, scorecard) => {
          const type = scorecard.entity_type || 'unknown';
          if (!acc[type]) {
            acc[type] = { count: 0, avgScore: 0, scores: [] };
          }
          acc[type].count++;
          acc[type].scores.push(scorecard.score || 0);
          return acc;
        }, {});
        
        // Calculate averages
        Object.keys(scoreDistribution).forEach(type => {
          const scores = scoreDistribution[type].scores;
          scoreDistribution[type].avgScore = scores.length > 0 ? 
            (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1) : 0;
        });
        
        analysis.relationships.scorecards = scoreDistribution;
      }
    }

    // 6. Check for data quality issues
    
    // Check for facilities without VISN (only flag if significant portion)
    if (analysis.sampleData.facilities) {
      const facilitiesWithoutVISN = analysis.sampleData.facilities.filter(f => !f.visn_id && !f.visn);
      const totalFacilities = analysis.sampleData.facilities.length;
      const missingPercentage = totalFacilities > 0 ? (facilitiesWithoutVISN.length / totalFacilities) * 100 : 0;
      
      if (missingPercentage > 30) {
        analysis.issues.push(`${Math.round(missingPercentage)}% of facilities missing VISN information`);
      }
    }
    
    // Check for complaints without facility links (only flag if very low)
    if (analysis.relationships.complaints?.facilityLinking) {
      const linkingRate = parseFloat(analysis.relationships.complaints.facilityLinking.linkingRate);
      if (linkingRate < 20) {
        analysis.issues.push(`Very low complaint-facility linking rate: ${linkingRate}%`);
      }
    }
    
    // Check for OIG reports without facility links (only flag if very low)
    if (analysis.relationships.oigReports?.facilityLinking) {
      const linkingRate = parseFloat(analysis.relationships.oigReports.facilityLinking.linkingRate);
      if (linkingRate < 20) {
        analysis.issues.push(`Very low OIG report-facility linking rate: ${linkingRate}%`);
      }
    }

    return analysis;

  } catch (error) {
    analysis.issues.push(`Analysis failed: ${error.message}`);
    return analysis;
  }
};

// Generate a summary report
export const generateAnalysisReport = (analysis) => {
  const report = {
    summary: {
      totalTables: Object.keys(analysis.tables).length,
      accessibleTables: Object.keys(analysis.tables).filter(t => analysis.tables[t].accessible).length,
      totalRecords: Object.values(analysis.dataCounts).reduce((sum, count) => sum + count, 0),
      issuesFound: analysis.issues.length
    },
    dataCounts: analysis.dataCounts,
    relationships: analysis.relationships,
    issues: analysis.issues,
    recommendations: []
  };

  // Generate recommendations based on analysis
  if (analysis.issues.length > 0) {
    report.recommendations.push('Review and address data quality issues listed above');
  }
  
  // Only show recommendations if there's actually data to work with
  const hasFacilities = analysis.dataCounts.va_facilities > 0;
  const hasComplaints = analysis.dataCounts.user_submitted_complaints > 0;
  const hasOIGReports = analysis.dataCounts.oig_report_entries > 0;
  const hasScorecards = analysis.dataCounts.scorecards > 0;
  
  if (hasFacilities && !hasComplaints) {
    report.recommendations.push('Add complaint data to enable facility performance analysis');
  }
  
  if (hasFacilities && !hasOIGReports) {
    report.recommendations.push('Add OIG report data to enhance facility accountability scoring');
  }
  
  if (hasFacilities && !hasScorecards) {
    report.recommendations.push('Generate scorecards to provide performance metrics');
  }
  
  if (!hasFacilities) {
    report.recommendations.push('Add VA facility data to begin platform setup');
  }
  
  // Only show data volume recommendations if there's some data
  if (hasComplaints && analysis.dataCounts.user_submitted_complaints < 5) {
    report.recommendations.push('Add more complaint data for comprehensive trend analysis');
  }
  
  if (hasOIGReports && analysis.dataCounts.oig_report_entries < 3) {
    report.recommendations.push('Add more OIG reports for better compliance tracking');
  }

  return report;
};

// Export analysis results for use in components
export const getAnalysisForDataAnalysisPage = async () => {
  const analysis = await analyzeDatabaseData();
  const report = generateAnalysisReport(analysis);
  
  return {
    analysis,
    report,
    hasRealData: report.summary.totalRecords > 0,
    dataQuality: report.summary.issuesFound === 0 ? 'good' : 'needs_attention',
    // Add more detailed quality assessment
    qualityDetails: {
      totalIssues: report.summary.issuesFound,
      hasCriticalIssues: report.summary.issuesFound > 2,
      dataCompleteness: report.summary.totalRecords > 100 ? 'good' : 'developing'
    }
  };
}; 