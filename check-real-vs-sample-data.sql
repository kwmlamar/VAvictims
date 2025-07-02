-- Check Real vs Sample Data
-- This script helps identify what's real VA data vs sample/fake data

-- ============================================================================
-- 1. FACILITY DATA ANALYSIS
-- ============================================================================

SELECT '=== FACILITY DATA ANALYSIS ===' as section;

-- Check for real VA facility patterns
SELECT 'Facilities with real VA names:' as category, COUNT(*) as count
FROM va_facilities 
WHERE name LIKE '%VA Medical Center%' 
   OR name LIKE '%VA Health Care System%'
   OR name LIKE '%VA Outpatient Clinic%'
   OR name LIKE '%VA Community Based Outpatient Clinic%'
UNION ALL
SELECT 'Facilities with generic names:' as category, COUNT(*) as count
FROM va_facilities 
WHERE name LIKE '%VA Medical Center - %' 
   OR name LIKE '%VA Outpatient Clinic - %'
   OR name LIKE '%VA Health Care System - %'
UNION ALL
SELECT 'Total facilities:' as category, COUNT(*) as count
FROM va_facilities;

-- Check VISN distribution
SELECT '=== VISN DISTRIBUTION ===' as section;

SELECT 
    visn,
    COUNT(*) as facility_count,
    CASE 
        WHEN visn LIKE 'VISN %' THEN 'Sample Data'
        WHEN visn IS NULL THEN 'No VISN'
        ELSE 'Unknown'
    END as data_type
FROM va_facilities 
GROUP BY visn
ORDER BY 
    CASE WHEN visn LIKE 'VISN %' THEN 1 ELSE 0 END,
    visn;

-- Check for realistic facility locations
SELECT '=== LOCATION ANALYSIS ===' as section;

SELECT 
    state,
    COUNT(*) as facility_count,
    CASE 
        WHEN state IN ('CA', 'TX', 'FL', 'NY', 'PA', 'OH', 'IL', 'MI', 'NC', 'GA') THEN 'High VA Density'
        WHEN state IN ('WY', 'ND', 'SD', 'MT', 'AK', 'DE', 'VT', 'NH', 'RI') THEN 'Low VA Density'
        ELSE 'Medium VA Density'
    END as expected_density
FROM va_facilities 
WHERE state IS NOT NULL
GROUP BY state
ORDER BY facility_count DESC
LIMIT 15;

-- ============================================================================
-- 2. SAMPLE DATA IDENTIFICATION
-- ============================================================================

SELECT '=== SAMPLE DATA IDENTIFICATION ===' as section;

-- Find facilities that look like sample data
SELECT 
    name,
    city,
    state,
    visn,
    'Sample Data' as data_type
FROM va_facilities 
WHERE name LIKE '%VA Medical Center - %'
   OR name LIKE '%VA Outpatient Clinic - %'
   OR name LIKE '%VA Health Care System - %'
   OR (city IN ('Atlanta', 'Boston', 'Chicago', 'Dallas', 'Denver', 'Los Angeles', 'Miami', 'New York', 'Phoenix', 'Seattle') 
       AND name LIKE '%VA%')
ORDER BY name
LIMIT 20;

-- ============================================================================
-- 3. REAL DATA IDENTIFICATION
-- ============================================================================

SELECT '=== POTENTIAL REAL DATA ===' as section;

-- Find facilities that might be real VA data
SELECT 
    name,
    city,
    state,
    visn,
    'Potential Real Data' as data_type
FROM va_facilities 
WHERE name NOT LIKE '%VA Medical Center - %'
   AND name NOT LIKE '%VA Outpatient Clinic - %'
   AND name NOT LIKE '%VA Health Care System - %'
   AND name LIKE '%VA%'
   AND name NOT LIKE '%Unknown%'
   AND name NOT LIKE '%News%'
ORDER BY name
LIMIT 20;

-- ============================================================================
-- 4. RECOMMENDATIONS
-- ============================================================================

SELECT '=== RECOMMENDATIONS ===' as section;

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'Found sample data - consider replacing with real VA facility data'
        ELSE 'No obvious sample data found'
    END as recommendation
FROM va_facilities 
WHERE name LIKE '%VA Medical Center - %'
   OR name LIKE '%VA Outpatient Clinic - %'
   OR name LIKE '%VA Health Care System - %';

-- Check if we have any real VISN assignments
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'Found VISN assignments - verify they are accurate'
        ELSE 'No VISN assignments found - need to add real VISN data'
    END as recommendation
FROM va_facilities 
WHERE visn IS NOT NULL AND visn != ''; 