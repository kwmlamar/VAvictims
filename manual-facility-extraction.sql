-- Manual facility name extraction from scraped HTML content
-- This script attempts to extract facility names using PostgreSQL text functions

-- First, let's try to extract facility names from the HTML content
WITH extracted_facilities AS (
  SELECT 
    id,
    source_url,
    data_type,
    content::text as html_content,
    -- Try to extract facility name from various HTML patterns
    CASE 
      -- Look for title tags
      WHEN content::text ~* '<title[^>]*>([^<]*VA[^<]*Health[^<]*)</title>' 
        THEN regexp_replace(content::text, '.*<title[^>]*>([^<]*VA[^<]*Health[^<]*)</title>.*', '\1', 'i')
      
      -- Look for h1 tags with VA content
      WHEN content::text ~* '<h1[^>]*>([^<]*VA[^<]*)</h1>' 
        THEN regexp_replace(content::text, '.*<h1[^>]*>([^<]*VA[^<]*)</h1>.*', '\1', 'i')
      
      -- Look for h2 tags with VA content
      WHEN content::text ~* '<h2[^>]*>([^<]*VA[^<]*)</h2>' 
        THEN regexp_replace(content::text, '.*<h2[^>]*>([^<]*VA[^<]*)</h2>.*', '\1', 'i')
      
      -- Look for facility name in URL path
      WHEN source_url ~* '/([^/]+)-health-care/' 
        THEN INITCAP(regexp_replace(source_url, '.*/([^/]+)-health-care/.*', '\1')) || ' VA Medical Center'
      
      ELSE NULL
    END as extracted_name,
    
    -- Extract state from URL or content
    CASE 
      WHEN source_url ~* '/richmond-' THEN 'VA'
      WHEN source_url ~* '/augusta-' THEN 'GA'
      WHEN source_url ~* '/atlanta-' THEN 'GA'
      WHEN source_url ~* '/birmingham-' THEN 'AL'
      WHEN source_url ~* '/charleston-' THEN 'SC'
      WHEN source_url ~* '/phoenix-' THEN 'AZ'
      WHEN source_url ~* '/houston-' THEN 'TX'
      ELSE NULL
    END as extracted_state,
    
    -- Extract city from URL
    CASE 
      WHEN source_url ~* '/richmond-' THEN 'Richmond'
      WHEN source_url ~* '/augusta-' THEN 'Augusta'
      WHEN source_url ~* '/atlanta-' THEN 'Atlanta'
      WHEN source_url ~* '/birmingham-' THEN 'Birmingham'
      WHEN source_url ~* '/charleston-' THEN 'Charleston'
      WHEN source_url ~* '/phoenix-' THEN 'Phoenix'
      WHEN source_url ~* '/houston-' THEN 'Houston'
      ELSE NULL
    END as extracted_city
    
  FROM scraped_data 
  WHERE data_type = 'facility_info'
    AND source_url LIKE '%va.gov%'
)
SELECT 
  source_url,
  extracted_name,
  extracted_city,
  extracted_state,
  -- Show if we found a facility name
  CASE 
    WHEN extracted_name IS NOT NULL THEN 'SUCCESS'
    ELSE 'FAILED'
  END as extraction_status
FROM extracted_facilities
ORDER BY extraction_status DESC, source_url; 