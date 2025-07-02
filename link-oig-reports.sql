-- Link OIG Reports to Facilities
-- This script matches OIG reports to VA facilities and sets the facility_id foreign key

-- ============================================================================
-- 1. SHOW CURRENT LINKING STATUS
-- ============================================================================

SELECT '=== CURRENT LINKING STATUS ===' as section;

SELECT 
    'OIG Reports with facility_id' as status,
    COUNT(*) as count
FROM oig_report_entries 
WHERE facility_id IS NOT NULL
UNION ALL
SELECT 
    'OIG Reports without facility_id' as status,
    COUNT(*) as count
FROM oig_report_entries 
WHERE facility_id IS NULL;

-- ============================================================================
-- 2. FIND EXACT MATCHES
-- ============================================================================

SELECT '=== EXACT FACILITY NAME MATCHES ===' as section;

-- Show exact matches that can be linked
SELECT 
    oig.facility_name as oig_facility_name,
    vf.name as va_facility_name,
    oig.visn as oig_visn,
    vf.visn as va_visn,
    oig.state as oig_state,
    vf.state as va_state,
    COUNT(oig.id) as oig_report_count
FROM oig_report_entries oig
JOIN va_facilities vf ON LOWER(TRIM(oig.facility_name)) = LOWER(TRIM(vf.name))
WHERE oig.facility_id IS NULL
GROUP BY oig.facility_name, vf.name, oig.visn, vf.visn, oig.state, vf.state
ORDER BY oig.facility_name
LIMIT 20;

-- ============================================================================
-- 3. FIND PARTIAL MATCHES
-- ============================================================================

SELECT '=== PARTIAL FACILITY NAME MATCHES ===' as section;

-- Show partial matches that might be the same facility
SELECT 
    oig.facility_name as oig_facility_name,
    vf.name as va_facility_name,
    oig.visn as oig_visn,
    vf.visn as va_visn,
    oig.state as oig_state,
    vf.state as va_state,
    COUNT(oig.id) as oig_report_count
FROM oig_report_entries oig
JOIN va_facilities vf ON 
    (LOWER(TRIM(oig.facility_name)) LIKE '%' || LOWER(TRIM(vf.name)) || '%' 
     OR LOWER(TRIM(vf.name)) LIKE '%' || LOWER(TRIM(oig.facility_name)) || '%')
    AND LOWER(TRIM(oig.facility_name)) != LOWER(TRIM(vf.name))
WHERE oig.facility_id IS NULL
GROUP BY oig.facility_name, vf.name, oig.visn, vf.visn, oig.state, vf.state
ORDER BY oig.facility_name
LIMIT 20;

-- ============================================================================
-- 4. LINK EXACT MATCHES
-- ============================================================================

SELECT '=== LINKING EXACT MATCHES ===' as section;

-- Link OIG reports to facilities using exact name matches
UPDATE oig_report_entries 
SET facility_id = vf.id
FROM va_facilities vf
WHERE oig_report_entries.facility_id IS NULL
  AND oig_report_entries.facility_name IS NOT NULL
  AND vf.name IS NOT NULL
  AND LOWER(TRIM(oig_report_entries.facility_name)) = LOWER(TRIM(vf.name));

-- Show how many were linked
SELECT 
    'OIG Reports linked by exact name match' as action,
    COUNT(*) as count
FROM oig_report_entries 
WHERE facility_id IS NOT NULL;

-- ============================================================================
-- 5. LINK PARTIAL MATCHES (CAREFULLY)
-- ============================================================================

SELECT '=== LINKING PARTIAL MATCHES ===' as section;

-- Link OIG reports to facilities using partial name matches
-- Only link if VISN and state also match for safety
UPDATE oig_report_entries 
SET facility_id = vf.id
FROM va_facilities vf
WHERE oig_report_entries.facility_id IS NULL
  AND oig_report_entries.facility_name IS NOT NULL
  AND vf.name IS NOT NULL
  AND oig_report_entries.visn IS NOT NULL
  AND vf.visn IS NOT NULL
  AND oig_report_entries.state IS NOT NULL
  AND vf.state IS NOT NULL
  AND LOWER(TRIM(oig_report_entries.visn)) = LOWER(TRIM(vf.visn))
  AND LOWER(TRIM(oig_report_entries.state)) = LOWER(TRIM(vf.state))
  AND (LOWER(TRIM(oig_report_entries.facility_name)) LIKE '%' || LOWER(TRIM(vf.name)) || '%' 
       OR LOWER(TRIM(vf.name)) LIKE '%' || LOWER(TRIM(oig_report_entries.facility_name)) || '%')
  AND LOWER(TRIM(oig_report_entries.facility_name)) != LOWER(TRIM(vf.name));

-- Show how many were linked
SELECT 
    'OIG Reports linked by partial name + VISN + state match' as action,
    COUNT(*) as count
FROM oig_report_entries 
WHERE facility_id IS NOT NULL;

-- ============================================================================
-- 6. FINAL LINKING STATUS
-- ============================================================================

SELECT '=== FINAL LINKING STATUS ===' as section;

SELECT 
    'OIG Reports with facility_id' as status,
    COUNT(*) as count
FROM oig_report_entries 
WHERE facility_id IS NOT NULL
UNION ALL
SELECT 
    'OIG Reports without facility_id' as status,
    COUNT(*) as count
FROM oig_report_entries 
WHERE facility_id IS NULL;

-- ============================================================================
-- 7. SHOW LINKED REPORTS
-- ============================================================================

SELECT '=== SAMPLE LINKED REPORTS ===' as section;

SELECT 
    oig.report_number,
    oig.facility_name as oig_facility_name,
    vf.name as va_facility_name,
    oig.report_date,
    oig.summary_of_violations,
    oig.visn,
    oig.state
FROM oig_report_entries oig
JOIN va_facilities vf ON oig.facility_id = vf.id
ORDER BY oig.report_date DESC
LIMIT 10;

-- ============================================================================
-- 8. SHOW UNLINKED REPORTS
-- ============================================================================

SELECT '=== SAMPLE UNLINKED REPORTS ===' as section;

SELECT 
    report_number,
    facility_name,
    report_date,
    summary_of_violations,
    visn,
    state,
    city
FROM oig_report_entries 
WHERE facility_id IS NULL
ORDER BY report_date DESC
LIMIT 10; 