import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Building, AlertTriangle, Users, Newspaper, Gavel, Shield, UserCheck, FileSpreadsheet, Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const DeveloperDataUpload = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRefs = useRef({});

  const uploadTypes = [
    {
      id: 'facility-data',
      label: 'Facility Data',
      description: 'Upload VA facility information, locations, and details',
      icon: Building,
      acceptedTypes: '.csv,.xlsx,.json',
      bucket: 'facility_data',
      table: 'va_facilities'
    },
    {
      id: 'oig-reports',
      label: 'OIG Reports',
      description: 'Office of Inspector General reports and investigations',
      icon: FileText,
      acceptedTypes: '.pdf,.doc,.docx,.txt',
      bucket: 'oig_reports',
      table: 'oig_report_entries'
    },
    {
      id: 'employee-surveys',
      label: 'All Employee Surveys',
      description: 'Comprehensive employee satisfaction and feedback surveys',
      icon: Users,
      acceptedTypes: '.csv,.xlsx,.pdf,.json',
      bucket: 'employee_surveys',
      table: 'employee_surveys'
    },
    {
      id: 'federal-employee-surveys',
      label: 'Federal Employee Surveys',
      description: 'Federal Employee Viewpoint Survey (FEVS) data',
      icon: UserCheck,
      acceptedTypes: '.csv,.xlsx,.json',
      bucket: 'federal_employee_surveys',
      table: 'federal_employee_surveys'
    },
    {
      id: 'patient-surveys',
      label: 'Patient Surveys',
      description: 'Patient satisfaction and experience surveys',
      icon: Users,
      acceptedTypes: '.csv,.xlsx,.json',
      bucket: 'patient_surveys',
      table: 'patient_surveys'
    },
    {
      id: 'user-evidence',
      label: 'User Evidence',
      description: 'Evidence files attached to user-submitted complaints',
      icon: FileText,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
      bucket: 'user_evidence',
      table: 'user_submitted_complaints'
    },
    {
      id: 'news-social-media',
      label: 'News & Social Media',
      description: 'News articles and social media content about VA facilities',
      icon: Newspaper,
      acceptedTypes: '.pdf,.txt,.json,.csv',
      bucket: 'media_files',
      table: 'news_articles'
    },
    {
      id: 'federal-court-records',
      label: 'Federal Court Records',
      description: 'Federal court cases and legal proceedings',
      icon: Gavel,
      acceptedTypes: '.pdf,.doc,.docx,.txt',
      bucket: 'legal_documents',
      table: 'federal_court_records'
    },
    {
      id: 'eco-records',
      label: 'ECO Records',
      description: 'Equal Employment Opportunity Commission records',
      icon: Shield,
      acceptedTypes: '.pdf,.doc,.docx,.txt',
      bucket: 'legal_documents',
      table: 'eco_records'
    },
    {
      id: 'osc-records',
      label: 'OSC Records',
      description: 'Office of Special Counsel records and investigations',
      icon: Shield,
      acceptedTypes: '.pdf,.doc,.docx,.txt',
      bucket: 'legal_documents',
      table: 'osc_records'
    },
    {
      id: 'mspb-records',
      label: 'MSPB Records',
      description: 'Merit Systems Protection Board records and decisions',
      icon: Shield,
      acceptedTypes: '.pdf,.doc,.docx,.txt',
      bucket: 'legal_documents',
      table: 'mspb_records'
    },
    {
      id: 'user-allegations',
      label: 'User Allegations',
      description: 'User-submitted complaints and allegations',
      icon: AlertTriangle,
      acceptedTypes: '.csv,.xlsx,.json',
      bucket: 'user_allegations',
      table: 'user_submitted_complaints'
    }
  ];

  const handleFileSelect = (uploadType, event) => {
    const files = event.target.files;
    if (files.length > 0) {
      handleUpload(uploadType, files);
    }
  };

  const handleUpload = async (uploadType, files) => {
    const uploadConfig = uploadTypes.find(type => type.id === uploadType);
    if (!uploadConfig) return;

    setUploading(prev => ({ ...prev, [uploadType]: true }));
    setUploadProgress(prev => ({ ...prev, [uploadType]: 0 }));

    try {
      const results = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${uploadType}/${Date.now()}-${file.name}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(uploadConfig.bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(uploadConfig.bucket)
          .getPublicUrl(fileName);

        // Store metadata in database
        const metadata = {
          file_name: file.name,
          file_path: fileName,
          file_url: urlData.publicUrl,
          file_size: file.size,
          file_type: file.type,
          upload_type: uploadType,
          uploaded_at: new Date().toISOString(),
          status: 'uploaded'
        };

        const { error: dbError } = await supabase
          .from('uploaded_documents')
          .insert([metadata]);

        if (dbError) {
          console.error('Database insert error:', dbError);
        }

        results.push({
          fileName: file.name,
          fileUrl: urlData.publicUrl,
          success: true
        });

        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [uploadType]: ((i + 1) / files.length) * 100
        }));
      }

      toast({
        title: '✅ Upload Successful',
        description: `Successfully uploaded ${files.length} file(s) for ${uploadConfig.label}`,
        duration: 3000,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: '❌ Upload Failed',
        description: `Failed to upload files: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setUploading(prev => ({ ...prev, [uploadType]: false }));
      setUploadProgress(prev => ({ ...prev, [uploadType]: 0 }));
      
      // Clear file input
      if (fileInputRefs.current[uploadType]) {
        fileInputRefs.current[uploadType].value = '';
      }
    }
  };

  const triggerFileInput = (uploadType) => {
    if (fileInputRefs.current[uploadType]) {
      fileInputRefs.current[uploadType].click();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <Upload className="h-8 w-8 text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Data Upload Center</h2>
          <p className="text-blue-200">Upload various types of data to the system</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uploadTypes.map((uploadType) => {
          const IconComponent = uploadType.icon;
          const isUploading = uploading[uploadType.id];
          const progress = uploadProgress[uploadType.id] || 0;

          return (
            <motion.div
              key={uploadType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="ios-card p-6 space-y-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <IconComponent className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{uploadType.label}</h3>
                  <p className="text-sm text-blue-200">{uploadType.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-blue-300">
                  <span className="font-medium">Accepted formats:</span> {uploadType.acceptedTypes}
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                      <span className="text-sm text-blue-200">Uploading...</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-blue-300">{Math.round(progress)}%</span>
                  </div>
                )}

                <Button
                  onClick={() => triggerFileInput(uploadType.id)}
                  disabled={isUploading}
                  className={`w-full ${isUploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Files
                    </>
                  )}
                </Button>

                <input
                  ref={(el) => fileInputRefs.current[uploadType.id] = el}
                  type="file"
                  multiple
                  accept={uploadType.acceptedTypes}
                  onChange={(e) => handleFileSelect(uploadType.id, e)}
                  className="hidden"
                />
              </div>

              <div className="text-xs text-gray-400">
                <div>Storage: {uploadType.bucket}</div>
                <div>Table: {uploadType.table}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Upload Guidelines</h3>
        <ul className="text-sm text-blue-200 space-y-2">
          <li>• Files are automatically categorized and stored in appropriate buckets</li>
          <li>• Metadata is recorded in the uploaded_documents table</li>
          <li>• Large files may take longer to upload - please be patient</li>
          <li>• Supported formats vary by data type - check accepted formats</li>
          <li>• Duplicate files will be handled automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default DeveloperDataUpload; 