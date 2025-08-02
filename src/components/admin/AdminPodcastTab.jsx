import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Video, Upload, Play, Pause, Edit, Trash2, Share, Calendar, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const AdminPodcastTab = () => {
  const { toast } = useToast();
  const [podcasts, setPodcasts] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    episode_number: '',
    duration: '',
    media_type: 'audio', // 'audio' or 'video'
    file: null,
    thumbnail: null,
    tags: '',
    is_published: false,
    publish_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Podcasts table may not exist yet:', error.message);
        setPodcasts([]);
        return;
      }
      setPodcasts(data || []);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      setPodcasts([]);
      toast({
        title: 'Info',
        description: 'Podcast system not set up yet. Run the database script first.',
      });
    }
  };

  const handleFileUpload = async (file, type) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const fileName = `podcasts/${type}/${Date.now()}-${file.name}`;
      const bucket = type === 'video' ? 'podcast_videos' : 'podcast_audio';

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setFormData(prev => ({
        ...prev,
        [type === 'video' ? 'video_url' : 'audio_url']: urlData.publicUrl,
        file_path: fileName
      }));

      toast({
        title: 'Upload Successful',
        description: `${type} file uploaded successfully`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const podcastData = {
        title: formData.title,
        description: formData.description,
        episode_number: formData.episode_number,
        duration: formData.duration,
        media_type: formData.media_type,
        audio_url: formData.audio_url,
        video_url: formData.video_url,
        thumbnail_url: formData.thumbnail_url,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        is_published: formData.is_published,
        publish_date: formData.publish_date,
        created_at: new Date().toISOString()
      };

      if (editingPodcast) {
        const { error } = await supabase
          .from('podcasts')
          .update(podcastData)
          .eq('id', editingPodcast.id);

        if (error) {
          console.error('Error updating podcast:', error);
          toast({
            title: 'Database Error',
            description: 'Podcasts table may not exist. Run the database script first.',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Podcast Updated',
          description: 'Podcast updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('podcasts')
          .insert([podcastData]);

        if (error) {
          console.error('Error creating podcast:', error);
          toast({
            title: 'Database Error',
            description: 'Podcasts table may not exist. Run the database script first.',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Podcast Created',
          description: 'New podcast created successfully',
        });
      }

      resetForm();
      fetchPodcasts();
      setIsCreating(false);
      setEditingPodcast(null);

    } catch (error) {
      console.error('Error saving podcast:', error);
      toast({
        title: 'Database Error',
        description: 'Podcasts table may not exist. Run the database script first.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      episode_number: '',
      duration: '',
      media_type: 'audio',
      file: null,
      thumbnail: null,
      tags: '',
      is_published: false,
      publish_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleEdit = (podcast) => {
    setEditingPodcast(podcast);
    setFormData({
      title: podcast.title,
      description: podcast.description,
      episode_number: podcast.episode_number,
      duration: podcast.duration,
      media_type: podcast.media_type,
      audio_url: podcast.audio_url,
      video_url: podcast.video_url,
      thumbnail_url: podcast.thumbnail_url,
      tags: podcast.tags?.join(', ') || '',
      is_published: podcast.is_published,
      publish_date: podcast.publish_date?.split('T')[0] || new Date().toISOString().split('T')[0]
    });
    setIsCreating(true);
  };

  const handleDelete = async (podcastId) => {
    if (!confirm('Are you sure you want to delete this podcast?')) return;

    try {
      const { error } = await supabase
        .from('podcasts')
        .delete()
        .eq('id', podcastId);

      if (error) {
        console.error('Error deleting podcast:', error);
        toast({
          title: 'Database Error',
          description: 'Podcasts table may not exist. Run the database script first.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Podcast Deleted',
        description: 'Podcast deleted successfully',
      });

      fetchPodcasts();
    } catch (error) {
      console.error('Error deleting podcast:', error);
      toast({
        title: 'Database Error',
        description: 'Podcasts table may not exist. Run the database script first.',
        variant: 'destructive',
      });
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mic className="h-8 w-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Podcast Management</h2>
            <p className="text-blue-200">Create and manage audio/video podcasts</p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isCreating ? 'Cancel' : 'Create New Podcast'}
        </Button>
      </div>

      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ios-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            {editingPodcast ? 'Edit Podcast' : 'Create New Podcast'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-blue-200">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 search-input text-white"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-blue-200">Episode Number</label>
                <input
                  type="text"
                  value={formData.episode_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, episode_number: e.target.value }))}
                  className="w-full px-3 py-2 search-input text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-blue-200">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 search-input text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-blue-200">Media Type</label>
                <select
                  value={formData.media_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, media_type: e.target.value }))}
                  className="w-full px-3 py-2 search-input text-white"
                >
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-blue-200">Duration (seconds)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 search-input text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-blue-200">Publish Date</label>
                <input
                  type="date"
                  value={formData.publish_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, publish_date: e.target.value }))}
                  className="w-full px-3 py-2 search-input text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-blue-200">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 search-input text-white"
                placeholder="victims, VA, healthcare, etc."
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-blue-200">
                  {formData.media_type === 'video' ? 'Video File' : 'Audio File'} *
                </label>
                <input
                  type="file"
                  accept={formData.media_type === 'video' ? 'video/*' : 'audio/*'}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleFileUpload(file, formData.media_type);
                    }
                  }}
                  className="w-full px-3 py-2 search-input text-white"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-blue-200">Thumbnail Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleFileUpload(file, 'thumbnail');
                    }
                  }}
                  className="w-full px-3 py-2 search-input text-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="is_published" className="text-sm text-blue-200">
                Publish immediately
              </label>
            </div>

            <div className="flex space-x-3">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingPodcast ? 'Update Podcast' : 'Create Podcast'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingPodcast(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Published Podcasts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {podcasts.map((podcast) => (
            <motion.div
              key={podcast.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="ios-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {podcast.media_type === 'video' ? (
                    <Video className="h-5 w-5 text-red-400" />
                  ) : (
                    <Mic className="h-5 w-5 text-blue-400" />
                  )}
                  <span className="text-sm text-blue-300">
                    Episode {podcast.episode_number}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(podcast)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(podcast.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white">{podcast.title}</h4>
                <p className="text-sm text-blue-200 line-clamp-2">
                  {podcast.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{podcast.duration ? formatDuration(podcast.duration) : 'N/A'}</span>
                <span>{podcast.is_published ? 'Published' : 'Draft'}</span>
              </div>

              {podcast.tags && podcast.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {podcast.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPodcastTab; 