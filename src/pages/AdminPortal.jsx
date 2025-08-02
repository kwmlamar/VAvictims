import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Settings, 
  Database, 
  Users, 
  FileText, 
  BarChart3, 
  Shield,
  Upload,
  Download,
  RefreshCw,
  Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabaseClient';
import AdminDashboardTab from '@/components/admin/AdminDashboardTab';
import AdminStorageTab from '@/components/admin/AdminStorageTab';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminSettingsTab from '@/components/admin/AdminSettingsTab';
import AdminPodcastTab from '@/components/admin/AdminPodcastTab';

const AdminPortal = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeSubmissions: 0,
    processedReports: 0,
    systemHealth: 0, 
    storageUsed: 0, 
    lastSync: 'N/A'
  });
  const [bucketsData, setBucketsData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const definedBuckets = [
    { name: 'complaint_pdfs', description: 'Stores PDFs uploaded by users/admins related to complaints or cases', access: 'Authenticated users (upload), Admin (read/write)' },
    { name: 'oig_reports', description: 'Stores full OIG reports and investigation findings', access: 'Public (read), Admin (write)' },
    { name: 'chip_reports', description: 'Stores CHIP reports for VA facilities', access: 'Public (read), Admin (write)' },
    { name: 'afge_surveys', description: 'Stores AFGE survey documents and results', access: 'Public (read), Admin (write)' },
    { name: 'nnu_surveys', description: 'Stores NNU survey documents and results', access: 'Public (read), Admin (write)' },
    { name: 'media_files', description: 'Stores news articles, social media content, and other media', access: 'Public (read), Admin (write)' },
    { name: 'scraped_content', description: 'Stores scraped web content (HTML, text, links) for analysis', access: 'Admin (read/write)' },
    { name: 'legal_documents', description: 'Stores AI-generated legal documents for users', access: 'Authenticated users (read own), Admin (read/write)' },
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchAdminStats = async () => {
    setLoadingStats(true);
    try {
      // Count users directly instead of using a function
      let usersCount = 0;
      try {
        const { count, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        if (!usersError) {
          usersCount = count || 0;
        } else {
          console.warn('Users table not accessible:', usersError.message);
        }
      } catch (error) {
        console.warn('Could not count users:', error.message);
      }
        
      // Count active submissions
      let submissionsCount = 0;
      try {
        const { count, error: submissionsError } = await supabase
          .from('user_submitted_complaints')
          .select('*', { count: 'exact', head: true })
          .neq('status', 'Resolved');
        if (!submissionsError) {
          submissionsCount = count || 0;
        } else {
          console.warn('Complaints table not accessible:', submissionsError.message);
        }
      } catch (error) {
        console.warn('Could not count submissions:', error.message);
      }

      // Count processed reports
      let reportsCount = 0;
      try {
        const { count, error: reportsError } = await supabase
          .from('uploaded_documents')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'processed');
        if (!reportsError) {
          reportsCount = count || 0;
        } else {
          console.warn('Uploaded documents table not accessible:', reportsError.message);
        }
      } catch (error) {
        console.warn('Could not count reports:', error.message);
      }

      // Calculate real system health based on database connectivity and data integrity
      let systemHealth = 0;
      try {
        // Test database connectivity by checking if we can access key tables
        const healthChecks = await Promise.all([
          supabase.from('va_facilities').select('count', { count: 'exact', head: true }),
          supabase.from('user_submitted_complaints').select('count', { count: 'exact', head: true }),
          supabase.from('oig_report_entries').select('count', { count: 'exact', head: true }),
          supabase.from('scorecards').select('count', { count: 'exact', head: true })
        ]);
        
        const successfulChecks = healthChecks.filter(check => !check.error).length;
        systemHealth = Math.round((successfulChecks / healthChecks.length) * 100);
        
        // Add bonus for having actual data
        if (usersCount > 0 || submissionsCount > 0 || reportsCount > 0) {
          systemHealth = Math.min(100, systemHealth + 10);
        }
      } catch (error) {
        console.warn('Could not calculate system health:', error.message);
        systemHealth = 0;
      }
      
      let totalStorageUsedBytes = 0;
      const fetchedBucketsData = await Promise.all(definedBuckets.map(async (bucket) => {
        try {
          const { data: files, error: filesError } = await supabase.storage.from(bucket.name).list('', { limit: 1000 });
          if (filesError) {
            console.warn(`Could not list files for bucket ${bucket.name}:`, filesError.message);
            return { ...bucket, size: 'N/A', files: 'N/A' };
          }
          const bucketSizeBytes = files.reduce((acc, file) => acc + (file.metadata?.size || 0), 0);
          totalStorageUsedBytes += bucketSizeBytes;
          return {
            ...bucket,
            size: formatFileSize(bucketSizeBytes),
            files: files.length
          };
        } catch (error) {
          console.warn(`Error accessing bucket ${bucket.name}:`, error.message);
          return { ...bucket, size: 'N/A', files: 'N/A' };
        }
      }));
      setBucketsData(fetchedBucketsData);

      setSystemStats(prev => ({
        ...prev,
        totalUsers: usersCount || 0,
        activeSubmissions: submissionsCount || 0,
        processedReports: reportsCount || 0,
        systemHealth: systemHealth,
        storageUsed: totalStorageUsedBytes > 0 ? parseFloat(((totalStorageUsedBytes / (5 * 1024 * 1024 * 1024)) * 100).toFixed(1)) : 0,
        lastSync: new Date().toLocaleString()
      }));

    } catch (error) {
      console.error("Error fetching admin stats:", error);
      const errorMessage = error.message || error.details || 'Unknown error occurred';
      toast({ 
        title: "Error fetching stats", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setLoadingStats(false);
    }
  };
  
  useEffect(() => {
    fetchAdminStats();
  }, []);


  const handleAction = (action) => {
    if (action === 'sync') {
      fetchAdminStats();
      toast({ title: "Data Syncing", description: "Refreshing dashboard statistics...", duration: 2000 });
      return;
    }
    toast({
      title: "🚧 Admin Feature Coming Soon",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };


  return (
    <>
      <Helmet>
        <title>Admin Portal - VA Accountability Platform</title>
        <meta name="description" content="Administrative dashboard for managing the VA accountability platform, data, users, and system settings." />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
        >
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Portal</h1>
            <p className="text-xl text-blue-200 mt-2">
              System management and data administration
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => handleAction('sync')}
              variant="outline"
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
              disabled={loadingStats}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
              {loadingStats ? 'Syncing...' : 'Sync Data'}
            </Button>
            <Button 
              onClick={() => handleAction('backup')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Backup
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {loadingStats ? (
            [...Array(4)].map((_, i) => <div key={i} className="ios-card p-6 loading-shimmer h-36" />)
          ) : (
            <>
              <div className="ios-card p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">{systemStats.systemHealth}%</h3>
                <p className="text-green-400 font-medium">System Health</p>
              </div>

              <div className="ios-card p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">{systemStats.totalUsers.toLocaleString()}</h3>
                <p className="text-blue-400 font-medium">Total Users</p>
              </div>

              <div className="ios-card p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">{systemStats.activeSubmissions}</h3>
                <p className="text-yellow-400 font-medium">Active Submissions</p>
              </div>

              <div className="ios-card p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">{systemStats.storageUsed}%</h3>
                <p className="text-purple-400 font-medium">Storage Used</p>
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                      <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="storage" className="data-[state=active]:bg-blue-600">
              <Database className="h-4 w-4 mr-2" />
              Storage
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="podcast" className="data-[state=active]:bg-blue-600">
              <Mic className="h-4 w-4 mr-2" />
              Podcasts
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

            <TabsContent value="dashboard">
              <AdminDashboardTab systemStats={systemStats} loadingStats={loadingStats} />
            </TabsContent>
            <TabsContent value="storage">
              <AdminStorageTab bucketsData={bucketsData} loadingStats={loadingStats} handleAction={handleAction} />
            </TabsContent>
            <TabsContent value="users">
              <AdminUsersTab handleAction={handleAction} />
            </TabsContent>
            <TabsContent value="podcast">
              <AdminPodcastTab />
            </TabsContent>
            <TabsContent value="settings">
              <AdminSettingsTab handleAction={handleAction} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </>
  );
};

export default AdminPortal;