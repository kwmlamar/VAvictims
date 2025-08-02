-- Check Current Category Constraint
-- This script shows what category values are currently allowed

-- Step 1: Check the current constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_submitted_complaints'::regclass
  AND conname = 'user_submitted_complaints_category_check';

-- Step 2: Check what category values currently exist in the database
SELECT 
    category,
    COUNT(*) as count
FROM user_submitted_complaints
WHERE category IS NOT NULL
GROUP BY category
ORDER BY count DESC;

-- Step 3: Show sample of recent submissions with categories
SELECT 
    category,
    complaint_type,
    facility_name_submitted,
    submitted_at
FROM user_submitted_complaints
WHERE category IS NOT NULL
ORDER BY submitted_at DESC
LIMIT 10; 