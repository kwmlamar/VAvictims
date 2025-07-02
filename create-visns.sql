-- Create VISNs Table Data
-- Populate VISNs table according to the schema:
-- id: uuid (auto-generated with uuid_generate_v4())
-- name: text (NOT NULL)
-- region: text (NOT NULL)
-- created_at: timestamp with time zone (auto-generated with CURRENT_TIMESTAMP)

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

-- Show results
SELECT 'VISNs created successfully!' as status;
SELECT COUNT(*) as total_visns FROM visns;

-- Show the created VISNs
SELECT 
    id,
    name,
    region,
    created_at
FROM visns 
ORDER BY name; 