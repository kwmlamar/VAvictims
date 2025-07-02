-- Improve web_sources table with better VA facility URLs
-- This script replaces generic URLs with actual VA facility pages that contain extractable data

-- Step 1: Remove all existing URLs that don't contain actual facility data
DELETE FROM web_sources 
WHERE url LIKE '%news.va.gov%'
   OR url LIKE '%vaoig.gov%'
   OR url LIKE '%www.va.gov/oig/pubs/%'
   OR url LIKE '%www.va.gov/qualityofcare/%'
   OR url LIKE '%www.va.gov/communitycare/%'
   OR url LIKE '%www.va.gov/find-locations/%'
   OR url LIKE '%www.va.gov/visn6/%'
   OR url LIKE '%www.va.gov/visn8/%'
   OR url LIKE '%www.va.gov/visn9/%'
   OR url LIKE '%www.va.gov/visn10/%'
   OR url LIKE '%www.va.gov/georgia-health-care/%'
   OR url LIKE '%www.va.gov/south-carolina-health-care/%'
   OR url LIKE '%www.va.gov/alabama-health-care/%'
   OR url LIKE '%www.va.gov/seattle-health-care/%'
   OR url LIKE '%www.va.gov/los-angeles-health-care/%'
   OR url LIKE '%www.va.gov/dallas-health-care/%';

-- Step 2: Add new URLs that don't already exist
INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/hampton-health-care/', 'Hampton VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/hampton-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/hampton-health-care/locations/', 'Hampton VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/hampton-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/salem-health-care/', 'Salem VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/salem-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/salem-health-care/locations/', 'Salem VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/salem-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/columbia-health-care/', 'Columbia VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/columbia-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/columbia-health-care/locations/', 'Columbia VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/columbia-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/dublin-health-care/', 'Dublin VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/dublin-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/dublin-health-care/locations/', 'Dublin VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/dublin-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/tuskegee-health-care/', 'Tuskegee VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/tuskegee-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/tuskegee-health-care/locations/', 'Tuskegee VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/tuskegee-health-care/locations/');

-- VISN 8 - Sunshine Healthcare Network
INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/bay-pines-health-care/', 'Bay Pines VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/bay-pines-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/bay-pines-health-care/locations/', 'Bay Pines VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/bay-pines-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/miami-health-care/', 'Miami VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/miami-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/miami-health-care/locations/', 'Miami VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/miami-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/orlando-health-care/', 'Orlando VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/orlando-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/orlando-health-care/locations/', 'Orlando VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/orlando-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/tampa-health-care/', 'Tampa VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/tampa-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/tampa-health-care/locations/', 'Tampa VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/tampa-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/west-palm-beach-health-care/', 'West Palm Beach VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/west-palm-beach-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/west-palm-beach-health-care/locations/', 'West Palm Beach VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/west-palm-beach-health-care/locations/');

-- VISN 9 - Mid South Healthcare Network
INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/nashville-health-care/', 'Nashville VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/nashville-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/nashville-health-care/locations/', 'Nashville VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/nashville-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/memphis-health-care/', 'Memphis VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/memphis-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/memphis-health-care/locations/', 'Memphis VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/memphis-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/huntington-health-care/', 'Huntington VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/huntington-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/huntington-health-care/locations/', 'Huntington VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/huntington-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/lexington-health-care/', 'Lexington VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/lexington-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/lexington-health-care/locations/', 'Lexington VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/lexington-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/louisville-health-care/', 'Louisville VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/louisville-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/louisville-health-care/locations/', 'Louisville VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/louisville-health-care/locations/');

-- VISN 10 - Veterans Integrated Service Network 10
INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/cincinnati-health-care/', 'Cincinnati VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/cincinnati-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/cincinnati-health-care/locations/', 'Cincinnati VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/cincinnati-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/cleveland-health-care/', 'Cleveland VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/cleveland-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/cleveland-health-care/locations/', 'Cleveland VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/cleveland-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/columbus-health-care/', 'Columbus VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/columbus-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/columbus-health-care/locations/', 'Columbus VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/columbus-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/dayton-health-care/', 'Dayton VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/dayton-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/dayton-health-care/locations/', 'Dayton VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/dayton-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/chillicothe-health-care/', 'Chillicothe VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/chillicothe-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/chillicothe-health-care/locations/', 'Chillicothe VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/chillicothe-health-care/locations/');

-- VISN 16 - South Central VA Health Care Network
INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/new-orleans-health-care/', 'New Orleans VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/new-orleans-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/new-orleans-health-care/locations/', 'New Orleans VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/new-orleans-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/shreveport-health-care/', 'Shreveport VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/shreveport-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/shreveport-health-care/locations/', 'Shreveport VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/shreveport-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/alexandria-health-care/', 'Alexandria VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/alexandria-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/alexandria-health-care/locations/', 'Alexandria VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/alexandria-health-care/locations/');

