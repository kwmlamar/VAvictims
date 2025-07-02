-- Check all facilities in the database
SELECT 
  id,
  name,
  city,
  state,
  type,
  visn,
  created_at
FROM va_facilities 
ORDER BY created_at DESC;

-- Count facilities by type
SELECT 
  type,
  COUNT(*) as count
FROM va_facilities 
GROUP BY type
ORDER BY count DESC;

-- Count facilities by VISN
SELECT 
  visn,
  COUNT(*) as count
FROM va_facilities 
GROUP BY visn
ORDER BY count DESC;

-- Check for any remaining news site entries
SELECT 
  name,
  city,
  state,
  type,
  created_at
FROM va_facilities 
WHERE name LIKE '%News%' 
   OR name LIKE '%Breaking%'
   OR name LIKE '%Department%'
   OR name LIKE '%Times%'
   OR name LIKE '%Network%'
   OR name LIKE '%Sentinel%'
   OR name LIKE '%Justice%'
   OR name LIKE '%Email%'
   OR name LIKE '%Join%'
   OR name LIKE '%Serving%'
ORDER BY created_at DESC; 