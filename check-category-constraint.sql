-- Check Category Constraint for user_submitted_complaints
-- This script identifies what category values are allowed

-- Step 1: Check the constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_submitted_complaints'::regclass
  AND conname = 'user_submitted_complaints_category_check';

-- Step 2: Check what category values currently exist
SELECT 
    category,
    COUNT(*) as count
FROM user_submitted_complaints
GROUP BY category
ORDER BY count DESC;

-- Step 3: Check the table definition for category
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_submitted_complaints'
  AND column_name = 'category';

-- Step 4: Show sample of existing complaints with categories
SELECT 
    category,
    complaint_type,
    facility_name_submitted,
    submitted_at
FROM user_submitted_complaints
WHERE category IS NOT NULL
ORDER BY submitted_at DESC
LIMIT 10;

-- Step 5: Try to find the constraint definition in a different way
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'user_submitted_complaints'
  AND tc.constraint_name = 'user_submitted_complaints_category_check'; 