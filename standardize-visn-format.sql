-- Standardize VISN formatting in the database
-- This script cleans up inconsistent VISN formatting and standardizes to just the number

-- Step 1: Update existing facilities to standardize VISN formatting
UPDATE va_facilities 
SET visn = CASE 
  WHEN visn = 'VISN 7' THEN '7'
  WHEN visn = 'VISN 6' THEN '6'
  WHEN visn = 'VISN 18' THEN '18'
  WHEN visn = 'VISN 16' THEN '16'
  WHEN visn = 'VISN 8' THEN '8'
  WHEN visn = 'VISN 9' THEN '9'
  WHEN visn = 'VISN 10' THEN '10'
  WHEN visn = 'VISN 11' THEN '11'
  WHEN visn = 'VISN 12' THEN '12'
  WHEN visn = 'VISN 15' THEN '15'
  WHEN visn = 'VISN 17' THEN '17'
  WHEN visn = 'VISN 19' THEN '19'
  WHEN visn = 'VISN 20' THEN '20'
  WHEN visn = 'VISN 21' THEN '21'
  WHEN visn = 'VISN 22' THEN '22'
  WHEN visn = 'VISN 23' THEN '23'
  ELSE visn
END
WHERE visn LIKE 'VISN %';

-- Step 2: Update scraped_data table to standardize VISN formatting
UPDATE scraped_data 
SET state = CASE 
  WHEN source_url ~* '/richmond-' THEN 'VA'
  WHEN source_url ~* '/hampton-' THEN 'VA'
  WHEN source_url ~* '/salem-' THEN 'VA'
  WHEN source_url ~* '/augusta-' THEN 'GA'
  WHEN source_url ~* '/atlanta-' THEN 'GA'
  WHEN source_url ~* '/birmingham-' THEN 'AL'
  WHEN source_url ~* '/charleston-' THEN 'SC'
  WHEN source_url ~* '/columbia-' THEN 'SC'
  WHEN source_url ~* '/dublin-' THEN 'GA'
  WHEN source_url ~* '/tuskegee-' THEN 'AL'
  WHEN source_url ~* '/bay-pines-' THEN 'FL'
  WHEN source_url ~* '/miami-' THEN 'FL'
  WHEN source_url ~* '/orlando-' THEN 'FL'
  WHEN source_url ~* '/tampa-' THEN 'FL'
  WHEN source_url ~* '/west-palm-beach-' THEN 'FL'
  WHEN source_url ~* '/nashville-' THEN 'TN'
  WHEN source_url ~* '/memphis-' THEN 'TN'
  WHEN source_url ~* '/huntington-' THEN 'WV'
  WHEN source_url ~* '/lexington-' THEN 'KY'
  WHEN source_url ~* '/louisville-' THEN 'KY'
  WHEN source_url ~* '/cincinnati-' THEN 'OH'
  WHEN source_url ~* '/cleveland-' THEN 'OH'
  WHEN source_url ~* '/columbus-' THEN 'OH'
  WHEN source_url ~* '/dayton-' THEN 'OH'
  WHEN source_url ~* '/chillicothe-' THEN 'OH'
  WHEN source_url ~* '/houston-' THEN 'TX'
  WHEN source_url ~* '/new-orleans-' THEN 'LA'
  WHEN source_url ~* '/shreveport-' THEN 'LA'
  WHEN source_url ~* '/alexandria-' THEN 'LA'
  WHEN source_url ~* '/phoenix-' THEN 'AZ'
  WHEN source_url ~* '/tucson-' THEN 'AZ'
  WHEN source_url ~* '/las-vegas-' THEN 'NV'
  WHEN source_url ~* '/loma-linda-' THEN 'CA'
  WHEN source_url ~* '/long-beach-' THEN 'CA'
  ELSE state
END
WHERE data_type = 'facility_info';

