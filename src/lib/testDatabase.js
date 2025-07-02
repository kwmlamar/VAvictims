import { supabase } from './supabaseClient';
import { seedDatabase } from './seedDatabase';
import { checkDatabaseTables } from './databaseUtils';

// Test database connection and basic operations
export const testDatabaseConnection = async () => {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('visns')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Test if we have any data
    const { count: visnCount } = await supabase
      .from('visns')
      .select('*', { count: 'exact', head: true });
    
    const { count: facilityCount } = await supabase
      .from('va_facilities')
      .select('*', { count: 'exact', head: true });
    
    const { count: scorecardCount } = await supabase
      .from('scorecards')
      .select('*', { count: 'exact', head: true });
    
    const { count: complaintsCount } = await supabase
      .from('user_submitted_complaints')
      .select('*', { count: 'exact', head: true });
    
    const { count: analyticsCount } = await supabase
      .from('analytics')
      .select('*', { count: 'exact', head: true });
    
    const { count: repsCount } = await supabase
      .from('congressional_representatives')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Current data counts:');
    console.log(`  - VISNs: ${visnCount || 0}`);
    console.log(`  - Facilities: ${facilityCount || 0}`);
    console.log(`  - Scorecards: ${scorecardCount || 0}`);
    console.log(`  - Complaints: ${complaintsCount || 0}`);
    console.log(`  - Analytics: ${analyticsCount || 0}`);
    console.log(`  - Representatives: ${repsCount || 0}`);
    
    // If no data, offer to seed
    if ((visnCount || 0) === 0 && (facilityCount || 0) === 0) {
      console.log('🌱 No data found. Would you like to seed the database?');
      console.log('   Run: await seedDatabase() in the browser console');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
};

// Test individual table access
export const testTableAccess = async () => {
  console.log('🔍 Testing individual table access...');
  
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
      console.log(`📋 Testing ${table}...`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ ${table} error:`, error);
      } else {
        console.log(`✅ ${table} accessible`);
      }
    } catch (error) {
      console.error(`❌ ${table} failed:`, error);
    }
  }
};

// Quick test function that can be called from browser console
export const quickTest = async () => {
  console.log('🚀 Starting quick database test...');
  
  const connectionOk = await testDatabaseConnection();
  
  if (connectionOk) {
    console.log('🎉 Database is ready!');
    console.log('💡 You can now:');
    console.log('   - View the dashboard to see real data');
    console.log('   - Use the "Seed Database" button to add sample data');
    console.log('   - Test the search filters and other features');
  } else {
    console.log('⚠️  Database issues detected. Check the console for details.');
  }
};

// Comprehensive test including table access
export const comprehensiveTest = async () => {
  console.log('🔬 Starting comprehensive database test...');
  
  await checkDatabaseTables();
  await testDatabaseConnection();
  await testTableAccess();
  
  console.log('✅ Comprehensive test completed!');
};

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  window.testDatabase = quickTest;
  window.testTableAccess = testTableAccess;
  window.comprehensiveTest = comprehensiveTest;
  window.seedDatabase = seedDatabase;
} 