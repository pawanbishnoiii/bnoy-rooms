
import React, { useState, useEffect } from 'react';
import { Search, MapPin, HomeIcon, Users, Filter, Sparkles, Star, CreditCard, Wifi, Fan, Utensils, CarFront, Lock, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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
  const [budgetRange, setBudgetRange] = useState<[number, number]>([1000, 15000]);
  const [showFilters, setShowFilters] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [genderOption, setGenderOption] = useState<'boys' | 'girls' | 'common'>('common');
  const [minRating, setMinRating] = useState<number>(0);
  const [nearbyOptions, setNearbyOptions] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Available amenities for filter with icons
  const availableAmenities = [
    { id: 'WiFi', label: 'WiFi', icon: Wifi },
    { id: 'AC', label: 'AC', icon: Fan },
    { id: 'Parking', label: 'Parking', icon: CarFront },
    { id: 'Laundry', label: 'Laundry', icon: Utensils },
    { id: 'Meals', label: 'Meals', icon: Utensils },
    { id: 'Gym', label: 'Gym', icon: Dumbbell },
    { id: 'Security', label: 'Security', icon: Lock }
  ];
  
  // Nearby options for filtering
  const availableNearbyOptions = [
    'College', 'University', 'Hospital', 'Metro Station', 
    'Bus Stop', 'Market', 'Restaurant', 'Mall'
  ];
  
  useEffect(() => {
    if (isAIEnabled && location) {
      // Simulate AI suggestions based on real-time input
      const suggestions = [
        `Affordable ${propertyType || 'housing'} for ${genderOption} in ${location}`,
        `${propertyType || 'Accommodations'} with WiFi and AC in ${location}`,
        `Best rated ${propertyType || 'PGs'} near ${location} (${minRating}+ rating)`,
        `${propertyType || 'Rooms'} with monthly rent ₹${budgetRange[0]}-₹${budgetRange[1]} in ${location}`
      ];
      
      if (amenities.length > 0) {
        suggestions.push(`${propertyType || 'Places'} with ${amenities.slice(0, 2).join(', ')} in ${location}`);
      }
      
      if (nearbyOptions.length > 0) {
        suggestions.push(`${propertyType || 'Options'} near ${nearbyOptions[0]} in ${location}`);
      }
      
      setAiSuggestions(suggestions);
    } else {
      setAiSuggestions([]);
    }
  }, [location, propertyType, isAIEnabled, genderOption, minRating, budgetRange, amenities, nearbyOptions]);
  
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
  
  const toggleNearbyOption = (option: string) => {
    setNearbyOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Prepare search data
    const searchData = { 
      location, 
      propertyType,
      minBudget: budgetRange[0],
      maxBudget: budgetRange[1],
      gender: genderOption,
      amenities,
      minRating,
      nearbyOptions,
      aiEnhanced: isAIEnabled
    };
    
    console.log('Searching for:', searchData);
    
    // Simulate search API call
    setTimeout(() => {
      setIsSearching(false);
      
      // Show success toast
      toast({
        title: 'Search completed',
        description: `Found properties matching your criteria in ${location || 'all locations'}`,
      });
      
      // Redirect to search results page
      const queryParams = new URLSearchParams();
      if (location) queryParams.set('location', location);
      if (propertyType) queryParams.set('type', propertyType);
      if (genderOption !== 'common') queryParams.set('gender', genderOption);
      queryParams.set('minPrice', budgetRange[0].toString());
      queryParams.set('maxPrice', budgetRange[1].toString());
      if (minRating > 0) queryParams.set('rating', minRating.toString());
      if (amenities.length > 0) queryParams.set('amenities', amenities.join(','));
      if (nearbyOptions.length > 0) queryParams.set('nearby', nearbyOptions.join(','));
      queryParams.set('ai', isAIEnabled.toString());
      
      window.location.href = `/properties?${queryParams.toString()}`;
    }, 1000);
  };
  
  const selectAiSuggestion = (suggestion: string) => {
    // Parse the AI suggestion and update search filters
    if (suggestion.includes('Affordable')) {
      setBudgetRange([1000, 7000]);
    } else if (suggestion.includes('WiFi and AC')) {
      setAmenities(prev => [...new Set([...prev, 'WiFi', 'AC'])]);
    } else if (suggestion.includes('Best rated')) {
      setMinRating(4);
    } else if (suggestion.includes('monthly rent')) {
      // The range is already part of the filters
    }
    
    // Handle gender option
    if (suggestion.includes('for boys')) {
      setGenderOption('boys');
    } else if (suggestion.includes('for girls')) {
      setGenderOption('girls');
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
                <div className="pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Budget range slider */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium">Budget Range (₹ per month)</label>
                      <Slider 
                        defaultValue={budgetRange} 
                        min={1000} 
                        max={50000} 
                        step={500}
                        onValueChange={(value) => setBudgetRange(value as [number, number])}
                        className="py-4" 
                      />
                      <div className="flex justify-between text-sm">
                        <span>₹{budgetRange[0].toLocaleString()}</span>
                        <span>₹{budgetRange[1].toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Input 
                          type="number" 
                          value={budgetRange[0]} 
                          onChange={e => setBudgetRange([parseInt(e.target.value), budgetRange[1]])}
                          className="text-xs p-2 h-8"
                          min={1000}
                          max={budgetRange[1] - 500}
                          step={500}
                        />
                        <span className="flex items-center">-</span>
                        <Input 
                          type="number" 
                          value={budgetRange[1]}
                          onChange={e => setBudgetRange([budgetRange[0], parseInt(e.target.value)])}
                          className="text-xs p-2 h-8"
                          min={budgetRange[0] + 500}
                          max={50000}
                          step={500}
                        />
                      </div>
                    </div>
                    
                    {/* Gender options */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium">Accommodation For</label>
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant={genderOption === 'boys' ? "default" : "outline"}
                          className="cursor-pointer hover:shadow-sm transition-shadow px-4 py-2"
                          onClick={() => setGenderOption('boys')}
                        >
                          <Users size={14} className="mr-1" />
                          Boys
                        </Badge>
                        <Badge 
                          variant={genderOption === 'girls' ? "default" : "outline"}
                          className="cursor-pointer hover:shadow-sm transition-shadow px-4 py-2"
                          onClick={() => setGenderOption('girls')}
                        >
                          <Users size={14} className="mr-1" />
                          Girls
                        </Badge>
                        <Badge 
                          variant={genderOption === 'common' ? "default" : "outline"}
                          className="cursor-pointer hover:shadow-sm transition-shadow px-4 py-2"
                          onClick={() => setGenderOption('common')}
                        >
                          <Users size={14} className="mr-1" />
                          Common / Any
                        </Badge>
                      </div>
                      
                      {/* Minimum Rating */}
                      <div className="space-y-2 pt-2">
                        <label className="block text-sm font-medium">Minimum Rating</label>
                        <div className="flex gap-3">
                          {[0, 1, 2, 3, 4, 5].map((rating) => (
                            <Badge 
                              key={rating}
                              variant={minRating === rating ? "default" : "outline"}
                              className="cursor-pointer hover:shadow-sm transition-shadow"
                              onClick={() => setMinRating(rating)}
                            >
                              {rating === 0 ? 'Any' : (
                                <div className="flex items-center">
                                  {rating}
                                  <Star size={12} className="ml-0.5 text-amber-500" />
                                </div>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Amenities */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Amenities</label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableAmenities.map(amenity => {
                          const AmenityIcon = amenity.icon;
                          return (
                            <div key={amenity.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`amenity-${amenity.id}`} 
                                checked={amenities.includes(amenity.id)}
                                onCheckedChange={() => toggleAmenity(amenity.id)}
                              />
                              <label 
                                htmlFor={`amenity-${amenity.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                              >
                                <AmenityIcon size={14} className="mr-1" />
                                {amenity.label}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Advanced Filters Section */}
                  <div className="mt-6">
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Nearby Options */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-3">Nearby Places</label>
                        <div className="flex flex-wrap gap-2">
                          {availableNearbyOptions.map(option => (
                            <Badge 
                              key={option}
                              variant={nearbyOptions.includes(option) ? "default" : "outline"}
                              className="cursor-pointer hover:shadow-sm transition-shadow"
                              onClick={() => toggleNearbyOption(option)}
                            >
                              {option}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* AI Toggle */}
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Sparkles size={16} className="text-amber-500" />
                            <span className="text-sm font-medium">AI-powered search</span>
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
                        
                        <div className="mt-2 text-xs text-muted-foreground">
                          Enhance your search with AI-powered recommendations based on your preferences
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {isAIEnabled && aiSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="mt-6 p-3 border rounded-md bg-slate-50"
                      >
                        <div className="flex items-center mb-2">
                          <Sparkles size={14} className="mr-1 text-amber-500" />
                          <p className="text-sm font-medium">AI-Powered Suggestions</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {aiSuggestions.map((suggestion, index) => (
                            <Badge 
                              key={index}
                              variant="secondary"
                              className="cursor-pointer hover:bg-secondary/80 transition-colors py-1.5"
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
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
};

export default SearchBar;
