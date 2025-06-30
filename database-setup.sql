-- VA Accountability Platform Database Setup
-- Run this script in your Supabase SQL editor to create all necessary tables

-- Create VISNs table
CREATE TABLE IF NOT EXISTS visns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    region TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create VA Facilities table
CREATE TABLE IF NOT EXISTS va_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    visn_id UUID REFERENCES visns(id),
    visn TEXT,
    city TEXT,
    state TEXT,
    type TEXT,
    director_name TEXT,
    full_address TEXT,
    address TEXT,
    zip_code TEXT,
    region TEXT,
    senator TEXT,
    congressman TEXT,
    congressional_reps_temp TEXT[],
    oig_reports_data JSONB,
    congressional_representatives_data JSONB,
    suicide_incidents_data JSONB,
    user_submitted_complaints_data JSONB,
    legal_actions_data JSONB,
    employee_surveys_data JSONB,
    suicide_data_summary JSONB,
    oig_reports_summary JSONB,
    user_submitted_complaints_summary JSONB,
    congressional_liaison_info JSONB,
    legal_actions_summary JSONB,
    employee_surveys_summary JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Scorecards table
CREATE TABLE IF NOT EXISTS scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    score NUMERIC,
    data_summary JSONB,
    criteria JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create User Submitted Complaints table
CREATE TABLE IF NOT EXISTS user_submitted_complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES va_facilities(id),
    facility_name_submitted TEXT,
    facility_type_submitted TEXT,
    location_submitted TEXT,
    complaint_type TEXT,
    description TEXT,
    veteran_name TEXT,
    veteran_id_last4 TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolution_notes TEXT,
    va_group TEXT,
    complicity_type TEXT,
    external_group TEXT,
    external_violation_type TEXT,
    category TEXT DEFAULT 'General Complaint',
    pdf_path TEXT,
    date_of_incident DATE,
    is_anonymous BOOLEAN DEFAULT false,
    user_id UUID
);

-- Create Analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visn_id UUID REFERENCES visns(id),
    facility_id UUID REFERENCES va_facilities(id),
    user_id UUID,
    data_type TEXT NOT NULL,
    trends JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Congressional Representatives table
CREATE TABLE IF NOT EXISTS congressional_representatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    representative_name TEXT NOT NULL,
    office_title TEXT,
    party TEXT,
    state TEXT,
    district TEXT,
    contact_url TEXT,
    email TEXT,
    phone TEXT,
    zip_code_coverage_mock TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create OIG Report Entries table
CREATE TABLE IF NOT EXISTS oig_report_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES va_facilities(id),
    facility_name TEXT,
    report_number TEXT,
    report_date DATE,
    visn TEXT,
    state TEXT,
    city TEXT,
    summary_of_violations TEXT,
    violations_details TEXT,
    repeat_violations_summary TEXT,
    report_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create other tables from the schema
