-- OIG Report Entries Summary
-- This script provides a comprehensive overview of the oig_report_entries table

-- ============================================================================
-- 1. BASIC TABLE OVERVIEW
-- ============================================================================

SELECT '=== OIG REPORT ENTRIES SUMMARY ===' as section;

-- Total count
SELECT 'Total OIG Reports' as metric, COUNT(*) as count FROM oig_report_entries;

-- Facility linking status
SELECT 
    'OIG Reports with facility_id' as metric,
    COUNT(*) as count
FROM oig_report_entries 
WHERE facility_id IS NOT NULL
UNION ALL
SELECT 
    'OIG Reports without facility_id' as metric,
    COUNT(*) as count
FROM oig_report_entries 
WHERE facility_id IS NULL;

-- ============================================================================
-- 2. FACILITY LINKING ANALYSIS
-- ============================================================================

SELECT '=== FACILITY LINKING ANALYSIS ===' as section;

-- Show linked vs unlinked reports
SELECT 
    CASE 
        WHEN facility_id IS NOT NULL THEN 'Linked to Facilities'
        ELSE 'Not Linked to Facilities'
    END as linking_status,
    COUNT(*) as report_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM oig_report_entries), 2) as percentage
FROM oig_report_entries 
GROUP BY facility_id IS NOT NULL
ORDER BY report_count DESC;

-- ============================================================================
-- 3. FACILITY NAME ANALYSIS
-- ============================================================================

SELECT '=== FACILITY NAME ANALYSIS ===' as section;

-- Top facility names mentioned in OIG reports
SELECT 
    facility_name,
    COUNT(*) as report_count
FROM oig_report_entries 
WHERE facility_name IS NOT NULL
GROUP BY facility_name
ORDER BY report_count DESC
LIMIT 15;

-- ============================================================================
-- 4. REPORT DATE ANALYSIS
-- ============================================================================

SELECT '=== REPORT DATE ANALYSIS ===' as section;

-- Reports by year
SELECT 
    EXTRACT(YEAR FROM report_date) as report_year,
    COUNT(*) as report_count
FROM oig_report_entries 
WHERE report_date IS NOT NULL
GROUP BY EXTRACT(YEAR FROM report_date)
ORDER BY report_year DESC;

-- Date range
SELECT 
    'Earliest Report Date' as metric,
    MIN(report_date) as date_value
FROM oig_report_entries 
WHERE report_date IS NOT NULL
UNION ALL
SELECT 
    'Latest Report Date' as metric,
    MAX(report_date) as date_value
FROM oig_report_entries 
WHERE report_date IS NOT NULL;

-- ============================================================================
-- 5. VIOLATION TYPE ANALYSIS
-- ============================================================================

SELECT '=== VIOLATION TYPE ANALYSIS ===' as section;

-- Summary of violations
SELECT 
    summary_of_violations,
    COUNT(*) as report_count
FROM oig_report_entries 
WHERE summary_of_violations IS NOT NULL
GROUP BY summary_of_violations
ORDER BY report_count DESC;

-- ============================================================================
-- 6. VISN ANALYSIS
-- ============================================================================

SELECT '=== VISN ANALYSIS ===' as section;

-- Reports by VISN
SELECT 
    visn,
    COUNT(*) as report_count
FROM oig_report_entries 
WHERE visn IS NOT NULL
GROUP BY visn
ORDER BY report_count DESC;

-- ============================================================================
-- 7. STATE ANALYSIS
-- ============================================================================

SELECT '=== STATE ANALYSIS ===' as section;

-- Reports by state
SELECT 
    state,
    COUNT(*) as report_count
FROM oig_report_entries 
WHERE state IS NOT NULL
GROUP BY state
ORDER BY report_count DESC
LIMIT 10;

-- ============================================================================
-- 8. SAMPLE DATA
-- ============================================================================

SELECT '=== SAMPLE OIG REPORTS ===' as section;

-- Show sample of recent reports
SELECT 
    report_number,
    facility_name,
    report_date,
    summary_of_violations,
    visn,
    state,
    CASE 
        WHEN facility_id IS NOT NULL THEN 'Linked'
        ELSE 'Not Linked'
    END as facility_status
FROM oig_report_entries 
ORDER BY report_date DESC
LIMIT 10;

-- ============================================================================
-- 9. LINKED FACILITY DETAILS
-- ============================================================================

SELECT '=== LINKED FACILITY DETAILS ===' as section;

-- Show OIG reports that are linked to actual facilities
SELECT 
    oig.report_number,
    oig.facility_name as oig_facility_name,
    vf.name as actual_facility_name,
    oig.report_date,
    oig.summary_of_violations,
    oig.visn,
    oig.state
FROM oig_report_entries oig
JOIN va_facilities vf ON oig.facility_id = vf.id
ORDER BY oig.report_date DESC
LIMIT 10;

-- ============================================================================
-- 10. UNLINKED REPORTS
-- ============================================================================

SELECT '=== UNLINKED REPORTS ===' as section;

-- Show OIG reports that are not linked to any facility
SELECT 
    report_number,
    facility_name,
    report_date,
    summary_of_violations,
    visn,
    state
FROM oig_report_entries 
WHERE facility_id IS NULL
ORDER BY report_date DESC
LIMIT 10;

-- ============================================================================
-- 11. REPEAT VIOLATIONS
-- ============================================================================

SELECT '=== REPEAT VIOLATIONS ===' as section;

-- Reports with repeat violations
SELECT 
    'Reports with repeat violations' as metric,
    COUNT(*) as count
FROM oig_report_entries 
WHERE repeat_violations_summary IS NOT NULL 
  AND repeat_violations_summary != ''
UNION ALL
SELECT 
    'Reports without repeat violations' as metric,
    COUNT(*) as count
FROM oig_report_entries 
WHERE repeat_violations_summary IS NULL 
   OR repeat_violations_summary = '';

-- ============================================================================
-- 12. SUMMARY STATISTICS
-- ============================================================================

SELECT '=== SUMMARY STATISTICS ===' as section;

SELECT 
    'Total OIG Reports' as metric,
    COUNT(*) as value
FROM oig_report_entries
UNION ALL
SELECT 
    'Linked to Facilities' as metric,
    COUNT(*) as value
FROM oig_report_entries 
WHERE facility_id IS NOT NULL
UNION ALL
SELECT 
    'Unique Facilities Mentioned' as metric,
    COUNT(DISTINCT facility_name) as value
FROM oig_report_entries 
WHERE facility_name IS NOT NULL
UNION ALL
SELECT 
    'Unique VISNs' as metric,
    COUNT(DISTINCT visn) as value
FROM oig_report_entries 
WHERE visn IS NOT NULL
UNION ALL
SELECT 
    'Unique States' as metric,
    COUNT(DISTINCT state) as value
FROM oig_report_entries 
WHERE state IS NOT NULL
UNION ALL
SELECT 
    'Reports with Repeat Violations' as metric,
    COUNT(*) as value
FROM oig_report_entries 
WHERE repeat_violations_summary IS NOT NULL 
  AND repeat_violations_summary != ''; 