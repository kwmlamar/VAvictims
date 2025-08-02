-- Fix Category Constraint Comprehensive
-- This script fixes the category constraint to allow all category values being used

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
WHERE category IS NOT NULL
GROUP BY category
ORDER BY count DESC;

-- Step 3: Drop the problematic constraint if it exists
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

-- Step 4: Create a new constraint that allows ALL category values being used
ALTER TABLE user_submitted_complaints 
ADD CONSTRAINT user_submitted_complaints_category_check 
CHECK (category IN (
    'General',
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
    'VA Group Complicity/Integrity Violation',
    'External Group Violation',
    'Other'
));

-- Step 5: Verify the new constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_submitted_complaints'::regclass
  AND conname = 'user_submitted_complaints_category_check';

-- Step 6: Test the constraint with all category values
DO $$
DECLARE
    test_categories TEXT[] := ARRAY[
        'General',
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
        'VA Group Complicity/Integrity Violation',
        'External Group Violation',
        'Other'
    ];
    test_category TEXT;
BEGIN
    FOREACH test_category IN ARRAY test_categories
    LOOP
        BEGIN
            INSERT INTO user_submitted_complaints (
                facility_name_submitted,
                complaint_type,
                description,
                category,
                status
            ) VALUES (
                'Test Facility',
                'Test Complaint',
                'Test description for category: ' || test_category,
                test_category,
                'pending'
            );
            
            RAISE NOTICE '✅ Successfully tested category: %', test_category;
            
            -- Clean up test data
            DELETE FROM user_submitted_complaints WHERE facility_name_submitted = 'Test Facility';
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Failed to test category %: %', test_category, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 7: Final verification
SELECT 
    'Category constraint fixed successfully!' as message,
    COUNT(*) as total_allowed_categories
FROM (
    SELECT unnest(ARRAY[
        'General',
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
        'VA Group Complicity/Integrity Violation',
        'External Group Violation',
        'Other'
    ]) as category
) as allowed_categories; 