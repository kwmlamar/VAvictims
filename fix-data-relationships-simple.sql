-- Fix Data Relationships (Simple Safe Version)
-- This script fixes relationships and adds test data using only default status values

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

-- Step 3: Add test complaints (using default status only)
INSERT INTO user_submitted_complaints (
    facility_id,
    facility_name_submitted,
    complaint_type,
    description,
    category
)
SELECT 
    f.id,
    f.name,
    'Patient Safety',
    'Test complaint for scoring system',
    'General Complaint'
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
WHERE facility_id IS NOT NULL; 