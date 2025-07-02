-- Remove news site entries that were incorrectly processed as facilities
DELETE FROM va_facilities 
WHERE name IN (
  'Welcome to VA News',
  'Latest news, sport and opinion from the Guardian',
  'U.S. Department of Veterans Affairs',
  'Associated Press News: Breaking News, Latest Headlines and Videos',
  'The New Yorker',
  'Military Times - Independent News About Your Military',
  'Federal News Network',
  'NBC News - Breaking News & Top Stories - Latest World, US & Local News',
  'Mass layoffs likely to remain blocked, for now, thanks to a Supreme Court footnote',
  'Join My Email List',
  'Milwaukee Journal Sentinel - Milwaukee and Wisconsin breaking news and investigations',
  'Serving Our Nation\'s Veterans.',
  'Department of Justice',
  'WPTV: Breaking News, Weather & Local Stories'
);

-- Also remove entries with generic names
DELETE FROM va_facilities 
WHERE name LIKE '%News%' 
   OR name LIKE '%Breaking%'
   OR name LIKE '%Department%'
   OR name LIKE '%Times%'
   OR name LIKE '%Network%'
   OR name LIKE '%Sentinel%'
   OR name LIKE '%Justice%'
   OR name LIKE '%Email%'
   OR name LIKE '%Join%'
   OR name LIKE '%Serving%';

-- Show the remaining real facilities
SELECT 
  name,
  visn,
  city,
  state,
  type,
  created_at
FROM va_facilities 
ORDER BY created_at DESC
LIMIT 20; 