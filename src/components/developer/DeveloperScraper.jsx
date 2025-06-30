import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Terminal, PlayCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DeveloperScraper = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('idle');

  const runScraper = async () => {
    setLoading(true);
    setStatus('running');
    setLogs(['[INFO] Invoking scraper function...']);

    try {
      const { data, error } = await supabase.functions.invoke('daily-data-scraper');

      if (error) {
        throw error;
      }

      setLogs(prev => [...prev, '[SUCCESS] Scraper function invoked successfully.', `[DATA] ${JSON.stringify(data, null, 2)}`]);
      setStatus('success');
      toast({
        title: 'Scraper Run Complete',
        description: data.message || 'The data scraper has finished its run.',
      });
    } catch (error) {
      const errorMessage = error.context?.error || error.message;
      setLogs(prev => [...prev, `[ERROR] ${errorMessage}`]);
      setStatus('error');
      toast({
        title: 'Scraper Run Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    switch(status) {
      case 'running':
        return { icon: <Loader2 className="h-5 w-5 animate-spin" />, text: 'Running...', color: 'text-blue-400' };
      case 'success':
        return { icon: <CheckCircle className="h-5 w-5" />, text: 'Completed Successfully', color: 'text-green-400' };
      case 'error':
        return { icon: <XCircle className="h-5 w-5" />, text: 'Failed', color: 'text-red-400' };
      default:
        return { icon: <PlayCircle className="h-5 w-5" />, text: 'Idle - Ready to run', color: 'text-gray-400' };
    }
  };

  const { icon, text, color } = getStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="ios-card p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Web Scraper Control</h2>
        <p className="text-blue-200 mb-6">
          Manually trigger the web scraper to collect the latest data from configured sources. This process runs a Supabase Edge Function named <code>daily-data-scraper</code>. The function fetches data from URLs in the <code>web_sources</code> table and saves the raw content into the <code>scraped_data</code> table for further processing.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button onClick={runScraper} disabled={loading} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait</>
            ) : (
              <><PlayCircle className="mr-2 h-4 w-4" /> Run Scraper Manually</>
            )}
          </Button>
          <div className={`flex items-center gap-2 p-2 rounded-md ${color}`}>
            {icon}
            <span className="font-medium">{text}</span>
          </div>
        </div>
      </div>

      <div className="ios-card p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Terminal className="mr-3 text-blue-400" />
          Scraper Logs
        </h3>
        <div className="bg-gray-900/50 rounded-lg p-4 h-96 overflow-y-auto custom-scrollbar">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap">
            {logs.map((log, index) => (
              <div key={index} className={`flex items-start ${log.startsWith('[ERROR]') ? 'text-red-400' : log.startsWith('[SUCCESS]') ? 'text-green-400' : ''}`}>
                <span className="mr-2 text-gray-500">{index + 1}</span>
                <span className="flex-1">{log}</span>
              </div>
            ))}
            {logs.length === 0 && <span className="text-gray-500">Logs will appear here...</span>}
          </pre>
        </div>
      </div>
    </motion.div>
  );
};

export default DeveloperScraper;