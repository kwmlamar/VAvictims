-- Calculate Real Scores for VA Accountability Platform (Alternative Version)
-- This script calculates facility, VISN, and national scores based on actual data
-- Uses DELETE/INSERT instead of ON CONFLICT to avoid constraint issues

-- Step 1: Create a function to calculate facility scores
CREATE OR REPLACE FUNCTION calculate_facility_score(facility_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    base_score NUMERIC := 100;
    complaint_penalty NUMERIC := 0;
    oig_penalty NUMERIC := 0;
    repeat_violation_penalty NUMERIC := 0;
    total_complaints INTEGER := 0;
    total_oig_reports INTEGER := 0;
    repeat_violations INTEGER := 0;
    final_score NUMERIC;
BEGIN
    -- Count complaints for this facility
    SELECT COUNT(*) INTO total_complaints
    FROM user_submitted_complaints
    WHERE facility_id = facility_uuid;
    
    -- Count OIG reports for this facility
    SELECT COUNT(*) INTO total_oig_reports
    FROM oig_report_entries
    WHERE facility_id = facility_uuid;
    
    -- Count repeat violations from OIG reports
    SELECT COUNT(*) INTO repeat_violations
    FROM oig_report_entries
    WHERE facility_id = facility_uuid 
      AND repeat_violations_summary IS NOT NULL 
      AND repeat_violations_summary != '';
    
    -- Calculate penalties
    -- Each complaint reduces score by 2 points (max 40 points)
    complaint_penalty := LEAST(total_complaints * 2, 40);
    
    -- Each OIG report reduces score by 15 points (max 45 points)
    oig_penalty := LEAST(total_oig_reports * 15, 45);
    
    -- Each repeat violation reduces score by 10 points (max 30 points)
    repeat_violation_penalty := LEAST(repeat_violations * 10, 30);
    
    -- Calculate final score
    final_score := GREATEST(base_score - complaint_penalty - oig_penalty - repeat_violation_penalty, 0);
    
    RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create a function to calculate VISN scores
CREATE OR REPLACE FUNCTION calculate_visn_score(visn_name TEXT)
RETURNS NUMERIC AS $$
DECLARE
    facility_scores NUMERIC[];
    lowest_50_percent_scores NUMERIC[];
    lowest_score NUMERIC;
    avg_lowest_50 NUMERIC;
    final_score NUMERIC;
BEGIN
    -- Get all facility scores for this VISN
    SELECT ARRAY_AGG(calculate_facility_score(f.id)) INTO facility_scores
    FROM va_facilities f
    WHERE f.visn = visn_name;
    
    -- If no facilities, return 0
    IF facility_scores IS NULL OR array_length(facility_scores, 1) = 0 THEN
        RETURN 0;
    END IF;
    
    -- Sort scores and get lowest 50%
    SELECT array_agg(score ORDER BY score) INTO lowest_50_percent_scores
    FROM (
        SELECT unnest(facility_scores) as score
        ORDER BY score
        LIMIT GREATEST(array_length(facility_scores, 1) / 2, 1)
    ) subq;
    
    -- Get the single lowest score
    SELECT MIN(score) INTO lowest_score
    FROM unnest(facility_scores) as score;
    
    -- Calculate average of lowest 50%
    SELECT AVG(score) INTO avg_lowest_50
    FROM unnest(lowest_50_percent_scores) as score;
    
    -- Apply formula: (Average of lowest 50% + lowest score) / 2
    final_score := (avg_lowest_50 + lowest_score) / 2;
    
    RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create a function to calculate national score
CREATE OR REPLACE FUNCTION calculate_national_score()
RETURNS NUMERIC AS $$
DECLARE
    visn_scores NUMERIC[];
    lowest_50_percent_visns NUMERIC[];
    lowest_visn_score NUMERIC;
    avg_lowest_50 NUMERIC;
    final_score NUMERIC;
BEGIN
    -- Get all VISN scores
    SELECT ARRAY_AGG(calculate_visn_score(v.name)) INTO visn_scores
    FROM visns v;
    
    -- If no VISNs, return 0
    IF visn_scores IS NULL OR array_length(visn_scores, 1) = 0 THEN
        RETURN 0;
    END IF;
    
    -- Sort scores and get lowest 50%
    SELECT array_agg(score ORDER BY score) INTO lowest_50_percent_visns
    FROM (
        SELECT unnest(visn_scores) as score
        ORDER BY score
        LIMIT GREATEST(array_length(visn_scores, 1) / 2, 1)
    ) subq;
    
    -- Get the single lowest VISN score
    SELECT MIN(score) INTO lowest_visn_score
    FROM unnest(visn_scores) as score;
    
    -- Calculate average of lowest 50%
    SELECT AVG(score) INTO avg_lowest_50
    FROM unnest(lowest_50_percent_visns) as score;
    
    -- Apply formula: (Average of lowest 50% + lowest score) / 2
    final_score := (avg_lowest_50 + lowest_visn_score) / 2;
    
    RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Clear existing scorecards and insert new facility scorecards
DELETE FROM scorecards WHERE entity_type = 'facility';

INSERT INTO scorecards (entity_type, entity_id, score, data_summary, criteria)
SELECT 
    'facility' as entity_type,
    f.id as entity_id,
    calculate_facility_score(f.id) as score,
    jsonb_build_object(
        'integrity_score', GREATEST(calculate_facility_score(f.id) - 10, 0),
        'complaints_count', COALESCE(complaint_counts.count, 0),
        'oig_reports_count', COALESCE(oig_counts.count, 0),
        'repeat_violations', COALESCE(repeat_violation_counts.count, 0),
        'facility_name', f.name,
        'visn', f.visn,
        'state', f.state,
        'city', f.city
    ) as data_summary,
    jsonb_build_object(
        'performance_weight', 0.6,
        'integrity_weight', 0.4,
        'complaint_penalty_per_item', 2,
        'oig_penalty_per_item', 15,
        'repeat_violation_penalty_per_item', 10
    ) as criteria
FROM va_facilities f
LEFT JOIN (
    SELECT facility_id, COUNT(*) as count
    FROM user_submitted_complaints
    GROUP BY facility_id
) complaint_counts ON f.id = complaint_counts.facility_id
LEFT JOIN (
    SELECT facility_id, COUNT(*) as count
    FROM oig_report_entries
    GROUP BY facility_id
) oig_counts ON f.id = oig_counts.facility_id
LEFT JOIN (
    SELECT facility_id, COUNT(*) as count
    FROM oig_report_entries
    WHERE repeat_violations_summary IS NOT NULL AND repeat_violations_summary != ''
    GROUP BY facility_id
) repeat_violation_counts ON f.id = repeat_violation_counts.facility_id
WHERE f.name IS NOT NULL AND f.name != '';

-- Step 5: Clear existing VISN scorecards and insert new ones
DELETE FROM scorecards WHERE entity_type = 'visn';

INSERT INTO scorecards (entity_type, entity_id, score, data_summary, criteria)
SELECT 
    'visn' as entity_type,
    v.id as entity_id,
    calculate_visn_score(v.name) as score,
    jsonb_build_object(
        'integrity_score', GREATEST(calculate_visn_score(v.name) - 15, 0),
        'facility_count', COALESCE(facility_counts.count, 0),
        'visn_name', v.name,
        'region', v.region,
        'lowest_facility_score', COALESCE(lowest_scores.min_score, 0),
        'avg_facility_score', COALESCE(avg_scores.avg_score, 0)
    ) as data_summary,
    jsonb_build_object(
        'performance_weight', 0.6,
        'integrity_weight', 0.4,
        'formula', 'Average of lowest 50% facilities + lowest facility score ÷ 2'
    ) as criteria
FROM visns v
LEFT JOIN (
    SELECT visn, COUNT(*) as count
    FROM va_facilities
    GROUP BY visn
) facility_counts ON v.name = facility_counts.visn
LEFT JOIN (
    SELECT f.visn, MIN(calculate_facility_score(f.id)) as min_score
    FROM va_facilities f
    GROUP BY f.visn
) lowest_scores ON v.name = lowest_scores.visn
LEFT JOIN (
    SELECT f.visn, AVG(calculate_facility_score(f.id)) as avg_score
    FROM va_facilities f
    GROUP BY f.visn
) avg_scores ON v.name = avg_scores.visn;

-- Step 6: Clear existing national scorecard and insert new one
DELETE FROM scorecards WHERE entity_type = 'national';

INSERT INTO scorecards (entity_type, entity_id, score, data_summary, criteria)
VALUES (
    'national',
    '00000000-0000-0000-0000-000000000000',
    calculate_national_score(),
    jsonb_build_object(
        'integrity_score', GREATEST(calculate_national_score() - 20, 0),
        'total_facilities', (SELECT COUNT(*) FROM va_facilities),
        'total_visns', (SELECT COUNT(*) FROM visns),
        'total_complaints', (SELECT COUNT(*) FROM user_submitted_complaints),
        'total_oig_reports', (SELECT COUNT(*) FROM oig_report_entries),
        'critical_facilities', (SELECT COUNT(*) FROM scorecards WHERE entity_type = 'facility' AND score < 20),
        'warning_facilities', (SELECT COUNT(*) FROM scorecards WHERE entity_type = 'facility' AND score >= 20 AND score < 50),
        'lowest_visn_score', (SELECT MIN(score) FROM scorecards WHERE entity_type = 'visn'),
        'avg_visn_score', (SELECT AVG(score) FROM scorecards WHERE entity_type = 'visn')
    ),
    jsonb_build_object(
        'performance_weight', 0.6,
        'integrity_weight', 0.4,
        'formula', 'Average of lowest 50% VISNs + lowest VISN score ÷ 2'
    )
);

-- Step 7: Show the results
SELECT '=== FACILITY SCORES ===' as info;
SELECT 
    f.name as facility_name,
    f.visn,
    f.state,
    s.score,
    s.data_summary->>'complaints_count' as complaints,
    s.data_summary->>'oig_reports_count' as oig_reports,
    s.data_summary->>'repeat_violations' as repeat_violations
FROM scorecards s
JOIN va_facilities f ON s.entity_id = f.id
WHERE s.entity_type = 'facility'
ORDER BY s.score ASC;

SELECT '=== VISN SCORES ===' as info;
SELECT 
    v.name as visn_name,
    v.region,
    s.score,
    s.data_summary->>'facility_count' as facilities,
    s.data_summary->>'lowest_facility_score' as lowest_facility,
    s.data_summary->>'avg_facility_score' as avg_facility
FROM scorecards s
JOIN visns v ON s.entity_id = v.id
WHERE s.entity_type = 'visn'
ORDER BY s.score ASC;

SELECT '=== NATIONAL SCORE ===' as info;
SELECT 
    s.score as national_score,
    s.data_summary->>'integrity_score' as integrity_score,
    s.data_summary->>'total_facilities' as total_facilities,
    s.data_summary->>'total_visns' as total_visns,
    s.data_summary->>'total_complaints' as total_complaints,
    s.data_summary->>'total_oig_reports' as total_oig_reports,
    s.data_summary->>'critical_facilities' as critical_facilities,
    s.data_summary->>'warning_facilities' as warning_facilities
FROM scorecards s
WHERE s.entity_type = 'national';

-- Step 8: Show summary statistics
SELECT '=== SUMMARY STATISTICS ===' as info;
SELECT 
    'Facilities' as category,
    COUNT(*) as total,
    AVG(score) as avg_score,
    MIN(score) as min_score,
    MAX(score) as max_score
FROM scorecards 
WHERE entity_type = 'facility'
UNION ALL
SELECT 
    'VISNs' as category,
    COUNT(*) as total,
    AVG(score) as avg_score,
    MIN(score) as min_score,
    MAX(score) as max_score
FROM scorecards 
WHERE entity_type = 'visn'; 