-- Check what tables exist in the database
-- This will help us find the correct table name for OIG reports

-- ============================================================================
-- LIST ALL TABLES
-- ============================================================================

SELECT '=== ALL TABLES IN DATABASE ===' as section;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- TABLES CONTAINING "OIG" OR "REPORT"
-- ============================================================================

SELECT '=== TABLES WITH OIG OR REPORT IN NAME ===' as section;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (table_name ILIKE '%oig%' OR table_name ILIKE '%report%')
ORDER BY table_name;

-- ============================================================================
-- TABLES CONTAINING "FACILITY" OR "VA"
-- ============================================================================

SELECT '=== TABLES WITH FACILITY OR VA IN NAME ===' as section;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (table_name ILIKE '%facility%' OR table_name ILIKE '%va%')
ORDER BY table_name;

-- ============================================================================
-- CHECK IF OIG_REPORT_ENTRIES EXISTS
-- ============================================================================

SELECT '=== CHECKING FOR OIG_REPORT_ENTRIES ===' as section;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'oig_report_entries'
        ) THEN 'EXISTS'
        ELSE 'DOES NOT EXIST'
    END as table_status,
    'oig_report_ENTRIES' as table_name;

-- ============================================================================
-- CHECK FOR SIMILAR TABLE NAMES
-- ============================================================================

SELECT '=== SIMILAR TABLE NAMES ===' as section;

SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name ILIKE '%oig%'
ORDER BY table_name; 