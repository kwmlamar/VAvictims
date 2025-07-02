-- Diagnose VISN Score Issue
-- This script helps identify why VISN scores aren't being created

-- Check if facilities have visn_id values
SELECT 
  'FACILITY VISN CHECK' as info,
  f.name as facility_name,
  f.visn_id,
  v.name as visn_name,
  s.score as facility_score
FROM va_facilities f
LEFT JOIN visns v ON f.visn_id = v.id
LEFT JOIN scorecards s ON f.id = s.entity_id AND s.entity_type = 'facility'
ORDER BY f.name;

-- Check what VISNs exist
SELECT 
  'VISNS IN DATABASE' as info,
  id,
  name,
  region
FROM visns
ORDER BY name;

-- Check if any facilities are missing visn_id
SELECT 
  'FACILITIES WITHOUT VISN_ID' as info,
  COUNT(*) as count
FROM va_facilities 
WHERE visn_id IS NULL;

-- Try to manually create VISN scores with explicit VISN ID
-- First, let's find the VISN 7 ID
SELECT 
  'VISN 7 ID' as info,
  id,
  name
FROM visns 
WHERE name LIKE '%7%' OR name LIKE '%VISN 7%';

-- Now let's manually create VISN scores using the VISN 7 ID
-- (We'll replace 'VISN_7_ID_HERE' with the actual ID from above)
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