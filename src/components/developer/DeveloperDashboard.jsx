import React from 'react';
import { motion } from 'framer-motion';
import { Code, Database, Server, Folder, Layers, Download, ExternalLink } from 'lucide-react';
import DeveloperInfoCard from '@/components/developer/DeveloperInfoCard';

const DeveloperDashboard = () => {
  const frontendTech = [
    { name: 'Vite', description: 'Build tool for fast development.' },
    { name: 'React 18', description: 'Core UI library.' },
    { name: 'React Router 6', description: 'For client-side routing.' },
    { name: 'TailwindCSS', description: 'Utility-first CSS framework.' },
    { name: 'shadcn/ui', description: 'Reusable UI components.' },
    { name: 'Framer Motion', description: 'For animations and transitions.' },
    { name: 'Lucide React', description: 'Icon library.' },
  ];

  const backendServices = [
    { name: 'Supabase', description: 'Backend-as-a-Service platform.' },
    { name: 'PostgreSQL', description: 'Database for all application data.' },
    { name: 'Supabase Auth', description: 'User authentication and management.' },
    { name: 'Supabase Storage', description: 'For file uploads (PDFs, images).' },
    { name: 'Edge Functions', description: 'Serverless functions for custom logic.' },
  ];

  const projectStructure = [
    { name: 'src/pages', description: 'Top-level route components (e.g., Dashboard, UserPortal).' },
    { name: 'src/components', description: 'Reusable UI components (e.g., ScoreCard, Button).' },
    { name: 'src/lib', description: 'Utility functions and Supabase client setup.' },
    { name: 'src/assets', description: 'Static assets like images and fonts (if any).' },
    { name: 'public/', description: 'Static files served directly by the server.' },
  ];
  
  const databaseInfo = {
    title: "Database Tables",
    icon: Database,
    items: ["users", "va_facilities", "user_submitted_complaints", "scorecards", "scraped_data", "web_sources", "developer_notes"],
    description: "Core tables storing application data. Schema includes relationships for facilities, users, and complaints."
  };

  const storageInfo = {
    title: "Storage Buckets",
    icon: Folder,
    items: ["complaint_pdfs", "oig_reports", "legal_documents", "media_files", "scraped_content"],
    description: "Dedicated buckets for storing different types of user and system-generated files securely."
  };

  const functionsInfo = {
    title: "Edge Functions",
    icon: Server,
    items: ["daily-data-scraper", "process-pdf-document"],
    description: "Serverless functions for running backend logic like data scraping and document processing."
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-bold text-white">Project Architecture</h1>
        <p className="mt-2 text-lg text-blue-200">A high-level overview of the technologies, structure, and services powering this application.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DeveloperInfoCard title="Frontend Stack" icon={Layers} items={frontendTech.map(t => t.name)} description="The frontend is built with a modern, fast, and scalable React-based stack." />
        <DeveloperInfoCard title="Backend Services" icon={Server} items={backendServices.map(t => t.name)} description="The backend is powered by Supabase, providing database, auth, storage, and serverless functions." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <DeveloperInfoCard {...databaseInfo} />
        <DeveloperInfoCard {...storageInfo} />
        <DeveloperInfoCard {...functionsInfo} />
      </div>
      
      <DeveloperInfoCard title="Project File Structure" icon={Folder} items={projectStructure.map(p => p.name)} description="The code is organized into logical directories for pages, components, and utilities to ensure maintainability." />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="ios-card p-6"
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <Download className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Export Full Codebase</h2>
            <p className="mt-2 text-blue-200">
              To get a complete copy of all the raw code and project artifacts for local development or backup, use the export feature.
            </p>
            <p className="mt-4 font-semibold text-white">
              How to Export:
            </p>
            <ol className="list-decimal list-inside mt-2 text-blue-200 space-y-1">
              <li>Click the 'Hostinger Horizons' dropdown menu at the top-left of your screen.</li>
              <li>Select the 'Export Project' button.</li>
              <li>A .zip file containing the entire project will be downloaded to your computer.</li>
            </ol>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeveloperDashboard;