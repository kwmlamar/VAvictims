-- Comprehensive Scoring Solution
-- This script links existing data and calculates scores without constraint violations

-- ============================================================================
-- 1. LINK COMPLAINTS TO FACILITIES (SAFE APPROACH)
-- ============================================================================

-- First, let's see what complaints we can link based on facility names
WITH complaint_matches AS (
    SELECT 
        usc.id as complaint_id,
        usc.facility_name_submitted,
        vf.id as facility_id,
        vf.name as actual_facility_name,
        vf.visn,
        CASE 
            WHEN LOWER(usc.facility_name_submitted) = LOWER(vf.name) THEN 'exact'
            WHEN LOWER(usc.facility_name_submitted) LIKE '%' || LOWER(vf.name) || '%' THEN 'contains'
            WHEN LOWER(vf.name) LIKE '%' || LOWER(usc.facility_name_submitted) || '%' THEN 'contained'
            ELSE 'fuzzy'
        END as match_type
    FROM user_submitted_complaints usc
    JOIN va_facilities vf ON 
        LOWER(usc.facility_name_submitted) = LOWER(vf.name)
        OR LOWER(usc.facility_name_submitted) LIKE '%' || LOWER(vf.name) || '%'
        OR LOWER(vf.name) LIKE '%' || LOWER(usc.facility_name_submitted) || '%'
    WHERE usc.facility_id IS NULL
)
SELECT 
    'Complaints that can be linked' as metric,
    COUNT(*) as count
FROM complaint_matches
WHERE match_type IN ('exact', 'contains')
UNION ALL
SELECT 
    'Complaints that cannot be linked' as metric,
    (SELECT COUNT(*) FROM user_submitted_complaints WHERE facility_id IS NULL) - 
    (SELECT COUNT(*) FROM complaint_matches WHERE match_type IN ('exact', 'contains'))
UNION ALL
SELECT 
    'Complaints already linked' as metric,
    COUNT(*) 
FROM user_submitted_complaints 
WHERE facility_id IS NOT NULL;

-- ============================================================================
-- 2. LINK OIG REPORTS TO FACILITIES (SAFE APPROACH)
-- ============================================================================

-- See what OIG reports we can link
WITH oig_matches AS (
    SELECT 
        oig.id as oig_id,
        oig.facility_name,
        vf.id as facility_id,
        vf.name as actual_facility_name,
        vf.visn,
        CASE 
            WHEN LOWER(oig.facility_name) = LOWER(vf.name) THEN 'exact'
            WHEN LOWER(oig.facility_name) LIKE '%' || LOWER(vf.name) || '%' THEN 'contains'
            WHEN LOWER(vf.name) LIKE '%' || LOWER(oig.facility_name) || '%' THEN 'contained'
            ELSE 'fuzzy'
        END as match_type
    FROM oig_report_entries oig
    JOIN va_facilities vf ON 
        LOWER(oig.facility_name) = LOWER(vf.name)
        OR LOWER(oig.facility_name) LIKE '%' || LOWER(vf.name) || '%'
        OR LOWER(vf.name) LIKE '%' || LOWER(oig.facility_name) || '%'
    WHERE oig.facility_id IS NULL
)
SELECT 
    'OIG Reports that can be linked' as metric,
    COUNT(*) as count
FROM oig_matches
WHERE match_type IN ('exact', 'contains')
UNION ALL
SELECT 
    'OIG Reports that cannot be linked' as metric,
    (SELECT COUNT(*) FROM oig_report_entries WHERE facility_id IS NULL) - 
    (SELECT COUNT(*) FROM oig_matches WHERE match_type IN ('exact', 'contains'))
UNION ALL
SELECT 
    'OIG Reports already linked' as metric,
    COUNT(*) 
FROM oig_report_entries 
WHERE facility_id IS NOT NULL;

-- ============================================================================
-- 3. ACTUAL LINKING SCRIPT (SAFE UPDATES)
-- ============================================================================

