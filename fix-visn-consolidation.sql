-- Fix VISN Consolidation - Move all facilities to VISN 7
-- This script consolidates all facilities into VISN 7 and removes extra VISNs

-- Step 1: Ensure VISN 7 exists
INSERT INTO visns (id, name, region) VALUES 
    ('77777777-7777-7777-7777-777777777777', 'VISN 7', 'Southeast')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Update all facilities to be in VISN 7
UPDATE va_facilities 
SET 
    visn = 'VISN 7',
    visn_id = '77777777-7777-7777-7777-777777777777'
WHERE visn != 'VISN 7' OR visn_id != '77777777-7777-7777-7777-777777777777';

-- Step 3: Update any facilities that don't have a VISN assigned
UPDATE va_facilities 
SET 
    visn = 'VISN 7',
    visn_id = '77777777-7777-7777-7777-777777777777'
WHERE visn IS NULL OR visn_id IS NULL;

-- Step 4: Delete all VISNs except VISN 7
DELETE FROM visns 
WHERE id != '77777777-7777-7777-7777-777777777777';

-- Step 5: Show the results
SELECT '=== VISN CONSOLIDATION RESULTS ===' as info;

SELECT 'VISNs after consolidation:' as metric, COUNT(*) as count FROM visns
UNION ALL
SELECT 'Facilities in VISN 7:' as metric, COUNT(*) as count FROM va_facilities WHERE visn = 'VISN 7'
UNION ALL
SELECT 'Facilities without VISN:' as metric, COUNT(*) as count FROM va_facilities WHERE visn IS NULL OR visn != 'VISN 7';

-- Step 6: Show sample facilities in VISN 7
SELECT '=== SAMPLE FACILITIES IN VISN 7 ===' as info;

SELECT 
    name,
    city,
    state,
    type,
    visn,
    visn_id IS NOT NULL as has_visn_id
FROM va_facilities 
WHERE visn = 'VISN 7'
ORDER BY name
LIMIT 10;

-- Step 7: Verify VISN 7 details
SELECT '=== VISN 7 DETAILS ===' as info;

SELECT 
    v.id,
    v.name,
    v.region,
    COUNT(f.id) as facility_count
FROM visns v
LEFT JOIN va_facilities f ON v.id = f.visn_id
GROUP BY v.id, v.name, v.region; 