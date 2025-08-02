-- Fix All Constraints for user_submitted_complaints
-- This script addresses both status and category constraint violations

-- Step 1: Check all current constraints
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_submitted_complaints'::regclass
  AND conname IN ('user_submitted_complaints_status_check', 'user_submitted_complaints_category_check');

-- Step 2: Check what values currently exist
SELECT 
    'Status Values' as type,
    status as value,
    COUNT(*) as count
FROM user_submitted_complaints
WHERE status IS NOT NULL
GROUP BY status
UNION ALL
SELECT 
    'Category Values' as type,
    category as value,
    COUNT(*) as count
FROM user_submitted_complaints
WHERE category IS NOT NULL
GROUP BY category
ORDER BY type, count DESC;

-- Step 3: Drop problematic constraints
DO $$
BEGIN
    -- Drop status constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'user_submitted_complaints'::regclass
        AND conname = 'user_submitted_complaints_status_check'
    ) THEN
        ALTER TABLE user_submitted_complaints 
        DROP CONSTRAINT user_submitted_complaints_status_check;
        RAISE NOTICE 'Dropped user_submitted_complaints_status_check constraint';
    ELSE
        RAISE NOTICE 'user_submitted_complaints_status_check constraint does not exist';
    END IF;
    
    -- Drop category constraint if it exists
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

-- Step 4: Create new status constraint
ALTER TABLE user_submitted_complaints 
ADD CONSTRAINT user_submitted_complaints_status_check 
CHECK (status IN ('pending', 'reviewed', 'investigating', 'resolved', 'closed', 'rejected'));

-- Step 5: Create new category constraint
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

-- Step 6: Verify the new constraints
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_submitted_complaints'::regclass
  AND conname IN ('user_submitted_complaints_status_check', 'user_submitted_complaints_category_check');

-- Step 7: Test both constraints with valid data
INSERT INTO user_submitted_complaints (
    facility_name_submitted,
    complaint_type,
    description,
    category,
    status
) VALUES (
    'Test Facility',
    'Test Complaint',
    'Test description for constraint validation',
    'General Complaint',
    'pending'
) ON CONFLICT DO NOTHING;

-- Step 8: Verify the test insert worked
SELECT 
    facility_name_submitted,
    complaint_type,
    category,
    status
FROM user_submitted_complaints 
WHERE facility_name_submitted = 'Test Facility';

-- Clean up test data
DELETE FROM user_submitted_complaints WHERE facility_name_submitted = 'Test Facility';

-- Step 9: Final verification
SELECT 
    'Constraints fixed successfully!' as message,
    COUNT(*) as total_constraints
FROM pg_constraint 
WHERE conrelid = 'user_submitted_complaints'::regclass
  AND conname IN ('user_submitted_complaints_status_check', 'user_submitted_complaints_category_check'); 