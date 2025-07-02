-- Clean Up Test Data and Keep Only Real Data
-- This script removes test/mock data and recalculates scores with real data only

-- Step 1: Remove test complaints (those with obvious test patterns)
DELETE FROM user_submitted_complaints 
WHERE description ILIKE '%test%' 
   OR description ILIKE '%sample%' 
   OR description ILIKE '%mock%'
   OR veteran_name ILIKE '%test%'
   OR veteran_name ILIKE '%sample%'
   OR veteran_name ILIKE '%mock%'
   OR veteran_name ILIKE '%John Doe%'
   OR veteran_name ILIKE '%Jane Doe%'
   OR veteran_name ILIKE '%Test User%';

-- Step 2: Remove test OIG reports (those with obvious test patterns)
DELETE FROM oig_report_entries 
WHERE summary_of_violations ILIKE '%test%' 
   OR summary_of_violations ILIKE '%sample%' 
   OR summary_of_violations ILIKE '%mock%'
   OR facility_name ILIKE '%test%'
   OR facility_name ILIKE '%sample%'
   OR facility_name ILIKE '%mock%';

-- Step 3: Clear all scorecards (will recalculate with real data only)
DELETE FROM scorecards;

-- Step 4: Recalculate scores with remaining real data
-- Calculate facility scores from real complaints and OIG reports
INSERT INTO scorecards (entity_type, entity_id, score, created_at, updated_at)
SELECT 
  'facility' as entity_type,
  f.id as entity_id,
  (COALESCE(COUNT(DISTINCT c.id), 0) * 0.6 + COALESCE(COUNT(DISTINCT o.id), 0) * 0.4) as score,
  NOW() as created_at,
  NOW() as updated_at
FROM va_facilities f
LEFT JOIN user_submitted_complaints c ON f.id = c.facility_id
LEFT JOIN oig_report_entries o ON f.id = o.facility_id
GROUP BY f.id, f.name
HAVING (COALESCE(COUNT(DISTINCT c.id), 0) * 0.6 + COALESCE(COUNT(DISTINCT o.id), 0) * 0.4) > 0;

-- Calculate VISN scores
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

-- Calculate national score
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

-- Show results after cleanup
SELECT 
  'DATA SUMMARY AFTER CLEANUP' as status,
  'Complaints remaining' as data_type,
  COUNT(*) as count
FROM user_submitted_complaints

UNION ALL

SELECT 
  'DATA SUMMARY AFTER CLEANUP' as status,
  'OIG reports remaining' as data_type,
  COUNT(*) as count
FROM oig_report_entries

UNION ALL

SELECT 
  'DATA SUMMARY AFTER CLEANUP' as status,
  'Scorecards created' as data_type,
  COUNT(*) as count
FROM scorecards;

-- Show final scores
SELECT 'NATIONAL SCORE (REAL DATA ONLY)' as level, score FROM scorecards WHERE entity_type = 'national';

SELECT 'VISN SCORES (REAL DATA ONLY)' as level, v.name, s.score 
FROM scorecards s 
JOIN visns v ON s.entity_id = v.id 
WHERE s.entity_type = 'visn' 
ORDER BY s.score DESC;

SELECT 'FACILITY SCORES (REAL DATA ONLY)' as level, f.name, s.score 
FROM scorecards s 
JOIN va_facilities f ON s.entity_id = f.id 
WHERE s.entity_type = 'facility' 
ORDER BY s.score DESC 
LIMIT 10; 