import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  Send, 
  ShieldAlert,
  CheckCircle,
  Clock,
  Users,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AllegationForm from '@/components/AllegationForm';
import VaGroupAllegationForm from '@/components/VaGroupAllegationForm';
import ExternalGroupAllegationForm from '@/components/ExternalGroupAllegationForm';
import EvidenceUpload from '@/components/EvidenceUpload';
import { supabase } from '@/lib/supabaseClient';
import { checkDatabaseTables } from '@/lib/databaseUtils';

const UserPortal = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('submit');
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      console.log('🔍 Fetching user submissions...');
      
      // Check table accessibility first
      const tableStatus = await checkDatabaseTables();
      if (!tableStatus.user_submitted_complaints?.accessible) {
        console.warn('⚠️ user_submitted_complaints table not accessible');
        setSubmissions([]);
        return;
      }

      const { data, error } = await supabase
        .from('user_submitted_complaints')
        .select(`
          id, 
          facility_name_submitted, 
          complaint_type, 
          status, 
          submitted_at, 
          va_group, 
          complicity_type, 
          external_group, 
          external_violation_type,
          description,
          contact_email,
          is_anonymous
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching submissions:', error);
        throw error;
      }
      
      console.log('✅ Fetched submissions:', data?.length || 0);
      
      const formattedSubmissions = (data || []).map(s => ({
        id: s.id,
        title: s.external_group 
          ? `${s.external_violation_type || 'Violation'} by ${s.external_group}`
          : s.va_group 
            ? `${s.complicity_type || 'Complicity'} by ${s.va_group}` 
            : `${s.complaint_type || 'Complaint'} at ${s.facility_name_submitted || 'Unknown Facility'}`,
        status: s.status || 'pending',
        submitted: new Date(s.submitted_at).toLocaleDateString(),
        facility: s.facility_name_submitted || (s.va_group ? `${s.va_group}` : (s.external_group ? s.external_group : 'N/A')),
        type: s.complaint_type || 'General',
        va_group: s.va_group,
        complicity_type: s.complicity_type,
        external_group: s.external_group,
        external_violation_type: s.external_violation_type,
        description: s.description,
        contact_email: s.contact_email,
        is_anonymous: s.is_anonymous
      }));

      setSubmissions(formattedSubmissions);

    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({ 
        title: "Error Fetching Submissions", 
        description: "Could not load your submissions. Please try again later.", 
        variant: "destructive" 
      });
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'track') {
      fetchSubmissions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleAllegationSubmit = async (formData) => {
    try {
      console.log('📝 Submitting allegation:', formData);
      
      // Check table accessibility
      const tableStatus = await checkDatabaseTables();
      if (!tableStatus.user_submitted_complaints?.accessible) {
        throw new Error('Database table not accessible');
      }

      // Prepare data for database insertion
      const submissionData = {
        facility_name_submitted: formData.facility,
        complaint_type: formData.type,
        description: formData.description,
        veteran_name: formData.veteranName,
        veteran_id_last4: formData.veteranId,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        status: 'pending',
        va_group: formData.va_group,
        complicity_type: formData.complicity_type,
        external_group: formData.external_group,
        external_violation_type: formData.external_violation_type,
        category: formData.category || 'General',
        date_of_incident: formData.dateOfIncident,
        is_anonymous: formData.isAnonymous || false,
        facility_type_submitted: formData.facilityType,
        location_submitted: formData.location,
        user_id: null
      };

      // Insert into database
      const { data, error } = await supabase
        .from('user_submitted_complaints')
        .insert([submissionData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error inserting submission:', error);
        throw error;
      }

      console.log('✅ Submission inserted successfully:', data);

      // Create submission object for UI
      const newSubmission = {
        id: data.id,
        title: formData.external_group 
          ? `${formData.external_violation_type || 'Violation'} by ${formData.external_group}`
          : formData.va_group 
            ? `${formData.complicity_type || 'Complicity'} by ${formData.va_group}` 
            : `${formData.type} at ${formData.facility}`,
        status: 'Submitted',
        submitted: new Date().toLocaleDateString(),
        facility: formData.facility || (formData.va_group ? `${formData.va_group}` : (formData.external_group ? formData.external_group : 'N/A')),
        type: formData.type,
        va_group: formData.va_group,
        complicity_type: formData.complicity_type,
        external_group: formData.external_group,
        external_violation_type: formData.external_violation_type,
        description: formData.description,
        contact_email: formData.contactEmail,
        is_anonymous: formData.isAnonymous || false
      };
      
      // Update local state
      setSubmissions([newSubmission, ...submissions]);
      
      toast({
        title: "✅ Allegation Submitted Successfully",
        description: `Your submission regarding ${newSubmission.title} has been received and saved to the database. ID: ${newSubmission.id.substring(0,8)}...`,
        duration: 5000,
      });

    } catch (error) {
      console.error('❌ Error submitting allegation:', error);
      toast({
        title: "❌ Submission Failed",
        description: "Could not submit your allegation. Please try again or contact support if the problem persists.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleFileUpload = async (uploadedFileRecords) => {
    try {
      console.log('📁 Processing file uploads:', uploadedFileRecords);
      
      // Check table accessibility
      const tableStatus = await checkDatabaseTables();
      if (!tableStatus.uploaded_documents?.accessible) {
        throw new Error('Upload documents table not accessible');
      }

      // Process each uploaded file
      const uploadPromises = uploadedFileRecords.map(async (fileRecord) => {
        const { data, error } = await supabase
          .from('uploaded_documents')
          .insert([{
            file_name: fileRecord.name,
            storage_path: fileRecord.path,
            content_type: fileRecord.type,
            size: fileRecord.size,
            status: 'uploaded',
            visn: fileRecord.visn || 'Unknown'
          }])
          .select()
          .single();

        if (error) {
          console.error('❌ Error uploading file:', error);
          throw error;
        }

        return data;
      });

      await Promise.all(uploadPromises);

      toast({
        title: "📁 Files Processed Successfully",
        description: `${uploadedFileRecords.length} file(s) uploaded and recorded in the database.`,
        duration: 3000,
      });

    } catch (error) {
      console.error('❌ Error processing file uploads:', error);
      toast({
        title: "❌ File Upload Failed",
        description: "Could not process file uploads. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted': return <Clock className="h-4 w-4 text-blue-400" />;
      case 'Under Review': return <FileText className="h-4 w-4 text-yellow-400" />;
      case 'Investigating': return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case 'Resolved': return <CheckCircle className="h-4 w-4 text-green-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'text-blue-400 bg-blue-400/10';
      case 'Under Review': return 'text-yellow-400 bg-yellow-400/10';
      case 'Investigating': return 'text-orange-400 bg-orange-400/10';
      case 'Resolved': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <>
      <Helmet>
        <title>User Portal - VA Accountability Platform</title>
        <meta name="description" content="Submit allegations, upload evidence, and track your submissions in the VA accountability platform." />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-white">User Portal</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Submit allegations, upload evidence, and track your submissions for VA accountability
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="ios-card p-6 border-l-4 border-blue-500"
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-blue-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Important Notice</h3>
              <p className="text-blue-200 text-sm leading-relaxed">
                This platform is designed to support veterans and advocates in their legal efforts. 
                All submissions are processed securely. Your privacy and confidentiality are protected. 
                Allegations against VA groups (OIG, OGC, etc.) or External Oversight Bodies (OSC, MSPB, etc.) can be filed using the respective tabs.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="submit" className="data-[state=active]:bg-blue-600">
                <Send className="h-4 w-4 mr-2" />
                Facility
              </TabsTrigger>
              <TabsTrigger value="group-allegation" className="data-[state=active]:bg-blue-600">
                <ShieldAlert className="h-4 w-4 mr-2" />
                VA Group
              </TabsTrigger>
              <TabsTrigger value="external-group-allegation" className="data-[state=active]:bg-blue-600">
                <Globe className="h-4 w-4 mr-2" />
                External Group
              </TabsTrigger>
              <TabsTrigger value="evidence" className="data-[state=active]:bg-blue-600">
                <Upload className="h-4 w-4 mr-2" />
                Evidence
              </TabsTrigger>
              <TabsTrigger value="track" className="data-[state=active]:bg-blue-600">
                <FileText className="h-4 w-4 mr-2" />
                Track
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submit" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <AllegationForm onSubmit={handleAllegationSubmit} />
              </motion.div>
            </TabsContent>

            <TabsContent value="group-allegation" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <VaGroupAllegationForm onSubmit={handleAllegationSubmit} />
              </motion.div>
            </TabsContent>
            
            <TabsContent value="external-group-allegation" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <ExternalGroupAllegationForm onSubmit={handleAllegationSubmit} />
              </motion.div>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <EvidenceUpload onUpload={handleFileUpload} />
              </motion.div>
            </TabsContent>

            <TabsContent value="track" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Your Submissions</h2>
                
                {loadingSubmissions ? (
                  <div className="ios-card p-8 text-center loading-shimmer h-40">
                     <p className="text-blue-200">Loading your submissions...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="ios-card p-8 text-center">
                    <FileText className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Submissions Yet</h3>
                    <p className="text-blue-200">Start by submitting an allegation or uploading evidence</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission, index) => (
                      <motion.div
                        key={submission.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="ios-card p-6 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{submission.title}</h3>
                              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                {getStatusIcon(submission.status)}
                                <span>{submission.status}</span>
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-200">
                              <div><span className="font-medium">ID:</span> {submission.id.substring(0,8)}...</div>
                              <div><span className="font-medium">{submission.external_group ? 'External Group:' : (submission.va_group ? 'VA Group:' : 'Facility:')}</span> {submission.external_group || submission.va_group || submission.facility}</div>
                              <div><span className="font-medium">Type:</span> {submission.external_violation_type || submission.complicity_type || submission.type}</div>
                            </div>
                            <div className="mt-2 text-sm text-blue-300">Submitted: {submission.submitted}</div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300" onClick={() => toast({title: "🚧 View Details Coming Soon"})}>
                            View Details
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="ios-card p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{submissions.length}</h3>
            <p className="text-blue-400 font-medium">Total Submissions</p>
          </div>
          <div className="ios-card p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{submissions.filter(s => s.status !== 'Resolved').length}</h3>
            <p className="text-yellow-400 font-medium">Pending Review</p>
          </div>
          <div className="ios-card p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{submissions.filter(s => s.status === 'Resolved').length}</h3>
            <p className="text-green-400 font-medium">Resolved</p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default UserPortal;