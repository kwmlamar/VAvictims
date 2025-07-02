-- Calculate Real Scores with Linked OIG Reports
-- This script calculates facility, VISN, and national scores using real linked data

-- Step 1: Calculate facility scores from complaints and OIG reports
WITH facility_scores AS (
  SELECT 
    f.id as facility_id,
    f.name as facility_name,
    f.visn_id,
    f.state,
    -- Count complaints (60% weight)
    COALESCE(COUNT(DISTINCT c.id), 0) as complaint_count,
    -- Count OIG reports (40% weight) 
    COALESCE(COUNT(DISTINCT o.id), 0) as oig_report_count,
    -- Calculate weighted score: complaints * 0.6 + OIG reports * 0.4
    (COALESCE(COUNT(DISTINCT c.id), 0) * 0.6 + COALESCE(COUNT(DISTINCT o.id), 0) * 0.4) as calculated_score
  FROM va_facilities f
  LEFT JOIN user_submitted_complaints c ON f.id = c.facility_id
  LEFT JOIN oig_report_entries o ON f.id = o.facility_id
  GROUP BY f.id, f.name, f.visn_id, f.state
),
-- Step 2: Calculate VISN scores (average of facility scores)
visn_scores AS (
  SELECT 
    v.id as visn_id,
    v.name as visn_name,
    v.number as visn_number,
    COUNT(f.id) as facility_count,
    AVG(fs.calculated_score) as avg_facility_score,
    SUM(fs.calculated_score) as total_facility_score
  FROM visns v
  LEFT JOIN va_facilities f ON v.id = f.visn_id
  LEFT JOIN facility_scores fs ON f.id = fs.facility_id
  GROUP BY v.id, v.name, v.number
),
-- Step 3: Calculate national score (average of VISN scores)
national_score AS (
  SELECT 
    AVG(vs.avg_facility_score) as national_avg_score,
    COUNT(vs.visn_id) as total_visns,
    SUM(vs.total_facility_score) as total_facility_scores
  FROM visn_scores vs
)
-- Step 4: Insert/Update all scorecards
SELECT 
  'Facility Scores' as score_type,
  facility_name,
  complaint_count,
  oig_report_count,
  calculated_score,
  state
FROM facility_scores
ORDER BY calculated_score DESC
LIMIT 10;

-- Now let's insert/update the actual scorecards
-- First, clear existing scorecards
DELETE FROM scorecards;

-- Insert facility scorecards
INSERT INTO scorecards (entity_type, entity_id, score, created_at, updated_at)
SELECT 
  'facility' as entity_type,
  fs.facility_id as entity_id,
  fs.calculated_score as score,
  NOW() as created_at,
  NOW() as updated_at
FROM facility_scores fs
WHERE fs.calculated_score > 0;

-- Insert VISN scorecards
INSERT INTO scorecards (entity_type, entity_id, score, created_at, updated_at)
SELECT 
  'visn' as entity_type,
  vs.visn_id as entity_id,
  vs.avg_facility_score as score,
  NOW() as created_at,
  NOW() as updated_at
FROM visn_scores vs
WHERE vs.avg_facility_score > 0;

-- Insert national scorecard
INSERT INTO scorecards (entity_type, entity_id, score, created_at, updated_at)
SELECT 
  'national' as entity_type,
  '00000000-0000-0000-0000-000000000000' as entity_id,
  ns.national_avg_score as score,
  NOW() as created_at,
  NOW() as updated_at
FROM national_score ns
WHERE ns.national_avg_score > 0;

-- Show final results
SELECT 
  'NATIONAL SCORE' as level,
  'National' as name,
  score,
  created_at
FROM scorecards 
WHERE entity_type = 'national'

UNION ALL

SELECT 
  'VISN SCORES' as level,
  v.name as name,
  s.score,
  s.created_at
FROM scorecards s
JOIN visns v ON s.entity_id = v.id
WHERE s.entity_type = 'visn'

UNION ALL

SELECT 
  'TOP FACILITY SCORES' as level,
  f.name as name,
  s.score,
  s.created_at
FROM scorecards s
JOIN va_facilities f ON s.entity_id = f.id
WHERE s.entity_type = 'facility'
ORDER BY s.score DESC
LIMIT 10; 