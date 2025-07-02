-- Calculate National Scores - Verified for Current Database Schema
-- This script calculates facility, VISN, and national scores using real linked data

-- First, clear existing scorecards to avoid duplicates
DELETE FROM scorecards;

-- Step 1: Calculate and insert facility scores
-- Formula: (complaints * 0.6) + (OIG reports * 0.4)
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

-- Step 2: Calculate and insert VISN scores (average of facility scores in each VISN)
INSERT INTO scorecards (entity_type, entity_id, score, created_at, updated_at)
SELECT 
  'visn' as entity_type,
  v.id as entity_id,
  AVG(facility_score) as score,
  NOW() as created_at,
  NOW() as updated_at
FROM (
  SELECT 
    f.visn_id,
    (COALESCE(COUNT(DISTINCT c.id), 0) * 0.6 + COALESCE(COUNT(DISTINCT o.id), 0) * 0.4) as facility_score
  FROM va_facilities f
  LEFT JOIN user_submitted_complaints c ON f.id = c.facility_id
  LEFT JOIN oig_report_entries o ON f.id = o.facility_id
  GROUP BY f.id, f.visn_id
) facility_scores
JOIN visns v ON facility_scores.visn_id = v.id
GROUP BY v.id, v.name
HAVING AVG(facility_score) > 0;

-- Step 3: Calculate and insert national score (average of all VISN scores)
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
    AVG(facility_score) as visn_score
  FROM (
    SELECT 
      f.visn_id,
      (COALESCE(COUNT(DISTINCT c.id), 0) * 0.6 + COALESCE(COUNT(DISTINCT o.id), 0) * 0.4) as facility_score
    FROM va_facilities f
    LEFT JOIN user_submitted_complaints c ON f.id = c.facility_id
    LEFT JOIN oig_report_entries o ON f.id = o.facility_id
    GROUP BY f.id, f.visn_id
  ) facility_scores
  JOIN visns v ON facility_scores.visn_id = v.id
  GROUP BY v.id
) visn_scores
HAVING AVG(visn_score) > 0;

-- Show the results
SELECT 'NATIONAL SCORE CALCULATED' as status, score FROM scorecards WHERE entity_type = 'national';

SELECT 'VISN SCORES' as level, v.name, s.score 
FROM scorecards s 
JOIN visns v ON s.entity_id = v.id 
WHERE s.entity_type = 'visn' 
ORDER BY s.score DESC;

SELECT 'TOP FACILITY SCORES' as level, f.name, s.score 
FROM scorecards s 
JOIN va_facilities f ON s.entity_id = f.id 
WHERE s.entity_type = 'facility' 
ORDER BY s.score DESC 
LIMIT 10; 