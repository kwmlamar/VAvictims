import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Image,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const EvidenceUpload = ({ onUpload }) => {
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = useCallback((files) => {
    const validFiles = files.filter(file => {
      const maxSize = 50 * 1024 * 1024; // 50MB
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'video/quicktime',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 50MB limit`,
          variant: "destructive",
          duration: 3000,
        });
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
          duration: 3000,
        });
        return false;
      }
      
      return true;
    });

    const filesWithMetadata = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...filesWithMetadata]);
  }, [toast]);

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    const uploadedFiles = [];

    for (const fileItem of files) {
      if (fileItem.status === 'completed') continue;

      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'uploading' } : f
      ));
      
      try {
        const filePath = `public/${fileItem.id}-${fileItem.name}`;
        const { error: uploadError } = await supabase.storage
          .from('complaint_pdfs') // Assuming this is the correct bucket
          .upload(filePath, fileItem.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('complaint_pdfs')
          .getPublicUrl(filePath);
        
        // Create database record
        const record = {
          file_name: fileItem.name,
          file_url: urlData.publicUrl,
          file_size: fileItem.size,
          file_type: fileItem.type,
          uploaded_at: new Date().toISOString(),
          status: 'completed'
        };

        const { error: dbError } = await supabase
          .from('evidence_files')
          .insert([record]);
        
        if (dbError) throw dbError;
        
        uploadedFiles.push(record);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'completed' } : f
        ));

      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'failed' } : f
        ));
        toast({
          title: `❌ Upload Failed for ${fileItem.name}`,
          description: error.message,
          variant: "destructive",
        });
      }
    }
    
    setUploading(false);
    if (uploadedFiles.length > 0) {
      onUpload(uploadedFiles);
    }
    
    setTimeout(() => {
      setFiles(prev => prev.filter(f => f.status !== 'completed'));
    }, 2000);
  }, [files, onUpload, toast]);

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (type === 'application/pdf') return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ios-card p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <Upload className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Upload Evidence</h2>
          <p className="text-blue-200 text-sm">Upload documents, images, and videos as evidence</p>
        </div>
      </div>

      <div
        className={`upload-zone p-8 text-center mb-6 ${dragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Drag and drop files here
        </h3>
        <p className="text-blue-200 text-sm mb-4">
          or click to select files from your device
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.mov,.txt,.doc,.docx"
        />
        <label htmlFor="file-upload">
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => document.getElementById('file-upload').click()}
          >
            Select Files
          </Button>
        </label>
        <p className="text-blue-300 text-xs mt-3">
          Supported: PDF, Images, Videos, Documents (Max 50MB each)
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-white">Selected Files</h3>
          <div className="space-y-2">
            {files.map((fileItem) => (
              <motion.div
                key={fileItem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-blue-400">
                    {getFileIcon(fileItem.type)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{fileItem.name}</p>
                    <p className="text-blue-300 text-xs">{formatFileSize(fileItem.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {fileItem.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileItem.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {fileItem.status === 'uploading' && (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  )}
                  {fileItem.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  )}
                   {fileItem.status === 'failed' && (
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-blue-200 text-sm">
            {files.filter(f=> f.status !== 'completed').length} file{files.filter(f=> f.status !== 'completed').length !== 1 ? 's' : ''} ready to upload
          </p>
          <Button
            onClick={handleUpload}
            disabled={uploading || files.every(f => f.status === 'completed' || f.status === 'failed')}
            className="bg-green-600 hover:bg-green-700"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </>
            )}
          </Button>
        </div>
      )}

      <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-1">Secure Upload</h4>
            <p className="text-blue-200 text-xs leading-relaxed">
              All files are encrypted during upload and stored securely. Large PDFs are automatically 
              scanned and analyzed for relevant information to support your case.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EvidenceUpload;