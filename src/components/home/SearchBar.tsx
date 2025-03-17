
import React, { useState } from 'react';
import { Search, MapPin, HomeIcon, Users, Filter } from 'lucide-react';

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
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', { location, propertyType });
    // Implement search functionality
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="glass-panel p-2 md:p-3">
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
              className="input-search pl-10 w-full bg-white/70 focus:bg-white"
            />
            
            {showLocationDropdown && filteredLocations.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                <ul className="py-1">
                  {filteredLocations.map((loc) => (
                    <li 
                      key={loc}
                      className="px-4 py-2 hover:bg-bnoy-50 cursor-pointer text-sm"
                      onMouseDown={() => handleLocationSelect(loc)}
                    >
                      {loc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="relative md:w-52">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <HomeIcon size={18} className="text-muted-foreground" />
            </div>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="input-search pl-10 w-full bg-white/70 focus:bg-white appearance-none"
            >
              <option value="">All Property Types</option>
              {propertyTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <button 
            type="submit" 
            className="btn-primary md:px-6 flex items-center justify-center gap-2"
          >
            <Search size={18} />
            <span>Search</span>
          </button>
          
          <button 
            type="button" 
            className="btn-outline md:w-auto flex items-center justify-center"
            onClick={() => console.log('Show filters')}
          >
            <Filter size={18} />
            <span className="ml-2 md:block">Filters</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