-- VISN 18 - Southwest VA Health Care Network
INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/tucson-health-care/', 'Tucson VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/tucson-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/tucson-health-care/locations/', 'Tucson VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/tucson-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/las-vegas-health-care/', 'Las Vegas VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/las-vegas-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/las-vegas-health-care/locations/', 'Las Vegas VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/las-vegas-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/loma-linda-health-care/', 'Loma Linda VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/loma-linda-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/loma-linda-health-care/locations/', 'Loma Linda VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/loma-linda-health-care/locations/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/long-beach-health-care/', 'Long Beach VA Medical Center - Main facility page', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/long-beach-health-care/');

INSERT INTO web_sources (url, description, data_type, update_frequency)
SELECT 'https://www.va.gov/long-beach-health-care/locations/', 'Long Beach VA Medical Center - All locations', 'facility_info', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM web_sources WHERE url = 'https://www.va.gov/long-beach-health-care/locations/');

-- Step 3: Update existing URLs with better descriptions and data types
UPDATE web_sources 
SET description = 'Richmond VA Medical Center - Main facility page',
    data_type = 'facility_info'
WHERE url = 'https://www.va.gov/richmond-health-care/';

UPDATE web_sources 
SET description = 'Richmond VA Medical Center - All locations',
    data_type = 'facility_info'
WHERE url = 'https://www.va.gov/richmond-health-care/locations/';

UPDATE web_sources 
SET description = 'Augusta VA Medical Center - Main facility page',
    data_type = 'facility_info'
WHERE url = 'https://www.va.gov/augusta-health-care/';

UPDATE web_sources 
SET description = 'Augusta VA Medical Center - All locations',
    data_type = 'facility_info'
WHERE url = 'https://www.va.gov/augusta-health-care/locations/';

UPDATE web_sources 
SET description = 'Atlanta VA Medical Center - Main facility page',
    data_type = 'facility_info'
WHERE url = 'https://www.va.gov/atlanta-health-care/';

UPDATE web_sources 
SET description = 'Atlanta VA Medical Center - All locations',
    data_type = 'facility_info'
WHERE url = 'https://www.va.gov/atlanta-health-care/locations/';

UPDATE web_sources 
SET description = 'Birmingham VA Medical Center - Main facility page',
    data_type = 'facility_info'
WHERE url = 'https://www.va.gov/birmingham-health-care/';

UPDATE web_sources 
SET description = 'Birmingham VA Medical Center - All locations',
    data_type = 'facility_info'
WHERE url = 'https://www.va.gov/birmingham-health-care/locations/';

UPDATE web_sources 
SET description = 'Charleston VA Medical Center - Main facility page',
    data_type = 'facility_info'
WHERE url = 'https://www.va.gov/charleston-health-care/';

UPDATE web_sources 
SET description = 'Charleston VA Medical Center - All locations',
    data_type = 'facility_info'
WHERE url = 'https://www.va.gov/charleston-health-care/locations/';

UPDATE web_sources 
SET description = 'Phoenix VA Medical Center - Main facility page',
    data_type = 'facility_info'
WHERE url = 'https://www.va.gov/phoenix-health-care/';

UPDATE web_sources 
SET description = 'Phoenix VA Medical Center - All locations',
    data_type = 'facility_info'
WHERE url = 'https://www.va.gov/phoenix-health-care/locations/';

UPDATE web_sources 
SET description = 'Houston VA Medical Center - Main facility page',
    data_type = 'facility_info'
WHERE url = 'https://www.va.gov/houston-health-care/';

UPDATE web_sources 
SET description = 'Houston VA Medical Center - All locations',
    data_type = 'facility_info'
WHERE url = 'https://www.va.gov/houston-health-care/locations/';

UPDATE web_sources 
SET description = 'VISN 7 - Southeast Network',
    data_type = 'visn_info'
WHERE url = 'https://www.va.gov/visn7/';

UPDATE web_sources 
SET description = 'VISN 7 - All facilities and locations',
    data_type = 'visn_info'
WHERE url = 'https://www.va.gov/visn7/locations/';

-- Step 4: Show the updated web_sources table
SELECT 
  id,
  url,
  description,
  data_type,
  update_frequency,
  last_scraped
FROM web_sources 
ORDER BY data_type, description;

-- Step 5: Show count by data type
SELECT 
  data_type,
  COUNT(*) as url_count
FROM web_sources 
GROUP BY data_type
ORDER BY url_count DESC; 