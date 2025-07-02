-- Fix the scraped_data table constraint to allow new data types
-- First, let's see what the current constraint allows
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'scraped_data'::regclass 
AND contype = 'c';

-- Drop the existing constraint
ALTER TABLE scraped_data DROP CONSTRAINT IF EXISTS scraped_data_data_type_check;

-- Add a new constraint that allows all the data types we need
ALTER TABLE scraped_data ADD CONSTRAINT scraped_data_data_type_check 
CHECK (data_type IN (
  'oig_report',
  'news_article', 
  'osc_complaint',
  'federal_survey',
  'facility_info',
  'visn_info',
  'facility_directory',
  'facility_news',
  'facility_performance',
  'community_care'
));

-- Verify the constraint was added
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'scraped_data'::regclass 
AND contype = 'c'; 