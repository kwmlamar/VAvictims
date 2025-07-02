import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const SearchFilters = ({ filters, onFilterChange }) => {
  const { toast } = useToast();
  const [visns, setVisns] = useState([]);
  const [states, setStates] = useState([]);
  const [facilityTypes, setFacilityTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        
        // Fetch VISNs
        const { data: visnData, error: visnError } = await supabase
          .from('visns')
          .select('name')
          .order('name');
        
        // Fetch unique states
        const { data: stateData, error: stateError } = await supabase
          .from('va_facilities')
          .select('state')
          .not('state', 'is', null);
        
        // Fetch unique facility types
        const { data: typeData, error: typeError } = await supabase
          .from('va_facilities')
          .select('type')
          .not('type', 'is', null);

        if (visnError || stateError || typeError) {
          throw new Error('Failed to fetch filter options');
        }

        // Process the data
        const uniqueStates = [...new Set(stateData.map(item => item.state))].sort();
        const uniqueTypes = [...new Set(typeData.map(item => item.type))].sort();
        const visnNames = visnData.map(item => item.name).sort();

        setStates(uniqueStates);
        setVisns(visnNames);
        setFacilityTypes(uniqueTypes);
        
      } catch (error) {
        toast({
          title: "Failed to load filter options",
          description: "Could not load the list of states, VISNs, and types. Please try again later.",
          variant: "destructive",
        });
        
        // Set fallback data
        setStates(['AZ', 'CA', 'WA', 'TX', 'FL', 'NY', 'PA', 'OH', 'IL', 'MI']);
        setVisns(['VISN 1', 'VISN 2', 'VISN 3', 'VISN 4', 'VISN 5']);
        setFacilityTypes(['Medical Center', 'Outpatient Clinic', 'Community Based Outpatient Clinic']);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, [toast]);

  const handleFilterUpdate = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      facilityName: '',
      state: '',
      visn: '',
      facilityType: '',
      scoreRange: [0, 100]
    });
  };

  const hasActiveFilters = filters.facilityName || filters.visn || filters.state || filters.facilityType || 
    filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ios-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-blue-400 hover:text-blue-300"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Facility Name Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-blue-200">Facility Name</label>
          <input
            type="text"
            placeholder="Enter facility name..."
            value={filters.facilityName || ''}
            onChange={(e) => handleFilterUpdate('facilityName', e.target.value)}
            className="w-full px-4 py-2 search-input text-white placeholder-blue-300 focus:outline-none"
          />
        </div>

        {/* State Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-blue-200">State</label>
          <Select value={filters.state} onValueChange={(value) => handleFilterUpdate('state', value)}>
            <SelectTrigger className="search-input text-white">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
              {loading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                states.map((state) => (
                  <SelectItem key={state} value={state} className="text-white hover:bg-slate-700">
                    {state}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* VISN Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-blue-200">VISN</label>
          <Select value={filters.visn} onValueChange={(value) => handleFilterUpdate('visn', value)}>
            <SelectTrigger className="search-input text-white">
              <SelectValue placeholder="Select VISN" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {loading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                visns.map((visn) => (
                  <SelectItem key={visn} value={visn} className="text-white hover:bg-slate-700">
                    {visn}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Score Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-blue-200">
            Score Range: {filters.scoreRange[0]}% - {filters.scoreRange[1]}%
          </label>
          <div className="pt-2">
            <Slider
              value={filters.scoreRange}
              onValueChange={(value) => handleFilterUpdate('scoreRange', value)}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Additional Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Facility Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-blue-200">Facility Type</label>
          <Select value={filters.facilityType} onValueChange={(value) => handleFilterUpdate('facilityType', value)}>
            <SelectTrigger className="search-input text-white">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {loading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                facilityTypes.map((type) => (
                  <SelectItem key={type} value={type} className="text-white hover:bg-slate-700">
                    {type}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchFilters;