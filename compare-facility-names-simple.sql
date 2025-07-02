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
-- 3. VISN FORMAT COMPARISON
-- ============================================================================

SELECT '=== VISN FORMAT IN OIG REPORTS ===' as section;

SELECT 
    visn,
    COUNT(*) as count
FROM oig_report_entries 
WHERE visn IS NOT NULL
GROUP BY visn
ORDER BY visn;

SELECT '=== VISN FORMAT IN VA FACILITIES ===' as section;

SELECT 
    visn,
    COUNT(*) as count
FROM va_facilities 
WHERE visn IS NOT NULL
GROUP BY visn
ORDER BY visn;

-- ============================================================================
-- 4. SMART MATCHING ATTEMPTS
-- ============================================================================

SELECT '=== MATCHING AUGUSTA FACILITIES ===' as section;

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

SELECT '=== MATCHING DUBLIN FACILITIES ===' as section;

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

SELECT '=== MATCHING COLUMBIA FACILITIES ===' as section;

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
-- 5. ALL OIG FACILITIES IN VISN 7
-- ============================================================================

SELECT '=== ALL OIG FACILITIES IN VISN 7 ===' as section;

SELECT 
    facility_name,
    visn,
    state,
    city,
    COUNT(*) as report_count
FROM oig_report_entries 
WHERE visn = '7' AND facility_name IS NOT NULL
GROUP BY facility_name, visn, state, city
ORDER BY facility_name;

-- ============================================================================
-- 6. ALL VA FACILITIES IN VISN 7
-- ============================================================================

SELECT '=== ALL VA FACILITIES IN VISN 7 ===' as section;

SELECT 
    name,
    visn,
    state,
    city,
    facility_type
FROM va_facilities 
WHERE visn = 'VISN 7' OR visn = '7'
ORDER BY name; 