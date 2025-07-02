-- Fix Data Relationships (Resolved Status Version)
-- This script fixes relationships and adds test data using 'resolved' status

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

-- Step 3: Add test complaints with 'resolved' status
INSERT INTO user_submitted_complaints (
    facility_id,
    facility_name_submitted,
    complaint_type,
    description,
    status,
    category
)
SELECT 
    f.id,
    f.name,
    'Patient Safety',
    'Test complaint for scoring system',
    'resolved',
    'General'
FROM va_facilities f
WHERE f.name IS NOT NULL 
  AND f.name != ''
  AND f.name NOT LIKE '%Unknown%'
  AND f.name NOT LIKE '%News%'
LIMIT 15;

-- Step 4: Add test OIG reports
INSERT INTO oig_report_entries (
    facility_id,
    facility_name,
    report_number,
    report_date,
    visn,
    state,
    city,
    summary_of_violations,
    violations_details,
    report_url
)
SELECT 
    f.id,
    f.name,
    'OIG-2023-0001',
    NOW() - interval '365 days',
    f.visn,
    f.state,
    f.city,
    'Test OIG Report',
    'Test violation details for scoring system',
    'https://www.va.gov/oig/pubs/test.pdf'
FROM va_facilities f
WHERE f.name IS NOT NULL 
  AND f.name != ''
  AND f.name NOT LIKE '%Unknown%'
  AND f.name NOT LIKE '%News%'
LIMIT 10;

-- Step 5: Show results
SELECT '=== RESULTS ===' as info;

SELECT 'Complaints with facility_id:' as metric, COUNT(*) as count
FROM user_submitted_complaints
WHERE facility_id IS NOT NULL
UNION ALL
SELECT 'OIG reports with facility_id:' as metric, COUNT(*) as count
FROM oig_report_entries
WHERE facility_id IS NOT NULL
UNION ALL
SELECT 'Total facilities:' as metric, COUNT(*) as count
FROM va_facilities;

-- Step 6: Show sample of linked data
SELECT '=== SAMPLE LINKED DATA ===' as info;

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