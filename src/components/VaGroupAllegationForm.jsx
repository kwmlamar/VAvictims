import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertTriangle, ShieldAlert, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const VaGroupAllegationForm = ({ onSubmit }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    vaGroup: '',
    complicityType: '',
    description: '',
    dateOfIncident: '',
    involvedPersonnel: '',
    contactInfo: '',
    anonymous: false
  });

  const vaGroups = [
    'OIG (Office of Inspector General)',
    'OGC (Office of General Counsel)',
    'HR (Human Resources)',
    'VA Police',
    'VA Central Office (VACO)',
    'VISN Leadership',
    'VBA (Veterans Benefits Administration)',
    'VHA (Veterans Health Administration)',
    'OAWP (Office of Accountability and Whistleblower Protection)',
    'Other VA Entity'
  ];

  const complicityTypes = [
    'Cover-up of Issues',
    'Complicity in Wrongdoing',
    'Obstruction of Justice/Investigation',
    'Retaliation (by VA Group)',
    'Interference with Reporting',
    'Witness Tampering',
    'Withholding/Tampering Evidence',
    'Perjury/False Statements',
    'Fraud (by VA Group)',
    'Rights Violations (by VA Group)',
    'Coercion',
    'Failure to Act/Negligence',
    'Mismanagement of Resources',
    'Other Integrity Violation'
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
    if (!formData.title || !formData.vaGroup || !formData.complicityType || !formData.description) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please fill in all required fields for VA Group allegation.",
        variant: "destructive",
      });
      return;
    }

    const submissionData = {
      complaint_type: 'VA Group Complicity/Integrity Violation', 
      va_group: formData.vaGroup,
      complicity_type: formData.complicityType,
      description: formData.description,
      date_of_incident: formData.dateOfIncident || null,
      contact_email: formData.anonymous ? null : formData.contactInfo, 
      is_anonymous: formData.anonymous,
      status: 'pending',
      facility_name_submitted: `Allegation against ${formData.vaGroup}`,
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
        onSubmit({ ...formData, id: data[0].id, va_group: formData.vaGroup, complicity_type: formData.complicityType }); 
        setFormData({
          title: '',
          vaGroup: '',
          complicityType: '',
          description: '',
          dateOfIncident: '',
          involvedPersonnel: '',
          contactInfo: '',
          anonymous: false
        });
      }
    } catch (error) {
      console.error("Error submitting VA Group allegation:", error);
      toast({
        title: "❌ Submission Failed",
        description: "Could not submit your VA Group allegation. Please try again. " + error.message,
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
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
          <ShieldAlert className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Submit VA Group Allegation</h2>
          <p className="text-blue-200 text-sm">Report cover-ups, complicity, or integrity violations by VA entities</p>
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
            placeholder="Brief summary (e.g., OIG cover-up of safety report)"
            className="w-full px-4 py-3 search-input text-white placeholder-blue-300 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-200">
              VA Group Involved *
            </label>
            <Select value={formData.vaGroup} onValueChange={(value) => handleSelectChange('vaGroup', value)} required>
              <SelectTrigger className="search-input text-white">
                <SelectValue placeholder="Select VA Group" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {vaGroups.map((group) => (
                  <SelectItem key={group} value={group} className="text-white hover:bg-slate-700">
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-200">
              Type of Complicity/Violation *
            </label>
            <Select value={formData.complicityType} onValueChange={(value) => handleSelectChange('complicityType', value)} required>
              <SelectTrigger className="search-input text-white">
                <SelectValue placeholder="Select type of violation" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {complicityTypes.map((type) => (
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
            placeholder="Provide a detailed account of the VA group's actions, including specific examples, dates, and how it constitutes a violation..."
            rows={6}
            className="w-full px-4 py-3 search-input text-white placeholder-blue-300 focus:outline-none resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-200">
              Date of Incident/Observation
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
              Involved Personnel (if known)
            </label>
            <input
              type="text"
              name="involvedPersonnel"
              value={formData.involvedPersonnel}
              onChange={handleInputChange}
              placeholder="Names or positions of VA personnel involved"
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
            id="anonymousGroup"
            name="anonymous"
            checked={formData.anonymous}
            onChange={handleInputChange}
            className="w-4 h-4 text-red-600 bg-transparent border-red-500 rounded focus:ring-red-500"
          />
          <label htmlFor="anonymousGroup" className="text-sm text-blue-200">
            Submit anonymously (no contact information will be stored)
          </label>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-400 mb-1">Warning: High Sensitivity</h4>
              <p className="text-blue-200 text-xs leading-relaxed">
                Allegations against VA entities like OIG or OGC are serious. Ensure your information is accurate. 
                Your submission is encrypted. Consider legal counsel if you have concerns about retaliation.
              </p>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 py-3"
          disabled={!formData.title || !formData.vaGroup || !formData.complicityType || !formData.description}
        >
          <Send className="h-4 w-4 mr-2" />
          Submit VA Group Allegation
        </Button>
      </form>
    </motion.div>
  );
};

export default VaGroupAllegationForm;