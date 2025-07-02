-- Fix Data Relationships and Add Realistic Test Data (Safe Version)
-- This script fixes the missing facility_id relationships and adds test data with only valid status values

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

-- Step 3: Add realistic test complaints for existing facilities (using only 'pending' status)
INSERT INTO user_submitted_complaints (
    facility_id,
    facility_name_submitted,
    complaint_type,
    description,
    category,
    submitted_at
)
SELECT 
    f.id,
    f.name,
    CASE (random() * 4)::int
        WHEN 0 THEN 'Patient Safety'
        WHEN 1 THEN 'Staff Misconduct'
        WHEN 2 THEN 'Wait Times'
        WHEN 3 THEN 'Quality of Care'
        ELSE 'General Complaint'
    END,
    CASE (random() * 4)::int
        WHEN 0 THEN 'Patient safety incident reported by staff member'
        WHEN 1 THEN 'Excessive wait times for appointments'
        WHEN 2 THEN 'Staff member not following proper procedures'
        WHEN 3 THEN 'Quality of care concerns raised by veteran'
        ELSE 'General complaint about facility operations'
    END,
    'General Complaint',
    NOW() - (random() * interval '365 days')
FROM va_facilities f
CROSS JOIN generate_series(1, (random() * 3 + 1)::int) -- 1-4 complaints per facility
WHERE f.name IS NOT NULL 
  AND f.name != ''
  AND f.name NOT LIKE '%Unknown%'
  AND f.name NOT LIKE '%News%'
  AND f.name NOT LIKE '%Department%'
LIMIT 30; -- Add 30 test complaints

-- Step 4: Add realistic test OIG reports for existing facilities
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
    repeat_violations_summary,
    report_url
)
SELECT 
    f.id,
    f.name,
    'OIG-' || (2020 + (random() * 4)::int) || '-' || LPAD((random() * 9999)::int::text, 4, '0'),
    NOW() - (random() * interval '1095 days'), -- Last 3 years
    f.visn,
    f.state,
    f.city,
    CASE (random() * 3)::int
        WHEN 0 THEN 'Patient Safety Violations'
        WHEN 1 THEN 'Staff Misconduct'
        WHEN 2 THEN 'Administrative Failures'
        ELSE 'Quality of Care Issues'
    END,
    CASE (random() * 3)::int
        WHEN 0 THEN 'Multiple instances of patient safety violations including medication errors and failure to follow proper protocols.'
        WHEN 1 THEN 'Staff misconduct including retaliation against whistleblowers and failure to report incidents.'
        WHEN 2 THEN 'Administrative failures including poor record keeping and lack of oversight.'
        ELSE 'Quality of care issues including delayed treatment and inadequate follow-up care.'
    END,
    CASE (random() * 2)::int
        WHEN 0 THEN 'Previous violations of similar nature documented in prior reports.'
        ELSE NULL
    END,
    'https://www.va.gov/oig/pubs/VAOIG-' || (2020 + (random() * 4)::int) || '-' || LPAD((random() * 9999)::int::text, 4, '0') || '.pdf'
FROM va_facilities f
CROSS JOIN generate_series(1, (random() * 2 + 1)::int) -- 1-3 reports per facility
WHERE f.name IS NOT NULL 
  AND f.name != ''
  AND f.name NOT LIKE '%Unknown%'
  AND f.name NOT LIKE '%News%'
  AND f.name NOT LIKE '%Department%'
LIMIT 20; -- Add 20 test OIG reports

-- Step 5: Ensure all facilities have proper VISN assignments
UPDATE va_facilities 
SET visn = 'VISN ' || (1 + (random() * 3)::int)
WHERE visn IS NULL OR visn = '';

-- Step 6: Add more VISNs if needed
INSERT INTO visns (id, name, region) VALUES 
    ('44444444-4444-4444-4444-444444444444', 'VISN 4', 'Mid-Atlantic'),
    ('55555555-5555-5555-5555-555555555555', 'VISN 5', 'Mid-Atlantic'),
    ('66666666-6666-6666-6666-666666666666', 'VISN 6', 'Southeast'),
    ('77777777-7777-7777-7777-777777777777', 'VISN 7', 'Southeast')
ON CONFLICT (id) DO NOTHING;

-- Step 7: Add more facilities to different VISNs
INSERT INTO va_facilities (id, name, city, state, type, visn, visn_id)
SELECT 
    gen_random_uuid(),
    'VA Medical Center - ' || 
    CASE (random() * 9)::int
        WHEN 0 THEN 'Atlanta'
        WHEN 1 THEN 'Boston'
        WHEN 2 THEN 'Chicago'
        WHEN 3 THEN 'Dallas'
        WHEN 4 THEN 'Denver'
        WHEN 5 THEN 'Los Angeles'
        WHEN 6 THEN 'Miami'
        WHEN 7 THEN 'New York'
        WHEN 8 THEN 'Phoenix'
        ELSE 'Seattle'
    END,
    CASE (random() * 9)::int
        WHEN 0 THEN 'Atlanta'
        WHEN 1 THEN 'Boston'
        WHEN 2 THEN 'Chicago'
        WHEN 3 THEN 'Dallas'
        WHEN 4 THEN 'Denver'
        WHEN 5 THEN 'Los Angeles'
        WHEN 6 THEN 'Miami'
        WHEN 7 THEN 'New York'
        WHEN 8 THEN 'Phoenix'
        ELSE 'Seattle'
    END,
    CASE (random() * 9)::int
        WHEN 0 THEN 'GA'
        WHEN 1 THEN 'MA'
        WHEN 2 THEN 'IL'
        WHEN 3 THEN 'TX'
        WHEN 4 THEN 'CO'
        WHEN 5 THEN 'CA'
        WHEN 6 THEN 'FL'
        WHEN 7 THEN 'NY'
        WHEN 8 THEN 'AZ'
        ELSE 'WA'
    END,
    'Medical Center',
    'VISN ' || (4 + (random() * 3)::int),
    v.id
FROM visns v
WHERE v.name IN ('VISN 4', 'VISN 5', 'VISN 6', 'VISN 7')
LIMIT 10; -- Add 10 more facilities

-- Step 8: Show the results
SELECT '=== DATA RELATIONSHIP FIX RESULTS ===' as info;

SELECT 'Complaints with facility_id:' as metric, COUNT(*) as count
FROM user_submitted_complaints
WHERE facility_id IS NOT NULL
UNION ALL
SELECT 'OIG reports with facility_id:' as metric, COUNT(*) as count
FROM oig_report_entries
WHERE facility_id IS NOT NULL
UNION ALL
SELECT 'Total facilities:' as metric, COUNT(*) as count
FROM va_facilities
UNION ALL
SELECT 'Total VISNs:' as metric, COUNT(*) as count
FROM visns;

-- Step 9: Show sample of linked data
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

-- Step 10: Show status distribution
SELECT '=== STATUS DISTRIBUTION ===' as info;

SELECT 
    status,
    COUNT(*) as count
FROM user_submitted_complaints
GROUP BY status
ORDER BY count DESC; 