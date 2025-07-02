-- Insert extracted facilities into va_facilities table
-- This uses the successful extraction logic from our manual extraction script

WITH extracted_facilities AS (
  SELECT DISTINCT -- Remove duplicates
    source_url,
    -- Clean up the extracted name to be more facility-like
    CASE 
      WHEN source_url ~* '/richmond-' THEN 'Richmond VA Medical Center'
      WHEN source_url ~* '/augusta-' THEN 'Augusta VA Medical Center'
      WHEN source_url ~* '/atlanta-' THEN 'Atlanta VA Medical Center'
      WHEN source_url ~* '/birmingham-' THEN 'Birmingham VA Medical Center'
      WHEN source_url ~* '/charleston-' THEN 'Charleston VA Medical Center'
      WHEN source_url ~* '/phoenix-' THEN 'Phoenix VA Medical Center'
      WHEN source_url ~* '/houston-' THEN 'Houston VA Medical Center'
      ELSE NULL
    END as facility_name,
    
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
    END as city,
    
    -- Extract state from URL
    CASE 
      WHEN source_url ~* '/richmond-' THEN 'VA'
      WHEN source_url ~* '/augusta-' THEN 'GA'
      WHEN source_url ~* '/atlanta-' THEN 'GA'
      WHEN source_url ~* '/birmingham-' THEN 'AL'
      WHEN source_url ~* '/charleston-' THEN 'SC'
      WHEN source_url ~* '/phoenix-' THEN 'AZ'
      WHEN source_url ~* '/houston-' THEN 'TX'
      ELSE NULL
    END as state,
    
    -- Determine facility type
    CASE 
      WHEN source_url LIKE '%locations%' THEN 'Outpatient Clinic'
      ELSE 'Medical Center'
    END as facility_type,
    
    -- Extract VISN based on state
    CASE 
      WHEN source_url ~* '/richmond-' THEN 'VISN 6'
      WHEN source_url ~* '/augusta-' THEN 'VISN 7'
      WHEN source_url ~* '/atlanta-' THEN 'VISN 7'
      WHEN source_url ~* '/birmingham-' THEN 'VISN 7'
      WHEN source_url ~* '/charleston-' THEN 'VISN 7'
      WHEN source_url ~* '/phoenix-' THEN 'VISN 18'
      WHEN source_url ~* '/houston-' THEN 'VISN 16'
      ELSE 'Unknown VISN'
    END as visn
    
  FROM scraped_data 
  WHERE data_type = 'facility_info'
    AND source_url LIKE '%va.gov%'
    AND source_url NOT LIKE '%locations%' -- Only main facility pages, not location pages
)
INSERT INTO va_facilities (name, city, state, type, visn, created_at)
SELECT 
  facility_name,
  city,
  state,
  facility_type,
  visn,
  NOW()
FROM extracted_facilities
WHERE facility_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM va_facilities 
    WHERE name = extracted_facilities.facility_name
  );

-- Show the newly inserted facilities
SELECT 
  name,
  city,
  state,
  type,
  visn,
  created_at
FROM va_facilities 
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC; 