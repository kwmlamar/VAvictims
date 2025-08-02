import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Share2, Download, Heart, MessageCircle, Calendar, Clock,
  Mic, Video, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const PodcastPlayer = ({ podcast, onClose }) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const mediaRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (mediaRef.current) {
      const media = mediaRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(media.duration);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(media.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      media.addEventListener('loadedmetadata', handleLoadedMetadata);
      media.addEventListener('timeupdate', handleTimeUpdate);
      media.addEventListener('ended', handleEnded);

      return () => {
        media.removeEventListener('loadedmetadata', handleLoadedMetadata);
        media.removeEventListener('timeupdate', handleTimeUpdate);
        media.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e) => {
    if (progressRef.current && mediaRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percentage = clickX / width;
      const newTime = percentage * duration;
      mediaRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      if (isMuted) {
        mediaRef.current.volume = volume;
        setIsMuted(false);
      } else {
        mediaRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const skip = (seconds) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime += seconds;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const text = `Check out this podcast: ${podcast.title}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        await navigator.clipboard.writeText(url);
        toast({
          title: 'Link Copied',
          description: 'Podcast link copied to clipboard',
        });
        return;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? 'Removed from favorites' : 'Added to favorites',
      description: isLiked ? 'Podcast removed from your favorites' : 'Podcast added to your favorites',
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = podcast.media_type === 'video' ? podcast.video_url : podcast.audio_url;
    link.download = `${podcast.title}.${podcast.media_type === 'video' ? 'mp4' : 'mp3'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="ios-card max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {podcast.media_type === 'video' ? (
                <Video className="h-8 w-8 text-red-400" />
              ) : (
                <Mic className="h-8 w-8 text-blue-400" />
              )}
              <div>
                <h2 className="text-xl font-bold text-white">Podcast Player</h2>
                <p className="text-blue-200 text-sm">
                  Episode {podcast.episode_number} • {formatTime(duration)}
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-gray-400">
              ×
            </Button>
          </div>

          {/* Media Player */}
          <div className="relative">
            {podcast.media_type === 'video' ? (
              <video
                ref={mediaRef}
                className="w-full rounded-lg"
                poster={podcast.thumbnail_url}
                controls={false}
              >
                <source src={podcast.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <Mic className="h-12 w-12 text-white" />
                  <div className="text-white">
                    <h3 className="text-lg font-semibold">{podcast.title}</h3>
                    <p className="text-blue-100">{podcast.description}</p>
                  </div>
                </div>
                <audio
                  ref={mediaRef}
                  src={podcast.audio_url}
                  preload="metadata"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div
                ref={progressRef}
                className="w-full h-2 bg-gray-700 rounded-full cursor-pointer relative"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-100"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skip(-10)}
                className="text-gray-400 hover:text-white"
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                onClick={togglePlay}
                className="bg-blue-600 hover:bg-blue-700 w-12 h-12 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => skip(10)}
                className="text-gray-400 hover:text-white"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-gray-400 hover:text-white"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`${isLiked ? 'text-red-400' : 'text-gray-400'} hover:text-red-400`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShare(!showShare)}
                  className="text-gray-400 hover:text-white"
                >
                  <Share2 className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-gray-400 hover:text-white"
                >
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Share Options */}
            {showShare && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-4 space-y-2"
              >
                <h4 className="text-sm font-medium text-white mb-2">Share Podcast</h4>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleShare('twitter')}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Twitter
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleShare('facebook')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Facebook
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleShare('linkedin')}
                    className="bg-blue-700 hover:bg-blue-800"
                  >
                    LinkedIn
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleShare('copy')}
                    variant="outline"
                  >
                    Copy Link
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Podcast Info */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-white mb-2">{podcast.title}</h3>
            <p className="text-blue-200 mb-4">{podcast.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(podcast.publish_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {podcast.tags && podcast.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {podcast.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PodcastPlayer; 