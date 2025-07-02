# Real Scoring System Implementation Guide

## Overview
This guide will help you implement a real scoring system that calculates facility, VISN, and national scores based on actual data from complaints, OIG reports, and scraped content.

## What This Does
- **Facility Scores**: Calculated from complaints, OIG reports, and repeat violations
- **VISN Scores**: Weighted average of facility scores within each VISN
- **National Score**: Weighted average of VISN scores with focus on worst performers

## Execution Steps

### Step 1: Add Sample Data (Optional)
If you want to test with realistic data, run this first:
```sql
-- Run in Supabase SQL Editor
-- This adds sample complaints, OIG reports, and facilities
```

**File**: `add-sample-data-for-scoring.sql`

### Step 2: Calculate Real Scores
Run the main scoring calculation:
```sql
-- Run in Supabase SQL Editor
-- This creates scoring functions and calculates all scores
```

**File**: `calculate-real-scores.sql`

## Scoring Formula

### Facility Score
- **Base Score**: 100 points
- **Complaint Penalty**: -2 points per complaint (max -40)
- **OIG Report Penalty**: -15 points per report (max -45)
- **Repeat Violation Penalty**: -10 points per repeat violation (max -30)
- **Final Score**: Base - Penalties (minimum 0)

### VISN Score
- **Formula**: (Average of lowest 50% facilities + lowest facility score) ÷ 2
- **Purpose**: Heavily weights worst-performing facilities

### National Score
- **Formula**: (Average of lowest 50% VISNs + lowest VISN score) ÷ 2
- **Purpose**: Prevents high scores from masking systemic failures

## Expected Results

After running the scripts, you should see:

### Facility Scores
- Range: 0-100
- Lower scores indicate more issues
- Based on actual complaints and OIG reports

### VISN Scores
- Range: 0-100
- Weighted toward worst facilities
- Shows regional performance patterns

### National Score
- Range: 0-100
- Overall VA system performance
- Reflects systemic issues across all VISNs

## Verification

After running the scripts, check:

1. **Dashboard**: National score should now show real calculated value
2. **Scorecards Page**: All tabs should display calculated scores
3. **Data Analysis**: Trends should reflect actual data

## Database Changes

The scripts will:
- Create scoring functions in your database
- Update/insert scorecard records
- Maintain scoring formulas and criteria
- Provide detailed breakdowns of score components

## Troubleshooting

### If Scores Show 0
- Check if you have complaints or OIG reports in the database
- Verify facilities are properly linked to complaints/reports
- Run the sample data script first for testing

### If Functions Fail
- Ensure you have proper database permissions
- Check that all required tables exist
- Verify UUID formats are correct

## Next Steps

After implementing real scores:

1. **Monitor Performance**: Watch how scores change as new data is added
2. **Refine Formulas**: Adjust penalty weights based on your priorities
3. **Add More Data Sources**: Include additional factors like wait times, patient satisfaction
4. **Automate Updates**: Set up scheduled score recalculations

## Files Created

1. `calculate-real-scores.sql` - Main scoring implementation
2. `add-sample-data-for-scoring.sql` - Sample data for testing
3. `SCORING_EXECUTION_GUIDE.md` - This guide

## Support

If you encounter issues:
1. Check the SQL error messages in Supabase
2. Verify table structures match the expected schema
3. Ensure all required data exists before calculating scores 