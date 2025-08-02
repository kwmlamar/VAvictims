import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, StickyNote, Code, BookOpen, Save, RefreshCw, ArrowLeft, Bot, Cpu, Upload } from 'lucide-react';
import DeveloperDashboard from '@/components/developer/DeveloperDashboard';
import DeveloperNotes from '@/components/developer/DeveloperNotes';
import DeveloperCodeView from '@/components/developer/DeveloperCodeView';
import DeveloperScraper from '@/components/developer/DeveloperScraper';
import DeveloperProcessor from '@/components/developer/DeveloperProcessor';
import DeveloperDataUpload from '@/components/developer/DeveloperDataUpload';

const DeveloperPortal = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSave = () => {
    toast({
      title: '🚧 Feature Not Implemented',
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const handleRefresh = () => {
    toast({
      title: 'Refreshing...',
      description: 'Reloading portal data.',
    });
    setTimeout(() => window.location.reload(), 500);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'code', label: 'Code & Artifacts', icon: BookOpen },
    { id: 'scraper', label: 'Scraper Control', icon: Bot },
    { id: 'processor', label: 'Data Processor', icon: Cpu },
    { id: 'upload', label: 'Data Upload', icon: Upload },
    { id: 'notes', label: 'Notes', icon: StickyNote },
  ];

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-gray-900/70 backdrop-blur-lg border-r border-gray-700 flex flex-col p-4"
      >
        <div className="flex items-center space-x-3 mb-10 p-2">
          <Code className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">Dev Portal</h1>
            <p className="text-xs text-blue-300">Project Overview</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'secondary' : 'ghost'}
              className={`w-full justify-start text-base py-6 ${activeTab === item.id ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-gray-700'}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="mt-auto">
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start text-base py-6 hover:bg-gray-700"
          >
            <Link to="/">
              <ArrowLeft className="mr-3 h-5 w-5" />
              Back to Main Site
            </Link>
          </Button>
        </div>
      </motion.aside>

      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
        <div className="absolute top-8 right-8 z-10 flex space-x-2">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button variant="outline" onClick={handleRefresh} className="bg-gray-800/50 border-gray-600 hover:bg-gray-700">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="pt-16"
          >
            {activeTab === 'dashboard' && <DeveloperDashboard />}
            {activeTab === 'code' && <DeveloperCodeView />}
            {activeTab === 'scraper' && <DeveloperScraper />}
            {activeTab === 'processor' && <DeveloperProcessor />}
            {activeTab === 'upload' && <DeveloperDataUpload />}
            {activeTab === 'notes' && <DeveloperNotes />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DeveloperPortal;