-- Fix the web_sources table by updating existing records and removing broken URLs
-- First, let's remove the URLs that returned 404 errors

DELETE FROM web_sources WHERE url IN (
  'https://www.va.gov/visn6/',
  'https://www.va.gov/visn6/locations/',
  'https://www.va.gov/visn8/',
  'https://www.va.gov/visn8/locations/',
  'https://www.va.gov/visn9/',
  'https://www.va.gov/visn9/locations/',
  'https://www.va.gov/visn10/',
  'https://www.va.gov/visn10/locations/',
  'https://www.va.gov/georgia-health-care/',
  'https://www.va.gov/georgia-health-care/locations/',
  'https://www.va.gov/south-carolina-health-care/',
  'https://www.va.gov/south-carolina-health-care/locations/',
  'https://www.va.gov/alabama-health-care/',
  'https://www.va.gov/alabama-health-care/locations/',
  'https://www.va.gov/oig/pubs/VAOIG-23-0117-0001.pdf',
  'https://www.va.gov/oig/pubs/VAOIG-23-0123-0001.pdf',
  'https://www.va.gov/oig/pubs/VAOIG-23-0134-0001.pdf',
  'https://news.va.gov/facilities/',
  'https://news.va.gov/tag/facilities/',
  'https://www.vaoig.gov/reports/'
);

-- Update existing facility URLs with correct data types and descriptions
UPDATE web_sources 
SET 
  data_type = 'facility_info',
  description = 'Richmond VA Medical Center - Main facility page'
WHERE url = 'https://www.va.gov/richmond-health-care/';

UPDATE web_sources 
SET 
  data_type = 'facility_info',
  description = 'Richmond VA Medical Center - All locations'
WHERE url = 'https://www.va.gov/richmond-health-care/locations/';

UPDATE web_sources 
SET 
  data_type = 'facility_info',
  description = 'Augusta VA Medical Center - Main facility page'
WHERE url = 'https://www.va.gov/augusta-health-care/';

UPDATE web_sources 
SET 
  data_type = 'facility_info',
  description = 'Augusta VA Medical Center - All locations'
WHERE url = 'https://www.va.gov/augusta-health-care/locations/';

UPDATE web_sources 
SET 
  data_type = 'facility_info',
  description = 'Atlanta VA Medical Center - Main facility page'
WHERE url = 'https://www.va.gov/atlanta-health-care/';

UPDATE web_sources 
SET 
  data_type = 'facility_info',
  description = 'Atlanta VA Medical Center - All locations'
WHERE url = 'https://www.va.gov/atlanta-health-care/locations/';

UPDATE web_sources 
SET 
  data_type = 'facility_info',
  description = 'Birmingham VA Medical Center - Main facility page'
WHERE url = 'https://www.va.gov/birmingham-health-care/';

UPDATE web_sources 
SET 
  data_type = 'facility_info',
  description = 'Birmingham VA Medical Center - All locations'
WHERE url = 'https://www.va.gov/birmingham-health-care/locations/';

UPDATE web_sources 
SET 
  data_type = 'facility_info',
  description = 'Charleston VA Medical Center - Main facility page'
WHERE url = 'https://www.va.gov/charleston-health-care/';

UPDATE web_sources 
SET 
  data_type = 'facility_info',
  description = 'Charleston VA Medical Center - All locations'
WHERE url = 'https://www.va.gov/charleston-health-care/locations/';

UPDATE web_sources 
SET 
  data_type = 'visn_info',
  description = 'VISN 7 - Southeast Network'
WHERE url = 'https://www.va.gov/visn7/';

UPDATE web_sources 
SET 
  data_type = 'visn_info',
  description = 'VISN 7 - All facilities and locations'
WHERE url = 'https://www.va.gov/visn7/locations/';

UPDATE web_sources 
SET 
  data_type = 'facility_directory',
  description = 'VA Facility Directory - All VA facilities nationwide'
WHERE url = 'https://www.va.gov/find-locations/';

UPDATE web_sources 
SET 
  data_type = 'facility_performance',
  description = 'VA Quality of Care - Facility performance data'
WHERE url = 'https://www.va.gov/qualityofcare/';

UPDATE web_sources 
SET 
  data_type = 'community_care',
  description = 'VA Community Care Network - Partner facilities'
WHERE url = 'https://www.va.gov/communitycare/';

-- Add only the new URLs that don't already exist
INSERT INTO web_sources (url, description, data_type, update_frequency) 
SELECT * FROM (VALUES
  ('https://www.va.gov/phoenix-health-care/', 'Phoenix VA Medical Center - Main facility page', 'facility_info', 'monthly'),
  ('https://www.va.gov/phoenix-health-care/locations/', 'Phoenix VA Medical Center - All locations', 'facility_info', 'monthly'),
  ('https://www.va.gov/seattle-health-care/', 'Seattle VA Medical Center - Main facility page', 'facility_info', 'monthly'),
  ('https://www.va.gov/seattle-health-care/locations/', 'Seattle VA Medical Center - All locations', 'facility_info', 'monthly'),
  ('https://www.va.gov/los-angeles-health-care/', 'Los Angeles VA Medical Center - Main facility page', 'facility_info', 'monthly'),
  ('https://www.va.gov/los-angeles-health-care/locations/', 'Los Angeles VA Medical Center - All locations', 'facility_info', 'monthly'),
  ('https://www.va.gov/houston-health-care/', 'Houston VA Medical Center - Main facility page', 'facility_info', 'monthly'),
  ('https://www.va.gov/houston-health-care/locations/', 'Houston VA Medical Center - All locations', 'facility_info', 'monthly'),
  ('https://www.va.gov/dallas-health-care/', 'Dallas VA Medical Center - Main facility page', 'facility_info', 'monthly'),
  ('https://www.va.gov/dallas-health-care/locations/', 'Dallas VA Medical Center - All locations', 'facility_info', 'monthly'),
  ('https://www.va.gov/oig/pubs/', 'VA OIG Publications - Official reports and investigations', 'oig_report', 'monthly')
) AS new_urls(url, description, data_type, update_frequency)
WHERE NOT EXISTS (
  SELECT 1 FROM web_sources WHERE web_sources.url = new_urls.url
);

-- Show the updated web_sources table
SELECT 
  id,
  url,
  description,
  data_type,
  update_frequency,
  last_scraped
FROM web_sources 
ORDER BY data_type, description; 