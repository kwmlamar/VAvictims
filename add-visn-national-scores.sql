-- Add Missing VISN and National Scores
-- This script adds VISN and national scorecards that are missing from the scorecards table

-- Step 1: Calculate and insert VISN scores (average of facility scores in each VISN)
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
GROUP BY v.id, v.name
HAVING AVG(s.score) > 0;

-- Step 2: Calculate and insert national score (average of all VISN scores)
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
) visn_scores
HAVING AVG(visn_score) > 0;

-- Show what's now in the scorecards table
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