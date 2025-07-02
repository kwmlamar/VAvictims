import { supabase } from './supabaseClient';
import { seedDatabase } from './seedDatabase';
import { checkDatabaseTables } from './databaseUtils';

// Test database connection and basic operations
export const testDatabaseConnection = async () => {
  // Test basic connection
  const { error } = await supabase
    .from('visns')
    .select('count')
    .limit(1);
  
  if (error) {
    return false;
  }
  
  // Test if we have any data
  const { count: visnCount } = await supabase
    .from('visns')
    .select('*', { count: 'exact', head: true });
  
  const { count: facilityCount } = await supabase
    .from('va_facilities')
    .select('*', { count: 'exact', head: true });
  
  // If no data, offer to seed
  if ((visnCount || 0) === 0 && (facilityCount || 0) === 0) {
    return false;
  }
  
  return true;
};

// Test individual table access
export const testTableAccess = async () => {
  const tables = [
    'visns',
    'va_facilities', 
    'scorecards',
    'user_submitted_complaints',
    'analytics',
    'congressional_representatives',
    'oig_report_entries'
  ];
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
  
  return true;
};

// Quick test function that can be called from browser console
export const quickTest = async () => {
  const connectionOk = await testDatabaseConnection();
  
  if (connectionOk) {
    return true;
  }
  
  return false;
};

// Comprehensive test including table access
export const comprehensiveTest = async () => {
  await checkDatabaseTables();
  await testDatabaseConnection();
  await testTableAccess();
  
  return true;
};

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  window.testDatabase = quickTest;
  window.testTableAccess = testTableAccess;
  window.comprehensiveTest = comprehensiveTest;
  window.seedDatabase = seedDatabase;
} 