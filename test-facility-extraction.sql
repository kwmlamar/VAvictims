-- Test facility name extraction from scraped HTML content
-- Let's look at the actual content that was scraped from VA facility pages

-- Check the raw HTML content from a VA facility page
SELECT 
  id,
  source_url,
  data_type,
  extracted_facility_name,
  state,
  -- Show first 500 characters of the HTML content
  LEFT(content::text, 500) as content_preview
FROM scraped_data 
WHERE data_type = 'facility_info' 
  AND source_url LIKE '%va.gov%'
ORDER BY scraped_at DESC
LIMIT 3;

-- Check if the content contains facility name patterns
SELECT 
  source_url,
  CASE 
    WHEN content::text ILIKE '%Richmond%' THEN 'Contains Richmond'
    WHEN content::text ILIKE '%Augusta%' THEN 'Contains Augusta'
    WHEN content::text ILIKE '%Atlanta%' THEN 'Contains Atlanta'
    WHEN content::text ILIKE '%Birmingham%' THEN 'Contains Birmingham'
    WHEN content::text ILIKE '%Charleston%' THEN 'Contains Charleston'
    WHEN content::text ILIKE '%Phoenix%' THEN 'Contains Phoenix'
    WHEN content::text ILIKE '%Houston%' THEN 'Contains Houston'
    ELSE 'No facility name found'
  END as facility_detected,
  extracted_facility_name
FROM scraped_data 
WHERE data_type = 'facility_info'
ORDER BY scraped_at DESC; 