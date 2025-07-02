import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  AlertTriangle, 
  Users, 
  Calendar,
  ExternalLink,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const FacilityCard = ({ facility }) => {
  const { toast } = useToast();

  const getScoreColor = (score) => {
    if (score < 20) return 'text-red-400 bg-red-500/20';
    if (score < 50) return 'text-yellow-400 bg-yellow-500/20';
    if (score < 70) return 'text-blue-400 bg-blue-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  const getWarningLevel = (score) => {
    if (score < 20) return { level: 'DANGER', color: 'text-red-400' };
    if (score < 50) return { level: 'CAUTION', color: 'text-yellow-400' };
    return null;
  };

  const handleViewDetails = () => {
    toast({
      title: "🚧 Facility Details Coming Soon",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  const warning = getWarningLevel(facility.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="facility-card ios-card p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{facility.name}</h3>
          <div className="flex items-center space-x-2 text-blue-200 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{facility.location}</span>
            <span>•</span>
            <span>{facility.visn}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(facility.score)}`}>
            {facility.score}%
          </div>
          {warning && (
            <div className={`text-xs font-medium mt-1 ${warning.color}`}>
              {warning.level}
            </div>
          )}
        </div>
      </div>

      {/* Warning Banner */}
      {warning && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">
              {warning.level === 'DANGER' 
                ? 'This facility may pose a danger to public health and safety'
                : 'Veterans should exercise caution when seeking care here'
              }
            </span>
          </div>
        </motion.div>
      )}

      {/* Issues */}
      {facility.issues && facility.issues.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-blue-200 mb-2">Primary Issues:</h4>
          <div className="flex flex-wrap gap-2">
            {facility.issues.map((issue, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs"
              >
                {issue}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Facility Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-blue-200">Type:</p>
          <p className="text-white font-medium">{facility.type}</p>
        </div>
        <div>
          <p className="text-blue-200">Last Updated:</p>
          <p className="text-white font-medium">{facility.lastUpdated}</p>
        </div>
        {facility.director && (
          <div>
            <p className="text-blue-200">Director:</p>
            <p className="text-white font-medium">{facility.director}</p>
          </div>
        )}
        {facility.directorTenure && (
          <div>
            <p className="text-blue-200">Tenure:</p>
            <p className="text-white font-medium">{facility.directorTenure}</p>
          </div>
        )}
      </div>

      {/* Representatives */}
      {facility.representatives && facility.representatives.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-blue-200 mb-2">Representatives:</h4>
          <div className="space-y-1">
            {facility.representatives.slice(0, 2).map((rep, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-white">{rep.name}</span>
                <span className="text-blue-300">{rep.party} - {rep.district || rep.state}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        <Button
          onClick={handleViewDetails}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          View Details
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetails}
          className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default FacilityCard;