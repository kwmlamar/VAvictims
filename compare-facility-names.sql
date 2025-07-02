-- Compare Facility Names Between OIG Reports and VA Facilities
-- This will help us understand the naming differences and create proper matching

-- ============================================================================
-- 1. OIG REPORT FACILITY NAMES
-- ============================================================================

SELECT '=== OIG REPORT FACILITY NAMES ===' as section;

SELECT 
    facility_name,
    visn,
    state,
    city,
    COUNT(*) as report_count
FROM oig_report_entries 
WHERE facility_name IS NOT NULL
GROUP BY facility_name, visn, state, city
ORDER BY facility_name;

-- ============================================================================
-- 2. VA FACILITY NAMES
-- ============================================================================

SELECT '=== VA FACILITY NAMES ===' as section;

SELECT 
    name,
    visn,
    state,
    city,
    facility_type
FROM va_facilities 
WHERE name IS NOT NULL
ORDER BY name;

-- ============================================================================
-- 3. POTENTIAL MATCHES BY VISN 7
-- ============================================================================

SELECT '=== POTENTIAL MATCHES FOR VISN 7 ===' as section;

-- Show OIG reports for VISN 7
SELECT 
    'OIG Report' as source,
    facility_name as name,
    visn,
    state,
    city
FROM oig_report_entries 
WHERE visn = '7' AND facility_name IS NOT NULL
GROUP BY facility_name, visn, state, city

UNION ALL

-- Show VA facilities for VISN 7
SELECT 
    'VA Facility' as source,
    name,
    visn,
    state,
    city
FROM va_facilities 
WHERE visn = 'VISN 7' OR visn = '7'
ORDER BY name;

-- ============================================================================
-- 4. SMART MATCHING ATTEMPTS
-- ============================================================================

SELECT '=== SMART MATCHING ATTEMPTS ===' as section;

-- Try to match "Augusta VAMC" to Augusta facilities
SELECT 
    oig.facility_name as oig_name,
    vf.name as va_name,
    oig.visn as oig_visn,
    vf.visn as va_visn,
    oig.state as oig_state,
    vf.state as va_state,
    oig.city as oig_city,
    vf.city as va_city
FROM oig_report_entries oig
CROSS JOIN va_facilities vf
WHERE oig.facility_name LIKE '%Augusta%'
  AND (vf.name LIKE '%Augusta%' OR vf.city = 'Augusta')
  AND oig.facility_id IS NULL
ORDER BY oig.facility_name, vf.name;

-- Try to match "Dublin VAMC" to Dublin facilities
SELECT 
    oig.facility_name as oig_name,
    vf.name as va_name,
    oig.visn as oig_visn,
    vf.visn as va_visn,
    oig.state as oig_state,
    vf.state as va_state,
    oig.city as oig_city,
    vf.city as va_city
FROM oig_report_entries oig
CROSS JOIN va_facilities vf
WHERE oig.facility_name LIKE '%Dublin%'
  AND (vf.name LIKE '%Dublin%' OR vf.city = 'Dublin')
  AND oig.facility_id IS NULL
ORDER BY oig.facility_name, vf.name;

-- Try to match "Columbia VAMC" to Columbia facilities
SELECT 
    oig.facility_name as oig_name,
    vf.name as va_name,
    oig.visn as oig_visn,
    vf.visn as va_visn,
    oig.state as oig_state,
    vf.state as va_state,
    oig.city as oig_city,
    vf.city as va_city
FROM oig_report_entries oig
CROSS JOIN va_facilities vf
WHERE oig.facility_name LIKE '%Columbia%'
  AND (vf.name LIKE '%Columbia%' OR vf.city = 'Columbia')
  AND oig.facility_id IS NULL
ORDER BY oig.facility_name, vf.name;

-- ============================================================================
-- 5. VISN FORMAT COMPARISON
-- ============================================================================

SELECT '=== VISN FORMAT COMPARISON ===' as section;

-- Check how VISNs are formatted in both tables
SELECT 
    'OIG Reports' as source,
    visn,
    COUNT(*) as count
FROM oig_report_entries 
WHERE visn IS NOT NULL
GROUP BY visn
ORDER BY visn

UNION ALL

SELECT 
    'VA Facilities' as source,
    visn,
    COUNT(*) as count
FROM va_facilities 
WHERE visn IS NOT NULL
GROUP BY visn
ORDER BY visn; 