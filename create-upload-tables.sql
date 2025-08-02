-- Create tables for data upload functionality
-- This script creates the necessary tables to support the comprehensive data upload system

-- Main uploaded documents table to track all uploads
CREATE TABLE IF NOT EXISTS uploaded_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_size BIGINT,
    file_type TEXT,
    upload_type TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'uploaded',
    processed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee surveys table
CREATE TABLE IF NOT EXISTS employee_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES va_facilities(id),
    survey_type TEXT,
    survey_date DATE,
    response_rate NUMERIC,
    overall_satisfaction NUMERIC,
    leadership_satisfaction NUMERIC,
    work_environment_satisfaction NUMERIC,
    compensation_satisfaction NUMERIC,
    survey_data JSONB,
    source_file_id UUID REFERENCES uploaded_documents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Federal employee surveys table
CREATE TABLE IF NOT EXISTS federal_employee_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES va_facilities(id),
    survey_year INTEGER,
    survey_type TEXT,
    response_rate NUMERIC,
    overall_satisfaction NUMERIC,
    leadership_satisfaction NUMERIC,
    work_environment_satisfaction NUMERIC,
    compensation_satisfaction NUMERIC,
    survey_data JSONB,
    source_file_id UUID REFERENCES uploaded_documents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient surveys table
CREATE TABLE IF NOT EXISTS patient_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES va_facilities(id),
    survey_type TEXT,
    survey_date DATE,
    response_rate NUMERIC,
    overall_satisfaction NUMERIC,
    care_quality_satisfaction NUMERIC,
    communication_satisfaction NUMERIC,
    wait_time_satisfaction NUMERIC,
    survey_data JSONB,
    source_file_id UUID REFERENCES uploaded_documents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    author TEXT,
    publication TEXT,
    publish_date DATE,
    url TEXT,
    content TEXT,
    summary TEXT,
    sentiment_score NUMERIC,
    facility_id UUID REFERENCES va_facilities(id),
    source_file_id UUID REFERENCES uploaded_documents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Federal court records table
CREATE TABLE IF NOT EXISTS federal_court_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT,
    case_title TEXT,
    court_name TEXT,
    filing_date DATE,
    case_type TEXT,
    plaintiff TEXT,
    defendant TEXT,
    case_summary TEXT,
    outcome TEXT,
    facility_id UUID REFERENCES va_facilities(id),
    source_file_id UUID REFERENCES uploaded_documents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ECO records table
CREATE TABLE IF NOT EXISTS eco_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT,
    case_title TEXT,
    filing_date DATE,
    complainant TEXT,
    respondent TEXT,
    case_type TEXT,
    case_summary TEXT,
    outcome TEXT,
    facility_id UUID REFERENCES va_facilities(id),
    source_file_id UUID REFERENCES uploaded_documents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OSC records table
CREATE TABLE IF NOT EXISTS osc_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT,
    case_title TEXT,
    filing_date DATE,
    complainant TEXT,
    respondent TEXT,
    case_type TEXT,
    case_summary TEXT,
    outcome TEXT,
    facility_id UUID REFERENCES va_facilities(id),
    source_file_id UUID REFERENCES uploaded_documents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MSPB records table
CREATE TABLE IF NOT EXISTS mspb_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT,
    case_title TEXT,
    filing_date DATE,
    appellant TEXT,
    respondent TEXT,
    case_type TEXT,
    case_summary TEXT,
    outcome TEXT,
    facility_id UUID REFERENCES va_facilities(id),
    source_file_id UUID REFERENCES uploaded_documents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_upload_type ON uploaded_documents(upload_type);
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_status ON uploaded_documents(status);
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_uploaded_at ON uploaded_documents(uploaded_at);

CREATE INDEX IF NOT EXISTS idx_employee_surveys_facility_id ON employee_surveys(facility_id);
CREATE INDEX IF NOT EXISTS idx_employee_surveys_survey_date ON employee_surveys(survey_date);

CREATE INDEX IF NOT EXISTS idx_federal_employee_surveys_facility_id ON federal_employee_surveys(facility_id);
CREATE INDEX IF NOT EXISTS idx_federal_employee_surveys_survey_year ON federal_employee_surveys(survey_year);

CREATE INDEX IF NOT EXISTS idx_patient_surveys_facility_id ON patient_surveys(facility_id);
CREATE INDEX IF NOT EXISTS idx_patient_surveys_survey_date ON patient_surveys(survey_date);

CREATE INDEX IF NOT EXISTS idx_news_articles_facility_id ON news_articles(facility_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_publish_date ON news_articles(publish_date);

CREATE INDEX IF NOT EXISTS idx_federal_court_records_facility_id ON federal_court_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_federal_court_records_filing_date ON federal_court_records(filing_date);

CREATE INDEX IF NOT EXISTS idx_eco_records_facility_id ON eco_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_eco_records_filing_date ON eco_records(filing_date);

CREATE INDEX IF NOT EXISTS idx_osc_records_facility_id ON osc_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_osc_records_filing_date ON osc_records(filing_date);

CREATE INDEX IF NOT EXISTS idx_mspb_records_facility_id ON mspb_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_mspb_records_filing_date ON mspb_records(filing_date);

-- Add RLS policies for security
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE federal_employee_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE federal_court_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE eco_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE osc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mspb_records ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication setup)
-- For now, allowing all authenticated users to read/write
CREATE POLICY "Allow authenticated users to read uploaded_documents" ON uploaded_documents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert uploaded_documents" ON uploaded_documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Similar policies for other tables
CREATE POLICY "Allow authenticated users to read employee_surveys" ON employee_surveys
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert employee_surveys" ON employee_surveys
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add similar policies for all other tables...

-- Show created tables
SELECT 
    table_name,
    column_count,
    row_count
FROM (
    SELECT 'uploaded_documents' as table_name, COUNT(*) as column_count, 0 as row_count FROM information_schema.columns WHERE table_name = 'uploaded_documents'
    UNION ALL
    SELECT 'employee_surveys' as table_name, COUNT(*) as column_count, 0 as row_count FROM information_schema.columns WHERE table_name = 'employee_surveys'
    UNION ALL
    SELECT 'federal_employee_surveys' as table_name, COUNT(*) as column_count, 0 as row_count FROM information_schema.columns WHERE table_name = 'federal_employee_surveys'
    UNION ALL
    SELECT 'patient_surveys' as table_name, COUNT(*) as column_count, 0 as row_count FROM information_schema.columns WHERE table_name = 'patient_surveys'
    UNION ALL
    SELECT 'news_articles' as table_name, COUNT(*) as column_count, 0 as row_count FROM information_schema.columns WHERE table_name = 'news_articles'
    UNION ALL
    SELECT 'federal_court_records' as table_name, COUNT(*) as column_count, 0 as row_count FROM information_schema.columns WHERE table_name = 'federal_court_records'
    UNION ALL
    SELECT 'eco_records' as table_name, COUNT(*) as column_count, 0 as row_count FROM information_schema.columns WHERE table_name = 'eco_records'
    UNION ALL
    SELECT 'osc_records' as table_name, COUNT(*) as column_count, 0 as row_count FROM information_schema.columns WHERE table_name = 'osc_records'
    UNION ALL
    SELECT 'mspb_records' as table_name, COUNT(*) as column_count, 0 as row_count FROM information_schema.columns WHERE table_name = 'mspb_records'
) t
ORDER BY table_name; 