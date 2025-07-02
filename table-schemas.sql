-- Table Schemas - Column Names and Structure
-- This script shows the column names for the tables we need to link

-- ============================================================================
-- OIG_REPORT_ENTRIES TABLE SCHEMA
-- ============================================================================

SELECT '=== OIG_REPORT_ENTRIES TABLE COLUMNS ===' as section;

SELECT 
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_default IS NOT NULL THEN 'Has Default'
        ELSE 'No Default'
    END as has_default
FROM information_schema.columns 
WHERE table_name = 'oig_report_entries' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- VA_FACILITIES TABLE SCHEMA
-- ============================================================================

SELECT '=== VA_FACILITIES TABLE COLUMNS ===' as section;

SELECT 
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_default IS NOT NULL THEN 'Has Default'
        ELSE 'No Default'
    END as has_default
FROM information_schema.columns 
WHERE table_name = 'va_facilities' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- KEY COLUMNS FOR LINKING
-- ============================================================================

SELECT '=== KEY COLUMNS FOR LINKING ===' as section;

-- OIG Report columns that can be used for linking
SELECT 
    'OIG_REPORT_ENTRIES' as table_name,
    column_name,
    'Linking field' as purpose
FROM information_schema.columns 
WHERE table_name = 'oig_report_entries' 
  AND table_schema = 'public'
  AND column_name IN ('facility_id', 'facility_name', 'visn', 'state', 'city')
ORDER BY column_name;

-- VA Facility columns that can be used for linking
SELECT 
    'VA_FACILITIES' as table_name,
    column_name,
    'Linking field' as purpose
FROM information_schema.columns 
WHERE table_name = 'va_facilities' 
  AND table_schema = 'public'
  AND column_name IN ('id', 'name', 'visn', 'state', 'city')
ORDER BY column_name; 