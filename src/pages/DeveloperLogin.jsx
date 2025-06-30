import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Code, LogIn } from 'lucide-react';

const DeveloperLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    if (email === 'mg@gs-3.com' && password === 'Lamar2025!') {
      toast({
        title: 'Login Successful',
        description: 'Redirecting to the developer portal...',
      });
      sessionStorage.setItem('devLoggedIn', 'true');
      navigate('/dev/portal');
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="ios-card p-8 space-y-6">
          <div className="text-center">
            <Code className="mx-auto h-12 w-12 text-blue-400" />
            <h2 className="mt-4 text-3xl font-bold text-white">Developer Portal</h2>
            <p className="mt-2 text-blue-200">Secure access for authorized personnel.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mg@gs-3.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="search-input text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-blue-200">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="search-input text-white"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? 'Signing In...' : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default DeveloperLogin;