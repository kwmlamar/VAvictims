-- Database Overview Script
-- This script provides a comprehensive overview of your VA Accountability Platform database

-- ============================================================================
-- 1. TABLE STRUCTURE OVERVIEW
-- ============================================================================

SELECT '=== TABLE STRUCTURE ===' as section;

SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name IN (
    'va_facilities', 'user_submitted_complaints', 'oig_report_entries', 
    'visns', 'scorecards', 'analytics', 'congressional_representatives'
  )
GROUP BY table_name
ORDER BY table_name;

-- ============================================================================
-- 2. DATA COUNTS
-- ============================================================================

SELECT '=== DATA COUNTS ===' as section;

SELECT 'Facilities' as table_name, COUNT(*) as record_count FROM va_facilities
UNION ALL
SELECT 'Complaints' as table_name, COUNT(*) as record_count FROM user_submitted_complaints
UNION ALL
SELECT 'OIG Reports' as table_name, COUNT(*) as record_count FROM oig_report_entries
UNION ALL
SELECT 'VISNs' as table_name, COUNT(*) as record_count FROM visns
UNION ALL
SELECT 'Scorecards' as table_name, COUNT(*) as record_count FROM scorecards
UNION ALL
SELECT 'Analytics' as table_name, COUNT(*) as record_count FROM analytics
UNION ALL
SELECT 'Congressional Representatives' as table_name, COUNT(*) as record_count FROM congressional_representatives;

-- ============================================================================
-- 3. FACILITY DATA OVERVIEW
-- ============================================================================

SELECT '=== FACILITY DATA ===' as section;

SELECT 
    visn,
    COUNT(*) as facility_count,
    COUNT(DISTINCT state) as states_covered
FROM va_facilities 
GROUP BY visn 
ORDER BY visn;

-- ============================================================================
-- 4. COMPLAINT DATA OVERVIEW
-- ============================================================================

SELECT '=== COMPLAINT DATA ===' as section;

SELECT 
    status,
    category,
    COUNT(*) as count
FROM user_submitted_complaints 
GROUP BY status, category
ORDER BY count DESC;

-- Check facility linking
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

-- ============================================================================
-- 5. OIG REPORT DATA OVERVIEW
-- ============================================================================

SELECT '=== OIG REPORT DATA ===' as section;

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
-- 6. CONSTRAINT INFORMATION
-- ============================================================================

SELECT '=== CONSTRAINT INFORMATION ===' as section;

SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'user_submitted_complaints'
  AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- 7. SAMPLE DATA
-- ============================================================================

SELECT '=== SAMPLE FACILITIES ===' as section;

SELECT 
    name,
    city,
    state,
    visn,
    type
FROM va_facilities 
ORDER BY name
LIMIT 10;

SELECT '=== SAMPLE COMPLAINTS ===' as section;

SELECT 
    facility_name_submitted,
    complaint_type,
    status,
    category,
    facility_id IS NOT NULL as has_facility_link
FROM user_submitted_complaints 
ORDER BY submitted_at DESC
LIMIT 10;

SELECT '=== SAMPLE OIG REPORTS ===' as section;

SELECT 
    facility_name,
    report_number,
    visn,
    facility_id IS NOT NULL as has_facility_link
FROM oig_report_entries 
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 8. RELATIONSHIP ANALYSIS
-- ============================================================================

SELECT '=== RELATIONSHIP ANALYSIS ===' as section;

SELECT 
    f.name as facility_name,
    f.visn,
    COUNT(usc.id) as complaint_count,
    COUNT(oig.id) as oig_report_count
FROM va_facilities f
LEFT JOIN user_submitted_complaints usc ON f.id = usc.facility_id
LEFT JOIN oig_report_entries oig ON f.id = oig.facility_id
GROUP BY f.id, f.name, f.visn
HAVING COUNT(usc.id) > 0 OR COUNT(oig.id) > 0
ORDER BY complaint_count DESC, oig_report_count DESC
LIMIT 10; 