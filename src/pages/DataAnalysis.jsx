import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Download,
  Filter,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const DataAnalysis = () => {
  const { toast } = useToast();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1year');

  useEffect(() => {
    const fetchAnalysisData = async () => {
      setLoading(true);
      try {
        // Placeholder: Replace with actual Supabase calls to fetch aggregated data
        // Example: const { data, error } = await supabase.rpc('get_analysis_data', { time_range: timeRange });
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

        setAnalysisData({
          trends: {
            nationalScore: { current: 42.3, change: -5.2, trend: 'down' },
            complaints: { current: 15847, change: 12.4, trend: 'up' },
            resolutionRate: { current: 68.2, change: -8.1, trend: 'down' },
            facilityImprovements: { current: 23, change: 15.6, trend: 'up' }
          },
          patterns: [
            {
              title: 'Patient Safety Violations',
              frequency: 34.2,
              trend: 'increasing',
              facilities: 89,
              description: 'Most common issue across facilities'
            },
            {
              title: 'Leadership Distrust',
              frequency: 28.7,
              trend: 'stable',
              facilities: 67,
              description: 'Persistent management issues'
            },
            {
              title: 'Retaliation Reports',
              frequency: 19.4,
              trend: 'increasing',
              facilities: 45,
              description: 'Growing concern for whistleblowers'
            },
            {
              title: 'Survey Compliance',
              frequency: 17.7,
              trend: 'decreasing',
              facilities: 123,
              description: 'Improving compliance rates'
            }
          ],
          visnPerformance: [
            { visn: 'VISN 18', score: 23.1, change: -12.4, facilities: 8 },
            { visn: 'VISN 12', score: 34.7, change: -8.9, facilities: 12 },
            { visn: 'VISN 8', score: 41.2, change: -5.3, facilities: 15 },
            { visn: 'VISN 20', score: 58.9, change: 3.2, facilities: 12 },
            { visn: 'VISN 1', score: 72.4, change: 8.7, facilities: 9 }
          ]
        });
      } catch (error) {
        console.error("Error fetching analysis data:", error);
        toast({
          title: "Error Fetching Analysis",
          description: "Could not load data analysis. " + error.message,
          variant: "destructive",
        });
        setAnalysisData(null); // Set to null or an error state
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [timeRange, toast]);

  const handleExportAnalysis = () => {
    toast({
      title: "🚧 Export Feature Coming Soon",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const handleFilterChange = (filter) => {
    setTimeRange(filter);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="ios-card p-6 loading-shimmer h-32" />
          ))}
        </div>
        <div className="ios-card p-8 loading-shimmer h-96" />
      </div>
    );
  }

  if (!analysisData) {
    return (
       <div className="text-center py-12">
           <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
           <h3 className="text-xl font-semibold text-white mb-2">Could not load analysis data</h3>
           <p className="text-blue-200">Please try refreshing the page or check back later.</p>
       </div>
    );
 }

  return (
    <>
      <Helmet>
        <title>Data Analysis - VA Accountability Platform</title>
        <meta name="description" content="Advanced analytics, trends, and patterns in VA facility performance and accountability metrics." />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
        >
          <div>
            <h1 className="text-4xl font-bold text-white">Data Analysis</h1>
            <p className="text-xl text-blue-200 mt-2">
              Advanced analytics and trend identification for VA accountability
            </p>
          </div>
          <div className="flex space-x-3">
            <div className="flex space-x-2">
              {['3months', '6months', '1year', '5years'].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange(range)}
                  className={timeRange === range ? 'bg-blue-600' : 'border-blue-500 text-blue-400'}
                >
                  {range === '3months' ? '3M' : range === '6months' ? '6M' : range === '1year' ? '1Y' : '5Y'}
                </Button>
              ))}
            </div>
            <Button 
              onClick={handleExportAnalysis}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(analysisData.trends).map(([key, data], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="ios-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  data.trend === 'up' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {data.trend === 'up' ? 
                    <TrendingUp className="h-5 w-5 text-green-400" /> :
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  }
                </div>
                <span className={`text-sm font-medium ${
                  data.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {data.change > 0 ? '+' : ''}{data.change}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {typeof data.current === 'number' && data.current > 100 ? 
                  data.current.toLocaleString() : 
                  `${data.current}${key.includes('Rate') || key.includes('Score') ? '%' : ''}`
                }
              </h3>
              <p className="text-blue-200 text-sm capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="ios-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Issue Patterns & Trends</h2>
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">Critical patterns identified</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysisData.patterns.map((pattern, index) => (
              <motion.div
                key={pattern.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{pattern.title}</h3>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    pattern.trend === 'increasing' ? 'bg-red-500/20 text-red-400' :
                    pattern.trend === 'decreasing' ? 'bg-green-500/20 text-green-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {pattern.trend}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">Frequency:</span>
                    <span className="text-white font-medium">{pattern.frequency}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">Affected Facilities:</span>
                    <span className="text-white font-medium">{pattern.facilities}</span>
                  </div>
                  <p className="text-blue-200 text-sm mt-2">{pattern.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="ios-card p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">VISN Performance Analysis</h2>
          
          <div className="space-y-4">
            {analysisData.visnPerformance.map((visn, index) => (
              <motion.div
                key={visn.visn}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    visn.score < 30 ? 'bg-red-500' :
                    visn.score < 50 ? 'bg-yellow-500' :
                    visn.score < 70 ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <h3 className="text-white font-semibold">{visn.visn}</h3>
                    <p className="text-blue-200 text-sm">{visn.facilities} facilities</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{visn.score}%</p>
                    <p className={`text-sm ${visn.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {visn.change > 0 ? '+' : ''}{visn.change}%
                    </p>
                  </div>
                  
                  <div className="w-32 bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        visn.score < 30 ? 'bg-red-500' :
                        visn.score < 50 ? 'bg-yellow-500' :
                        visn.score < 70 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.max(visn.score, 5)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="ios-card p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Key Insights</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Critical Findings</h3>
              <ul className="space-y-2 text-blue-200">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Patient safety violations increased 34% in the past year</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <span>VISN 18 shows systemic leadership failures</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Retaliation reports correlate with low facility scores</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Positive Trends</h3>
              <ul className="space-y-2 text-blue-200">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Survey compliance improving in 23 facilities</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>VISN 1 shows consistent improvement</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>User engagement with platform increasing</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default DataAnalysis;