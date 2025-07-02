-- Diagnose Scoring Issues
-- This script helps identify why all facilities have 100% scores and VISN scores aren't working

-- Step 1: Check current data counts
SELECT '=== CURRENT DATA COUNTS ===' as info;

SELECT 'Facilities' as table_name, COUNT(*) as count FROM va_facilities
UNION ALL
SELECT 'Complaints' as table_name, COUNT(*) as count FROM user_submitted_complaints
UNION ALL
SELECT 'OIG Reports' as table_name, COUNT(*) as count FROM oig_report_entries
UNION ALL
SELECT 'VISNs' as table_name, COUNT(*) as count FROM visns
UNION ALL
SELECT 'Scorecards' as table_name, COUNT(*) as count FROM scorecards;

-- Step 2: Check facility-complaint relationships
SELECT '=== FACILITY-COMPLAINT RELATIONSHIPS ===' as info;

SELECT 
    f.name as facility_name,
    f.visn,
    COUNT(usc.id) as complaint_count,
    COUNT(oig.id) as oig_report_count
FROM va_facilities f
LEFT JOIN user_submitted_complaints usc ON f.id = usc.facility_id
LEFT JOIN oig_report_entries oig ON f.id = oig.facility_id
GROUP BY f.id, f.name, f.visn
ORDER BY complaint_count DESC, oig_report_count DESC;

-- Step 3: Check if complaints have facility_id set
SELECT '=== COMPLAINTS WITHOUT FACILITY_ID ===' as info;

SELECT 
    facility_name_submitted,
    complaint_type,
    status,
    facility_id IS NULL as missing_facility_id
FROM user_submitted_complaints
WHERE facility_id IS NULL
LIMIT 10;

-- Step 4: Check if OIG reports have facility_id set
SELECT '=== OIG REPORTS WITHOUT FACILITY_ID ===' as info;

SELECT 
    facility_name,
    report_number,
    visn,
    facility_id IS NULL as missing_facility_id
FROM oig_report_entries
WHERE facility_id IS NULL
LIMIT 10;

-- Step 5: Check VISN-facility relationships
SELECT '=== VISN-FACILITY RELATIONSHIPS ===' as info;

SELECT 
    v.name as visn_name,
    v.region,
    COUNT(f.id) as facility_count
FROM visns v
LEFT JOIN va_facilities f ON v.name = f.visn
GROUP BY v.id, v.name, v.region
ORDER BY facility_count DESC;

-- Step 6: Test the scoring functions manually
SELECT '=== MANUAL SCORING FUNCTION TESTS ===' as info;

-- Test facility scoring for first few facilities
SELECT 
    f.name as facility_name,
    f.visn,
    calculate_facility_score(f.id) as calculated_score,
    COUNT(usc.id) as complaint_count,
    COUNT(oig.id) as oig_count
FROM va_facilities f
LEFT JOIN user_submitted_complaints usc ON f.id = usc.facility_id
LEFT JOIN oig_report_entries oig ON f.id = oig.facility_id
GROUP BY f.id, f.name, f.visn
ORDER BY f.name
LIMIT 5;

-- Test VISN scoring for first few VISNs
SELECT 
    v.name as visn_name,
    calculate_visn_score(v.name) as calculated_score,
    COUNT(f.id) as facility_count
FROM visns v
LEFT JOIN va_facilities f ON v.name = f.visn
GROUP BY v.id, v.name
ORDER BY v.name
LIMIT 5;

-- Step 7: Check current scorecard data
SELECT '=== CURRENT SCORECARD DATA ===' as info;

SELECT 
    entity_type,
    COUNT(*) as count,
    AVG(score) as avg_score,
    MIN(score) as min_score,
    MAX(score) as max_score
FROM scorecards
GROUP BY entity_type;

-- Step 8: Show sample scorecard details
SELECT '=== SAMPLE SCORECARD DETAILS ===' as info;

SELECT 
    s.entity_type,
    s.score,
    s.data_summary->>'complaints_count' as complaints,
    s.data_summary->>'oig_reports_count' as oig_reports,
    s.data_summary->>'facility_name' as facility_name,
    s.data_summary->>'visn_name' as visn_name
FROM scorecards s
ORDER BY s.entity_type, s.score
LIMIT 10; 