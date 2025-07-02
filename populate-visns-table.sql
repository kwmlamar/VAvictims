-- Populate VISNs Table
-- This script creates all the VISN records needed for the scorecard page

-- Clear existing VISNs (optional - comment out if you want to keep existing data)
-- DELETE FROM visns;

-- Insert all VISNs (Veterans Integrated Service Networks)
INSERT INTO visns (id, name, region) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'VISN 1', 'Northeast'),
    ('22222222-2222-2222-2222-222222222222', 'VISN 2', 'Northeast'),
    ('33333333-3333-3333-3333-333333333333', 'VISN 3', 'Mid-Atlantic'),
    ('44444444-4444-4444-4444-444444444444', 'VISN 4', 'Mid-Atlantic'),
    ('55555555-5555-5555-5555-555555555555', 'VISN 5', 'Mid-Atlantic'),
    ('66666666-6666-6666-6666-666666666666', 'VISN 6', 'Southeast'),
    ('77777777-7777-7777-7777-777777777777', 'VISN 7', 'Southeast'),
    ('88888888-8888-8888-8888-888888888888', 'VISN 8', 'Southeast'),
    ('99999999-9999-9999-9999-999999999999', 'VISN 9', 'Southeast'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'VISN 10', 'Midwest'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'VISN 11', 'Midwest'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'VISN 12', 'Midwest'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'VISN 15', 'Central'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'VISN 16', 'South Central'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'VISN 17', 'South Central'),
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'VISN 18', 'Southwest'),
    ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'VISN 19', 'Northwest'),
    ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'VISN 20', 'Northwest'),
    ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'VISN 21', 'Pacific'),
    ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'VISN 22', 'Pacific'),
    ('llllllll-llll-llll-llll-llllllllllll', 'VISN 23', 'Midwest')
ON CONFLICT (id) DO NOTHING;

-- Show the results
SELECT '=== VISNS POPULATED ===' as info;

SELECT 
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