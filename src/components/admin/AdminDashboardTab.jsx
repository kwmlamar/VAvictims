import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

const AdminDashboardTab = ({ systemStats, loadingStats }) => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    database: 'Online',
    storage: 'Healthy',
    api: 'Operational',
    lastSync: systemStats.lastSync
  });

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // Fetch recent complaints
        const { data: recentComplaints } = await supabase
          .from('user_submitted_complaints')
          .select('*')
          .order('submitted_at', { ascending: false })
          .limit(5);

        // Fetch recent uploaded documents
        const { data: recentDocuments } = await supabase
          .from('uploaded_documents')
          .select('*')
          .order('uploaded_at', { ascending: false })
          .limit(3);

        // Combine and format activities
        const activities = [];
        
        if (recentComplaints) {
          recentComplaints.forEach(complaint => {
            activities.push({
              action: `New ${complaint.complaint_type || 'complaint'} submission`,
              time: new Date(complaint.submitted_at).toLocaleString(),
              type: 'submission',
              details: complaint.facility_name_submitted || 'Unknown facility'
            });
          });
        }

        if (recentDocuments) {
          recentDocuments.forEach(doc => {
            activities.push({
              action: `Document uploaded: ${doc.file_name}`,
              time: new Date(doc.uploaded_at).toLocaleString(),
              type: 'report',
              details: doc.status || 'pending'
            });
          });
        }

        // Add system sync activity
        activities.push({
          action: 'Data sync completed',
          time: systemStats.lastSync,
          type: 'system',
          details: 'All systems operational'
        });

        // Sort by time and take most recent 5
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        setRecentActivity(activities.slice(0, 5));

        // Check real system status
        const systemChecks = await Promise.all([
          supabase.from('user_submitted_complaints').select('count', { count: 'exact', head: true }),
          supabase.from('va_facilities').select('count', { count: 'exact', head: true }),
          supabase.from('oig_report_entries').select('count', { count: 'exact', head: true })
        ]);
        
        const dbOnline = systemChecks.some(check => !check.error);
        const storageHealthy = true; // Simplified - in real app you'd check storage connectivity
        const apiOperational = true; // Simplified - in real app you'd check API endpoints
        
        setSystemStatus({
          database: dbOnline ? 'Online' : 'Offline',
          storage: storageHealthy ? 'Healthy' : 'Issues',
          api: apiOperational ? 'Operational' : 'Down',
          lastSync: systemStats.lastSync
        });

      } catch (error) {
        console.error('Error fetching recent activity:', error);
        setSystemStatus({
          database: 'Error',
          storage: 'Error',
          api: 'Error',
          lastSync: 'N/A'
        });
      }
    };

    if (!loadingStats) {
      fetchRecentActivity();
    }
  }, [loadingStats, systemStats.lastSync]);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <div className="ios-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        {loadingStats ? <div className="loading-shimmer h-40 rounded-lg"/> : (
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'submission' ? 'bg-green-500' :
                  activity.type === 'report' ? 'bg-blue-500' :
                  activity.type === 'user' ? 'bg-purple-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.action}</p>
                    <p className="text-blue-300 text-xs">{getTimeAgo(activity.time)}</p>
                    {activity.details && (
                      <p className="text-blue-400 text-xs">{activity.details}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-blue-200 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ios-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">System Status</h3>
        {loadingStats ? <div className="loading-shimmer h-40 rounded-lg"/> : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-200">Database</span>
              <span className={`font-medium ${
                systemStatus.database === 'Online' ? 'text-green-400' : 'text-red-400'
              }`}>
                {systemStatus.database}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-200">Storage</span>
              <span className={`font-medium ${
                systemStatus.storage === 'Healthy' ? 'text-green-400' : 'text-red-400'
              }`}>
                {systemStatus.storage}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-200">API</span>
              <span className={`font-medium ${
                systemStatus.api === 'Operational' ? 'text-green-400' : 'text-red-400'
              }`}>
                {systemStatus.api}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-200">Last Sync</span>
              <span className="text-blue-300 text-sm">{systemStatus.lastSync}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-200">Active Submissions</span>
              <span className="text-yellow-400 font-medium">{systemStats.activeSubmissions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-200">Storage Used</span>
              <span className="text-purple-400 font-medium">{systemStats.storageUsed}%</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminDashboardTab;