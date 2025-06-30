import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

const AdminUsersTab = ({ handleAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="ios-card p-6"
    >
      <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
      <p className="text-blue-200 mb-4">
        Manage user accounts, permissions, and access controls for the platform.
      </p>
      <Button 
        onClick={() => handleAction('user-management')}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Users className="h-4 w-4 mr-2" />
        Manage Users
      </Button>
    </motion.div>
  );
};

export default AdminUsersTab;