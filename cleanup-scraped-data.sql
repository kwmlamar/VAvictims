-- Clean up all scraped data from the database
-- Run this in your Supabase SQL editor

-- Delete all scraped data (raw HTML content)
DELETE FROM scraped_data;

-- Delete all facilities that were created from scraping
-- Keep any manually added facilities by checking if they have meaningful data
DELETE FROM va_facilities 
WHERE name IS NULL 
   OR name = '' 
   OR name LIKE '%Unknown%'
   OR name LIKE '%Facility%'
   OR name LIKE '%Test%'
   OR name LIKE '%Sample%';

-- Reset the last_scraped timestamp in web_sources so scraper will re-process all URLs
UPDATE web_sources 
SET last_scraped = NULL;

-- Optional: Also clean up any related data that might have been created
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

-- Reset analytics data that might be based on scraped facilities
DELETE FROM analytics 
WHERE data_type IN ('facility_trends', 'scraped_data_analytics');

-- Show the cleanup results
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
FROM web_sources; 