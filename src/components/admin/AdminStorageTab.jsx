import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const AdminStorageTab = ({ bucketsData, loadingStats, handleAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Supabase Storage Buckets</h2>
        <Button 
          onClick={() => handleAction('manage-storage')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          Manage Storage
        </Button>
      </div>

      {loadingStats ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="ios-card p-6 loading-shimmer h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bucketsData.map((bucket, index) => (
            <motion.div
              key={bucket.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="ios-card p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{bucket.name}</h3>
                  <p className="text-blue-200 text-sm mt-1">{bucket.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{bucket.size}</p>
                  <p className="text-blue-300 text-sm">{bucket.files} files</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-200 text-sm">{bucket.access}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction(`manage-${bucket.name}`)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Manage
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AdminStorageTab;