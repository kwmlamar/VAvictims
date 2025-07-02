-- Examine Table Structures and Sample Data
-- This script helps understand how to link OIG reports to facilities

-- ============================================================================
-- 1. OIG_REPORT_ENTRIES TABLE STRUCTURE
-- ============================================================================

SELECT '=== OIG_REPORT_ENTRIES TABLE STRUCTURE ===' as section;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'oig_report_entries' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- 2. VA_FACILITIES TABLE STRUCTURE
-- ============================================================================

SELECT '=== VA_FACILITIES TABLE STRUCTURE ===' as section;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'va_facilities' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. SAMPLE OIG REPORT DATA
-- ============================================================================

SELECT '=== SAMPLE OIG REPORT DATA ===' as section;

SELECT 
    id,
    facility_id,
    facility_name,
    report_number,
    report_date,
    visn,
    state,
    city,
    summary_of_violations,
    LEFT(violations_details, 100) || '...' as violations_details_preview,
    repeat_violations_summary,
    LEFT(report_url, 50) || '...' as report_url_preview
FROM oig_report_entries 
ORDER BY report_date DESC
LIMIT 10;

-- ============================================================================
-- 4. SAMPLE VA FACILITIES DATA
-- ============================================================================

SELECT '=== SAMPLE VA FACILITIES DATA ===' as section;

SELECT 
    id,
    name,
    visn,
    state,
    city,
    facility_type,
    director_name,
    phone,
    LEFT(website, 50) || '...' as website_preview
FROM va_facilities 
ORDER BY name
LIMIT 15;

-- ============================================================================
-- 5. FACILITY NAME COMPARISON
-- ============================================================================

SELECT '=== FACILITY NAME COMPARISON ===' as section;

-- Show OIG report facility names
SELECT 'OIG Report Facility Names:' as source, facility_name as name
FROM oig_report_entries 
WHERE facility_name IS NOT NULL
GROUP BY facility_name
ORDER BY facility_name
LIMIT 20;

-- Show VA facility names
SELECT 'VA Facility Names:' as source, name
FROM va_facilities 
WHERE name IS NOT NULL
ORDER BY name
LIMIT 20;

-- ============================================================================
-- 6. VISN COMPARISON
-- ============================================================================

SELECT '=== VISN COMPARISON ===' as section;

-- VISNs in OIG reports
SELECT 'OIG Reports VISNs:' as source, visn, COUNT(*) as count
FROM oig_report_entries 
WHERE visn IS NOT NULL
GROUP BY visn
ORDER BY visn;

-- VISNs in VA facilities
SELECT 'VA Facilities VISNs:' as source, visn, COUNT(*) as count
FROM va_facilities 
WHERE visn IS NOT NULL
GROUP BY visn
ORDER BY visn;

-- ============================================================================
-- 7. STATE COMPARISON
-- ============================================================================

SELECT '=== STATE COMPARISON ===' as section;

-- States in OIG reports
SELECT 'OIG Reports States:' as source, state, COUNT(*) as count
FROM oig_report_entries 
WHERE state IS NOT NULL
GROUP BY state
ORDER BY state;

-- States in VA facilities
SELECT 'VA Facilities States:' as source, state, COUNT(*) as count
FROM va_facilities 
WHERE state IS NOT NULL
GROUP BY state
ORDER BY count DESC
LIMIT 15;

-- ============================================================================
-- 8. POTENTIAL MATCHES
-- ============================================================================

SELECT '=== POTENTIAL FACILITY MATCHES ===' as section;

-- Find potential exact matches
SELECT 
    oig.facility_name as oig_facility_name,
    vf.name as va_facility_name,
    oig.visn as oig_visn,
    vf.visn as va_visn,
    oig.state as oig_state,
    vf.state as va_state,
    'EXACT MATCH' as match_type
FROM oig_report_entries oig
JOIN va_facilities vf ON LOWER(oig.facility_name) = LOWER(vf.name)
WHERE oig.facility_id IS NULL
ORDER BY oig.facility_name
LIMIT 20;

-- Find potential partial matches
SELECT 
    oig.facility_name as oig_facility_name,
    vf.name as va_facility_name,
    oig.visn as oig_visn,
    vf.visn as va_visn,
    oig.state as oig_state,
    vf.state as va_state,
    'PARTIAL MATCH' as match_type
FROM oig_report_entries oig
JOIN va_facilities vf ON 
    (LOWER(oig.facility_name) LIKE '%' || LOWER(vf.name) || '%' 
     OR LOWER(vf.name) LIKE '%' || LOWER(oig.facility_name) || '%')
    AND LOWER(oig.facility_name) != LOWER(vf.name)
WHERE oig.facility_id IS NULL
ORDER BY oig.facility_name
LIMIT 20;

-- ============================================================================
-- 9. UNMATCHED OIG REPORTS
-- ============================================================================

SELECT '=== UNMATCHED OIG REPORTS ===' as section;

-- Show OIG reports that can't be matched
SELECT 
    facility_name,
    visn,
    state,
    city,
    COUNT(*) as report_count
FROM oig_report_entries oig
WHERE facility_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM va_facilities vf 
    WHERE LOWER(oig.facility_name) = LOWER(vf.name)
       OR LOWER(oig.facility_name) LIKE '%' || LOWER(vf.name) || '%'
       OR LOWER(vf.name) LIKE '%' || LOWER(oig.facility_name) || '%'
  )
GROUP BY facility_name, visn, state, city
ORDER BY report_count DESC
LIMIT 15;

-- ============================================================================
-- 10. DATA QUALITY CHECK
-- ============================================================================

SELECT '=== DATA QUALITY CHECK ===' as section;

-- Check for null values in key fields
SELECT 
    'OIG Reports with NULL facility_name' as check_type,
    COUNT(*) as count
FROM oig_report_entries 
WHERE facility_name IS NULL
UNION ALL
SELECT 
    'OIG Reports with NULL report_date' as check_type,
    COUNT(*) as count
FROM oig_report_entries 
WHERE report_date IS NULL
UNION ALL
SELECT 
    'VA Facilities with NULL name' as check_type,
    COUNT(*) as count
FROM va_facilities 
WHERE name IS NULL
UNION ALL
SELECT 
    'VA Facilities with NULL visn' as check_type,
    COUNT(*) as count
FROM va_facilities 
WHERE visn IS NULL; 