# Setting up the Search Function

To make the facility search work, you need to run the SQL function creation script in your Supabase database.

## Steps:

1. **Open your Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Search Function Script**
   - Copy the contents of `create-search-function.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

3. **Verify the Function**
   - The function `search_facilities` should now be available
   - You can test it by running:
   ```sql
   SELECT * FROM search_facilities('test');
   ```

## What the Function Does:

- **Search Term**: Searches across facility name, city, state, and VISN
- **Filters**: Supports filtering by facility name, VISN, state, type, and score range
- **Scoring**: Includes facility scores from the scorecards table
- **Ordering**: Results are ordered by relevance and then alphabetically

## Features Added to the Frontend:

- ✅ Debounced search (500ms delay)
- ✅ Clear search button
- ✅ Real-time search as you type
- ✅ Better loading states
- ✅ Improved empty states
- ✅ Search term display in results header

The search should now work properly! Try searching for facilities by name, location, or VISN. 