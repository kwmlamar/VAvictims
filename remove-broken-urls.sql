-- Remove the remaining broken URLs that returned 404 errors
DELETE FROM web_sources WHERE url IN (
  'https://www.va.gov/seattle-health-care/',
  'https://www.va.gov/seattle-health-care/locations/',
  'https://www.va.gov/los-angeles-health-care/',
  'https://www.va.gov/los-angeles-health-care/locations/',
  'https://www.va.gov/dallas-health-care/',
  'https://www.va.gov/dallas-health-care/locations/',
  'https://www.va.gov/oig/pubs/'
);

-- Show the current working web_sources
SELECT 
  id,
  url,
  description,
  data_type,
  update_frequency,
  last_scraped
FROM web_sources 
WHERE data_type IN ('facility_info', 'visn_info', 'facility_directory', 'facility_performance', 'community_care')
ORDER BY data_type, description; 