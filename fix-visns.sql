-- Fix duplicate VISN records
-- Remove duplicates and keep only one record per VISN

-- Show current duplicates
SELECT '=== CURRENT DUPLICATES ===' as info;
SELECT 
    name,
    COUNT(*) as count
FROM visns 
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY name;

-- Create a temporary table with unique VISNs
CREATE TEMP TABLE unique_visns AS
SELECT DISTINCT ON (name) id, name, region, created_at
FROM visns 
ORDER BY name, created_at;

-- Delete all records from visns
DELETE FROM visns;

-- Insert back only the unique records
INSERT INTO visns (id, name, region, created_at)
SELECT id, name, region, created_at FROM unique_visns;

-- Show final results
SELECT '=== CLEANED VISN RECORDS ===' as info;
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