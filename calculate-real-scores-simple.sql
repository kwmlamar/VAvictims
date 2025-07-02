-- Calculate Real Scores with Linked OIG Reports (Simplified Version)
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
-- Step 4: Show facility scores preview
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