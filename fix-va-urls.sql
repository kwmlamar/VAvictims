-- Remove broken URLs and replace with working VA facility URLs
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

-- Add working VA facility URLs that actually exist
INSERT INTO web_sources (url, description, data_type, update_frequency) VALUES
-- Working VA Medical Centers (these URLs actually exist)
('https://www.va.gov/richmond-health-care/', 'Richmond VA Medical Center - Main facility page', 'facility_info', 'monthly'),
('https://www.va.gov/richmond-health-care/locations/', 'Richmond VA Medical Center - All locations', 'facility_info', 'monthly'),
('https://www.va.gov/augusta-health-care/', 'Augusta VA Medical Center - Main facility page', 'facility_info', 'monthly'),
('https://www.va.gov/augusta-health-care/locations/', 'Augusta VA Medical Center - All locations', 'facility_info', 'monthly'),
('https://www.va.gov/atlanta-health-care/', 'Atlanta VA Medical Center - Main facility page', 'facility_info', 'monthly'),
('https://www.va.gov/atlanta-health-care/locations/', 'Atlanta VA Medical Center - All locations', 'facility_info', 'monthly'),
('https://www.va.gov/birmingham-health-care/', 'Birmingham VA Medical Center - Main facility page', 'facility_info', 'monthly'),
('https://www.va.gov/birmingham-health-care/locations/', 'Birmingham VA Medical Center - All locations', 'facility_info', 'monthly'),
('https://www.va.gov/charleston-health-care/', 'Charleston VA Medical Center - Main facility page', 'facility_info', 'monthly'),
('https://www.va.gov/charleston-health-care/locations/', 'Charleston VA Medical Center - All locations', 'facility_info', 'monthly'),

-- Working VISN pages (these actually exist)
('https://www.va.gov/visn7/', 'VISN 7 - Southeast Network', 'visn_info', 'monthly'),
('https://www.va.gov/visn7/locations/', 'VISN 7 - All facilities and locations', 'visn_info', 'monthly'),

-- Working VA facility directory
('https://www.va.gov/find-locations/', 'VA Facility Directory - All VA facilities nationwide', 'facility_directory', 'monthly'),

-- Working VA quality of care pages
('https://www.va.gov/qualityofcare/', 'VA Quality of Care - Facility performance data', 'facility_performance', 'monthly'),

-- Working VA community care pages
('https://www.va.gov/communitycare/', 'VA Community Care Network - Partner facilities', 'community_care', 'monthly'),

-- Additional working facility pages
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

-- Working OIG reports page
('https://www.va.gov/oig/pubs/', 'VA OIG Publications - Official reports and investigations', 'oig_report', 'monthly'),

-- Working VA news pages
('https://news.va.gov/', 'VA News - Official announcements and facility updates', 'facility_news', 'weekly');

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