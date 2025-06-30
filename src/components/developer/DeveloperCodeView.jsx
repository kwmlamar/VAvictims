import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { projectFiles } from '@/data/developerProjectFiles';
import FileTree from '@/components/developer/FileTree';

const DeveloperCodeView = () => {
  const [selectedFile, setSelectedFile] = useState('src/App.jsx');

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-bold text-white">Code & Artifacts</h1>
        <p className="mt-2 text-lg text-blue-200">Browse the complete project source code.</p>
      </motion.div>
      <div className="flex space-x-8 h-[70vh]">
        <aside className="w-1/4 ios-card p-4 overflow-y-auto custom-scrollbar">
          <h2 className="text-xl font-bold mb-4 text-white">File Browser</h2>
          <FileTree files={projectFiles} onSelectFile={setSelectedFile} />
        </aside>
        <main className="w-3/4 flex flex-col ios-card">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-mono text-lg text-blue-300">{selectedFile}</h3>
          </div>
          <div className="flex-1 p-4 overflow-auto custom-scrollbar bg-gray-900/50 rounded-b-lg">
            <pre className="text-sm">
              <code className="language-jsx whitespace-pre-wrap break-words">
                {projectFiles[selectedFile]}
              </code>
            </pre>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeveloperCodeView;