
import React, { useState, useEffect } from 'react';
import { Search, MapPin, HomeIcon, Users, Filter, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

const locationOptions = [
  'Suratgarh', 'Bikaner', 'Anupgarh', 'RaiSinghnagar', 
  'Sri Ganganagar', 'Abohar', 'Gharsana', 'Hanumangarh',
  'Sangariya', 'Sikar', 'Gopalpura Jaipur', 'Ridhi Sidhi Jaipur',
  'Mansarovar Jaipur', 'Kota'
];

const propertyTypes = [
  { id: 'pg', label: 'PG' },
  { id: 'hostel', label: 'Hostel' },
  { id: 'independent', label: 'Independent Room' },
  { id: 'rented', label: 'Rented House' },
  { id: 'hotel', label: 'Hotel' }
];

const SearchBar = () => {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(locationOptions);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [budget, setBudget] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  // Available amenities for filter
  const availableAmenities = [
    'WiFi', 'AC', 'Parking', 'Laundry', 'Meals', 'Gym', 'Security'
  ];
  
  useEffect(() => {
    if (isAIEnabled && location) {
      // Simulate AI suggestions
      const suggestions = [
        `Affordable ${propertyType || 'housing'} in ${location}`,
        `Best rated ${propertyType || 'accommodations'} near ${location}`,
        `${propertyType || 'Rooms'} with WiFi in ${location}`,
        `Safe ${propertyType || 'housing'} options for students in ${location}`
      ];
      setAiSuggestions(suggestions);
    } else {
      setAiSuggestions([]);
    }
  }, [location, propertyType, isAIEnabled]);
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    
    if (value.trim() === '') {
      setFilteredLocations(locationOptions);
    } else {
      const filtered = locationOptions.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
    
    setShowLocationDropdown(true);
  };
  
  const handleLocationSelect = (loc: string) => {
    setLocation(loc);
    setShowLocationDropdown(false);
  };
  
  const toggleAmenity = (amenity: string) => {
    setAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Simulate search API call
    setTimeout(() => {
      console.log('Searching for:', { 
        location, 
        propertyType,
        budget: budget ? parseInt(budget) : undefined,
        amenities,
        aiEnhanced: isAIEnabled
      });
      setIsSearching(false);
      
      // Here you would typically redirect to search results page
      window.location.href = `/properties?location=${encodeURIComponent(location)}&type=${encodeURIComponent(propertyType)}&ai=${isAIEnabled}`;
    }, 1000);
  };
  
  const selectAiSuggestion = (suggestion: string) => {
    // Here we would parse the suggestion and update the form
    if (suggestion.includes('Affordable')) {
      setBudget('5000');
    } else if (suggestion.includes('Best rated')) {
      // Would set some sort of rating filter
    } else if (suggestion.includes('WiFi')) {
      setAmenities(prev => [...prev, 'WiFi']);
    } else if (suggestion.includes('Safe')) {
      // Would set some sort of safety filter
    }
    
    // Submit the search with the AI suggestion
    handleSearch(new Event('submit') as any);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <form onSubmit={handleSearch} className="glass-panel p-2 md:p-3 rounded-lg shadow-md bg-white/90">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <MapPin size={18} className="text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Where are you looking for accommodation?"
                value={location}
                onChange={handleLocationChange}
                onFocus={() => setShowLocationDropdown(true)}
                onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                className="input-search pl-10 w-full bg-white/70 focus:bg-white border border-gray-200 rounded-md py-2 px-4"
              />
              
              <AnimatePresence>
                {showLocationDropdown && filteredLocations.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto"
                  >
                    <ul className="py-1">
                      {filteredLocations.map((loc) => (
                        <motion.li 
                          key={loc}
                          whileHover={{ backgroundColor: "#f9fafb" }}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                          onMouseDown={() => handleLocationSelect(loc)}
                        >
                          {loc}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative md:w-52">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <HomeIcon size={18} className="text-muted-foreground" />
              </div>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="input-search pl-10 w-full bg-white/70 focus:bg-white appearance-none border border-gray-200 rounded-md py-2 px-4"
              >
                <option value="">All Property Types</option>
                {propertyTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="btn-primary md:px-6 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-md py-2 px-4"
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Search size={18} />
                )}
                <span>Search</span>
              </button>
              
              <button 
                type="button" 
                className="btn-outline md:w-auto flex items-center justify-center border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                <span className="ml-2 md:block">Filters</span>
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium mb-2">Budget (per month)</label>
                    <input
                      type="number"
                      placeholder="Maximum budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full border border-gray-200 rounded-md py-2 px-3"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {availableAmenities.map(amenity => (
                        <Badge 
                          key={amenity}
                          variant={amenities.includes(amenity) ? "default" : "outline"}
                          className="cursor-pointer hover:shadow-sm transition-shadow"
                          onClick={() => toggleAmenity(amenity)}
                        >
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="md:col-span-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles size={16} className="text-amber-500" />
                        <span className="text-sm font-medium">Enable AI-powered search</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isAIEnabled}
                          onChange={() => setIsAIEnabled(!isAIEnabled)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    <AnimatePresence>
                      {isAIEnabled && aiSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-3"
                        >
                          <p className="text-xs text-muted-foreground mb-2">AI Suggestions</p>
                          <div className="flex flex-wrap gap-2">
                            {aiSuggestions.map((suggestion, index) => (
                              <Badge 
                                key={index}
                                variant="secondary"
                                className="cursor-pointer hover:bg-secondary/80 transition-colors"
                                onClick={() => selectAiSuggestion(suggestion)}
                              >
                                <Sparkles size={12} className="mr-1 text-amber-500" />
                                {suggestion}
                              </Badge>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
};

export default SearchBar;
