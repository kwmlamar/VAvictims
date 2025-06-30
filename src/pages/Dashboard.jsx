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
import DatabaseSeeder from '@/components/DatabaseSeeder';
import { fetchNationalDashboardData } from '@/lib/databaseUtils';
import { quickTest, comprehensiveTest } from '@/lib/testDatabase';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [nationalData, setNationalData] = useState(null);
  const [loading, setLoading] = useState(true);

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

    fetchDashboardData();
  }, [toast]);

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
            value={`${nationalData.nationalScore}%`}
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
            {[
              { type: 'alert', message: 'Phoenix VA Medical Center score dropped to 18%', time: '2 hours ago' },
              { type: 'report', message: 'New OIG report published for VISN 12', time: '4 hours ago' },
              { type: 'complaint', message: '47 new complaints submitted today', time: '6 hours ago' },
              { type: 'update', message: 'Seattle VA improved score to 67%', time: '1 day ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'alert' ? 'bg-red-500' :
                  activity.type === 'report' ? 'bg-blue-500' :
                  activity.type === 'complaint' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.message}</p>
                  <p className="text-blue-300 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Development Tools - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <DatabaseSeeder />
            
            <div className="ios-card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Database Testing</h3>
              <p className="text-blue-200 text-sm">
                Test the database connection and see current data counts.
              </p>
              <div className="flex space-x-4">
                <Button
                  onClick={quickTest}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Quick Test
                </Button>
                <Button
                  onClick={comprehensiveTest}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Comprehensive Test
                </Button>
              </div>
              <div className="text-xs text-blue-300">
                <p>Check the browser console for test results.</p>
                <p>You can also run <code className="bg-black/20 px-1 rounded">window.comprehensiveTest()</code> in the console.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Dashboard;