-- Step 3: Add a function to standardize VISN extraction from URLs
CREATE OR REPLACE FUNCTION extract_standardized_visn(url TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE 
    -- VISN 6 - Mid-Atlantic Health Care Network
    WHEN url ~* '/richmond-' OR url ~* '/hampton-' OR url ~* '/salem-' THEN '6'
    
    -- VISN 7 - Southeast Network
    WHEN url ~* '/augusta-' OR url ~* '/atlanta-' OR url ~* '/birmingham-' OR 
         url ~* '/charleston-' OR url ~* '/columbia-' OR url ~* '/dublin-' OR 
         url ~* '/tuskegee-' THEN '7'
    
    -- VISN 8 - Sunshine Healthcare Network
    WHEN url ~* '/bay-pines-' OR url ~* '/miami-' OR url ~* '/orlando-' OR 
         url ~* '/tampa-' OR url ~* '/west-palm-beach-' THEN '8'
    
    -- VISN 9 - Mid South Healthcare Network
    WHEN url ~* '/nashville-' OR url ~* '/memphis-' OR url ~* '/huntington-' OR 
         url ~* '/lexington-' OR url ~* '/louisville-' THEN '9'
    
    -- VISN 10 - Veterans Integrated Service Network 10
    WHEN url ~* '/cincinnati-' OR url ~* '/cleveland-' OR url ~* '/columbus-' OR 
         url ~* '/dayton-' OR url ~* '/chillicothe-' THEN '10'
    
    -- VISN 16 - South Central VA Health Care Network
    WHEN url ~* '/houston-' OR url ~* '/new-orleans-' OR url ~* '/shreveport-' OR 
         url ~* '/alexandria-' THEN '16'
    
    -- VISN 18 - Southwest VA Health Care Network
    WHEN url ~* '/phoenix-' OR url ~* '/tucson-' OR url ~* '/las-vegas-' OR 
         url ~* '/loma-linda-' OR url ~* '/long-beach-' THEN '18'
    
    ELSE 'Unknown'
  END;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Add a function to extract standardized facility names from URLs
CREATE OR REPLACE FUNCTION extract_standardized_facility_name(url TEXT)
RETURNS TEXT AS $$
DECLARE
  city_name TEXT;
BEGIN
  -- Extract city name from URL
  city_name := CASE 
    WHEN url ~* '/richmond-' THEN 'Richmond'
    WHEN url ~* '/hampton-' THEN 'Hampton'
    WHEN url ~* '/salem-' THEN 'Salem'
    WHEN url ~* '/augusta-' THEN 'Augusta'
    WHEN url ~* '/atlanta-' THEN 'Atlanta'
    WHEN url ~* '/birmingham-' THEN 'Birmingham'
    WHEN url ~* '/charleston-' THEN 'Charleston'
    WHEN url ~* '/columbia-' THEN 'Columbia'
    WHEN url ~* '/dublin-' THEN 'Dublin'
    WHEN url ~* '/tuskegee-' THEN 'Tuskegee'
    WHEN url ~* '/bay-pines-' THEN 'Bay Pines'
    WHEN url ~* '/miami-' THEN 'Miami'
    WHEN url ~* '/orlando-' THEN 'Orlando'
    WHEN url ~* '/tampa-' THEN 'Tampa'
    WHEN url ~* '/west-palm-beach-' THEN 'West Palm Beach'
    WHEN url ~* '/nashville-' THEN 'Nashville'
    WHEN url ~* '/memphis-' THEN 'Memphis'
    WHEN url ~* '/huntington-' THEN 'Huntington'
    WHEN url ~* '/lexington-' THEN 'Lexington'
    WHEN url ~* '/louisville-' THEN 'Louisville'
    WHEN url ~* '/cincinnati-' THEN 'Cincinnati'
    WHEN url ~* '/cleveland-' THEN 'Cleveland'
    WHEN url ~* '/columbus-' THEN 'Columbus'
    WHEN url ~* '/dayton-' THEN 'Dayton'
    WHEN url ~* '/chillicothe-' THEN 'Chillicothe'
    WHEN url ~* '/houston-' THEN 'Houston'
    WHEN url ~* '/new-orleans-' THEN 'New Orleans'
    WHEN url ~* '/shreveport-' THEN 'Shreveport'
    WHEN url ~* '/alexandria-' THEN 'Alexandria'
    WHEN url ~* '/phoenix-' THEN 'Phoenix'
    WHEN url ~* '/tucson-' THEN 'Tucson'
    WHEN url ~* '/las-vegas-' THEN 'Las Vegas'
    WHEN url ~* '/loma-linda-' THEN 'Loma Linda'
    WHEN url ~* '/long-beach-' THEN 'Long Beach'
    ELSE NULL
  END;
  
  -- Return standardized facility name
  IF city_name IS NOT NULL THEN
    RETURN city_name || ' VA Medical Center';
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Show the current VISN distribution after standardization
SELECT 
  visn,
  COUNT(*) as facility_count
FROM va_facilities 
GROUP BY visn
ORDER BY 
  CASE 
    WHEN visn ~ '^[0-9]+$' THEN visn::integer 
    ELSE 999 
  END;

-- Step 6: Show sample of standardized facility names that can be extracted
SELECT 
  url,
  extract_standardized_facility_name(url) as facility_name,
  extract_standardized_visn(url) as visn,
  data_type
FROM web_sources 
WHERE data_type = 'facility_info'
ORDER BY extract_standardized_visn(url), extract_standardized_facility_name(url)
LIMIT 20; 