# VA Accountability Platform - Database Cleanup & Improvement Plan

## Overview
This document outlines a three-step process to clean up the current database and improve the scraping results for the VA Accountability Platform.

## Current Issues Identified
1. **Inconsistent VISN Formatting**: Mix of "7" and "VISN 7" in the database
2. **Limited Facility Coverage**: Only 4 VISNs represented out of 18 total
3. **Poor Data Quality**: Many invalid entries from generic news/government sites
4. **Ineffective Web Sources**: URLs pointing to generic pages without facility-specific data

## Step 1: Clean Up Current Data
**File**: `cleanup-all-data.sql`

### What This Does:
- Deletes all scraped data (raw HTML content)
- Removes invalid facilities created from scraping
- Resets web_sources timestamps for fresh scraping
- Cleans up related data (scorecards, complaints, OIG reports)
- Preserves manually added facilities

### Expected Results:
- `scraped_data`: 0 rows
- `va_facilities`: Only manually added facilities remain
- All related tables cleaned of orphaned data

### To Execute:
```sql
-- Run in Supabase SQL Editor
-- This will show cleanup results and remaining facilities
```

## Step 2: Improve Web Sources
**File**: `improve-web-sources.sql`

### What This Does:
- Removes generic URLs (news sites, government pages)
- Adds 80+ actual VA facility URLs across 6 VISNs
- Includes both main facility pages and location pages
- Covers VISNs 6, 7, 8, 9, 10, 16, and 18

### New URL Coverage:
- **VISN 6**: Richmond, Hampton, Salem
- **VISN 7**: Augusta, Atlanta, Birmingham, Charleston, Columbia, Dublin, Tuskegee
- **VISN 8**: Bay Pines, Miami, Orlando, Tampa, West Palm Beach
- **VISN 9**: Nashville, Memphis, Huntington, Lexington, Louisville
- **VISN 10**: Cincinnati, Cleveland, Columbus, Dayton, Chillicothe
- **VISN 16**: Houston, New Orleans, Shreveport, Alexandria
- **VISN 18**: Phoenix, Tucson, Las Vegas, Loma Linda, Long Beach

### Expected Results:
- `web_sources`: ~80 facility-specific URLs
- All URLs point to actual VA facility pages
- Better data extraction potential

### To Execute:
```sql
-- Run in Supabase SQL Editor
-- This will show the updated URL list and counts
```

## Step 3: Standardize VISN Formatting
**File**: `standardize-visn-format.sql`

### What This Does:
- Updates existing facilities to use "7" instead of "VISN 7"
- Creates database functions for standardized extraction
- Maps URL patterns to VISN numbers and facility names
- Provides consistent formatting for future scraping

### Database Functions Created:
- `extract_standardized_visn(url)`: Extracts VISN number from URL
- `extract_standardized_facility_name(url)`: Extracts facility name from URL

### Expected Results:
- Consistent VISN formatting (numbers only)
- Better facility name extraction
- Improved data quality

### To Execute:
```sql
-- Run in Supabase SQL Editor
-- This will show standardized VISN distribution
```

## Recommended Execution Order

### Phase 1: Cleanup (Run First)
1. Execute `cleanup-all-data.sql`
2. Verify cleanup results
3. Confirm only manually added facilities remain

### Phase 2: Improve Sources (Run Second)
1. Execute `improve-web-sources.sql`
2. Verify new URL list
3. Confirm all URLs are facility-specific

### Phase 3: Standardize (Run Third)
1. Execute `standardize-visn-format.sql`
2. Verify VISN formatting
3. Test extraction functions

## Post-Cleanup Actions

### 1. Run the Scraper
After completing all three steps:
1. Go to Developer Portal → Web Scraper Control
2. Click "Run Scraper Manually"
3. Monitor the logs for successful scraping

### 2. Run the Processor
After scraping completes:
1. Go to Developer Portal → Data Processor Control
2. Click "Run Processor"
3. Monitor for facility extraction results

### 3. Verify Results
Check the following:
- Facility count should be much higher
- VISN formatting should be consistent (numbers only)
- Facility names should be properly extracted
- No more generic news site entries

## Expected Improvements

### Before Cleanup:
- ~19 facilities (mostly invalid)
- Inconsistent VISN formatting
- Limited VISN coverage (4 out of 18)
- Poor data quality

### After Cleanup:
- 80+ potential facilities across 7 VISNs
- Consistent VISN formatting (numbers only)
- Better facility name extraction
- Higher quality data

## Monitoring & Validation

### Key Metrics to Track:
1. **Facility Count**: Should increase significantly
2. **VISN Coverage**: Should expand to 7+ VISNs
3. **Data Quality**: No more generic site entries
4. **Formatting Consistency**: All VISNs as numbers

### Validation Queries:
```sql
-- Check facility count by VISN
SELECT visn, COUNT(*) as count 
FROM va_facilities 
GROUP BY visn 
ORDER BY visn::integer;

-- Check for any remaining invalid entries
SELECT name, city, state, visn 
FROM va_facilities 
WHERE name LIKE '%News%' OR name LIKE '%Department%';
```

## Rollback Plan
If issues occur:
1. **Database Backup**: Ensure you have a recent backup
2. **Manual Facility Recovery**: Re-add any manually created facilities
3. **Gradual Rollback**: Execute cleanup steps in reverse order

## Notes
- This process will remove ALL scraped data and invalid facilities
- Only manually added facilities will be preserved
- The new URL list focuses on actual VA facility pages
- Standardized formatting will improve future scraping results
- Monitor the scraper logs for any 404 errors or extraction issues 