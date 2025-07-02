-- Add VISN Scores Only
-- This script adds the missing VISN scorecards

-- Add VISN scores
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

-- Show final results
SELECT 
  entity_type,
  COUNT(*) as count,
  AVG(score) as avg_score
FROM scorecards 
GROUP BY entity_type
ORDER BY entity_type;

-- Show VISN scores
SELECT 'VISN SCORES' as level, v.name, s.score 
FROM scorecards s 
JOIN visns v ON s.entity_id = v.id 
WHERE s.entity_type = 'visn' 
ORDER BY s.score DESC; 