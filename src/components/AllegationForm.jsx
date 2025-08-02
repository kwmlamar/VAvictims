import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertTriangle, FileText, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AllegationForm = ({ onSubmit }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    facility: '',
    type: '',
    description: '',
    dateOfIncident: '',
    witnessInfo: '',
    contactInfo: '',
    anonymous: false
  });

  const allegationTypes = [
    'Patient Safety',
    'Medical Malpractice',
    'Retaliation (Facility/Staff)',
    'Discrimination',
    'Fraud/Waste/Abuse (Facility)',
    'Leadership Issues (Facility)',
    'Quality of Care',
    'Access to Care',
    'Facility Conditions',
    'Other Facility-Related Issue'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.facility || !formData.type || !formData.description) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please fill in all required fields for facility allegation.",
        variant: "destructive",
      });
      return;
    }

    const submissionData = {
      facility_name_submitted: formData.facility,
      complaint_type: formData.type,
      description: formData.description,
      date_of_incident: formData.dateOfIncident && formData.dateOfIncident.trim() !== '' ? formData.dateOfIncident : null,
      contact_email: formData.anonymous ? null : formData.contactInfo, 
      is_anonymous: formData.anonymous,
      status: 'pending',
      // Ensure no va_group or complicity_type is sent for this form
      va_group: null,
      complicity_type: null,
      user_id: null,
      category: 'General Complaint' // Use a more specific category value
    };
    
    try {
      const { data, error } = await supabase
        .from('user_submitted_complaints')
        .insert([submissionData])
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        onSubmit({ ...formData, id: data[0].id }); 
        setFormData({
          title: '',
          facility: '',
          type: '',
          description: '',
          dateOfIncident: '',
          witnessInfo: '',
          contactInfo: '',
          anonymous: false
        });
      }
    } catch (error) {
      console.error("Error submitting facility allegation:", error);
      
      // Handle specific constraint errors
      let errorMessage = "Could not submit your facility allegation. Please try again.";
      
      if (error.code === '23514') {
        if (error.message.includes('category_check')) {
          errorMessage = "There was an issue with the complaint category. Please try again or contact support.";
        } else if (error.message.includes('status_check')) {
          errorMessage = "There was an issue with the complaint status. Please try again or contact support.";
        } else {
          errorMessage = "There was a validation error with your submission. Please check all required fields and try again.";
        }
      } else if (error.message) {
        errorMessage += " " + error.message;
      }
      
      toast({
        title: "❌ Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ios-card p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Building className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Submit Facility Allegation</h2>
          <p className="text-blue-200 text-sm">Report issues concerning a specific VA facility or clinic</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-blue-200">
            Allegation Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Brief description of the facility issue"
            className="w-full px-4 py-3 search-input text-white placeholder-blue-300 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-200">
              Facility Name *
            </label>
            <input
              type="text"
              name="facility"
              value={formData.facility}
              onChange={handleInputChange}
              placeholder="e.g., Phoenix VA Medical Center"
              className="w-full px-4 py-3 search-input text-white placeholder-blue-300 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-200">
              Allegation Type *
            </label>
            <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)} required>
              <SelectTrigger className="search-input text-white">
                <SelectValue placeholder="Select type of facility issue" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {allegationTypes.map((type) => (
                  <SelectItem key={type} value={type} className="text-white hover:bg-slate-700">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-blue-200">
            Detailed Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Provide a detailed description of the incident or issue at the facility..."
            rows={6}
            className="w-full px-4 py-3 search-input text-white placeholder-blue-300 focus:outline-none resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-200">
              Date of Incident
            </label>
            <input
              type="date"
              name="dateOfIncident"
              value={formData.dateOfIncident}
              onChange={handleInputChange}
              className="w-full px-4 py-3 search-input text-white focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-200">
              Witness Information
            </label>
            <input
              type="text"
              name="witnessInfo"
              value={formData.witnessInfo}
              onChange={handleInputChange}
              placeholder="Names or contact info of witnesses"
              className="w-full px-4 py-3 search-input text-white placeholder-blue-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-blue-200">
            Your Contact Information
          </label>
          <input
            type="text"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleInputChange}
            placeholder="Email or phone number for follow-up"
            className="w-full px-4 py-3 search-input text-white placeholder-blue-300 focus:outline-none"
            disabled={formData.anonymous}
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="anonymousFacility"
            name="anonymous"
            checked={formData.anonymous}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 bg-transparent border-blue-500 rounded focus:ring-blue-500"
          />
          <label htmlFor="anonymousFacility" className="text-sm text-blue-200">
            Submit anonymously (no contact information will be stored)
          </label>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-1">Privacy & Security</h4>
              <p className="text-blue-200 text-xs leading-relaxed">
                Your submission is encrypted and stored securely. Information may be used to support 
                legal cases against the VA. You can request deletion of your data at any time.
              </p>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-3"
          disabled={!formData.title || !formData.facility || !formData.type || !formData.description}
        >
          <Send className="h-4 w-4 mr-2" />
          Submit Facility Allegation
        </Button>
      </form>
    </motion.div>
  );
};

export default AllegationForm;