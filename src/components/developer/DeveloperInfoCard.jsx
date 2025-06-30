import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DeveloperInfoCard = ({ title, icon: Icon, items, color }) => {
  const colors = {
    blue: 'border-blue-500/50 text-blue-400',
    green: 'border-green-500/50 text-green-400',
    purple: 'border-purple-500/50 text-purple-400',
    yellow: 'border-yellow-500/50 text-yellow-400',
    red: 'border-red-500/50 text-red-400',
    indigo: 'border-indigo-500/50 text-indigo-400',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className={`bg-gray-800/50 border-2 ${colors[color]}`}>
        <CardHeader className="flex flex-row items-center space-x-4">
          <Icon className={`h-8 w-8 ${colors[color]}`} />
          <CardTitle className="text-2xl text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.ul
            className="space-y-2 list-disc list-inside"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {items.map((item, index) => (
              <motion.li key={index} className="text-blue-100" variants={itemVariants}>
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DeveloperInfoCard;