-- Fix Status Constraint Issue for user_submitted_complaints
-- This script addresses the constraint violation error

-- Step 1: Check current constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_submitted_complaints'::regclass
  AND conname = 'user_submitted_complaints_status_check';

-- Step 2: Check what status values currently exist
SELECT 
    status,
    COUNT(*) as count
FROM user_submitted_complaints
GROUP BY status
ORDER BY count DESC;

-- Step 3: Drop the problematic constraint if it exists
DO $$
BEGIN
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
END $$;

-- Step 4: Create a new constraint that allows common status values
ALTER TABLE user_submitted_complaints 
ADD CONSTRAINT user_submitted_complaints_status_check 
CHECK (status IN ('pending', 'reviewed', 'investigating', 'resolved', 'closed', 'rejected'));

-- Step 5: Verify the fix by checking the new constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_submitted_complaints'::regclass
  AND conname = 'user_submitted_complaints_status_check';

-- Step 6: Test the constraint with a valid status
-- This should work without error
INSERT INTO user_submitted_complaints (
    facility_name_submitted,
    complaint_type,
    description,
    status
) VALUES (
    'Test Facility',
    'Test Complaint',
    'Test description',
    'pending'
) ON CONFLICT DO NOTHING;

-- Clean up test data
DELETE FROM user_submitted_complaints WHERE facility_name_submitted = 'Test Facility'; 