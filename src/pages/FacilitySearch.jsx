import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, Filter, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import SearchFilters from '@/components/SearchFilters';
import FacilityCard from '@/components/FacilityCard';
import { supabase } from '@/lib/supabaseClient';

const FacilitySearch = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    facilityName: '',
    state: '',
    visn: '',
    facilityType: '',
    scoreRange: [0, 100]
  });
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_facilities', {
        search_term: searchTerm,
        facility_name_filter: filters.facilityName,
        visn_filter: filters.visn,
        state_filter: filters.state,
        type_filter: filters.facilityType,
        min_score: filters.scoreRange[0],
        max_score: filters.scoreRange[1]
      });

      if (error) throw error;

      const formattedData = data.map(f => ({
        ...f,
        score: parseFloat(f.score) || 0,
        issues: f.issues || [],
        lastUpdated: f.last_updated ? new Date(f.last_updated).toLocaleDateString() : 'N/A',
        representatives: f.representatives || []
      }));

      setFacilities(formattedData);

    } catch (error) {
      console.error("Error fetching facilities:", error);
      toast({
        title: "Error Fetching Facilities",
        description: "Could not load facility data. " + error.message,
        variant: "destructive",
      });
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFacilities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = () => {
    fetchFacilities();
  };


  const handleAdvancedSearch = () => {
    toast({
      title: "🚧 Advanced Search Coming Soon",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      duration: 3000,
    });
  };

  return (
    <>
      <Helmet>
        <title>Facility Search - VA Accountability Platform</title>
        <meta name="description" content="Search and explore VA facilities, VISNs, clinics, and CROCs with comprehensive scoring and accountability data." />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-white">Facility Search</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Search and explore VA facilities, VISNs, clinics, and CROCs nationwide
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="ios-card p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
              <input
                type="text"
                placeholder="Search facilities, locations, or VISNs..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                className="w-full pl-12 pr-4 py-3 search-input text-white placeholder-blue-300 focus:outline-none"
              />
            </div>
            <Button 
              onClick={handleSearchClick}
              className="bg-blue-600 hover:bg-blue-700 px-8"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button 
              variant="outline"
              onClick={handleAdvancedSearch}
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Search Results ({facilities.length})
            </h2>
            {facilities.some(f => f.score < 50) && (
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">Facilities with warnings found</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="ios-card p-6 loading-shimmer h-64" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {facilities.map((facility) => (
                <FacilityCard key={facility.id} facility={facility} />
              ))}
            </div>
          )}

          {!loading && facilities.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No facilities found</h3>
              <p className="text-blue-200">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default FacilitySearch;