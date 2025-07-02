-- Fix Scores - Robust Version
-- This script handles NULL values and ensures all scorecards are created

-- First, let's see what we have
SELECT 
  'CURRENT STATE' as info,
  entity_type,
  COUNT(*) as count
FROM scorecards 
GROUP BY entity_type;

-- Step 1: Add VISN scores (only if we have facility scores)
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
HAVING AVG(s.score) IS NOT NULL AND AVG(s.score) > 0;

-- Step 2: Add national score (only if we have VISN scores)
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
  HAVING AVG(s.score) IS NOT NULL AND AVG(s.score) > 0
) visn_scores
HAVING AVG(visn_score) IS NOT NULL AND AVG(visn_score) > 0;

-- Show final results
SELECT 
  'FINAL RESULTS' as info,
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

-- If no national score was created, let's create one directly from facility scores
INSERT INTO scorecards (entity_type, entity_id, score, created_at, updated_at)
SELECT 
  'national' as entity_type,
  '00000000-0000-0000-0000-000000000000' as entity_id,
  AVG(s.score) as score,
  NOW() as created_at,
  NOW() as updated_at
FROM scorecards s
WHERE s.entity_type = 'facility'
HAVING AVG(s.score) IS NOT NULL AND AVG(s.score) > 0
ON CONFLICT (entity_type, entity_id) DO NOTHING;

-- Show final check
SELECT 'FINAL CHECK' as info, entity_type, COUNT(*) as count FROM scorecards GROUP BY entity_type ORDER BY entity_type; 