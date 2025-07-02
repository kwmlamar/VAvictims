import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  MapPin, 
  AlertTriangle, 
  RefreshCw,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getVISNBreakdown } from '@/lib/visnAnalysis';

const VISNAnalysis = () => {
  const { toast } = useToast();
  const [visnData, setVisnData] = useState(null);
  const [loading, setLoading] = useState(true);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const result = await getVISNBreakdown();
      setVisnData(result);
      
      if (result.error) {
        toast({
          title: "❌ Analysis Failed",
          description: result.error,
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "✅ VISN Analysis Complete",
          description: `Found ${result.summary.totalVISNs} VISNs with ${result.summary.totalFacilities} facilities.`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('VISN analysis failed:', error);
      toast({
        title: "❌ Analysis Failed",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-white mb-2">Analyzing VISN Data</h3>
          <p className="text-blue-200">Checking VISN distribution and facility assignments...</p>
        </div>
      </div>
    );
  }

  if (!visnData || visnData.error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">VISN Analysis Failed</h3>
        <p className="text-blue-200 mb-4">{visnData?.error || 'Could not analyze VISN data.'}</p>
        <Button onClick={runAnalysis}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Analysis
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>VISN Analysis - VA Accountability Platform</title>
        <meta name="description" content="Analysis of VISN data and facility distribution." />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
        >
          <div>
            <h1 className="text-4xl font-bold text-white">VISN Analysis</h1>
            <p className="text-xl text-blue-200 mt-2">
              Understanding VISN distribution and facility assignments
            </p>
          </div>
          <Button 
            onClick={runAnalysis}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : 'Refresh Analysis'}
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="ios-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Building2 className="h-8 w-8 text-blue-400" />
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                {visnData.summary.totalVISNs} VISNs
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {visnData.summary.totalVISNs}
            </h3>
            <p className="text-blue-200 text-sm">Total VISNs Found</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="ios-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <MapPin className="h-8 w-8 text-green-400" />
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                {visnData.summary.totalFacilities} Facilities
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {visnData.summary.totalFacilities}
            </h3>
            <p className="text-blue-200 text-sm">Total Facilities</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="ios-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                {visnData.summary.issuesFound} Issues
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {visnData.summary.issuesFound}
            </h3>
            <p className="text-blue-200 text-sm">Data Issues Found</p>
          </motion.div>
        </div>

        {/* Issues */}
        {visnData.issues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="ios-card p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Data Issues</h2>
            <div className="space-y-3">
              {visnData.issues.map((issue, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-red-200">{issue}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VISN Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="ios-card p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">VISN Distribution</h2>
          
          <div className="space-y-6">
            {visnData.visnDetails.map((visnDetail, index) => (
              <motion.div
                key={visnDetail.visn}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      visnDetail.visn === 'VISN 7' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <h3 className="text-lg font-semibold text-white">{visnDetail.visn}</h3>
                    <span className="text-sm text-blue-200">({visnDetail.facilityCount} facilities)</span>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    visnDetail.visn === 'VISN 7' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {visnDetail.visn === 'VISN 7' ? 'Expected' : 'Unexpected'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-200">Sample Facilities:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {visnDetail.facilities.map((facility, facilityIndex) => (
                      <div key={facilityIndex} className="text-sm text-white bg-white/5 rounded p-2">
                        <div className="font-medium">{facility.name}</div>
                        <div className="text-blue-200">{facility.city}, {facility.state}</div>
                      </div>
                    ))}
                  </div>
                  {visnDetail.hasMore && (
                    <p className="text-sm text-blue-300 italic">
                      ... and {visnDetail.facilityCount - 5} more facilities
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Data Quality Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="ios-card p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Data Quality Assessment</h2>
          
          <div className="space-y-4 text-blue-200">
            <p>
              You&apos;re seeing multiple VISNs (including VISN 17 with 19 facilities) because the sample data scripts 
              created facilities across multiple VISNs to simulate a national dataset.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h4 className="text-red-400 font-semibold mb-2">Sample Data Indicators:</h4>
                <ul className="space-y-1 text-sm">
                  <li>&bull; Generic facility names like &quot;VA Medical Center - Atlanta&quot;</li>
                  <li>&bull; VISN assignments that don&apos;t match real VA geography</li>
                  <li>&bull; Facilities in major cities only (Atlanta, Boston, Chicago, etc.)</li>
                  <li>&bull; Random VISN numbers that don&apos;t reflect real VA structure</li>
                </ul>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold mb-2">Real Data Indicators:</h4>
                <ul className="space-y-1 text-sm">
                  <li>&bull; Specific facility names like &quot;VA Puget Sound Health Care System&quot;</li>
                  <li>&bull; Accurate VISN assignments (VISN 1-23, with gaps)</li>
                  <li>&bull; Facilities distributed across all states</li>
                  <li>&bull; Real facility types and locations</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">To Get Accurate Data:</h4>
              <ul className="space-y-1 text-sm">
                <li>&bull; Replace sample data with real VA facility data</li>
                <li>&bull; Use official VA facility lists with correct VISN assignments</li>
                <li>&bull; Verify VISN assignments match real VA geography</li>
                <li>&bull; Include all facility types (Medical Centers, CBOCs, etc.)</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default VISNAnalysis; 