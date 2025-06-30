import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertTriangle, Globe, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const ExternalGroupAllegationForm = ({ onSubmit }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    externalGroup: '',
    violationType: '',
    description: '',
    dateOfIncident: '',
    involvedPersonnel: '',
    contactInfo: '',
    anonymous: false
  });

  const externalGroups = [
    'OSC (Office of Special Counsel)',
    'MSPB (Merit Systems Protection Board)',
    'CAFC (Court of Appeals for the Federal Circuit)',
    'EEOC (Equal Employment Opportunity Commission)',
    'GAO (Government Accountability Office)',
    'DOJ (Department of Justice)',
    'Congressional Committee',
    'State/Local Oversight Body',
    'Other External Oversight Body'
  ];

  const violationTypes = [
    'Denied FOIA/Privacy Act Rights',
    'Perjury/Evidence Tampering in Proceedings',
    'Due Process Violations',
    'Failure to Investigate/Address Complaint',
    'Retaliation (by External Group)',
    'Bias/Conflict of Interest',
    'Unlawful Affirmation/Decision',
    'Constitutional Violations',
    'Obstruction of Justice',
    'Failure to Protect Whistleblower',
    'Other Misconduct/Violation'
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
    if (!formData.title || !formData.externalGroup || !formData.violationType || !formData.description) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please fill in all required fields for External Group allegation.",
        variant: "destructive",
      });
      return;
    }

    const submissionData = {
      complaint_type: 'External Group Violation', 
      external_group: formData.externalGroup,
      external_violation_type: formData.violationType,
      description: formData.description,
      date_of_incident: formData.dateOfIncident || null,
      contact_email: formData.anonymous ? null : formData.contactInfo, 
      is_anonymous: formData.anonymous,
      status: 'pending',
      facility_name_submitted: `Allegation against ${formData.externalGroup}`,
      user_id: null,
      category: 'General'
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
        onSubmit({ ...formData, id: data[0].id, external_group: formData.externalGroup, external_violation_type: formData.violationType }); 
        setFormData({
          title: '',
          externalGroup: '',
          violationType: '',
          description: '',
          dateOfIncident: '',
          involvedPersonnel: '',
          contactInfo: '',
          anonymous: false
        });
      }
    } catch (error) {
      console.error("Error submitting External Group allegation:", error);
      toast({
        title: "❌ Submission Failed",
        description: "Could not submit your External Group allegation. Please try again. " + error.message,
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
        <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
          <Globe className="h-5 w-5 text-teal-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Submit External Group Allegation</h2>
          <p className="text-blue-200 text-sm">Report issues with OSC, MSPB, CAFC, or other external oversight bodies</p>
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
            placeholder="Brief summary (e.g., OSC failed to interview key witnesses)"
            className="w-full px-4 py-3 search-input text-white placeholder-blue-300 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-200">
              External Group Involved *
            </label>
            <Select value={formData.externalGroup} onValueChange={(value) => handleSelectChange('externalGroup', value)} required>
              <SelectTrigger className="search-input text-white">
                <SelectValue placeholder="Select External Group" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {externalGroups.map((group) => (
                  <SelectItem key={group} value={group} className="text-white hover:bg-slate-700">
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-200">
              Type of Violation *
            </label>
            <Select value={formData.violationType} onValueChange={(value) => handleSelectChange('violationType', value)} required>
              <SelectTrigger className="search-input text-white">
                <SelectValue placeholder="Select type of violation" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {violationTypes.map((type) => (
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
            placeholder="Provide a detailed account of the external group's actions or failures, including specific examples, case numbers (if applicable), dates, and how it constitutes a violation..."
            rows={6}
            className="w-full px-4 py-3 search-input text-white placeholder-blue-300 focus:outline-none resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-200">
              Date of Incident/Decision
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
              Involved Personnel/Case Officer (if known)
            </label>
            <input
              type="text"
              name="involvedPersonnel"
              value={formData.involvedPersonnel}
              onChange={handleInputChange}
              placeholder="Names or titles of individuals involved"
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
            id="anonymousExternal"
            name="anonymous"
            checked={formData.anonymous}
            onChange={handleInputChange}
            className="w-4 h-4 text-teal-600 bg-transparent border-teal-500 rounded focus:ring-teal-500"
          />
          <label htmlFor="anonymousExternal" className="text-sm text-blue-200">
            Submit anonymously (no contact information will be stored)
          </label>
        </div>

        <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-teal-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-teal-400 mb-1">Note on External Allegations</h4>
              <p className="text-blue-200 text-xs leading-relaxed">
                Allegations against external oversight bodies are complex. Ensure your information is accurate and well-documented. 
                This platform aims to collect data for broader analysis of systemic issues.
              </p>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 py-3"
          disabled={!formData.title || !formData.externalGroup || !formData.violationType || !formData.description}
        >
          <Send className="h-4 w-4 mr-2" />
          Submit External Group Allegation
        </Button>
      </form>
    </motion.div>
  );
};

export default ExternalGroupAllegationForm;