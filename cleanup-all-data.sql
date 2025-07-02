-- Comprehensive cleanup script for VA Accountability Platform
-- This script removes all scraped data and invalid facilities, then prepares for fresh scraping

-- Step 1: Delete all scraped data (raw HTML content)
DELETE FROM scraped_data;

-- Step 2: Delete all facilities that were created from scraping
-- Keep any manually added facilities by checking if they have meaningful data
DELETE FROM va_facilities 
WHERE name IS NULL 
   OR name = '' 
   OR name LIKE '%Unknown%'
   OR name LIKE '%Facility%'
   OR name LIKE '%Test%'
   OR name LIKE '%Sample%'
   OR name LIKE '%News%' 
   OR name LIKE '%Breaking%'
   OR name LIKE '%Department%'
   OR name LIKE '%Times%'
   OR name LIKE '%Network%'
   OR name LIKE '%Sentinel%'
   OR name LIKE '%Justice%'
   OR name LIKE '%Email%'
   OR name LIKE '%Join%'
   OR name LIKE '%Serving%';

-- Step 3: Reset the last_scraped timestamp in web_sources so scraper will re-process all URLs
UPDATE web_sources 
SET last_scraped = NULL;

-- Step 4: Clean up related data that might have been created from scraped facilities
-- Delete scorecards for facilities that no longer exist
DELETE FROM scorecards 
WHERE entity_type = 'facility' 
  AND entity_id NOT IN (SELECT id FROM va_facilities);

-- Delete OIG reports for facilities that no longer exist
DELETE FROM oig_report_entries 
WHERE facility_id NOT IN (SELECT id FROM va_facilities);

-- Delete complaints for facilities that no longer exist
DELETE FROM user_submitted_complaints 
WHERE facility_id NOT IN (SELECT id FROM va_facilities);

-- Delete uploaded documents for facilities that no longer exist
DELETE FROM uploaded_documents 
WHERE facility_id NOT IN (SELECT id FROM va_facilities);

-- Reset analytics data that might be based on scraped facilities
DELETE FROM analytics 
WHERE data_type IN ('facility_trends', 'scraped_data_analytics');

-- Step 5: Show the cleanup results
SELECT 
  'scraped_data' as table_name,
  COUNT(*) as remaining_rows
FROM scraped_data
UNION ALL
SELECT 
  'va_facilities' as table_name,
  COUNT(*) as remaining_rows
FROM va_facilities
UNION ALL
SELECT 
  'web_sources' as table_name,
  COUNT(*) as remaining_rows
FROM web_sources
UNION ALL
SELECT 
  'scorecards' as table_name,
  COUNT(*) as remaining_rows
FROM scorecards
UNION ALL
SELECT 
  'oig_report_entries' as table_name,
  COUNT(*) as remaining_rows
FROM oig_report_entries
UNION ALL
SELECT 
  'user_submitted_complaints' as table_name,
  COUNT(*) as remaining_rows
FROM user_submitted_complaints;

-- Step 6: Show any remaining facilities (should be manually added ones)
SELECT 
  'Remaining Facilities:' as info,
  name,
  city,
  state,
  type,
  visn,
  created_at
FROM va_facilities 
ORDER BY created_at DESC; 