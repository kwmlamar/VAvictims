-- Populate VISNs Table (Auto-Generated UUIDs)
-- This script creates all the VISN records needed for the scorecard page

-- Clear existing VISNs (optional - comment out if you want to keep existing data)
-- DELETE FROM visns;

-- Insert all VISNs (Veterans Integrated Service Networks) with auto-generated UUIDs
INSERT INTO visns (name, region) VALUES 
    ('VISN 1', 'Northeast'),
    ('VISN 2', 'Northeast'),
    ('VISN 3', 'Mid-Atlantic'),
    ('VISN 4', 'Mid-Atlantic'),
    ('VISN 5', 'Mid-Atlantic'),
    ('VISN 6', 'Southeast'),
    ('VISN 7', 'Southeast'),
    ('VISN 8', 'Southeast'),
    ('VISN 9', 'Southeast'),
    ('VISN 10', 'Midwest'),
    ('VISN 11', 'Midwest'),
    ('VISN 12', 'Midwest'),
    ('VISN 15', 'Central'),
    ('VISN 16', 'South Central'),
    ('VISN 17', 'South Central'),
    ('VISN 18', 'Southwest'),
    ('VISN 19', 'Northwest'),
    ('VISN 20', 'Northwest'),
    ('VISN 21', 'Pacific'),
    ('VISN 22', 'Pacific'),
    ('VISN 23', 'Midwest');

-- Show the results
SELECT '=== VISNS POPULATED ===' as info;

SELECT 
    id,
    name,
    region,
    created_at
FROM visns 
ORDER BY name;

-- Show count
SELECT 
    'Total VISNs' as metric,
    COUNT(*) as count
FROM visns;

-- Show VISN distribution by region
SELECT 
    region,
    COUNT(*) as visn_count
FROM visns 
GROUP BY region
ORDER BY region; 