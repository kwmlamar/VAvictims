-- Smart Link OIG Reports to Facilities
-- This script handles naming differences between OIG reports and VA facilities

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
-- 2. SMART MATCHING STRATEGY
-- ============================================================================

SELECT '=== SMART MATCHING STRATEGY ===' as section;

-- Show potential matches using city + state + VISN
SELECT 
    oig.facility_name as oig_facility_name,
    vf.name as va_facility_name,
    oig.city as oig_city,
    vf.city as va_city,
    oig.state as oig_state,
    vf.state as va_state,
    oig.visn as oig_visn,
    vf.visn as va_visn,
    COUNT(oig.id) as oig_report_count
FROM oig_report_entries oig
CROSS JOIN va_facilities vf
WHERE oig.facility_id IS NULL
  AND oig.city IS NOT NULL
  AND vf.city IS NOT NULL
  AND oig.state IS NOT NULL
  AND vf.state IS NOT NULL
  AND oig.visn IS NOT NULL
  AND vf.visn IS NOT NULL
  AND LOWER(TRIM(oig.city)) = LOWER(TRIM(vf.city))
  AND LOWER(TRIM(oig.state)) = LOWER(TRIM(vf.state))
  AND LOWER(TRIM(oig.visn)) = LOWER(TRIM(vf.visn))
GROUP BY oig.facility_name, vf.name, oig.city, vf.city, oig.state, vf.state, oig.visn, vf.visn
ORDER BY oig.facility_name, vf.name;

-- ============================================================================
-- 3. LINK BY CITY + STATE + VISN MATCHING
-- ============================================================================

SELECT '=== LINKING BY CITY + STATE + VISN ===' as section;

-- Link OIG reports to facilities using city, state, and VISN matching
-- This is the safest approach since city names should be consistent
UPDATE oig_report_entries 
SET facility_id = vf.id
FROM va_facilities vf
WHERE oig_report_entries.facility_id IS NULL
  AND oig_report_entries.city IS NOT NULL
  AND vf.city IS NOT NULL
  AND oig_report_entries.state IS NOT NULL
  AND vf.state IS NOT NULL
  AND oig_report_entries.visn IS NOT NULL
  AND vf.visn IS NOT NULL
  AND LOWER(TRIM(oig_report_entries.city)) = LOWER(TRIM(vf.city))
  AND LOWER(TRIM(oig_report_entries.state)) = LOWER(TRIM(vf.state))
  AND LOWER(TRIM(oig_report_entries.visn)) = LOWER(TRIM(vf.visn));

-- Show how many were linked
SELECT 
    'OIG Reports linked by city + state + VISN match' as action,
    COUNT(*) as count
FROM oig_report_entries 
WHERE facility_id IS NOT NULL;

-- ============================================================================
-- 4. LINK REMAINING BY PARTIAL NAME + CITY MATCHING
-- ============================================================================

SELECT '=== LINKING REMAINING BY PARTIAL NAME + CITY ===' as section;

-- For remaining unlinked reports, try partial name matching with city verification
UPDATE oig_report_entries 
SET facility_id = vf.id
FROM va_facilities vf
WHERE oig_report_entries.facility_id IS NULL
  AND oig_report_entries.facility_name IS NOT NULL
  AND vf.name IS NOT NULL
  AND oig_report_entries.city IS NOT NULL
  AND vf.city IS NOT NULL
  AND oig_report_entries.state IS NOT NULL
  AND vf.state IS NOT NULL
  AND LOWER(TRIM(oig_report_entries.city)) = LOWER(TRIM(vf.city))
  AND LOWER(TRIM(oig_report_entries.state)) = LOWER(TRIM(vf.state))
  AND (
      -- Match "Augusta VAMC" to "Augusta VA Medical Center" or "Charlie Norwood VAMC - Augusta"
      (LOWER(oig_report_entries.facility_name) LIKE '%augusta%' AND LOWER(vf.name) LIKE '%augusta%')
      OR
      -- Match "Dublin VAMC" to "Carl Vinson VAMC - Dublin"
      (LOWER(oig_report_entries.facility_name) LIKE '%dublin%' AND LOWER(vf.name) LIKE '%dublin%')
      OR
      -- Match "Columbia VAMC" to "Wm. Jennings Bryan Dorn VAMC - Columbia"
      (LOWER(oig_report_entries.facility_name) LIKE '%columbia%' AND LOWER(vf.name) LIKE '%columbia%')
      OR
      -- Match "Charleston VAMC" to "Charleston VA Medical Center" or "Ralph H. Johnson VAMC - Charleston"
      (LOWER(oig_report_entries.facility_name) LIKE '%charleston%' AND LOWER(vf.name) LIKE '%charleston%')
      OR
      -- Match "Birmingham VAMC" to "Birmingham VA Medical Center"
      (LOWER(oig_report_entries.facility_name) LIKE '%birmingham%' AND LOWER(vf.name) LIKE '%birmingham%')
      OR
      -- Match "Atlanta VAMC" to "Atlanta VA Medical Center"
      (LOWER(oig_report_entries.facility_name) LIKE '%atlanta%' AND LOWER(vf.name) LIKE '%atlanta%')
  );

-- Show how many were linked
SELECT 
    'OIG Reports linked by partial name + city match' as action,
    COUNT(*) as count
FROM oig_report_entries 
WHERE facility_id IS NOT NULL;

-- ============================================================================
-- 5. FINAL LINKING STATUS
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
-- 6. SHOW SUCCESSFULLY LINKED REPORTS
-- ============================================================================

SELECT '=== SUCCESSFULLY LINKED REPORTS ===' as section;

SELECT 
    oig.report_number,
    oig.facility_name as oig_facility_name,
    vf.name as va_facility_name,
    oig.report_date,
    oig.summary_of_violations,
    oig.visn,
    oig.state,
    oig.city
FROM oig_report_entries oig
JOIN va_facilities vf ON oig.facility_id = vf.id
ORDER BY oig.report_date DESC
LIMIT 15;

-- ============================================================================
-- 7. SHOW REMAINING UNLINKED REPORTS
-- ============================================================================

SELECT '=== REMAINING UNLINKED REPORTS ===' as section;

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

-- ============================================================================
-- 8. LINKING SUMMARY BY FACILITY
-- ============================================================================

SELECT '=== LINKING SUMMARY BY FACILITY ===' as section;

SELECT 
    vf.name as va_facility_name,
    vf.city,
    vf.state,
    COUNT(oig.id) as linked_oig_reports
FROM va_facilities vf
LEFT JOIN oig_report_entries oig ON vf.id = oig.facility_id
GROUP BY vf.id, vf.name, vf.city, vf.state
HAVING COUNT(oig.id) > 0
ORDER BY linked_oig_reports DESC; 