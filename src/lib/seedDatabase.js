import { supabase } from './supabaseClient';

// Sample data for seeding the database
const sampleData = {
  // Sample VISNs
  visns: [
    { id: '11111111-1111-1111-1111-111111111111', name: 'VISN 1', region: 'Northeast' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'VISN 2', region: 'Northeast' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'VISN 3', region: 'Mid-Atlantic' },
    { id: '44444444-4444-4444-4444-444444444444', name: 'VISN 4', region: 'Mid-Atlantic' },
    { id: '55555555-5555-5555-5555-555555555555', name: 'VISN 5', region: 'Mid-Atlantic' }
  ],

  // Sample VA Facilities
  facilities: [
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      name: 'Phoenix VA Medical Center',
      visn_id: '11111111-1111-1111-1111-111111111111',
      visn: 'VISN 1',
      city: 'Phoenix',
      state: 'AZ',
      type: 'Medical Center',
      director_name: 'Dr. John Smith',
      full_address: '650 E Indian School Rd, Phoenix, AZ 85012'
    },
    {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      name: 'Seattle VA Medical Center',
      visn_id: '22222222-2222-2222-2222-222222222222',
      visn: 'VISN 2',
      city: 'Seattle',
      state: 'WA',
      type: 'Medical Center',
      director_name: 'Dr. Sarah Johnson',
      full_address: '1660 S Columbian Way, Seattle, WA 98108'
    },
    {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      name: 'Los Angeles VA Medical Center',
      visn_id: '33333333-3333-3333-3333-333333333333',
      visn: 'VISN 3',
      city: 'Los Angeles',
      state: 'CA',
      type: 'Medical Center',
      director_name: 'Dr. Michael Brown',
      full_address: '11301 Wilshire Blvd, Los Angeles, CA 90073'
    }
  ],

  // Sample Scorecards
  scorecards: [
    {
      id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      entity_type: 'national',
      entity_id: '00000000-0000-0000-0000-000000000000',
      score: 42.3,
      data_summary: {
        integrity_score: 35.5,
        total_facilities: 1255,
        critical_facilities: 89,
        warning_facilities: 234
      },
      criteria: {
        performance_weight: 0.6,
        integrity_weight: 0.4
      }
    },
    {
      id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      entity_type: 'facility',
      entity_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      score: 18.0,
      data_summary: {
        integrity_score: 15.2,
        complaints_count: 47,
        oig_reports_count: 3
      }
    },
    {
      id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      entity_type: 'facility',
      entity_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      score: 67.0,
      data_summary: {
        integrity_score: 72.1,
        complaints_count: 12,
        oig_reports_count: 0
      }
    },
    {
      id: 'gggggggg-gggg-gggg-gggg-gggggggggggg',
      entity_type: 'facility',
      entity_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      score: 45.0,
      data_summary: {
        integrity_score: 38.7,
        complaints_count: 28,
        oig_reports_count: 1
      }
    }
  ],

  // Sample Analytics
  analytics: [
    {
      id: 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
      data_type: 'national_trends',
      trends: {
        score: -5.2,
        integrity_score: -8.1,
        complaints: 12.4,
        resolution: -8.1
      }
    }
  ],

  // Sample Congressional Representatives
  congressional_representatives: [
    {
      id: 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
      representative_name: 'House Veterans Affairs Committee',
      office_title: 'House Veterans Affairs Committee',
      party: 'Bipartisan',
      state: 'DC',
      district: 'N/A',
      contact_url: 'https://veterans.house.gov/',
      email: 'veterans@house.gov',
      phone: '(202) 225-3527'
    },
    {
      id: 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj',
      representative_name: 'Senate Veterans Affairs Committee',
      office_title: 'Senate Veterans Affairs Committee',
      party: 'Bipartisan',
      state: 'DC',
      district: 'N/A',
      contact_url: 'https://www.veterans.senate.gov/',
      email: 'veterans@senate.gov',
      phone: '(202) 224-9126'
    }
  ],

  // Sample User Submitted Complaints
  user_submitted_complaints: [
    {
      id: 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk',
      facility_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      facility_name_submitted: 'Phoenix VA Medical Center',
      complaint_type: 'patient_safety',
      description: 'Patient was left unattended for 6 hours in emergency room',
      status: 'pending',
      submitted_at: new Date().toISOString(),
      contact_email: 'veteran@example.com',
      is_anonymous: false
    },
    {
      id: 'llllllll-llll-llll-llll-llllllllllll',
      facility_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      facility_name_submitted: 'Seattle VA Medical Center',
      complaint_type: 'wait_times',
      description: 'Appointment scheduled 3 months in advance',
      status: 'resolved',
      submitted_at: new Date(Date.now() - 86400000).toISOString(),
      contact_email: 'veteran2@example.com',
      is_anonymous: true
    }
  ],

  // Sample OIG Report Entries
  oig_report_entries: [
    {
      id: 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm',
      facility_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      facility_name: 'Phoenix VA Medical Center',
      report_number: 'VA-2023-0117',
      report_date: '2023-06-15',
      visn: 'VISN 1',
      state: 'AZ',
      city: 'Phoenix',
      summary_of_violations: 'Multiple patient safety violations including failure to provide timely care',
      violations_details: 'Investigation found 47 instances of delayed care resulting in patient harm',
      report_url: 'https://www.va.gov/oig/pubs/VAOIG-23-0117-0001.pdf'
    }
  ]
};

// Function to seed the database
export const seedDatabase = async () => {
  try {
    // Insert VISNs
    const { error: visnsError } = await supabase
      .from('visns')
      .upsert(sampleData.visns);
    if (visnsError) return { success: false, error: visnsError };

    // Insert Facilities
    const { error: facilitiesError } = await supabase
      .from('va_facilities')
      .upsert(sampleData.facilities);
    if (facilitiesError) return { success: false, error: facilitiesError };

    // Insert Scorecards
    const { error: scorecardsError } = await supabase
      .from('scorecards')
      .upsert(sampleData.scorecards);
    if (scorecardsError) return { success: false, error: scorecardsError };

    // Insert Analytics
    const { error: analyticsError } = await supabase
      .from('analytics')
      .upsert(sampleData.analytics);
    if (analyticsError) return { success: false, error: analyticsError };

    // Insert Congressional Representatives
    const { error: repsError } = await supabase
      .from('congressional_representatives')
      .upsert(sampleData.congressional_representatives);
    if (repsError) return { success: false, error: repsError };

    // Insert User Submitted Complaints
    const { error: complaintsError } = await supabase
      .from('user_submitted_complaints')
      .upsert(sampleData.user_submitted_complaints);
    if (complaintsError) return { success: false, error: complaintsError };

    // Insert OIG Report Entries
    const { error: oigError } = await supabase
      .from('oig_report_entries')
      .upsert(sampleData.oig_report_entries);
    if (oigError) return { success: false, error: oigError };

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Function to clear all data (for testing)
export const clearDatabase = async () => {
  try {
    const tables = [
      'oig_report_entries',
      'user_submitted_complaints',
      'congressional_representatives',
      'analytics',
      'scorecards',
      'va_facilities',
      'visns'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Keep system records
      
      if (error) {
        return { success: false, error };
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}; 