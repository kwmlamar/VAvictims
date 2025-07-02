-- Analyze Data Authenticity
-- This script helps identify real vs test data in your database

-- 1. Analyze User Submitted Complaints
SELECT 
  'USER SUBMITTED COMPLAINTS' as data_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN description LIKE '%test%' OR description LIKE '%sample%' OR description LIKE '%mock%' THEN 1 END) as likely_test,
  COUNT(CASE WHEN description NOT LIKE '%test%' AND description NOT LIKE '%sample%' AND description NOT LIKE '%mock%' THEN 1 END) as likely_real
FROM user_submitted_complaints;

-- Show sample complaints to assess authenticity
SELECT 
  'SAMPLE COMPLAINTS' as info,
  facility_name_submitted,
  complaint_type,
  LEFT(description, 100) as description_preview,
  submitted_at
FROM user_submitted_complaints 
ORDER BY submitted_at DESC
LIMIT 10;

-- 2. Analyze OIG Report Entries
SELECT 
  'OIG REPORT ENTRIES' as data_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN summary_of_violations LIKE '%test%' OR summary_of_violations LIKE '%sample%' OR summary_of_violations LIKE '%mock%' THEN 1 END) as likely_test,
  COUNT(CASE WHEN summary_of_violations NOT LIKE '%test%' AND summary_of_violations NOT LIKE '%sample%' AND summary_of_violations NOT LIKE '%mock%' THEN 1 END) as likely_real
FROM oig_report_entries;

-- Show sample OIG reports to assess authenticity
SELECT 
  'SAMPLE OIG REPORTS' as info,
  facility_name,
  report_number,
  report_date,
  LEFT(summary_of_violations, 100) as summary_preview
FROM oig_report_entries 
ORDER BY report_date DESC
LIMIT 10;

-- 3. Check for obvious test patterns
SELECT 
  'TEST DATA PATTERNS' as analysis,
  'Complaints with test patterns' as pattern_type,
  COUNT(*) as count
FROM user_submitted_complaints 
WHERE description ILIKE '%test%' 
   OR description ILIKE '%sample%' 
   OR description ILIKE '%mock%'
   OR veteran_name ILIKE '%test%'
   OR veteran_name ILIKE '%sample%'
   OR veteran_name ILIKE '%mock%'

UNION ALL

SELECT 
  'TEST DATA PATTERNS' as analysis,
  'OIG reports with test patterns' as pattern_type,
  COUNT(*) as count
FROM oig_report_entries 
WHERE summary_of_violations ILIKE '%test%' 
   OR summary_of_violations ILIKE '%sample%' 
   OR summary_of_violations ILIKE '%mock%'
   OR facility_name ILIKE '%test%'
   OR facility_name ILIKE '%sample%'
   OR facility_name ILIKE '%mock%';

-- 4. Check submission dates for patterns
SELECT 
  'SUBMISSION DATE ANALYSIS' as analysis,
  DATE(submitted_at) as submission_date,
  COUNT(*) as complaints_count
FROM user_submitted_complaints 
GROUP BY DATE(submitted_at)
ORDER BY submission_date DESC
LIMIT 10;

-- 5. Check OIG report dates for patterns
SELECT 
  'OIG REPORT DATE ANALYSIS' as analysis,
  report_date,
  COUNT(*) as reports_count
FROM oig_report_entries 
WHERE report_date IS NOT NULL
GROUP BY report_date
ORDER BY report_date DESC
LIMIT 10; 