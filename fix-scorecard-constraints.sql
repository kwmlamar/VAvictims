-- Fix Scorecard Constraints for Real Scoring System
-- This script adds the missing unique constraint needed for ON CONFLICT operations

-- Step 1: Add unique constraint to scorecards table
-- This allows the ON CONFLICT clause to work properly
ALTER TABLE scorecards 
ADD CONSTRAINT scorecards_entity_type_entity_id_unique 
UNIQUE (entity_type, entity_id);

-- Step 2: Verify the constraint was added
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'scorecards' 
  AND constraint_type = 'UNIQUE';

-- Step 3: Show current scorecard structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'scorecards'
ORDER BY ordinal_position; 