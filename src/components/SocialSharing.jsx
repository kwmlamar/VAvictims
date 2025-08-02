import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, Twitter, Facebook, Linkedin, Instagram, 
  MessageCircle, Mail, Link, Copy, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const SocialSharing = ({ 
  url, 
  title, 
  description, 
  image, 
  hashtags = [], 
  platforms = ['twitter', 'facebook', 'linkedin', 'copy'],
  variant = 'default' // 'default', 'compact', 'floating'
}) => {
  const { toast } = useToast();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = {
    url: url || window.location.href,
    title: title || 'Check out this content on VA Victims',
    description: description || 'Supporting veterans and their families',
    hashtags: hashtags.join(' ')
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}&hashtags=${encodeURIComponent(shareData.hashtags)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
    instagram: `https://www.instagram.com/?url=${encodeURIComponent(shareData.url)}`,
    email: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(`${shareData.description}\n\n${shareData.url}`)}`,
    sms: `sms:?body=${encodeURIComponent(`${shareData.title} ${shareData.url}`)}`
  };

  const handleShare = async (platform) => {
    try {
      if (platform === 'copy') {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        toast({
          title: 'Link Copied',
          description: 'Link copied to clipboard',
        });
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      if (platform === 'email') {
        window.location.href = shareUrls.email;
        return;
      }

      if (platform === 'sms') {
        window.location.href = shareUrls.sms;
        return;
      }

      const shareUrl = shareUrls[platform];
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }

      toast({
        title: 'Shared Successfully',
        description: `Content shared on ${platform}`,
      });

    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: 'Share Failed',
        description: 'Failed to share content',
        variant: 'destructive',
      });
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageCircle className="h-4 w-4" />;
      case 'copy':
        return copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'twitter':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'facebook':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'linkedin':
        return 'bg-blue-700 hover:bg-blue-800';
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600';
      case 'email':
        return 'bg-gray-600 hover:bg-gray-700';
      case 'sms':
        return 'bg-green-600 hover:bg-green-700';
      case 'copy':
        return copied ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex space-x-2">
        {platforms.map((platform) => (
          <Button
            key={platform}
            size="sm"
            onClick={() => handleShare(platform)}
            className={`${getPlatformColor(platform)} text-white`}
          >
            {getPlatformIcon(platform)}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className="relative">
        <Button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="bg-blue-600 hover:bg-blue-700 rounded-full w-12 h-12"
        >
          <Share2 className="h-5 w-5" />
        </Button>

        <AnimatePresence>
          {showShareMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg p-2 shadow-lg z-50"
            >
              <div className="grid grid-cols-3 gap-2">
                {platforms.map((platform) => (
                  <Button
                    key={platform}
                    size="sm"
                    onClick={() => {
                      handleShare(platform);
                      setShowShareMenu(false);
                    }}
                    className={`${getPlatformColor(platform)} text-white w-10 h-10 p-0`}
                  >
                    {getPlatformIcon(platform)}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default variant
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Share2 className="h-5 w-5 text-blue-400" />
        <span className="text-white font-medium">Share this content</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {platforms.map((platform) => (
          <Button
            key={platform}
            onClick={() => handleShare(platform)}
            className={`${getPlatformColor(platform)} text-white flex items-center space-x-2`}
          >
            {getPlatformIcon(platform)}
            <span className="capitalize">{platform}</span>
          </Button>
        ))}
      </div>

      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-400">Suggested hashtags:</span>
          {hashtags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded cursor-pointer hover:bg-blue-500/30"
              onClick={() => {
                navigator.clipboard.writeText(`#${tag}`);
                toast({
                  title: 'Hashtag Copied',
                  description: `#${tag} copied to clipboard`,
                });
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialSharing; 