import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Users, 
  FileText,
  BarChart3,
  MapPin,
  Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ScoreCard from '@/components/ScoreCard';
import MetricCard from '@/components/MetricCard';
import { fetchNationalDashboardData } from '@/lib/databaseUtils';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [nationalData, setNationalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const data = await fetchNationalDashboardData();
        setNationalData(data);
        
        // Check if we got default data (indicating database issues)
        if (data.totalFacilities === 0 && data.totalComplaints === 0) {
          toast({
            title: "Database Not Available",
            description: "The database appears to be empty or not accessible. Use the 'Seed Database' button to populate it with sample data.",
            variant: "destructive",
            duration: 8000,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        
        // Check if it's a database connection issue
        if (error.message.includes('Failed to fetch some data from database')) {
          toast({
            title: "Database Connection Issue",
            description: "Some data couldn't be loaded. This might be normal if the database is empty. Try seeding the database with sample data.",
            variant: "destructive",
            duration: 5000,
          });
        } else {
          toast({
            title: "Error Fetching Data",
            description: "Could not load dashboard statistics. " + error.message,
            variant: "destructive",
          });
        }
        
        // Fallback to default values
        setNationalData({ 
          nationalScore: 0, 
          nationalIntegrityScore: 0, 
          totalFacilities: 0, 
          criticalFacilities: 0, 
          warningFacilities: 0, 
          totalComplaints: 0, 
          pendingCases: 0, 
          trends: {score: 0, integrityScore: 0, complaints: 0, resolution: 0},
          representatives: []
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        // Calculate date 30 days ago for "recent" filter
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch recent complaints (last 30 days)
        const { data: recentComplaints } = await supabase
          .from('user_submitted_complaints')
          .select('*')
          .gte('submitted_at', thirtyDaysAgo.toISOString())
          .order('submitted_at', { ascending: false })
          .limit(3);

        // Fetch recent OIG reports (last 30 days)
        const { data: recentOIGReports } = await supabase
          .from('oig_report_entries')
          .select('*')
          .gte('report_date', thirtyDaysAgo.toISOString().split('T')[0])
          .order('report_date', { ascending: false })
          .limit(2);

        // Fetch recent score changes (last 30 days)
        const { data: recentScorecards } = await supabase
          .from('scorecards')
          .select('*')
          .eq('entity_type', 'facility')
          .gte('updated_at', thirtyDaysAgo.toISOString())
          .order('updated_at', { ascending: false })
          .limit(2);

        // Combine and format activities
        const activities = [];
        
        if (recentComplaints) {
          recentComplaints.forEach(complaint => {
            activities.push({
              type: 'complaint',
              message: `New ${complaint.complaint_type || 'complaint'} submitted for ${complaint.facility_name_submitted || 'Unknown facility'}`,
              time: new Date(complaint.submitted_at).toLocaleString(),
              timestamp: complaint.submitted_at
            });
          });
        }

        if (recentOIGReports) {
          recentOIGReports.forEach(report => {
            activities.push({
              type: 'report',
              message: `OIG report published for ${report.facility_name || 'Unknown facility'}`,
              time: new Date(report.report_date).toLocaleString(),
              timestamp: report.report_date
            });
          });
        }

        if (recentScorecards) {
          recentScorecards.forEach(scorecard => {
            activities.push({
              type: 'update',
              message: `Score updated for facility (${scorecard.score.toFixed(1)}%)`,
              time: new Date(scorecard.updated_at).toLocaleString(),
              timestamp: scorecard.updated_at
            });
          });
        }

        // Sort by timestamp and take most recent 4
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRecentActivity(activities.slice(0, 4));

      } catch (error) {
        console.error('Error fetching recent activity:', error);
        // Fallback to empty array
        setRecentActivity([]);
      }
    };

    fetchDashboardData();
    fetchRecentActivity();
  }, [toast]);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const handleQuickAction = (path) => {
    if (path === 'analysis' || path === 'scorecards' || path === 'submit') {
       let targetPath = '';
       if (path === 'analysis') targetPath = '/analysis';
       else if (path === 'scorecards') targetPath = '/scorecards';
       else if (path === 'submit') targetPath = '/portal';
       
       if (targetPath) navigate(targetPath);
       else {
        toast({
            title: "🚧 Feature Coming Soon",
            description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
            duration: 3000,
          });
       }
    } else {
      toast({
        title: "🚧 Feature Coming Soon",
        description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="ios-card p-6 loading-shimmer h-32" />
          ))}
        </div>
        <div className="ios-card p-8 loading-shimmer h-64" />
      </div>
    );
  }
  
  if (!nationalData) {
     return (
        <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Could not load dashboard data</h3>
            <p className="text-blue-200">Please try refreshing the page or check back later.</p>
        </div>
     );
  }


  return (
    <>
      <Helmet>
        <title>Dashboard - VA Accountability Platform</title>
        <meta name="description" content="Real-time overview of VA facility performance, scores, and accountability metrics across the nation." />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-white">VA Accountability Dashboard</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Real-time transparency and oversight of Department of Veterans Affairs facilities nationwide
          </p>
        </motion.div>

        {(nationalData.nationalScore < 50 || nationalData.nationalIntegrityScore < 50) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="warning-banner p-6 text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-2">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-lg font-bold">NATIONAL ALERT</span>
            </div>
            {nationalData.nationalScore < 50 && <p className="text-white/90">National VA Performance Score is below 50%. Veterans should exercise caution.</p>}
            {nationalData.nationalIntegrityScore < 50 && <p className="text-white/90 mt-1">National VA Integrity Score is below 50%, indicating potential systemic issues.</p>}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="National Score"
            value={`${nationalData.nationalScore.toFixed(1)}%`}
            trend={nationalData.trends.score}
            icon={Shield}
            color={nationalData.nationalScore < 20 ? 'critical' : nationalData.nationalScore < 50 ? 'warning' : 'good'}
          />
          <MetricCard
            title="Integrity Score"
            value={`${nationalData.nationalIntegrityScore}%`}
            trend={nationalData.trends.integrityScore}
            icon={Scale}
            color={nationalData.nationalIntegrityScore < 20 ? 'critical' : nationalData.nationalIntegrityScore < 50 ? 'warning' : 'good'}
          />
          <MetricCard
            title="Active Complaints"
            value={nationalData.totalComplaints.toLocaleString()}
            trend={nationalData.trends.complaints}
            icon={FileText}
            color="warning"
          />
          <MetricCard
            title="Total Facilities"
            value={nationalData.totalFacilities.toLocaleString()}
            icon={MapPin}
            color="good"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ScoreCard
            title="National VA Scorecard"
            score={nationalData.nationalScore}
            integrityScore={nationalData.nationalIntegrityScore}
            type="national"
            issues={[
              'Patient Safety Violations',
              'Leadership Distrust',
              'Retaliation Reports',
              'Survey Compliance Issues'
            ]}
            integrityIssues={[
              'Obstruction of Investigations',
              'Withholding Evidence',
              'Systemic Cover-ups'
            ]}
            representatives={nationalData.representatives}
            representativeScoreFormula="Avg. Facility Scores (Jurisdiction) * 0.6 + Avg. VISN Integrity (Jurisdiction) * 0.4 - Penalties"
            formula="Average of lowest 50% VISNs + lowest VISN score ÷ 2"
            explanation="Score reflects systemic issues across multiple VISNs with particular concern in patient safety and leadership accountability."
            integrityFormula="Base 100% - Sum of deductions for documented integrity violations (obstruction, retaliation, etc.)"
            integrityExplanation="National integrity score reflects documented instances of obstruction, retaliation, cover-ups, and other integrity violations across VA operations. A low score indicates significant concerns about transparency and ethical conduct at a national level."
            integritySources={[
              { name: "OIG Report VA-2023-0117", url: "#" },
              { name: "GAO Findings on VA Whistleblowers", url: "#" }
            ]}
            entities={['OIG', 'OGC', 'HR', 'VBA', 'OAWP', 'VACO']}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="ios-card p-6 text-center space-y-4"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">View Scorecards</h3>
            <p className="text-blue-200 text-sm">
              Explore detailed facility and VISN performance metrics
            </p>
            <Button 
              onClick={() => handleQuickAction('scorecards')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Explore Scorecards
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="ios-card p-6 text-center space-y-4"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Submit Allegation</h3>
            <p className="text-blue-200 text-sm">
              Report issues and upload evidence for investigation
            </p>
            <Button 
              onClick={() => handleQuickAction('submit')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Submit Report
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="ios-card p-6 text-center space-y-4"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Data Analysis</h3>
            <p className="text-blue-200 text-sm">
              Advanced analytics and trend identification
            </p>
            <Button 
              onClick={() => handleQuickAction('analysis')}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              View Analysis
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="ios-card p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'alert' ? 'bg-red-500' :
                    activity.type === 'report' ? 'bg-blue-500' :
                    activity.type === 'complaint' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-blue-300 text-xs">{getTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-blue-200 text-sm">No recent activity</p>
                <p className="text-blue-300 text-xs mt-1">Activity will appear here as complaints and reports are submitted</p>
              </div>
            )}
          </div>
        </motion.div>


      </div>
    </>
  );
};

export default Dashboard;