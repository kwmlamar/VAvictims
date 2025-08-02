-- Fix Category Constraint Issue for user_submitted_complaints
-- This script addresses the category constraint violation error

-- Step 1: Check current constraint definition
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

-- Step 4: Drop the problematic constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'user_submitted_complaints'::regclass
        AND conname = 'user_submitted_complaints_category_check'
    ) THEN
        ALTER TABLE user_submitted_complaints 
        DROP CONSTRAINT user_submitted_complaints_category_check;
        RAISE NOTICE 'Dropped user_submitted_complaints_category_check constraint';
    ELSE
        RAISE NOTICE 'user_submitted_complaints_category_check constraint does not exist';
    END IF;
END $$;

-- Step 5: Create a new constraint that allows common category values
ALTER TABLE user_submitted_complaints 
ADD CONSTRAINT user_submitted_complaints_category_check 
CHECK (category IN (
    'General Complaint',
    'Medical Malpractice',
    'Patient Safety',
    'Quality of Care',
    'Access to Care',
    'Facility Conditions',
    'Staff Issues',
    'Leadership Issues',
    'Fraud/Waste/Abuse',
    'Discrimination',
    'Retaliation',
    'Other'
));

-- Step 6: Verify the fix by checking the new constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_submitted_complaints'::regclass
  AND conname = 'user_submitted_complaints_category_check';

-- Step 7: Test the constraint with a valid category
-- This should work without error
INSERT INTO user_submitted_complaints (
    facility_name_submitted,
    complaint_type,
    description,
    category,
    status
) VALUES (
    'Test Facility',
    'Test Complaint',
    'Test description',
    'General Complaint',
    'pending'
) ON CONFLICT DO NOTHING;

-- Clean up test data
DELETE FROM user_submitted_complaints WHERE facility_name_submitted = 'Test Facility'; 