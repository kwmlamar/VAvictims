-- Fix Missing VISN and National Scores
-- This script directly adds the missing scorecards

-- First, let's see what VISNs we have and their facility scores
SELECT 
  'VISN ANALYSIS' as info,
  v.name as visn_name,
  v.id as visn_id,
  COUNT(f.id) as facility_count,
  AVG(facility_scores.score) as avg_facility_score
FROM visns v
LEFT JOIN va_facilities f ON v.id = f.visn_id
LEFT JOIN (
  SELECT 
    f.visn_id,
    s.score
  FROM scorecards s
  JOIN va_facilities f ON s.entity_id = f.id
  WHERE s.entity_type = 'facility'
) facility_scores ON v.id = facility_scores.visn_id
GROUP BY v.id, v.name;

-- Now add VISN scorecards
INSERT INTO scorecards (entity_type, entity_id, score, created_at, updated_at)
SELECT 
  'visn' as entity_type,
  v.id as entity_id,
  AVG(s.score) as score,
  NOW() as created_at,
  NOW() as updated_at
FROM scorecards s
JOIN va_facilities f ON s.entity_id = f.id
JOIN visns v ON f.visn_id = v.id
WHERE s.entity_type = 'facility'
GROUP BY v.id, v.name;

-- Add national scorecard
INSERT INTO scorecards (entity_type, entity_id, score, created_at, updated_at)
SELECT 
  'national' as entity_type,
  '00000000-0000-0000-0000-000000000000' as entity_id,
  AVG(visn_score) as score,
  NOW() as created_at,
  NOW() as updated_at
FROM (
  SELECT 
    v.id as visn_id,
    AVG(s.score) as visn_score
  FROM scorecards s
  JOIN va_facilities f ON s.entity_id = f.id
  JOIN visns v ON f.visn_id = v.id
  WHERE s.entity_type = 'facility'
  GROUP BY v.id
) visn_scores;

-- Show final results
SELECT 
  entity_type,
  COUNT(*) as count,
  AVG(score) as avg_score
FROM scorecards 
GROUP BY entity_type
ORDER BY entity_type;

-- Show the national score
SELECT 'NATIONAL SCORE' as level, score FROM scorecards WHERE entity_type = 'national';

-- Show VISN scores
SELECT 'VISN SCORES' as level, v.name, s.score 
FROM scorecards s 
JOIN visns v ON s.entity_id = v.id 
WHERE s.entity_type = 'visn' 
ORDER BY s.score DESC; 