-- Link complaints to facilities (only exact and contains matches)
UPDATE user_submitted_complaints 
SET facility_id = vf.id
FROM va_facilities vf
WHERE user_submitted_complaints.facility_id IS NULL
  AND user_submitted_complaints.facility_name_submitted IS NOT NULL
  AND (
      LOWER(user_submitted_complaints.facility_name_submitted) = LOWER(vf.name)
      OR LOWER(user_submitted_complaints.facility_name_submitted) LIKE '%' || LOWER(vf.name) || '%'
  );

-- Link OIG reports to facilities (only exact and contains matches)
UPDATE oig_report_entries 
SET facility_id = vf.id
FROM va_facilities vf
WHERE oig_report_entries.facility_id IS NULL
  AND oig_report_entries.facility_name IS NOT NULL
  AND (
      LOWER(oig_report_entries.facility_name) = LOWER(vf.name)
      OR LOWER(oig_report_entries.facility_name) LIKE '%' || LOWER(vf.name) || '%'
  );

-- ============================================================================
-- 4. SCORE CALCULATION FUNCTIONS
-- ============================================================================

-- Function to calculate facility score
CREATE OR REPLACE FUNCTION calculate_facility_score(facility_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    complaint_score NUMERIC := 0;
    oig_score NUMERIC := 0;
    total_score NUMERIC := 0;
    complaint_count INTEGER := 0;
    oig_count INTEGER := 0;
BEGIN
    -- Calculate complaint score (weight: 60%)
    SELECT 
        COUNT(*),
        COUNT(*) * 10  -- Each complaint adds 10 points
    INTO complaint_count, complaint_score
    FROM user_submitted_complaints 
    WHERE facility_id = facility_uuid;
    
    -- Calculate OIG report score (weight: 40%)
    SELECT 
        COUNT(*),
        COUNT(*) * 15  -- Each OIG report adds 15 points
    INTO oig_count, oig_score
    FROM oig_report_entries 
    WHERE facility_id = facility_uuid;
    
    -- Calculate total score (weighted average)
    IF complaint_count > 0 OR oig_count > 0 THEN
        total_score := (complaint_score * 0.6) + (oig_score * 0.4);
    END IF;
    
    RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate VISN score
CREATE OR REPLACE FUNCTION calculate_visn_score(visn_number TEXT)
RETURNS NUMERIC AS $$
DECLARE
    facility_count INTEGER := 0;
    total_facility_score NUMERIC := 0;
    avg_score NUMERIC := 0;
BEGIN
    -- Get average facility score for this VISN
    SELECT 
        COUNT(*),
        COALESCE(AVG(calculate_facility_score(vf.id)), 0)
    INTO facility_count, avg_score
    FROM va_facilities vf
    WHERE vf.visn = visn_number;
    
    RETURN avg_score;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate national score
CREATE OR REPLACE FUNCTION calculate_national_score()
RETURNS NUMERIC AS $$
DECLARE
    total_visn_score NUMERIC := 0;
    visn_count INTEGER := 0;
    national_score NUMERIC := 0;
BEGIN
    -- Get average VISN score
    SELECT 
        COUNT(DISTINCT visn),
        COALESCE(AVG(calculate_visn_score(visn)), 0)
    INTO visn_count, national_score
    FROM va_facilities;
    
    RETURN national_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. CREATE/UPDATE SCORECARDS
-- ============================================================================

-- Clear existing scorecards
DELETE FROM scorecards;

-- Insert facility scorecards
INSERT INTO scorecards (entity_type, entity_id, score, criteria, data_summary)
SELECT 
    'facility' as entity_type,
    vf.id as entity_id,
    calculate_facility_score(vf.id) as score,
    jsonb_build_object(
        'complaint_weight', 0.6,
        'oig_weight', 0.4,
        'complaint_points_per_item', 10,
        'oig_points_per_item', 15
    ) as criteria,
    jsonb_build_object(
        'complaint_count', COALESCE(complaint_stats.count, 0),
        'oig_count', COALESCE(oig_stats.count, 0),
        'facility_name', vf.name,
        'visn', vf.visn
    ) as data_summary
FROM va_facilities vf
LEFT JOIN (
    SELECT facility_id, COUNT(*) as count
    FROM user_submitted_complaints
    WHERE facility_id IS NOT NULL
    GROUP BY facility_id
) complaint_stats ON vf.id = complaint_stats.facility_id
LEFT JOIN (
    SELECT facility_id, COUNT(*) as count
    FROM oig_report_entries
    WHERE facility_id IS NOT NULL
    GROUP BY facility_id
) oig_stats ON vf.id = oig_stats.facility_id
WHERE calculate_facility_score(vf.id) > 0;

-- Insert VISN scorecards
INSERT INTO scorecards (entity_type, entity_id, score, criteria, data_summary)
SELECT 
    'visn' as entity_type,
    vf.visn::uuid as entity_id,
    calculate_visn_score(vf.visn) as score,
    jsonb_build_object(
        'calculation_method', 'average_facility_scores',
        'facility_count', facility_count.count
    ) as criteria,
    jsonb_build_object(
        'visn_number', vf.visn,
        'facility_count', facility_count.count,
        'facilities_with_scores', score_count.count
    ) as data_summary
FROM va_facilities vf
JOIN (
    SELECT visn, COUNT(*) as count
    FROM va_facilities
    GROUP BY visn
) facility_count ON vf.visn = facility_count.visn
JOIN (
    SELECT visn, COUNT(*) as count
    FROM va_facilities vf2
    WHERE calculate_facility_score(vf2.id) > 0
    GROUP BY visn
) score_count ON vf.visn = score_count.visn
GROUP BY vf.visn, facility_count.count, score_count.count;

-- Insert national scorecard
INSERT INTO scorecards (entity_type, entity_id, score, criteria, data_summary)
SELECT 
    'national' as entity_type,
    '00000000-0000-0000-0000-000000000000'::uuid as entity_id,
    calculate_national_score() as score,
    jsonb_build_object(
        'calculation_method', 'average_visn_scores',
        'visn_count', visn_count.count
    ) as criteria,
    jsonb_build_object(
        'total_facilities', facility_count.count,
        'facilities_with_scores', score_count.count,
        'visn_count', visn_count.count
    ) as data_summary
FROM (
    SELECT COUNT(DISTINCT visn) as count FROM va_facilities
) visn_count
CROSS JOIN (
    SELECT COUNT(*) as count FROM va_facilities
) facility_count
CROSS JOIN (
    SELECT COUNT(*) as count FROM va_facilities WHERE calculate_facility_score(id) > 0
) score_count;

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Show final results
SELECT '=== FINAL RESULTS ===' as section;

-- Linked data summary
SELECT 
    'Complaints linked to facilities' as metric,
    COUNT(*) as count
FROM user_submitted_complaints 
WHERE facility_id IS NOT NULL
UNION ALL
SELECT 
    'OIG Reports linked to facilities' as metric,
    COUNT(*) as count
FROM oig_report_entries 
WHERE facility_id IS NOT NULL;

-- Scorecard summary
SELECT 
    entity_type,
    COUNT(*) as count,
    AVG(score) as avg_score,
    MIN(score) as min_score,
    MAX(score) as max_score
FROM scorecards 
GROUP BY entity_type
ORDER BY entity_type;

-- Top scoring facilities
SELECT 
    vf.name as facility_name,
    vf.visn,
    sc.score,
    sc.data_summary->>'complaint_count' as complaints,
    sc.data_summary->>'oig_count' as oig_reports
FROM scorecards sc
JOIN va_facilities vf ON sc.entity_id = vf.id
WHERE sc.entity_type = 'facility'
ORDER BY sc.score DESC
LIMIT 10; 