import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Terminal, Cpu, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DeveloperProcessor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('idle');

  const runProcessor = async () => {
    setLoading(true);
    setStatus('running');
    setLogs(['[INFO] Invoking data processor function...']);

    try {
      const { data, error } = await supabase.functions.invoke('process-scraped-data');

      if (error) {
        throw error;
      }

      setLogs(prev => [...prev, '[SUCCESS] Processor function invoked successfully.', `[DATA] ${JSON.stringify(data, null, 2)}`]);
      setStatus('success');
      toast({
        title: 'Processing Complete',
        description: data.message || 'The data processor has finished its run.',
      });
    } catch (error) {
      const errorMessage = error.context?.error || error.message;
      setLogs(prev => [...prev, `[ERROR] ${errorMessage}`]);
      setStatus('error');
      toast({
        title: 'Processing Failed',
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
        return { icon: <Cpu className="h-5 w-5" />, text: 'Idle - Ready to run', color: 'text-gray-400' };
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
        <h2 className="text-2xl font-bold text-white mb-2">Data Processor Control</h2>
        <p className="text-blue-200 mb-6">
          Manually trigger the data processor to extract structured information from raw scraped data. This process runs a Supabase Edge Function named <code>process-scraped-data</code>. It reads from <code>scraped_data</code>, parses the content, and upserts facility information into the <code>va_facilities</code> table.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button onClick={runProcessor} disabled={loading} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              <><Cpu className="mr-2 h-4 w-4" /> Run Processor</>
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
          Processor Logs
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

export default DeveloperProcessor;