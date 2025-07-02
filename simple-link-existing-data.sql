-- Simple Link Existing Data
-- This script only links existing complaints and OIG reports to facilities
-- No new data insertion - avoids all constraint issues

-- Step 1: Link existing complaints to facilities by name
UPDATE user_submitted_complaints 
SET facility_id = f.id
FROM va_facilities f
WHERE user_submitted_complaints.facility_name_submitted = f.name
  AND user_submitted_complaints.facility_id IS NULL;

-- Step 2: Link existing OIG reports to facilities by name
UPDATE oig_report_entries 
SET facility_id = f.id
FROM va_facilities f
WHERE oig_report_entries.facility_name = f.name
  AND oig_report_entries.facility_id IS NULL;

-- Step 3: Show what we linked
SELECT '=== LINKING RESULTS ===' as info;

SELECT 'Complaints linked to facilities:' as metric, COUNT(*) as count
FROM user_submitted_complaints
WHERE facility_id IS NOT NULL
UNION ALL
SELECT 'OIG reports linked to facilities:' as metric, COUNT(*) as count
FROM oig_report_entries
WHERE facility_id IS NOT NULL
UNION ALL
SELECT 'Total facilities:' as metric, COUNT(*) as count
FROM va_facilities;

-- Step 4: Show sample of linked data
SELECT '=== LINKED DATA SAMPLE ===' as info;

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

-- Step 5: Show unlinked data
SELECT '=== UNLINKED DATA ===' as info;

SELECT 'Complaints without facility_id:' as metric, COUNT(*) as count
FROM user_submitted_complaints
WHERE facility_id IS NULL
UNION ALL
SELECT 'OIG reports without facility_id:' as metric, COUNT(*) as count
FROM oig_report_entries
WHERE facility_id IS NULL; 