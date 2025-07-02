-- Clean up duplicate VISN records
-- This script removes duplicates and keeps only one record per VISN

-- First, let's see what we have
SELECT '=== CURRENT VISN RECORDS ===' as info;
SELECT 
    name,
    COUNT(*) as count
FROM visns 
GROUP BY name
ORDER BY name;

-- Remove duplicates, keeping only the first record for each VISN
DELETE FROM visns 
WHERE id NOT IN (
    SELECT DISTINCT ON (name) id
    FROM visns 
    ORDER BY name, created_at
);

-- Show the cleaned up results
SELECT '=== CLEANED UP VISN RECORDS ===' as info;
SELECT 
    id,
    name,
    region,
    created_at
FROM visns 
ORDER BY name;

-- Show final count
SELECT 
    'Total unique VISNs' as metric,
    COUNT(*) as count
FROM visns;

-- Show VISN distribution by region
SELECT 
    region,
    COUNT(*) as visn_count
FROM visns 
GROUP BY region
ORDER BY region; 