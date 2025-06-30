import React from 'react';
import { motion } from 'framer-motion';

const AdminDashboardTab = ({ systemStats, loadingStats }) => {
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
            {[
              { action: 'New submission received', time: '5 minutes ago', type: 'submission' },
              { action: 'OIG report processed', time: '1 hour ago', type: 'report' },
              { action: 'User registration', time: '2 hours ago', type: 'user' },
              { action: `Data sync completed: ${systemStats.lastSync}`, time: 'Now', type: 'system' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'submission' ? 'bg-green-500' :
                  activity.type === 'report' ? 'bg-blue-500' :
                  activity.type === 'user' ? 'bg-purple-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.action}</p>
                  <p className="text-blue-300 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ios-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">System Status</h3>
        {loadingStats ? <div className="loading-shimmer h-40 rounded-lg"/> : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-200">Database</span>
              <span className="text-green-400 font-medium">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-200">Storage</span>
              <span className="text-green-400 font-medium">Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-200">API</span>
              <span className="text-green-400 font-medium">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-200">Last Sync</span>
              <span className="text-blue-300 text-sm">{systemStats.lastSync}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminDashboardTab;