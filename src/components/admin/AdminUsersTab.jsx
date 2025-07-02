import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, UserCheck, UserX, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const AdminUsersTab = ({ handleAction }) => {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    usersWithSubmissions: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Get total users
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*');

        if (usersError) throw usersError;

        // Get users with submissions
        const { data: usersWithComplaints, error: complaintsError } = await supabase
          .from('user_submitted_complaints')
          .select('user_id')
          .not('user_id', 'is', null);

        if (complaintsError) throw complaintsError;

        // Calculate user statistics
        const totalUsers = users?.length || 0;
        const uniqueUsersWithSubmissions = new Set(usersWithComplaints?.map(c => c.user_id)).size;
        
        // Calculate new users this month
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        const newUsersThisMonth = users?.filter(user => 
          new Date(user.created_at) >= thisMonth
        ).length || 0;

        // Get recent users
        const recentUsersData = users?.slice(0, 5).map(user => ({
          id: user.id,
          email: user.email,
          role: user.role || 'user',
          created_at: user.created_at,
          lastActivity: user.created_at // In a real app, you'd track last login
        })) || [];

        setUserStats({
          totalUsers,
          activeUsers: totalUsers, // Simplified - in real app you'd track active sessions
          newUsersThisMonth,
          usersWithSubmissions: uniqueUsersWithSubmissions
        });

        setRecentUsers(recentUsersData);

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInDays = Math.floor((now - time) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
      <Button 
        onClick={() => handleAction('user-management')}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Users className="h-4 w-4 mr-2" />
        Manage Users
      </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="ios-card p-6 loading-shimmer h-32" />
          ))}
        </div>
      ) : (
        <>
          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="ios-card p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">{userStats.totalUsers}</h3>
              <p className="text-blue-400 font-medium">Total Users</p>
            </div>

            <div className="ios-card p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">{userStats.activeUsers}</h3>
              <p className="text-green-400 font-medium">Active Users</p>
            </div>

            <div className="ios-card p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <UserPlus className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">{userStats.newUsersThisMonth}</h3>
              <p className="text-purple-400 font-medium">New This Month</p>
            </div>

            <div className="ios-card p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">{userStats.usersWithSubmissions}</h3>
              <p className="text-yellow-400 font-medium">With Submissions</p>
            </div>
          </div>

          {/* Recent Users */}
          <div className="ios-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Users</h3>
            {recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.email}</p>
                        <p className="text-blue-200 text-sm capitalize">{user.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-300 text-sm">{getTimeAgo(user.created_at)}</p>
                      <p className="text-blue-400 text-xs">Joined</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserX className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <p className="text-blue-200">No users found</p>
              </div>
            )}
          </div>

          {/* User Activity Summary */}
          <div className="ios-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">User Activity Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">User Engagement</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Users with submissions:</span>
                    <span className="text-white font-medium">{userStats.usersWithSubmissions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Engagement rate:</span>
                    <span className="text-white font-medium">
                      {userStats.totalUsers > 0 ? Math.round((userStats.usersWithSubmissions / userStats.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">New user growth:</span>
                    <span className="text-white font-medium">
                      {userStats.totalUsers > 0 ? Math.round((userStats.newUsersThisMonth / userStats.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start border-blue-500 text-blue-400"
                    onClick={() => handleAction('view-all-users')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View All Users
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start border-green-500 text-green-400"
                    onClick={() => handleAction('export-users')}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Export User Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default AdminUsersTab;