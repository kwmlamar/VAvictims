export const layoutContent = `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  BarChart3, 
  FileText, 
  Settings, 
  TrendingUp,
  Menu,
  X,
  AlertTriangle,
  Code
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/b5d3de1a-abbd-4767-8dfe-debe0b4c6075/f146c201ef9be8192109ee3a4e93ec98.png";

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Facility Search', href: '/search', icon: Search },
    { name: 'Scorecards', href: '/scorecards', icon: BarChart3 },
    { name: 'User Portal', href: '/portal', icon: FileText },
    { name: 'Data Analysis', href: '/analysis', icon: TrendingUp },
    { name: 'Admin Portal', href: '/admin', icon: Settings },
    { name: 'Developer', href: '/dev/login', icon: Code },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen flex">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="glass-effect text-white hover:bg-white/10"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed lg:relative inset-y-0 left-0 z-40 w-72 sidebar-nav lg:translate-x-0"
          >
            <div className="flex flex-col h-full p-6">
              {/* Logo */}
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-white/90 glass-effect p-1 shadow-lg">
                  <img src={logoUrl} alt="VA Victims Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">VA Accountability</h1>
                  <p className="text-sm text-blue-200">Transparency Platform</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={\`nav-item flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all \${
                        isActive(item.href)
                          ? 'active text-white'
                          : 'text-blue-100 hover:text-white'
                      }\`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Warning Notice */}
              <div className="mt-auto p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-500/30">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-400">Notice</span>
                </div>
                <p className="text-xs text-amber-100">
                  This platform provides transparency data for veteran advocacy and legal support.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        <main className="min-h-screen p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
`;