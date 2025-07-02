-- Fix VISN formatting inconsistency
-- This script standardizes all VISN values to just the number format

-- Step 1: Check current VISN distribution
SELECT 
  visn,
  COUNT(*) as facility_count
FROM va_facilities 
GROUP BY visn
ORDER BY visn;

-- Step 2: Update va_facilities table to standardize VISN formatting
UPDATE va_facilities 
SET visn = CASE 
  WHEN visn = 'VISN 1' THEN '1'
  WHEN visn = 'VISN 2' THEN '2'
  WHEN visn = 'VISN 3' THEN '3'
  WHEN visn = 'VISN 4' THEN '4'
  WHEN visn = 'VISN 5' THEN '5'
  WHEN visn = 'VISN 6' THEN '6'
  WHEN visn = 'VISN 7' THEN '7'
  WHEN visn = 'VISN 8' THEN '8'
  WHEN visn = 'VISN 9' THEN '9'
  WHEN visn = 'VISN 10' THEN '10'
  WHEN visn = 'VISN 11' THEN '11'
  WHEN visn = 'VISN 12' THEN '12'
  WHEN visn = 'VISN 13' THEN '13'
  WHEN visn = 'VISN 14' THEN '14'
  WHEN visn = 'VISN 15' THEN '15'
  WHEN visn = 'VISN 16' THEN '16'
  WHEN visn = 'VISN 17' THEN '17'
  WHEN visn = 'VISN 18' THEN '18'
  WHEN visn = 'VISN 19' THEN '19'
  WHEN visn = 'VISN 20' THEN '20'
  WHEN visn = 'VISN 21' THEN '21'
  WHEN visn = 'VISN 22' THEN '22'
  WHEN visn = 'VISN 23' THEN '23'
  ELSE visn
END
WHERE visn LIKE 'VISN %';

-- Step 3: Update scraped_data table to standardize VISN formatting
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

-- Step 4: Show the updated VISN distribution
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

-- Step 5: Show sample of facilities with standardized VISN formatting
SELECT 
  name,
  city,
  state,
  visn,
  type,
  created_at
FROM va_facilities 
ORDER BY 
  CASE 
    WHEN visn ~ '^[0-9]+$' THEN visn::integer 
    ELSE 999 
  END,
  name
LIMIT 20; 