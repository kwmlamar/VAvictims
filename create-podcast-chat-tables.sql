-- Create tables for podcast, chat, and help features
-- This script creates the necessary tables to support the new features

-- Podcasts table
CREATE TABLE IF NOT EXISTS podcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    episode_number TEXT,
    duration INTEGER, -- in seconds
    media_type TEXT CHECK (media_type IN ('audio', 'video')),
    audio_url TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    tags TEXT[],
    is_published BOOLEAN DEFAULT false,
    publish_date DATE,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'audio', 'video')),
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles for chat
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT,
    avatar_url TEXT,
    bio TEXT,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reported messages for moderation
CREATE TABLE IF NOT EXISTS reported_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id),
    reported_by UUID REFERENCES auth.users(id),
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Podcast likes/favorites
CREATE TABLE IF NOT EXISTS podcast_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    podcast_id UUID REFERENCES podcasts(id),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(podcast_id, user_id)
);

-- Podcast views tracking
CREATE TABLE IF NOT EXISTS podcast_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    podcast_id UUID REFERENCES podcasts(id),
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Help resources table
CREATE TABLE IF NOT EXISTS help_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ table
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support groups table
CREATE TABLE IF NOT EXISTS support_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    schedule TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    max_members INTEGER,
    current_members INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support group members
CREATE TABLE IF NOT EXISTS support_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES support_groups(id),
    user_id UUID REFERENCES auth.users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_moderator BOOLEAN DEFAULT false,
    UNIQUE(group_id, user_id)
);

-- Emergency contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    description TEXT,
    contact_type TEXT CHECK (contact_type IN ('emergency', 'support', 'information')),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_podcasts_published ON podcasts(is_published, publish_date);
