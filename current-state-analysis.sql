-- Current State Analysis
-- This script analyzes what data exists and what needs to be linked

-- ============================================================================
-- 1. FACILITY DATA ANALYSIS
-- ============================================================================

SELECT '=== FACILITY ANALYSIS ===' as section;

-- Total facilities
SELECT 'Total Facilities' as metric, COUNT(*) as count FROM va_facilities;

-- Facilities by VISN
SELECT 
    visn,
    COUNT(*) as facility_count
FROM va_facilities 
GROUP BY visn 
ORDER BY visn;

-- Sample facility names for matching
SELECT 
    name,
    city,
    state,
    visn
FROM va_facilities 
ORDER BY name
LIMIT 20;

-- ============================================================================
-- 2. COMPLAINT DATA ANALYSIS
-- ============================================================================

SELECT '=== COMPLAINT ANALYSIS ===' as section;

-- Total complaints
SELECT 'Total Complaints' as metric, COUNT(*) as count FROM user_submitted_complaints;

-- Complaints by status
SELECT 
    status,
    COUNT(*) as count
FROM user_submitted_complaints 
GROUP BY status
ORDER BY count DESC;

-- Complaints by category
SELECT 
    category,
    COUNT(*) as count
FROM user_submitted_complaints 
GROUP BY category
ORDER BY count DESC;

-- Facility linking status
SELECT 
    'Complaints with facility_id' as metric,
    COUNT(*) as count
FROM user_submitted_complaints 
WHERE facility_id IS NOT NULL
UNION ALL
SELECT 
    'Complaints without facility_id' as metric,
    COUNT(*) as count
FROM user_submitted_complaints 
WHERE facility_id IS NULL;

-- Sample complaint facility names
SELECT DISTINCT
    facility_name_submitted,
    COUNT(*) as complaint_count
FROM user_submitted_complaints 
WHERE facility_name_submitted IS NOT NULL
GROUP BY facility_name_submitted
ORDER BY complaint_count DESC
LIMIT 20;

-- ============================================================================
-- 3. OIG REPORT DATA ANALYSIS
-- ============================================================================

SELECT '=== OIG REPORT ANALYSIS ===' as section;

-- Total OIG reports
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

-- Sample OIG report facility names
SELECT DISTINCT
    facility_name,
    COUNT(*) as report_count
FROM oig_report_entries 
WHERE facility_name IS NOT NULL
GROUP BY facility_name
ORDER BY report_count DESC
LIMIT 20;

-- ============================================================================
-- 4. NAME MATCHING ANALYSIS
-- ============================================================================

SELECT '=== NAME MATCHING ANALYSIS ===' as section;

-- Find potential matches between complaint facility names and actual facilities
SELECT 
    usc.facility_name_submitted,
    vf.name as actual_facility_name,
    vf.city,
    vf.state,
    vf.visn,
    COUNT(usc.id) as complaint_count
FROM user_submitted_complaints usc
JOIN va_facilities vf ON 
    LOWER(usc.facility_name_submitted) LIKE '%' || LOWER(vf.name) || '%'
    OR LOWER(vf.name) LIKE '%' || LOWER(usc.facility_name_submitted) || '%'
WHERE usc.facility_id IS NULL
GROUP BY usc.facility_name_submitted, vf.id, vf.name, vf.city, vf.state, vf.visn
ORDER BY complaint_count DESC
LIMIT 20;

-- Find potential matches between OIG report facility names and actual facilities
SELECT 
    oig.facility_name,
    vf.name as actual_facility_name,
    vf.city,
    vf.state,
    vf.visn,
    COUNT(oig.id) as report_count
FROM oig_report_entries oig
JOIN va_facilities vf ON 
    LOWER(oig.facility_name) LIKE '%' || LOWER(vf.name) || '%'
    OR LOWER(vf.name) LIKE '%' || LOWER(oig.facility_name) || '%'
WHERE oig.facility_id IS NULL
GROUP BY oig.facility_name, vf.id, vf.name, vf.city, vf.state, vf.visn
ORDER BY report_count DESC
LIMIT 20;

-- ============================================================================
-- 5. SCORECARD ANALYSIS
-- ============================================================================

SELECT '=== SCORECARD ANALYSIS ===' as section;

-- Current scorecards
SELECT 
    entity_type,
    entity_id,
    score,
    created_at
FROM scorecards 
ORDER BY created_at DESC
LIMIT 10;

-- Scorecard table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'scorecards' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- 6. CONSTRAINT ANALYSIS
-- ============================================================================

SELECT '=== CONSTRAINT ANALYSIS ===' as section;

-- Show all check constraints on complaints table
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints cc
JOIN information_schema.table_constraints tc ON cc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'user_submitted_complaints'
  AND tc.constraint_type = 'CHECK'
ORDER BY constraint_name; 