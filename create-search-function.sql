-- Create the search_facilities function for the facility search page
-- This function will handle searching facilities with various filters

CREATE OR REPLACE FUNCTION search_facilities(
    search_term TEXT DEFAULT '',
    facility_name_filter TEXT DEFAULT '',
    visn_filter TEXT DEFAULT '',
    state_filter TEXT DEFAULT '',
    type_filter TEXT DEFAULT '',
    min_score NUMERIC DEFAULT 0,
    max_score NUMERIC DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    visn TEXT,
    city TEXT,
    state TEXT,
    type TEXT,
    director_name TEXT,
    full_address TEXT,
    address TEXT,
    zip_code TEXT,
    region TEXT,
    senator TEXT,
    congressman TEXT,
    score NUMERIC,
    issues TEXT[],
    last_updated TIMESTAMP WITH TIME ZONE,
    representatives JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vf.id,
        vf.name,
        vf.visn,
        vf.city,
        vf.state,
        vf.type,
        vf.director_name,
        vf.full_address,
        vf.address,
        vf.zip_code,
        vf.region,
        vf.senator,
        vf.congressman,
        COALESCE(sc.score, 0) as score,
        ARRAY[]::TEXT[] as issues, -- Placeholder for issues
        vf.updated_at as last_updated,
        vf.congressional_representatives_data as representatives
    FROM va_facilities vf
    LEFT JOIN scorecards sc ON sc.entity_id = vf.id AND sc.entity_type = 'facility'
    WHERE 
        -- Search term filter (searches across name, city, state, visn)
        (
            search_term = '' OR
            vf.name ILIKE '%' || search_term || '%' OR
            vf.city ILIKE '%' || search_term || '%' OR
            vf.state ILIKE '%' || search_term || '%' OR
            vf.visn ILIKE '%' || search_term || '%'
        )
        AND
        -- Facility name filter
        (
            facility_name_filter = '' OR
            vf.name ILIKE '%' || facility_name_filter || '%'
        )
        AND
        -- VISN filter
        (
            visn_filter = '' OR
            vf.visn = visn_filter
        )
        AND
        -- State filter
        (
            state_filter = '' OR
            vf.state = state_filter
        )
        AND
        -- Type filter
        (
            type_filter = '' OR
            vf.type = type_filter
        )
        AND
        -- Score range filter
        COALESCE(sc.score, 0) BETWEEN min_score AND max_score
    ORDER BY 
        CASE 
            WHEN search_term != '' THEN 
                CASE 
                    WHEN vf.name ILIKE search_term THEN 1
                    WHEN vf.name ILIKE '%' || search_term || '%' THEN 2
                    WHEN vf.city ILIKE '%' || search_term || '%' THEN 3
                    WHEN vf.state ILIKE '%' || search_term || '%' THEN 4
                    ELSE 5
                END
            ELSE 1
        END,
        vf.name;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_facilities TO authenticated;
GRANT EXECUTE ON FUNCTION search_facilities TO anon; 