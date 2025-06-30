export const appContent = `import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import FacilitySearch from '@/pages/FacilitySearch';
import Scorecards from '@/pages/Scorecards';
import UserPortal from '@/pages/UserPortal';
import AdminPortal from '@/pages/AdminPortal';
import DataAnalysis from '@/pages/DataAnalysis';
import DeveloperLogin from '@/pages/DeveloperLogin';
import DeveloperPortal from '@/pages/DeveloperPortal';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = sessionStorage.getItem('devLoggedIn') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/dev/login" replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <Helmet>
        <title>VA Accountability Platform - Transparency & Oversight</title>
        <meta name="description" content="Comprehensive platform for VA facility oversight, scorecards, and accountability tracking with user allegation portal and evidence submission." />
      </Helmet>
      <Router>
        <Routes>
          <Route path="/dev/login" element={<DeveloperLogin />} />
          <Route 
            path="/dev/portal" 
            element={
              <ProtectedRoute>
                <DeveloperPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/search" element={<FacilitySearch />} />
                <Route path="/scorecards" element={<Scorecards />} />
                <Route path="/portal" element={<UserPortal />} />
                <Route path="/admin" element={<AdminPortal />} />
                <Route path="/analysis" element={<DataAnalysis />} />
              </Routes>
            </Layout>
          } />
        </Routes>
        <Toaster />
      </Router>
    </>
  );
}

export default App;
`;