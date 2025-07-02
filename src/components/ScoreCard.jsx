import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Shield, 
  Users, 
  MapPin, 
  Calculator, 
  Link as LinkIcon, 
  Scale, 
  Briefcase, 
  Award 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ScoreCard = ({ 
  title, 
  score, 
  integrityScore,
  type, 
  issues = [], 
  integrityIssues = [],
  representatives = [], 
  representativeScoreFormula = "Representative Score = (Avg. Facility Scores in District/State * 0.7) + (Integrity Score of Covered Entities * 0.3) - Penalties for Unaddressed Critical Issues",
  formula, 
  integrityFormula,
  explanation,
  integrityExplanation,
  integritySources = [],
  director,
  directorScore,
  directorTenure,
  visn,
  facilities,
  entities = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (s, isIntegrity = false) => {
    if (s === undefined || s === null) return 'bg-gray-500/20 text-gray-400';
    if (s < 20) return isIntegrity ? 'score-critical border-red-700' : 'score-critical';
    if (s < 50) return isIntegrity ? 'score-warning border-yellow-700' : 'score-warning';
    if (s < 70) return isIntegrity ? 'score-good border-green-700' : 'score-good';
    return isIntegrity ? 'score-excellent border-teal-700' : 'score-excellent';
  };

  const getRepScoreColor = (s) => {
    if (s === undefined || s === null) return 'text-gray-400';
    if (s < 40) return 'text-red-400';
    if (s < 60) return 'text-yellow-400';
    if (s < 75) return 'text-green-400';
    return 'text-teal-400';
  }

  const getWarningLevel = (s) => {
    if (s === undefined || s === null) return null;
    if (s < 20) return {
      level: 'DANGER',
      message: 'Veterans and the public need to be cautious that this facility/entity may be a danger or threat to public health and safety.',
      color: 'text-red-400 bg-red-500/20'
    };
    if (s < 50) return {
      level: 'CAUTION',
      message: 'Veterans should be cautious for the issues presented regarding this facility/entity.',
      color: 'text-yellow-400 bg-yellow-500/20'
    };
    return null;
  };

  const warning = getWarningLevel(score);
  const integrityWarning = getWarningLevel(integrityScore);


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="scorecard-container ios-card overflow-hidden"
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              {type === 'facility' && visn && (
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">
                  {visn}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className={`px-6 py-3 rounded-xl ${getScoreColor(score)} flex items-center space-x-2`}>
                <Shield className="h-6 w-6" />
                <span className="text-2xl font-bold">{score !== undefined && score !== null ? score.toFixed(1) : 'N/A'}%</span>
                <span className="text-xs opacity-80">Performance</span>
              </div>
              
              {integrityScore !== undefined && integrityScore !== null && (
                <div className={`px-6 py-3 rounded-xl ${getScoreColor(integrityScore, true)} border-2 flex items-center space-x-2`}>
                  <Scale className="h-6 w-6" />
                  <span className="text-2xl font-bold">{integrityScore.toFixed(1)}%</span>
                  <span className="text-xs opacity-80">Integrity</span>
                </div>
              )}
              
              {warning && !integrityWarning && (
                <div className={`px-4 py-2 rounded-lg border ${warning.color}`}>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-bold text-sm">{warning.level}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-400 hover:text-blue-300 self-start"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>

        {warning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30"
          >
            <p className="text-red-400 text-sm"><span className="font-bold">Performance Warning:</span> {warning.message}</p>
          </motion.div>
        )}
        
        {integrityWarning && (
           <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30"
          >
            <p className="text-red-400 text-sm"><span className="font-bold">Integrity Warning:</span> {integrityWarning.message}</p>
          </motion.div>
        )}


        {issues.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-blue-200 mb-2">Primary Performance Issues:</h3>
            <div className="flex flex-wrap gap-2">
              {issues.map((issue, index) => (
                <span
                  key={`perf-${index}`}
                  className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs"
                >
                  {issue}
                </span>
              ))}
            </div>
          </div>
        )}

        {integrityIssues.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-blue-200 mb-2">Primary Integrity Concerns:</h3>
            <div className="flex flex-wrap gap-2">
              {integrityIssues.map((issue, index) => (
                <span
                  key={`int-${index}`}
                  className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs"
                >
                  {issue}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-lg p-4 space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Calculator className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Performance Scoring</h3>
                  </div>
                  <p className="text-blue-200 text-sm mb-3 font-mono bg-black/20 p-3 rounded">
                    {formula}
                  </p>
                  <p className="text-blue-200 text-sm">{explanation}</p>
                </div>

                {integrityFormula && (
                  <div>
                    <div className="flex items-center space-x-2 mb-3 pt-4 border-t border-white/10">
                      <Scale className="h-5 w-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Integrity Scoring</h3>
                    </div>
                    <p className="text-blue-200 text-sm mb-3 font-mono bg-black/20 p-3 rounded">
                      {integrityFormula}
                    </p>
                    <p className="text-blue-200 text-sm">{integrityExplanation}</p>
                    {integritySources && integritySources.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-semibold text-blue-200 mb-1">Cited Sources:</h4>
                        <ul className="space-y-1">
                          {integritySources.map((source, idx) => (
                            <li key={`source-${idx}`} className="text-xs text-blue-300 hover:text-blue-100">
                              <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                <LinkIcon className="h-3 w-3 mr-1.5 flex-shrink-0" />
                                {source.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                {director && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                       <Briefcase className="h-5 w-5 text-blue-400" />
                       <h3 className="text-lg font-semibold text-white">Facility Director</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-blue-200 text-sm">Director</p>
                        <p className="text-white font-medium">{director}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm">Director Score</p>
                        <p className={`font-bold ${directorScore < 30 ? 'text-red-400' : directorScore < 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {directorScore}%
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-sm">Tenure</p>
                        <p className="text-white font-medium">{directorTenure}</p>
                      </div>
                    </div>
                  </div>
                )}

                {entities.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Scored Entities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {entities.map((entity, index) => (
                        <div key={index} className="text-center p-3 rounded-lg bg-white/5">
                          <p className="text-white font-medium">{entity}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {facilities && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-blue-400" />
                      <span className="text-white font-medium">{facilities} Facilities</span>
                    </div>
                  </div>
                )}

                {representatives.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-5 w-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Congressional Representatives</h3>
                    </div>
                    <p className="text-blue-200 text-xs mb-1 font-mono bg-black/20 p-2 rounded">
                      Formula: {representativeScoreFormula}
                    </p>
                    <p className="text-blue-200 text-xs mb-3">
                      This score reflects the representative&apos;s effectiveness in overseeing VA facilities within their jurisdiction based on available data.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {representatives.map((rep, index) => (
                        <div key={index} className="representative-card p-3 bg-black/20 rounded-lg">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="text-white font-semibold text-sm">{rep.name}</p>
                              <p className="text-blue-200 text-xs">
                                {rep.role || `${rep.party} - ${rep.district || rep.state}`}
                              </p>
                            </div>
                            {rep.score !== undefined && rep.score !== null && (
                              <div className="text-right">
                                <p className={`font-bold text-xl ${getRepScoreColor(rep.score)}`}>
                                  {rep.score.toFixed(1)}%
                                </p>
                                <p className="text-blue-300 text-xs">Rep Score</p>
                              </div>
                            )}
                          </div>
                           {rep.contactUrl && <a href={rep.contactUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-200 flex items-center"><LinkIcon className="h-3 w-3 mr-1"/>Contact</a>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">10-Year Performance Trend</h3>
                  <div className="h-32 bg-black/20 rounded-lg flex items-center justify-center">
                    <p className="text-blue-400">Historical trend chart would appear here</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ScoreCard;