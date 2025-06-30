import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Trash2, RefreshCw } from 'lucide-react';

const DeveloperNotes = () => {
  const { toast } = useToast();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('developer_notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching notes', description: error.message, variant: 'destructive' });
    } else {
      setNotes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSaveNote = async () => {
    if (newNote.trim() === '') {
      toast({ title: 'Note is empty', description: 'Please write something before saving.', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('developer_notes')
      .insert([{ note_content: newNote }]);

    if (error) {
      toast({ title: 'Error saving note', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Note saved successfully!' });
      setNewNote('');
      fetchNotes();
    }
  };

  const handleDeleteNote = async (id) => {
    const { error } = await supabase
      .from('developer_notes')
      .delete()
      .match({ id });

    if (error) {
      toast({ title: 'Error deleting note', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Note deleted.' });
      fetchNotes();
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-bold text-white">Developer Notes</h1>
        <p className="mt-2 text-lg text-blue-200">A private space for your thoughts, ideas, and to-do lists.</p>
      </motion.div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">New Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Type your note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[150px] bg-gray-900 border-gray-600 text-white focus:ring-blue-500"
          />
          <Button onClick={handleSaveNote} className="bg-blue-600 hover:bg-blue-700">
            <Save className="mr-2 h-4 w-4" /> Save Note
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Saved Notes</h2>
            <Button variant="ghost" size="icon" onClick={fetchNotes} disabled={loading}>
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
        </div>
        {loading ? (
          <p className="text-blue-300">Loading notes...</p>
        ) : notes.length > 0 ? (
          notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4 flex justify-between items-start">
                  <p className="text-blue-100 whitespace-pre-wrap flex-1 mr-4">{note.note_content}</p>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="text-xs text-gray-400">{new Date(note.created_at).toLocaleString()}</span>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteNote(note.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <p className="text-blue-300">No notes found. Time to write something!</p>
        )}
      </div>
    </div>
  );
};

export default DeveloperNotes;