CREATE TABLE IF NOT EXISTS employee_surveys (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS filed_complaints (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS legal_actions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    complaint_id UUID,
    document_path TEXT,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suicide (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS uploaded_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES va_facilities(id),
    user_id UUID,
    file_name TEXT,
    storage_path TEXT,
    content_type TEXT,
    size BIGINT,
    status TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    analysis_summary JSONB,
    visn TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    password TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facility_representatives (
    representative_id UUID REFERENCES congressional_representatives(id),
    facility_id UUID REFERENCES va_facilities(id),
    PRIMARY KEY (representative_id, facility_id)
);

CREATE TABLE IF NOT EXISTS grading_formula (
    id SERIAL PRIMARY KEY,
    quality_of_care NUMERIC,
    staff_performance NUMERIC,
    facility_conditions NUMERIC,
    patient_satisfaction NUMERIC,
    wait_times NUMERIC,
    safety_incidents NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grading_scales (
    id SERIAL PRIMARY KEY,
    grade TEXT,
    min_score INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scraped_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES va_facilities(id),
    visn_id UUID REFERENCES visns(id),
    content JSONB,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_processed BOOLEAN DEFAULT false,
    source_url TEXT,
    data_type TEXT,
    citation TEXT,
    state TEXT,
    extracted_facility_name TEXT,
    document_date DATE
);

CREATE TABLE IF NOT EXISTS web_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT,
    last_scraped TIMESTAMP WITH TIME ZONE,
    update_frequency TEXT,
    data_type TEXT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS developer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_va_facilities_visn_id ON va_facilities(visn_id);
CREATE INDEX IF NOT EXISTS idx_va_facilities_state ON va_facilities(state);
CREATE INDEX IF NOT EXISTS idx_scorecards_entity_type ON scorecards(entity_type);
CREATE INDEX IF NOT EXISTS idx_scorecards_entity_id ON scorecards(entity_id);
CREATE INDEX IF NOT EXISTS idx_user_submitted_complaints_facility_id ON user_submitted_complaints(facility_id);
CREATE INDEX IF NOT EXISTS idx_user_submitted_complaints_status ON user_submitted_complaints(status);
CREATE INDEX IF NOT EXISTS idx_analytics_data_type ON analytics(data_type);
CREATE INDEX IF NOT EXISTS idx_oig_report_entries_facility_id ON oig_report_entries(facility_id);

-- Enable Row Level Security (RLS) - you may want to customize these policies
ALTER TABLE visns ENABLE ROW LEVEL SECURITY;
ALTER TABLE va_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_submitted_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE congressional_representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE oig_report_entries ENABLE ROW LEVEL SECURITY;

-- Create basic policies for public read access (customize as needed)
CREATE POLICY "Allow public read access to visns" ON visns FOR SELECT USING (true);
CREATE POLICY "Allow public read access to va_facilities" ON va_facilities FOR SELECT USING (true);
CREATE POLICY "Allow public read access to scorecards" ON scorecards FOR SELECT USING (true);
CREATE POLICY "Allow public read access to analytics" ON analytics FOR SELECT USING (true);
CREATE POLICY "Allow public read access to congressional_representatives" ON congressional_representatives FOR SELECT USING (true);
CREATE POLICY "Allow public read access to oig_report_entries" ON oig_report_entries FOR SELECT USING (true);

-- Allow public to insert complaints
CREATE POLICY "Allow public insert to user_submitted_complaints" ON user_submitted_complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access to user_submitted_complaints" ON user_submitted_complaints FOR SELECT USING (true);

-- Create function to handle user_id for anonymous submissions
CREATE OR REPLACE FUNCTION handle_anonymous_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is not provided or is 'anon', set it to null
  IF NEW.user_id IS NULL OR NEW.user_id::text = 'anon' THEN
    NEW.user_id := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle anonymous user submissions
DROP TRIGGER IF EXISTS handle_anonymous_user_trigger ON user_submitted_complaints;
CREATE TRIGGER handle_anonymous_user_trigger
  BEFORE INSERT ON user_submitted_complaints
  FOR EACH ROW
  EXECUTE FUNCTION handle_anonymous_user_id();

-- Create function to insert complaints safely
CREATE OR REPLACE FUNCTION insert_complaint(
  p_facility_name TEXT,
  p_complaint_type TEXT,
  p_description TEXT,
  p_date_of_incident DATE DEFAULT NULL,
  p_contact_email TEXT DEFAULT NULL,
  p_is_anonymous BOOLEAN DEFAULT false,
  p_status TEXT DEFAULT 'Submitted'
)
RETURNS TABLE(id UUID) AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO user_submitted_complaints (
    facility_name_submitted,
    complaint_type,
    description,
    date_of_incident,
    contact_email,
    is_anonymous,
    status,
    user_id,
    va_group,
    complicity_type,
    external_group,
    external_violation_type,
    category,
    facility_id,
    veteran_name,
    veteran_id_last4,
    contact_phone,
    facility_type_submitted,
    location_submitted
  ) VALUES (
    p_facility_name,
    p_complaint_type,
    p_description,
    p_date_of_incident,
    p_contact_email,
    p_is_anonymous,
    p_status,
    NULL, -- Explicitly set user_id to NULL
    NULL, -- va_group
    NULL, -- complicity_type
    NULL, -- external_group
    NULL, -- external_violation_type
    NULL, -- category
    NULL, -- facility_id
    NULL, -- veteran_name
    NULL, -- veteran_id_last4
    NULL, -- contact_phone
    NULL, -- facility_type_submitted
    NULL  -- location_submitted
  ) RETURNING id INTO v_id;
  
  RETURN QUERY SELECT v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample data
INSERT INTO visns (id, name, region) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'VISN 1', 'Northeast'),
    ('22222222-2222-2222-2222-222222222222', 'VISN 2', 'Northeast'),
    ('33333333-3333-3333-3333-333333333333', 'VISN 3', 'Mid-Atlantic')
ON CONFLICT (id) DO NOTHING;

INSERT INTO congressional_representatives (id, representative_name, office_title, party, state, contact_url, email) VALUES 
    ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'House Veterans Affairs Committee', 'House Veterans Affairs Committee', 'Bipartisan', 'DC', 'https://veterans.house.gov/', 'veterans@house.gov'),
    ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'Senate Veterans Affairs Committee', 'Senate Veterans Affairs Committee', 'Bipartisan', 'DC', 'https://www.veterans.senate.gov/', 'veterans@senate.gov')
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully!' as status; 