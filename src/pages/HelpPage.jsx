import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, Phone, Mail, MessageCircle, Shield, 
  FileText, Users, Heart, AlertTriangle, CheckCircle,
  ExternalLink, ChevronDown, ChevronUp, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import SocialSharing from '@/components/SocialSharing';
import { AnimatePresence } from 'framer-motion';

const HelpPage = () => {
  const { toast } = useToast();
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const emergencyContacts = [
    {
      name: 'Veterans Crisis Line',
      phone: '1-800-273-8255',
      description: '24/7 confidential support for veterans in crisis',
      type: 'emergency'
    },
    {
      name: 'National Suicide Prevention Lifeline',
      phone: '988',
      description: '24/7 suicide prevention and crisis support',
      type: 'emergency'
    },
    {
      name: 'VA Benefits Hotline',
      phone: '1-800-827-1000',
      description: 'Information about VA benefits and services',
      type: 'support'
    },
    {
      name: 'VA Health Care',
      phone: '1-877-222-8387',
      description: 'VA health care enrollment and information',
      type: 'support'
    }
  ];

  const resources = [
    {
      title: 'VA Benefits Guide',
      description: 'Complete guide to VA benefits and how to apply',
      url: 'https://www.va.gov/benefits/',
      category: 'benefits'
    },
    {
      title: 'Mental Health Resources',
      description: 'VA mental health services and support programs',
      url: 'https://www.mentalhealth.va.gov/',
      category: 'health'
    },
    {
      title: 'Legal Assistance',
      description: 'Free legal help for veterans and their families',
      url: 'https://www.va.gov/legal-aid/',
      category: 'legal'
    },
    {
      title: 'Housing Assistance',
      description: 'VA housing programs and homeless veteran services',
      url: 'https://www.va.gov/housing-assistance/',
      category: 'housing'
    },
    {
      title: 'Education Benefits',
      description: 'GI Bill and other education benefits for veterans',
      url: 'https://www.va.gov/education/',
      category: 'education'
    },
    {
      title: 'Employment Services',
      description: 'Job training and employment assistance for veterans',
      url: 'https://www.va.gov/careers-employment/',
      category: 'employment'
    }
  ];

  const faqs = [
    {
      question: 'How do I report misconduct at a VA facility?',
      answer: 'You can report misconduct through our platform by submitting an allegation form, or directly to the VA Office of Inspector General. Always document incidents with dates, times, and names of involved parties.',
      category: 'reporting'
    },
    {
      question: 'What should I do if I experience retaliation?',
      answer: 'Document all incidents of retaliation immediately. Contact the VA Office of Inspector General and consider reaching out to veteran advocacy organizations. Retaliation is illegal and should be reported.',
      category: 'legal'
    },
    {
      question: 'How can I access my VA medical records?',
      answer: 'You can access your VA medical records through the My HealtheVet portal, by requesting them from your VA facility, or through the VA Blue Button feature.',
      category: 'health'
    },
    {
      question: 'What benefits am I entitled to as a veteran?',
      answer: 'Veterans may be eligible for health care, disability compensation, education benefits, home loans, and more. Contact the VA Benefits Hotline or visit va.gov/benefits for a complete assessment.',
      category: 'benefits'
    },
    {
      question: 'How do I appeal a VA decision?',
      answer: 'You can appeal VA decisions through the Board of Veterans Appeals. The process involves filing a Notice of Disagreement and potentially requesting a hearing. Consider consulting with a veterans service organization.',
      category: 'legal'
    },
    {
      question: 'What mental health services are available?',
      answer: 'VA offers comprehensive mental health services including counseling, therapy, medication management, and crisis intervention. Services are available at VA medical centers and through community providers.',
      category: 'health'
    }
  ];

  const supportGroups = [
    {
      name: 'PTSD Support Group',
      description: 'Weekly meetings for veterans dealing with PTSD',
      schedule: 'Every Tuesday, 6:00 PM',
      contact: 'ptsd-support@vavictims.com'
    },
    {
      name: 'Families of Veterans',
      description: 'Support for family members of veterans',
      schedule: 'Every Thursday, 7:00 PM',
      contact: 'families@vavictims.com'
    },
    {
      name: 'Women Veterans Group',
      description: 'Support group specifically for women veterans',
      schedule: 'Every Saturday, 10:00 AM',
      contact: 'women-vets@vavictims.com'
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContactClick = (contact) => {
    if (contact.type === 'emergency') {
      toast({
        title: 'Emergency Contact',
        description: `Calling ${contact.name} at ${contact.phone}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <HelpCircle className="h-12 w-12 text-blue-400" />
            <h1 className="text-4xl font-bold">Help & Support</h1>
          </div>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            You're not alone. We're here to help you navigate the VA system and get the support you deserve.
          </p>
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <span>Emergency Contacts</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`ios-card p-6 border-l-4 ${
                  contact.type === 'emergency' ? 'border-red-500' : 'border-blue-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{contact.name}</h3>
                    <p className="text-blue-200 text-sm mb-2">{contact.description}</p>
                    <p className="text-2xl font-bold text-blue-400">{contact.phone}</p>
                  </div>
                  <Button
                    onClick={() => handleContactClick(contact)}
                    className={`${
                      contact.type === 'emergency' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-400" />
            <span>Resources & Information</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="ios-card p-6 hover:bg-gray-800/50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{resource.title}</h3>
                <p className="text-blue-200 text-sm mb-4">{resource.description}</p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Resource
                  </a>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <HelpCircle className="h-6 w-6 text-blue-400" />
            <span>Frequently Asked Questions</span>
          </h2>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 search-input text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="ios-card"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                  {expandedFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-blue-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-blue-400" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedFAQ === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-6"
                    >
                      <p className="text-blue-200">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Support Groups */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-400" />
            <span>Support Groups</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportGroups.map((group, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="ios-card p-6 text-center"
              >
                <Heart className="h-8 w-8 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{group.name}</h3>
                <p className="text-blue-200 text-sm mb-4">{group.description}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">{group.schedule}</p>
                  <p className="text-blue-300">{group.contact}</p>
                </div>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Join Group
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <Mail className="h-6 w-6 text-blue-400" />
            <span>Get Help</span>
          </h2>
          <div className="ios-card p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Need Immediate Help?</h3>
                <p className="text-blue-200 mb-6">
                  If you're in crisis or need immediate assistance, please use the emergency contacts above. 
                  For non-emergency support, we're here to help.
                </p>
                <div className="space-y-4">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Live Chat
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Share This Page</h3>
                <p className="text-blue-200 mb-6">
                  Help other veterans find the support they need by sharing this page.
                </p>
                <SocialSharing
                  title="VA Victims Help & Support"
                  description="Resources and support for veterans and their families"
                  hashtags={['vavictims', 'veterans', 'support', 'help']}
                  variant="compact"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Safety Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ios-card p-6 border-l-4 border-yellow-500 bg-yellow-500/10"
        >
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-yellow-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Safety Notice</h3>
              <p className="text-blue-200">
                If you're experiencing thoughts of self-harm or suicide, please call the Veterans Crisis Line 
                at 1-800-273-8255 or text 838255. You're not alone, and help is available 24/7.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpPage; 