-- Add Sample Data for Testing the Scoring System
-- This script adds sample complaints and OIG reports to test the scoring calculations

-- Step 1: Add sample complaints for existing facilities
INSERT INTO user_submitted_complaints (
    facility_id,
    facility_name_submitted,
    complaint_type,
    description,
    status,
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
    CASE (random() * 2)::int
        WHEN 0 THEN 'pending'
        ELSE 'resolved'
    END,
    'General Complaint',
    NOW() - (random() * interval '365 days')
FROM va_facilities f
CROSS JOIN generate_series(1, (random() * 3 + 1)::int) -- 1-4 complaints per facility
WHERE f.name IS NOT NULL 
  AND f.name != ''
  AND f.name NOT LIKE '%Unknown%'
LIMIT 50; -- Limit to 50 total complaints

-- Step 2: Add sample OIG reports for existing facilities
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
LIMIT 30; -- Limit to 30 total OIG reports

-- Step 3: Add more VISNs to have better coverage
INSERT INTO visns (id, name, region) VALUES 
    ('44444444-4444-4444-4444-444444444444', 'VISN 4', 'Mid-Atlantic'),
    ('55555555-5555-5555-5555-555555555555', 'VISN 5', 'Mid-Atlantic'),
    ('66666666-6666-6666-6666-666666666666', 'VISN 6', 'Southeast'),
    ('77777777-7777-7777-7777-777777777777', 'VISN 7', 'Southeast'),
    ('88888888-8888-8888-8888-888888888888', 'VISN 8', 'Southeast'),
    ('99999999-9999-9999-9999-999999999999', 'VISN 9', 'Southeast'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'VISN 10', 'Midwest'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'VISN 11', 'Midwest'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'VISN 12', 'Midwest'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'VISN 15', 'Central'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'VISN 16', 'South Central'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'VISN 17', 'South Central'),
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'VISN 18', 'Southwest'),
    ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'VISN 19', 'Northwest'),
    ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'VISN 20', 'Northwest'),
    ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'VISN 21', 'Pacific'),
    ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'VISN 22', 'Pacific'),
    ('llllllll-llll-llll-llll-llllllllllll', 'VISN 23', 'Midwest')
ON CONFLICT (id) DO NOTHING;

-- Step 4: Add more facilities across different VISNs
INSERT INTO va_facilities (id, name, city, state, type, visn, visn_id)
SELECT 
    gen_random_uuid(),
    CASE (random() * 4)::int
        WHEN 0 THEN 'VA Medical Center'
        WHEN 1 THEN 'VA Outpatient Clinic'
        WHEN 2 THEN 'VA Community Based Outpatient Clinic'
        ELSE 'VA Health Care System'
    END || ' - ' || 
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
    CASE (random() * 3)::int
        WHEN 0 THEN 'Medical Center'
        WHEN 1 THEN 'Outpatient Clinic'
        ELSE 'CBOC'
    END,
    'VISN ' || (4 + (random() * 19)::int),
    v.id
FROM visns v
CROSS JOIN generate_series(1, 3) -- 3 facilities per VISN
WHERE v.name NOT IN ('VISN 1', 'VISN 2', 'VISN 3') -- Skip existing VISNs
LIMIT 50; -- Add 50 more facilities

-- Step 5: Show what we added
SELECT '=== ADDED SAMPLE DATA ===' as info;

SELECT 'Complaints Added:' as category, COUNT(*) as count
FROM user_submitted_complaints
WHERE submitted_at > NOW() - interval '1 hour'
UNION ALL
SELECT 'OIG Reports Added:' as category, COUNT(*) as count
FROM oig_report_entries
WHERE created_at > NOW() - interval '1 hour'
UNION ALL
SELECT 'New VISNs Added:' as category, COUNT(*) as count
FROM visns
WHERE created_at > NOW() - interval '1 hour'
UNION ALL
SELECT 'New Facilities Added:' as category, COUNT(*) as count
FROM va_facilities
WHERE created_at > NOW() - interval '1 hour';

-- Step 6: Show sample of added data
SELECT '=== SAMPLE COMPLAINTS ===' as info;
SELECT 
    f.name as facility,
    f.visn,
    usc.complaint_type,
    usc.status,
    usc.submitted_at
FROM user_submitted_complaints usc
JOIN va_facilities f ON usc.facility_id = f.id
WHERE usc.submitted_at > NOW() - interval '1 hour'
ORDER BY usc.submitted_at DESC
LIMIT 10;

SELECT '=== SAMPLE OIG REPORTS ===' as info;
SELECT 
    f.name as facility,
    f.visn,
    oig.report_number,
    oig.summary_of_violations,
    oig.repeat_violations_summary IS NOT NULL as has_repeat_violations
FROM oig_report_entries oig
JOIN va_facilities f ON oig.facility_id = f.id
WHERE oig.created_at > NOW() - interval '1 hour'
ORDER BY oig.created_at DESC
LIMIT 10; 