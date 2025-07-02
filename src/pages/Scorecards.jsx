import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { BarChart3, TrendingDown, AlertTriangle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ScoreCard from '@/components/ScoreCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabaseClient';
import { checkDatabaseTables } from '@/lib/databaseUtils';

const Scorecards = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('national');
  const [scorecardData, setScorecardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScorecardData = async () => {
      setLoading(true);
      try {
        // Check table accessibility first
        const tableStatus = await checkDatabaseTables();
        const accessibleTables = Object.keys(tableStatus).filter(table => tableStatus[table].accessible);
        
        if (accessibleTables.length === 0) {
          setScorecardData(getDefaultScorecardData());
          return;
        }

        // Fetch national scorecard
        let nationalData = getDefaultNationalData();
        if (tableStatus.scorecards?.accessible) {
          const { data: nationalScorecard, error } = await supabase
            .from('scorecards')
            .select('*')
            .eq('entity_type', 'national')
            .single();
          
          if (!error && nationalScorecard) {
            nationalData = {
              score: parseFloat(nationalScorecard.score || 0),
              integrityScore: parseFloat(nationalScorecard.data_summary?.integrity_score || 0),
              issues: nationalScorecard.data_summary?.issues || ['Patient Safety Violations', 'Leadership Distrust', 'Retaliation Reports', 'Survey Compliance Issues'],
              integrityIssues: nationalScorecard.data_summary?.integrity_issues || ['Obstruction of Investigations', 'Withholding Evidence', 'Systemic Cover-ups'],
              representatives: nationalScorecard.data_summary?.representatives || getDefaultRepresentatives(),
              representativeScoreFormula: nationalScorecard.data_summary?.representative_score_formula || "Avg. Facility Scores (Jurisdiction) * 0.6 + Avg. VISN Integrity (Jurisdiction) * 0.4 - Penalties for unaddressed critical issues.",
              formula: nationalScorecard.data_summary?.formula || 'Average of lowest 50% VISNs + lowest VISN score ÷ 2',
              explanation: nationalScorecard.data_summary?.explanation || 'Score reflects systemic issues across multiple VISNs with particular concern in patient safety and leadership accountability.',
              integrityFormula: nationalScorecard.data_summary?.integrity_formula || 'Base 100% - Sum of deductions for documented integrity violations (obstruction, retaliation, etc.)',
              integrityExplanation: nationalScorecard.data_summary?.integrity_explanation || 'National integrity score reflects documented instances of obstruction, retaliation, cover-ups, and other integrity violations across VA operations.',
              integritySources: nationalScorecard.data_summary?.integrity_sources || [{ name: "OIG Report VA-2023-0117", url: "#" }, { name: "GAO Findings on VA Whistleblowers", url: "#" }],
              entities: nationalScorecard.data_summary?.entities || ['OIG', 'OGC', 'HR', 'VBA', 'OAWP', 'VACO']
            };
          }
        }

        // Fetch VISN scorecards
        let visnsData = [];
        if (tableStatus.scorecards?.accessible && tableStatus.visns?.accessible) {
          const { data: visnScorecards, error: visnError } = await supabase
            .from('scorecards')
            .select('*')
            .eq('entity_type', 'visn');
          
          const { data: visns, error: visnsError } = await supabase
            .from('visns')
            .select('*');
          
          if (!visnError && !visnsError && visnScorecards && visns) {
            visnsData = visnScorecards.map(scorecard => {
              const visn = visns.find(v => v.id === scorecard.entity_id);
              return {
                id: visn?.name || scorecard.entity_id,
                name: visn?.name || `VISN ${scorecard.entity_id}`,
                score: parseFloat(scorecard.score || 0),
                integrityScore: parseFloat(scorecard.data_summary?.integrity_score || 0),
                facilities: scorecard.data_summary?.facility_count || 0,
                issues: scorecard.data_summary?.issues || ['Survey Compliance'],
                integrityIssues: scorecard.data_summary?.integrity_issues || ['Minor reporting discrepancies'],
                representatives: scorecard.data_summary?.representatives || getDefaultRepresentatives(),
                representativeScoreFormula: scorecard.data_summary?.representative_score_formula || "Avg. Facility Scores (Jurisdiction) * 0.6 + Avg. VISN Integrity (Jurisdiction) * 0.4 - Penalties for unaddressed critical issues within this VISN.",
                formula: scorecard.data_summary?.formula || 'Average of bottom 50% facilities + lowest facility score ÷ 2',
                explanation: scorecard.data_summary?.explanation || 'VISN performance based on facility scores and compliance metrics.',
                integrityFormula: scorecard.data_summary?.integrity_formula || 'Admin Defined: Base 100% - Deductions for specific integrity breaches within VISN facilities.',
                integrityExplanation: scorecard.data_summary?.integrity_explanation || 'VISN integrity reflects the aggregate of facility integrity issues and VISN-level oversight failures.'
              };
            });
          }
        }

        // Fetch facility scorecards
        let facilitiesData = [];
        if (tableStatus.scorecards?.accessible && tableStatus.va_facilities?.accessible) {
          const { data: facilityScorecards, error: facilityScorecardError } = await supabase
            .from('scorecards')
            .select('*')
            .eq('entity_type', 'facility')
            .limit(10); // Limit to prevent overwhelming the UI
          
          const { data: facilities, error: facilitiesError } = await supabase
            .from('va_facilities')
            .select('*');
          
          if (!facilityScorecardError && !facilitiesError && facilityScorecards && facilities) {
            facilitiesData = facilityScorecards.map(scorecard => {
              const facility = facilities.find(f => f.id === scorecard.entity_id);
              return {
                id: facility?.id || scorecard.entity_id,
                name: facility?.name || `Facility ${scorecard.entity_id}`,
                score: parseFloat(scorecard.score || 0),
                integrityScore: parseFloat(scorecard.data_summary?.integrity_score || 0),
                visn: facility?.visn || 'Unknown VISN',
                issues: scorecard.data_summary?.issues || ['Survey Compliance'],
                integrityIssues: scorecard.data_summary?.integrity_issues || ['Minor reporting discrepancies'],
                representatives: scorecard.data_summary?.representatives || getDefaultRepresentatives(),
                representativeScoreFormula: scorecard.data_summary?.representative_score_formula || "Rep. Score = (Facility Score * 0.5) + (Facility Integrity * 0.5) - Direct Penalties. Based on performance of this specific facility.",
                director: facility?.director_name || 'Unknown',
                directorScore: scorecard.data_summary?.director_score || 0,
                directorTenure: scorecard.data_summary?.director_tenure || 'Unknown',
                formula: scorecard.data_summary?.formula || 'Base 100% - Patient Safety (-45%) - Leadership (-25%) - Retaliation (-11.8%)',
                explanation: scorecard.data_summary?.explanation || 'Facility performance based on safety, leadership, and compliance metrics.',
                integrityFormula: scorecard.data_summary?.integrity_formula || 'Base 100% - Obstruction (-30%) - Retaliation (-25%) - Cover-ups (-20%) - Withholding Evidence (-14.5%)',
                integrityExplanation: scorecard.data_summary?.integrity_explanation || 'Facility integrity reflects documented instances of interference and lack of transparency.',
                integritySources: scorecard.data_summary?.integrity_sources || [{name: "Internal Audit Findings", url:"#"}]
              };
            });
          }
        }

        // Get facility counts for summary cards
        let criticalFacilities = 0;
        let warningFacilities = 0;
        let totalFacilities = 0;
        
        if (tableStatus.scorecards?.accessible) {
          const { count: criticalCount } = await supabase
            .from('scorecards')
            .select('*', { count: 'exact', head: true })
            .eq('entity_type', 'facility')
            .lt('score', 20);
          
          const { count: warningCount } = await supabase
            .from('scorecards')
            .select('*', { count: 'exact', head: true })
            .eq('entity_type', 'facility')
            .gte('score', 20)
            .lt('score', 50);
          
          const { count: totalCount } = await supabase
            .from('va_facilities')
            .select('*', { count: 'exact', head: true });
          
          criticalFacilities = criticalCount || 0;
          warningFacilities = warningCount || 0;
          totalFacilities = totalCount || 0;
        }

        const result = {
          national: nationalData,
          visns: visnsData,
          facilities: facilitiesData,
          summary: {
            criticalFacilities,
            warningFacilities,
            totalFacilities
          }
        };

        setScorecardData(result);
        
      } catch (error) {
        toast({
          title: "Error Fetching Scorecards",
          description: "Could not load scorecard data. " + error.message,
          variant: "destructive",
        });
        setScorecardData(getDefaultScorecardData());
      } finally {
        setLoading(false);
      }
    };

    fetchScorecardData();
  }, [toast, getDefaultNationalData, getDefaultScorecardData]);

  // Helper functions for default data
  const getDefaultRepresentatives = () => [
    { name: 'Veterans Affairs Committee', role: 'House Oversight', score: 38.2, contactUrl: 'https://veterans.house.gov/' },
    { name: 'Senate VA Committee', role: 'Senate Oversight', score: 41.7, contactUrl: 'https://www.veterans.senate.gov/' }
  ];

  const getDefaultNationalData = useCallback(() => ({
    score: 0,
    integrityScore: 0,
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
  }), []);

  const getDefaultScorecardData = useCallback(() => ({
    national: getDefaultNationalData(),
    visns: [],
    facilities: []
  }), [getDefaultNationalData]);

  const handleExportData = () => {
    toast({
      title: "🚧 Export Feature Coming Soon",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="ios-card p-8 loading-shimmer h-64" />
        <div className="ios-card p-8 loading-shimmer h-96" />
      </div>
    );
  }
  
  if (!scorecardData) {
    return (
       <div className="text-center py-12">
           <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
           <h3 className="text-xl font-semibold text-white mb-2">Could not load scorecard data</h3>
           <p className="text-blue-200">Please try refreshing the page or check back later.</p>
       </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Scorecards - VA Accountability Platform</title>
        <meta name="description" content="Comprehensive scorecards for VA facilities, VISNs, and national performance with detailed metrics and accountability tracking." />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
        >
          <div>
            <h1 className="text-4xl font-bold text-white">Performance & Integrity Scorecards</h1>
            <p className="text-xl text-blue-200 mt-2">
              Comprehensive accountability metrics and performance tracking
            </p>
          </div>
          <Button 
            onClick={handleExportData}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="national" className="data-[state=active]:bg-blue-600">
                National
              </TabsTrigger>
              <TabsTrigger value="visns" className="data-[state=active]:bg-blue-600">
                VISNs
              </TabsTrigger>
              <TabsTrigger value="facilities" className="data-[state=active]:bg-blue-600">
                Facilities
              </TabsTrigger>
            </TabsList>

            <TabsContent value="national" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ScoreCard
                  title="National VA Scorecard"
                  score={scorecardData.national.score}
                  integrityScore={scorecardData.national.integrityScore}
                  type="national"
                  issues={scorecardData.national.issues}
                  integrityIssues={scorecardData.national.integrityIssues}
                  representatives={scorecardData.national.representatives}
                  representativeScoreFormula={scorecardData.national.representativeScoreFormula}
                  formula={scorecardData.national.formula}
                  explanation={scorecardData.national.explanation}
                  integrityFormula={scorecardData.national.integrityFormula}
                  integrityExplanation={scorecardData.national.integrityExplanation}
                  integritySources={scorecardData.national.integritySources}
                  entities={scorecardData.national.entities}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="visns" className="space-y-6">
              {scorecardData.visns.map((visn, index) => (
                <motion.div
                  key={visn.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <ScoreCard
                    title={visn.name}
                    score={visn.score}
                    integrityScore={visn.integrityScore}
                    type="visn"
                    issues={visn.issues}
                    integrityIssues={visn.integrityIssues}
                    representatives={visn.representatives}
                    representativeScoreFormula={visn.representativeScoreFormula}
                    formula={visn.formula}
                    explanation={visn.explanation}
                    integrityFormula={visn.integrityFormula}
                    integrityExplanation={visn.integrityExplanation}
                    facilities={visn.facilities}
                  />
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="facilities" className="space-y-6">
              {scorecardData.facilities.map((facility, index) => (
                <motion.div
                  key={facility.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <ScoreCard
                    title={facility.name}
                    score={facility.score}
                    integrityScore={facility.integrityScore}
                    type="facility"
                    issues={facility.issues}
                    integrityIssues={facility.integrityIssues}
                    representatives={facility.representatives}
                    representativeScoreFormula={facility.representativeScoreFormula}
                    formula={facility.formula}
                    explanation={facility.explanation}
                    integrityFormula={facility.integrityFormula}
                    integrityExplanation={facility.integrityExplanation}
                    integritySources={facility.integritySources}
                    director={facility.director}
                    directorScore={facility.directorScore}
                    directorTenure={facility.directorTenure}
                    visn={facility.visn}
                  />
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="ios-card p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{scorecardData?.summary?.criticalFacilities || 0}</h3>
            <p className="text-red-400 font-medium">Critical Facilities</p>
            <p className="text-blue-200 text-sm mt-1">Score below 20%</p>
          </div>

          <div className="ios-card p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
              <TrendingDown className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{scorecardData?.summary?.warningFacilities || 0}</h3>
            <p className="text-amber-400 font-medium">Warning Facilities</p>
            <p className="text-blue-200 text-sm mt-1">Score 20-50%</p>
          </div>

          <div className="ios-card p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{scorecardData?.summary?.totalFacilities || 0}</h3>
            <p className="text-blue-400 font-medium">Total Facilities</p>
            <p className="text-blue-200 text-sm mt-1">Nationwide coverage</p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Scorecards;