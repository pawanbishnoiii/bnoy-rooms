
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Property, Facility, Location } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import PropertyCard from '@/components/home/PropertyCard';
import { MapPin, Search, SlidersHorizontal, X, Map, List, Star, BedDouble, Bath, Fan, PenBox, FolderArchive } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyMap from '@/components/maps/PropertyMap';
import AIRecommendations from '@/components/properties/AIRecommendations';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface FiltersState {
  gender: string;
  priceRange: [number, number];
  location: string;
  timeFrame: string;
  facilities: string[];
  searchTerm: string;
  propertyType: string;
  rating: number | null;
}

const PropertiesPage = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [propertyTypes, setPropertyTypes] = useState<string[]>([
    'PG', 'Hostel', 'Independent Room', 'Rented House', 'Hotel'
  ]);
  
  const [filters, setFilters] = useState<FiltersState>({
    gender: '',
    priceRange: [0, 50000],
    location: '',
    timeFrame: 'monthly',
    facilities: [],
    searchTerm: '',
    propertyType: '',
    rating: null,
  });

  // Common amenities for quick access
  const commonAmenities = [
    { id: 'wifi', name: 'WiFi', icon: <MapPin size={16} /> },
    { id: 'bathroom', name: 'Independent Bathroom', icon: <Bath size={16} /> },
    { id: 'fan', name: 'Fan', icon: <Fan size={16} /> },
    { id: 'almirah', name: 'Almirah', icon: <FolderArchive size={16} /> },
    { id: 'desk', name: 'Desk', icon: <PenBox size={16} /> },
    { id: 'bed', name: 'Bed', icon: <BedDouble size={16} /> },
  ];

  // Max price for the range slider
  const MAX_PRICE = 50000;

  useEffect(() => {
    fetchProperties();
    fetchFacilities();
    fetchLocations();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          location:locations(*),
          facilities:property_facilities(facility:facilities(*)),
          images:property_images(*)
        `)
        .eq('is_verified', true);

      if (error) {
        throw error;
      }

      if (data) {
        // Transform the data to match our Property type
        const formattedProperties: Property[] = data.map(property => ({
          ...property,
          location: property.location ? {
            id: property.location.id,
            name: property.location.name,
            latitude: property.location.latitude,
            longitude: property.location.longitude,
            created_at: property.location.created_at,
          } : undefined,
          facilities: property.facilities?.map(item => item.facility) || [],
          images: property.images?.map(img => ({
            id: img.id,
            property_id: img.property_id,
            image_url: img.image_url,
            is_primary: img.is_primary || false,
            created_at: img.created_at,
          })) || [],
          average_rating: Math.floor(Math.random() * 5) + 1, // Mock data for now, will be replaced with real ratings
        }));
        
        setProperties(formattedProperties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        setFacilities(data);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        setLocations(data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleFilterChange = (key: keyof FiltersState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleFacility = (facilityId: string) => {
    setFilters(prev => {
      const facilities = [...prev.facilities];
      if (facilities.includes(facilityId)) {
        return {
          ...prev,
          facilities: facilities.filter(id => id !== facilityId)
        };
      } else {
        return {
          ...prev,
          facilities: [...facilities, facilityId]
        };
      }
    });
  };

  const resetFilters = () => {
    setFilters({
      gender: '',
      priceRange: [0, MAX_PRICE],
      location: '',
      timeFrame: 'monthly',
      facilities: [],
      searchTerm: '',
      propertyType: '',
      rating: null,
    });
  };

  const filteredProperties = properties.filter(property => {
    // Gender filter
    if (filters.gender && property.gender !== filters.gender) {
      return false;
    }

    // Property type filter
    if (filters.propertyType && property.type !== filters.propertyType) {
      return false;
    }

    // Price filter
    const price = filters.timeFrame === 'daily' 
      ? property.daily_price || property.monthly_price / 30 
      : property.monthly_price;
    
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
      return false;
    }

    // Location filter
    if (filters.location && property.location_id !== filters.location) {
      return false;
    }

    // Facilities filter
    if (filters.facilities.length > 0) {
      const propertyFacilityIds = property.facilities?.map(f => f.id) || [];
      if (!filters.facilities.every(id => propertyFacilityIds.includes(id))) {
        return false;
      }
    }

    // Rating filter
    if (filters.rating && property.average_rating && property.average_rating < filters.rating) {
      return false;
    }

    // Search term
    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      return (
        property.name.toLowerCase().includes(searchTermLower) ||
        property.address.toLowerCase().includes(searchTermLower) ||
        property.type.toLowerCase().includes(searchTermLower) ||
        property.location?.name.toLowerCase().includes(searchTermLower)
      );
    }

    return true;
  });

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'map' : 'list');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bnoy-50/30 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {user && (
            <AIRecommendations 
              userPreferences={{
                gender: filters.gender as any,
                budget: filters.priceRange[1],
                location: locations.find(loc => loc.id === filters.location)?.name,
                propertyType: filters.propertyType,
                amenities: filters.facilities.map(id => 
                  facilities.find(f => f.id === id)?.name || ''
                ).filter(Boolean)
              }}
            />
          )}

          {/* Search and filter bar */}
          <div className="mb-8 relative">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, location, or type..."
                  className="pl-10"
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={toggleFilters}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal size={16} />
                <span className="hidden md:inline">Filters</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={toggleViewMode}
                className="flex items-center gap-2"
              >
                {viewMode === 'list' ? (
                  <>
                    <Map size={16} />
                    <span className="hidden md:inline">Map View</span>
                  </>
                ) : (
                  <>
                    <List size={16} />
                    <span className="hidden md:inline">List View</span>
                  </>
                )}
              </Button>
            </div>

            {filtersOpen && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Filters</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetFilters}
                      className="h-auto py-1 text-sm"
                    >
                      Reset all
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Gender filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Gender</label>
                      <Select 
                        value={filters.gender} 
                        onValueChange={(value) => handleFilterChange('gender', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any gender</SelectItem>
                          <SelectItem value="boys">Boys only</SelectItem>
                          <SelectItem value="girls">Girls only</SelectItem>
                          <SelectItem value="common">Common</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Property Type filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Property Type</label>
                      <Select 
                        value={filters.propertyType} 
                        onValueChange={(value) => handleFilterChange('propertyType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All types</SelectItem>
                          {propertyTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Location</label>
                      <Select 
                        value={filters.location} 
                        onValueChange={(value) => handleFilterChange('location', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All locations</SelectItem>
                          {locations.map(location => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Rating filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                      <Select 
                        value={filters.rating?.toString() || ''} 
                        onValueChange={(value) => handleFilterChange('rating', value ? parseInt(value) : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any rating</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Time frame filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Time Frame</label>
                      <Select 
                        value={filters.timeFrame} 
                        onValueChange={(value) => handleFilterChange('timeFrame', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Monthly" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Price Range filter */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Price Range</label>
                      <span className="text-sm">
                        ₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}
                        {filters.timeFrame === 'daily' ? '/day' : '/month'}
                      </span>
                    </div>
                    <Slider
                      defaultValue={[0, MAX_PRICE]}
                      min={0}
                      max={MAX_PRICE}
                      step={500}
                      value={filters.priceRange}
                      onValueChange={(value) => handleFilterChange('priceRange', value)}
                    />
                  </div>

                  {/* Common Amenities quick filter */}
                  <div className="mt-6">
                    <label className="text-sm font-medium mb-2 block">Common Amenities</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {commonAmenities.map(amenity => {
                        const facilityInDb = facilities.find(f => f.name.toLowerCase().includes(amenity.name.toLowerCase()));
                        const facilityId = facilityInDb?.id || '';
                        const isSelected = facilityId && filters.facilities.includes(facilityId);
                        
                        return facilityId ? (
                          <Badge 
                            key={amenity.id}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer py-1 px-2"
                            onClick={() => toggleFacility(facilityId)}
                          >
                            <span className="mr-1">{amenity.icon}</span>
                            {amenity.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* All Facilities filter */}
                  <div className="mt-2">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="facilities">
                        <AccordionTrigger>All Facilities</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {facilities.map(facility => (
                              <div key={facility.id} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`facility-${facility.id}`}
                                  checked={filters.facilities.includes(facility.id)}
                                  onCheckedChange={() => toggleFacility(facility.id)}
                                />
                                <label 
                                  htmlFor={`facility-${facility.id}`}
                                  className="text-sm"
                                >
                                  {facility.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filter tags */}
            {(filters.gender || filters.location || filters.propertyType || filters.facilities.length > 0 || filters.rating) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.gender && (
                  <div className="bg-secondary py-1 px-3 rounded-full text-xs flex items-center">
                    {filters.gender === 'boys' ? 'Boys only' : filters.gender === 'girls' ? 'Girls only' : 'Common'}
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={() => handleFilterChange('gender', '')}
                    />
                  </div>
                )}
                
                {filters.propertyType && (
                  <div className="bg-secondary py-1 px-3 rounded-full text-xs flex items-center">
                    {filters.propertyType}
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={() => handleFilterChange('propertyType', '')}
                    />
                  </div>
                )}
                
                {filters.location && (
                  <div className="bg-secondary py-1 px-3 rounded-full text-xs flex items-center">
                    <MapPin size={12} className="mr-1" />
                    {locations.find(l => l.id === filters.location)?.name || 'Location'}
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={() => handleFilterChange('location', '')}
                    />
                  </div>
                )}
                
                {filters.rating && (
                  <div className="bg-secondary py-1 px-3 rounded-full text-xs flex items-center">
                    <Star size={12} className="mr-1 text-amber-500" fill="#F59E0B" />
                    {filters.rating}+ Rating
                    <X
                      size={14}
                      className="ml-1 cursor-pointer"
                      onClick={() => handleFilterChange('rating', null)}
                    />
                  </div>
                )}
                
                {filters.facilities.map(facilityId => {
                  const facility = facilities.find(f => f.id === facilityId);
                  if (!facility) return null;
                  return (
                    <div key={facilityId} className="bg-secondary py-1 px-3 rounded-full text-xs flex items-center">
                      {facility.name}
                      <X
                        size={14}
                        className="ml-1 cursor-pointer"
                        onClick={() => toggleFacility(facilityId)}
                      />
                    </div>
                  );
                })}
                
                {(filters.gender || filters.location || filters.propertyType || filters.facilities.length > 0 || filters.rating) && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-bnoy-600 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Available Properties</h1>
            <p className="text-muted-foreground">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
            </p>
          </div>

          {/* Map View */}
          {viewMode === 'map' && (
            <div className="mb-8">
              <PropertyMap 
                properties={filteredProperties} 
                height="600px"
              />
            </div>
          )}

          {/* Properties grid */}
          {viewMode === 'list' && (
            loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-background rounded-xl h-80 animate-pulse"></div>
                ))}
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProperties.map(property => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    name={property.name}
                    type={property.type}
                    location={property.location?.name || property.address || ''}
                    price={filters.timeFrame === 'daily' ? (property.daily_price || Math.round(property.monthly_price / 30)) : property.monthly_price}
                    rating={property.average_rating || 4.5}
                    reviewCount={12} // Mock data, would come from reviews
                    image={property.images?.find(img => img.is_primary)?.image_url || 
                           property.images?.[0]?.image_url || 
                           "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3"}
                    facilities={property.facilities?.map(f => f.name) || []}
                    distance="1.2 km" // Mock data, would be calculated
                    isVerified={property.is_verified}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4 text-muted-foreground">
                  <Search size={40} className="mx-auto" />
                </div>
                <h3 className="text-xl font-medium mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <Button onClick={resetFilters}>Clear all filters</Button>
              </div>
            )
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PropertiesPage;
