import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricCard = ({ title, value, trend, icon: Icon, color = 'good' }) => {
  const getTrendIcon = () => {
    if (trend === undefined || trend === null) return null;
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend === undefined || trend === null) return 'text-gray-400';
    if (trend > 0) return 'text-green-400';
    if (trend < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getCardColor = () => {
    switch (color) {
      case 'critical':
        return 'border-red-500/30 bg-red-500/5';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'good':
        return 'border-green-500/30 bg-green-500/5';
      default:
        return 'border-blue-500/30 bg-blue-500/5';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`metric-card border ${getCardColor()}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          color === 'critical' ? 'bg-red-500/20' :
          color === 'warning' ? 'bg-yellow-500/20' :
          color === 'good' ? 'bg-green-500/20' : 'bg-blue-500/20'
        }`}>
          <Icon className={`h-5 w-5 ${
            color === 'critical' ? 'text-red-400' :
            color === 'warning' ? 'text-yellow-400' :
            color === 'good' ? 'text-green-400' : 'text-blue-400'
          }`} />
        </div>
        
        {trend !== undefined && trend !== null && (
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-blue-200 text-sm">{title}</p>
      </div>
    </motion.div>
  );
};

export default MetricCard;