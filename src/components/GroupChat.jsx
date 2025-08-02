import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, Paperclip, Image, File, 
  Users, Shield, Flag, MoreVertical, Smile,
  Mic, Video, Phone, Settings, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const GroupChat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRecorderRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    setupRealtimeSubscription();
    fetchOnlineUsers();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = messages.filter(message =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.user_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(messages);
    }
  }, [searchTerm, messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          user_profiles:user_id (
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.warn('Chat tables may not exist yet:', error.message);
        setMessages([]);
        return;
      }
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('chat_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const fetchOnlineUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, name, avatar_url, last_seen')
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Online in last 5 minutes

      if (error) {
        console.warn('User profiles table may not exist yet:', error.message);
        setOnlineUsers([]);
        return;
      }
      setOnlineUsers(data || []);
    } catch (error) {
      console.error('Error fetching online users:', error);
      setOnlineUsers([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const messageData = {
        content: newMessage,
        user_id: user.id,
        message_type: 'text',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert([messageData]);

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Database Error',
          description: 'Chat system not set up yet. Run the database script first.',
          variant: 'destructive',
        });
        return;
      }

      setNewMessage('');
      setIsTyping(false);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Database Error',
        description: 'Chat system not set up yet. Run the database script first.',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileName = `chat/${Date.now()}-${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat_files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat_files')
        .getPublicUrl(fileName);

      const messageData = {
        content: `Shared a file: ${file.name}`,
        user_id: user.id,
        message_type: 'file',
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert([messageData]);

      if (error) {
        console.error('Error sharing file:', error);
        toast({
          title: 'Database Error',
          description: 'Chat system not set up yet. Run the database script first.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'File Shared',
        description: 'File shared successfully',
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Database Error',
        description: 'Chat system not set up yet. Run the database script first.',
        variant: 'destructive',
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'voice-message.webm', { type: 'audio/webm' });
        
        // Upload audio file
        const { data: { user } } = await supabase.auth.getUser();
        const fileName = `chat/audio/${Date.now()}-voice-message.webm`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat_files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('chat_files')
          .getPublicUrl(fileName);

        const messageData = {
          content: 'Voice message',
          user_id: user.id,
          message_type: 'audio',
          file_url: urlData.publicUrl,
          created_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('chat_messages')
          .insert([messageData]);

        if (error) {
          console.error('Error sending voice message:', error);
          toast({
            title: 'Database Error',
            description: 'Chat system not set up yet. Run the database script first.',
            variant: 'destructive',
          });
          return;
        }
      };

      mediaRecorder.start();
      audioRecorderRef.current = mediaRecorder;
      setIsRecording(true);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Failed',
        description: 'Failed to start recording',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const reportMessage = async (messageId) => {
    try {
      const { error } = await supabase
        .from('reported_messages')
        .insert([{
          message_id: messageId,
          reported_at: new Date().toISOString(),
          status: 'pending'
        }]);

      if (error) {
        console.error('Error reporting message:', error);
        toast({
          title: 'Database Error',
          description: 'Chat system not set up yet. Run the database script first.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Message Reported',
        description: 'Message has been reported to moderators',
      });

    } catch (error) {
      console.error('Error reporting message:', error);
      toast({
        title: 'Database Error',
        description: 'Chat system not set up yet. Run the database script first.',
        variant: 'destructive',
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageTypeIcon = (messageType) => {
    switch (messageType) {
      case 'file':
        return <File className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'audio':
        return <Mic className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-6 w-6 text-blue-400" />
              <div>
                <h2 className="text-lg font-semibold text-white">Victims Support Chat</h2>
                <p className="text-sm text-blue-200">{onlineUsers.length} online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Online Users */}
        <div className="flex-1 p-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Online Members</h3>
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="text-white text-sm">{user.name || 'Anonymous'}</p>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-gray-400">online</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Support Group</h3>
              <p className="text-sm text-blue-200">A safe space for victims to connect and support each other</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Shield className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Users className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {filteredMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.user_id === 'current-user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${message.user_id === 'current-user' ? 'bg-blue-600' : 'bg-gray-700'} rounded-lg p-3`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-blue-200">
                      {message.user_profiles?.name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    {getMessageTypeIcon(message.message_type)}
                    <div className="flex-1">
                      {message.message_type === 'file' && (
                        <div className="flex items-center space-x-2 p-2 bg-gray-600 rounded">
                          <File className="h-4 w-4" />
                          <span className="text-sm">{message.file_name}</span>
                        </div>
                      )}
                      {message.message_type === 'audio' && (
                        <div className="flex items-center space-x-2 p-2 bg-gray-600 rounded">
                          <Mic className="h-4 w-4" />
                          <audio controls className="h-8">
                            <source src={message.file_url} type="audio/webm" />
                          </audio>
                        </div>
                      )}
                      <p className="text-white text-sm">{message.content}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => reportMessage(message.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Flag className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-5 w-5" />
            </Button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="w-full px-4 py-2 search-input text-white"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              className={isRecording ? 'text-red-400' : 'text-gray-400'}
            >
              <Mic className="h-5 w-5" />
            </Button>

            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />
        </div>
      </div>
    </div>
  );
};

export default GroupChat; 