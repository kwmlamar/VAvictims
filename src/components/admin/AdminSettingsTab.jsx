import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const AdminSettingsTab = ({ handleAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="ios-card p-6"
    >
      <h2 className="text-2xl font-bold text-white mb-6">System Settings</h2>
      <p className="text-blue-200 mb-4">
        Configure system parameters, scoring formulas, and platform settings.
      </p>
      <Button 
        onClick={() => handleAction('system-settings')}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Settings className="h-4 w-4 mr-2" />
        Configure Settings
      </Button>
    </motion.div>
  );
};

export default AdminSettingsTab;