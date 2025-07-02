-- Check what data was scraped and from which sources
SELECT 
  sd.id,
  sd.source_url,
  sd.data_type,
  sd.extracted_facility_name,
  sd.state,
  sd.is_processed,
  sd.scraped_at,
  ws.description
FROM scraped_data sd
LEFT JOIN web_sources ws ON sd.source_url = ws.url
ORDER BY sd.scraped_at DESC
LIMIT 20;

-- Check which data types we have
SELECT 
  data_type,
  COUNT(*) as count
FROM scraped_data
GROUP BY data_type
ORDER BY count DESC;

-- Check if we have any facility_info data
SELECT 
  source_url,
  extracted_facility_name,
  state,
  data_type
FROM scraped_data
WHERE data_type = 'facility_info'
ORDER BY scraped_at DESC
LIMIT 10; 