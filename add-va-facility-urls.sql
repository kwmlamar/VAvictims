-- Add VA facility-specific URLs to web_sources table
-- These URLs contain actual facility information that can be extracted

-- VA Medical Centers and Health Care Systems
INSERT INTO web_sources (url, description, data_type, update_frequency) VALUES
-- Major VA Medical Centers
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

-- VISN Directory Pages
('https://www.va.gov/visn6/', 'VISN 6 - Mid-Atlantic Health Care Network', 'visn_info', 'monthly'),
('https://www.va.gov/visn6/locations/', 'VISN 6 - All facilities and locations', 'visn_info', 'monthly'),
('https://www.va.gov/visn7/', 'VISN 7 - Southeast Network', 'visn_info', 'monthly'),
('https://www.va.gov/visn7/locations/', 'VISN 7 - All facilities and locations', 'visn_info', 'monthly'),
('https://www.va.gov/visn8/', 'VISN 8 - Sunshine Healthcare Network', 'visn_info', 'monthly'),
('https://www.va.gov/visn8/locations/', 'VISN 8 - All facilities and locations', 'visn_info', 'monthly'),
('https://www.va.gov/visn9/', 'VISN 9 - Mid South Healthcare Network', 'visn_info', 'monthly'),
('https://www.va.gov/visn9/locations/', 'VISN 9 - All facilities and locations', 'visn_info', 'monthly'),
('https://www.va.gov/visn10/', 'VISN 10 - Veterans Integrated Service Network 10', 'visn_info', 'monthly'),
('https://www.va.gov/visn10/locations/', 'VISN 10 - All facilities and locations', 'visn_info', 'monthly'),

-- VA Facility Directory
('https://www.va.gov/find-locations/', 'VA Facility Directory - All VA facilities nationwide', 'facility_directory', 'monthly'),
('https://www.va.gov/find-locations/results/', 'VA Facility Search Results - All facilities', 'facility_directory', 'monthly'),

-- State-specific VA pages
('https://www.va.gov/georgia-health-care/', 'Georgia VA Health Care System', 'facility_info', 'monthly'),
('https://www.va.gov/georgia-health-care/locations/', 'Georgia VA - All locations', 'facility_info', 'monthly'),
('https://www.va.gov/south-carolina-health-care/', 'South Carolina VA Health Care System', 'facility_info', 'monthly'),
('https://www.va.gov/south-carolina-health-care/locations/', 'South Carolina VA - All locations', 'facility_info', 'monthly'),
('https://www.va.gov/alabama-health-care/', 'Alabama VA Health Care System', 'facility_info', 'monthly'),
('https://www.va.gov/alabama-health-care/locations/', 'Alabama VA - All locations', 'facility_info', 'monthly'),

-- OIG Reports with facility-specific content
('https://www.va.gov/oig/pubs/VAOIG-23-0117-0001.pdf', 'OIG Report VA-2023-0117 - Phoenix VA Medical Center', 'oig_report', 'monthly'),
('https://www.va.gov/oig/pubs/VAOIG-23-0123-0001.pdf', 'OIG Report VA-2023-0123 - Augusta VA Medical Center', 'oig_report', 'monthly'),
('https://www.va.gov/oig/pubs/VAOIG-23-0134-0001.pdf', 'OIG Report VA-2023-0134 - Atlanta VA Medical Center', 'oig_report', 'monthly'),

-- VA News with facility mentions
('https://news.va.gov/facilities/', 'VA News - Facility-specific announcements', 'facility_news', 'weekly'),
('https://news.va.gov/tag/facilities/', 'VA News - All facility-related news', 'facility_news', 'weekly'),

-- VA Facility Performance Data
('https://www.va.gov/qualityofcare/', 'VA Quality of Care - Facility performance data', 'facility_performance', 'monthly'),
('https://www.va.gov/qualityofcare/find-locations/', 'VA Quality of Care - Facility search and ratings', 'facility_performance', 'monthly'),

-- VA Community Care Network
('https://www.va.gov/communitycare/', 'VA Community Care Network - Partner facilities', 'community_care', 'monthly'),
('https://www.va.gov/communitycare/providers/', 'VA Community Care - Provider directory', 'community_care', 'monthly');

-- Update existing news URLs to have better descriptions
UPDATE web_sources 
SET description = 'VA OIG Reports - Official investigations and findings for specific facilities'
WHERE url = 'https://www.vaoig.gov/reports/';

UPDATE web_sources 
SET description = 'VA News - Official announcements and facility-specific updates'
WHERE url = 'https://news.va.gov';

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