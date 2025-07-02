-- Check and Fix VISN Relationship
-- This script checks the VISN relationship and fixes it

-- Check what VISNs we have
SELECT 'VISNS IN DATABASE' as info, id, name FROM visns;

-- Check if facilities have visn_id
SELECT 'FACILITIES WITH VISN_ID' as info, COUNT(*) as count FROM va_facilities WHERE visn_id IS NOT NULL;
SELECT 'FACILITIES WITHOUT VISN_ID' as info, COUNT(*) as count FROM va_facilities WHERE visn_id IS NULL;

-- Show a few facilities and their visn_id
SELECT 'SAMPLE FACILITIES' as info, name, visn_id FROM va_facilities LIMIT 5;

-- If facilities don't have visn_id, let's set them to VISN 7
-- First, get the VISN 7 ID
WITH visn7 AS (
  SELECT id FROM visns WHERE name LIKE '%7%' OR name LIKE '%VISN 7%' LIMIT 1
)
UPDATE va_facilities 
SET visn_id = (SELECT id FROM visn7)
WHERE visn_id IS NULL;

-- Now try to create VISN scores again
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