CREATE INDEX IF NOT EXISTS idx_podcasts_media_type ON podcasts(media_type);
CREATE INDEX IF NOT EXISTS idx_podcasts_created_at ON podcasts(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(message_type);

CREATE INDEX IF NOT EXISTS idx_user_profiles_online ON user_profiles(is_online, last_seen);
CREATE INDEX IF NOT EXISTS idx_user_profiles_name ON user_profiles(name);

CREATE INDEX IF NOT EXISTS idx_reported_messages_status ON reported_messages(status);
CREATE INDEX IF NOT EXISTS idx_reported_messages_created_at ON reported_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_podcast_likes_user ON podcast_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_likes_podcast ON podcast_likes(podcast_id);

CREATE INDEX IF NOT EXISTS idx_podcast_views_podcast ON podcast_views(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_views_user ON podcast_views(user_id);

CREATE INDEX IF NOT EXISTS idx_help_resources_category ON help_resources(category, is_active);
CREATE INDEX IF NOT EXISTS idx_help_resources_sort ON help_resources(sort_order);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category, is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_sort ON faqs(sort_order);

CREATE INDEX IF NOT EXISTS idx_support_groups_active ON support_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_support_group_members_user ON support_group_members(user_id);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_type ON emergency_contacts(contact_type, is_active);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_sort ON emergency_contacts(sort_order);

-- Add RLS policies for security
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reported_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Podcast policies
CREATE POLICY "Public podcasts are viewable by everyone" ON podcasts
    FOR SELECT USING (is_published = true);

CREATE POLICY "Users can create podcasts" ON podcasts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own podcasts" ON podcasts
    FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view chat messages" ON chat_messages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert chat messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own messages" ON chat_messages
    FOR UPDATE USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Users can view profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Reported messages policies
CREATE POLICY "Users can report messages" ON reported_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Moderators can view reports" ON reported_messages
    FOR SELECT USING (auth.role() = 'authenticated');

-- Podcast likes policies
CREATE POLICY "Users can like podcasts" ON podcast_likes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view likes" ON podcast_likes
    FOR SELECT USING (true);

-- Help resources policies (public)
CREATE POLICY "Help resources are viewable by everyone" ON help_resources
    FOR SELECT USING (is_active = true);

-- FAQ policies (public)
CREATE POLICY "FAQs are viewable by everyone" ON faqs
    FOR SELECT USING (is_active = true);

-- Support groups policies
CREATE POLICY "Support groups are viewable by everyone" ON support_groups
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can join groups" ON support_group_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Emergency contacts policies (public)
CREATE POLICY "Emergency contacts are viewable by everyone" ON emergency_contacts
    FOR SELECT USING (is_active = true);

-- Insert sample data
INSERT INTO emergency_contacts (name, phone, description, contact_type) VALUES
    ('Veterans Crisis Line', '1-800-273-8255', '24/7 confidential support for veterans in crisis', 'emergency'),
    ('National Suicide Prevention Lifeline', '988', '24/7 suicide prevention and crisis support', 'emergency'),
    ('VA Benefits Hotline', '1-800-827-1000', 'Information about VA benefits and services', 'support'),
    ('VA Health Care', '1-877-222-8387', 'VA health care enrollment and information', 'support');

INSERT INTO help_resources (title, description, url, category) VALUES
    ('VA Benefits Guide', 'Complete guide to VA benefits and how to apply', 'https://www.va.gov/benefits/', 'benefits'),
    ('Mental Health Resources', 'VA mental health services and support programs', 'https://www.mentalhealth.va.gov/', 'health'),
    ('Legal Assistance', 'Free legal help for veterans and their families', 'https://www.va.gov/legal-aid/', 'legal'),
    ('Housing Assistance', 'VA housing programs and homeless veteran services', 'https://www.va.gov/housing-assistance/', 'housing'),
    ('Education Benefits', 'GI Bill and other education benefits for veterans', 'https://www.va.gov/education/', 'education'),
    ('Employment Services', 'Job training and employment assistance for veterans', 'https://www.va.gov/careers-employment/', 'employment');

INSERT INTO faqs (question, answer, category) VALUES
    ('How do I report misconduct at a VA facility?', 'You can report misconduct through our platform by submitting an allegation form, or directly to the VA Office of Inspector General. Always document incidents with dates, times, and names of involved parties.', 'reporting'),
    ('What should I do if I experience retaliation?', 'Document all incidents of retaliation immediately. Contact the VA Office of Inspector General and consider reaching out to veteran advocacy organizations. Retaliation is illegal and should be reported.', 'legal'),
    ('How can I access my VA medical records?', 'You can access your VA medical records through the My HealtheVet portal, by requesting them from your VA facility, or through the VA Blue Button feature.', 'health'),
    ('What benefits am I entitled to as a veteran?', 'Veterans may be eligible for health care, disability compensation, education benefits, home loans, and more. Contact the VA Benefits Hotline or visit va.gov/benefits for a complete assessment.', 'benefits'),
    ('How do I appeal a VA decision?', 'You can appeal VA decisions through the Board of Veterans Appeals. The process involves filing a Notice of Disagreement and potentially requesting a hearing. Consider consulting with a veterans service organization.', 'legal'),
    ('What mental health services are available?', 'VA offers comprehensive mental health services including counseling, therapy, medication management, and crisis intervention. Services are available at VA medical centers and through community providers.', 'health');

INSERT INTO support_groups (name, description, schedule, contact_email) VALUES
    ('PTSD Support Group', 'Weekly meetings for veterans dealing with PTSD', 'Every Tuesday, 6:00 PM', 'ptsd-support@vavictims.com'),
    ('Families of Veterans', 'Support for family members of veterans', 'Every Thursday, 7:00 PM', 'families@vavictims.com'),
    ('Women Veterans Group', 'Support group specifically for women veterans', 'Every Saturday, 10:00 AM', 'women-vets@vavictims.com');

-- Show created tables summary
SELECT 
    table_name,
    column_count,
    row_count
FROM (
    SELECT 'podcasts' as table_name, COUNT(*) as column_count, 0 as row_count FROM information_schema.columns WHERE table_name = 'podcasts'
    UNION ALL
    SELECT 'chat_messages' as table_name, COUNT(*) as column_count, 0 as row_count FROM information_schema.columns WHERE table_name = 'chat_messages'
    UNION ALL
    SELECT 'user_profiles' as table_name, COUNT(*) as column_count, 0 as row_count FROM information_schema.columns WHERE table_name = 'user_profiles'
    UNION ALL
    SELECT 'reported_messages' as table_name, COUNT(*) as column_count, 0 as row_count FROM information_schema.columns WHERE table_name = 'reported_messages'
    UNION ALL
    SELECT 'help_resources' as table_name, COUNT(*) as column_count, 6 as row_count FROM information_schema.columns WHERE table_name = 'help_resources'
    UNION ALL
    SELECT 'faqs' as table_name, COUNT(*) as column_count, 6 as row_count FROM information_schema.columns WHERE table_name = 'faqs'
    UNION ALL
    SELECT 'support_groups' as table_name, COUNT(*) as column_count, 3 as row_count FROM information_schema.columns WHERE table_name = 'support_groups'
    UNION ALL
    SELECT 'emergency_contacts' as table_name, COUNT(*) as column_count, 4 as row_count FROM information_schema.columns WHERE table_name = 'emergency_contacts'
) t
ORDER BY table_name; 