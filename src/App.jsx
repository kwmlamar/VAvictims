import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import FacilitySearch from '@/pages/FacilitySearch';
import Scorecards from '@/pages/Scorecards';
import UserPortal from '@/pages/UserPortal';
import AdminPortal from '@/pages/AdminPortal';
import DataAnalysis from '@/pages/DataAnalysis';
import DeveloperPortal from '@/pages/DeveloperPortal';
import About from '@/pages/About';
import Calculations from '@/pages/Calculations';

function App() {
  return (
    <HelmetProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route path="/dev/portal" element={<DeveloperPortal />} />
          
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/search" element={<FacilitySearch />} />
                <Route path="/scorecards" element={<Scorecards />} />
                <Route path="/about" element={<About />} />
                <Route path="/calculations" element={<Calculations />} />
                <Route path="/portal" element={<UserPortal />} />
                <Route path="/admin" element={<AdminPortal />} />
                <Route path="/analysis" element={<DataAnalysis />} />
              </Routes>
            </Layout>
          } />
        </Routes>
        <Toaster />
      </Router>
    </HelmetProvider>
  );
}

export default App;