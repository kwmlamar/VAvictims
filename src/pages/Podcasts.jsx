import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Mic, Video, Play, Clock, Calendar, Heart, Share2, 
  Search, Filter, SortAsc, SortDesc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import PodcastPlayer from '@/components/PodcastPlayer';
import SocialSharing from '@/components/SocialSharing';

const Podcasts = () => {
  const { toast } = useToast();
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Podcasts table may not exist yet:', error.message);
        setPodcasts([]);
        setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredAndSortedPodcasts = podcasts
    .filter(podcast => {
      const matchesSearch = podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          podcast.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || podcast.media_type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return (a.duration || 0) - (b.duration || 0);
        default:
          return 0;
      }
    });

  const handlePlayPodcast = (podcast) => {
    setSelectedPodcast(podcast);
  };

  const handleClosePlayer = () => {
    setSelectedPodcast(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading podcasts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Podcasts - VA Victims</title>
        <meta name="description" content="Listen to podcasts about VA accountability, veteran support, and healthcare transparency." />
      </Helmet>

      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Mic className="h-12 w-12 text-blue-400" />
              <h1 className="text-4xl font-bold">Podcasts</h1>
            </div>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Listen to stories, insights, and discussions about VA accountability and veteran support
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-4"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search podcasts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 search-input text-white"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 search-input text-white"
                >
                  <option value="all">All Types</option>
                  <option value="audio">Audio Only</option>
                  <option value="video">Video Only</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 search-input text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Alphabetical</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Podcasts Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAndSortedPodcasts.map((podcast, index) => (
              <motion.div
                key={podcast.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="ios-card p-6 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer group"
                onClick={() => handlePlayPodcast(podcast)}
              >
                {/* Thumbnail */}
                <div className="relative mb-4">
                  {podcast.thumbnail_url ? (
                    <img
                      src={podcast.thumbnail_url}
                      alt={podcast.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      {podcast.media_type === 'video' ? (
                        <Video className="h-12 w-12 text-white" />
                      ) : (
                        <Mic className="h-12 w-12 text-white" />
                      )}
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 rounded-full p-4">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-300">
                      Episode {podcast.episode_number || 'N/A'}
                    </span>
                    <div className="flex items-center space-x-2">
                      {podcast.media_type === 'video' ? (
                        <Video className="h-4 w-4 text-red-400" />
                      ) : (
                        <Mic className="h-4 w-4 text-blue-400" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white line-clamp-2">
                    {podcast.title}
                  </h3>

                  <p className="text-blue-200 text-sm line-clamp-3">
                    {podcast.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(podcast.duration)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(podcast.publish_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {podcast.tags && podcast.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {podcast.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPodcast(podcast);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle like functionality
                        }}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      
                      <SocialSharing
                        url={window.location.href}
                        title={podcast.title}
                        description={podcast.description}
                        hashtags={podcast.tags || []}
                        variant="compact"
                        platforms={['twitter', 'facebook', 'copy']}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredAndSortedPodcasts.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Mic className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No podcasts found</h3>
              <p className="text-blue-200">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Check back soon for new episodes'
                }
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Podcast Player Modal */}
      {selectedPodcast && (
        <PodcastPlayer
          podcast={selectedPodcast}
          onClose={handleClosePlayer}
        />
      )}
    </>
  );
};

export default Podcasts; 