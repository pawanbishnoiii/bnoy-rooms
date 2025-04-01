import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { supabase } from '@/integrations/supabase/client';
import { Property, GenderOption, PropertyCategory } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import PropertyCard from '@/components/home/PropertyCard';
import PageLayout from '@/components/layout/PageLayout';
import { mapDbPropertyToProperty } from '@/utils/typeUtils';

interface FilterOptions {
  gender?: GenderOption;
  propertyType?: string;
  propertyCategory?: PropertyCategory;
  location?: string;
  maxBudget?: number;
  amenities?: string[];
  capacity?: number;
}

const Properties = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  // State variables
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const debouncedSearchTerm = useDebounce(searchQuery, 500);

  // Extract filter values from URL
  useEffect(() => {
    const gender = searchParams.get('gender') as GenderOption | undefined;
    const propertyType = searchParams.get('propertyType') || undefined;
    const propertyCategory = searchParams.get('propertyCategory') as PropertyCategory | undefined;
    const locationParam = searchParams.get('location') || undefined;
    const maxBudget = searchParams.get('maxBudget') ? parseInt(searchParams.get('maxBudget')!) : undefined;
    const capacity = searchParams.get('capacity') ? parseInt(searchParams.get('capacity')!) : undefined;

    setFilterOptions({
      gender,
      propertyType,
      propertyCategory,
      location: locationParam,
      maxBudget,
      capacity
    });
  }, [searchParams]);

  // Update URL when filter options change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filterOptions.gender) params.set('gender', filterOptions.gender);
    if (filterOptions.propertyType) params.set('propertyType', filterOptions.propertyType);
    if (filterOptions.propertyCategory) params.set('propertyCategory', filterOptions.propertyCategory);
    if (filterOptions.location) params.set('location', filterOptions.location);
    if (filterOptions.maxBudget) params.set('maxBudget', filterOptions.maxBudget.toString());
    if (filterOptions.capacity) params.set('capacity', filterOptions.capacity.toString());

    setSearchParams(params);
  }, [filterOptions, setSearchParams]);

  // Function to fetch properties with filters
  const fetchProperties = async (filters: FilterOptions) => {
    let query = supabase
      .from('properties')
      .select(`
        *,
        location:locations(*),
        images:property_images(*),
        facilities:property_facilities(facility:facilities(*)),
        rooms(*)
      `)
      .eq('is_verified', true);

    if (filters.gender && filters.gender !== 'common') {
      query = query.eq('gender', filters.gender);
    }
    if (filters.propertyType) {
      query = query.eq('type', filters.propertyType);
    }
    if (filters.propertyCategory) {
      query = query.eq('category', filters.propertyCategory);
    }
    if (filters.location) {
      query = query.ilike('address', `%${filters.location}%`);
    }
    if (filters.maxBudget) {
      query = query.lte('monthly_price', filters.maxBudget);
    }
    if (filters.capacity) {
      // This requires a more complex filter on the rooms
      // You might need to adjust this based on your specific requirements
    }

    const { data, error } = await query;
    return { properties: data, error };
  };

  const propertiesQuery = useQuery({
    queryKey: ['properties', filterOptions],
    queryFn: async () => {
      const { properties, error } = await fetchProperties(filterOptions);
      
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load properties. Please try again.',
          variant: 'destructive',
        });
        throw new Error(error);
      }
      
      // Map database properties to our frontend Property type
      const mappedProperties = properties.map(mapDbPropertyToProperty);
      
      return mappedProperties;
    }
  });

  const { data: properties = [], isLoading, error } = propertiesQuery;

  // Handlers for filter changes
  const handleGenderChange = (gender: GenderOption) => {
    setFilterOptions(prev => ({ ...prev, gender }));
  };

  const handlePropertyTypeChange = (propertyType: string) => {
    setFilterOptions(prev => ({ ...prev, propertyType }));
  };

  const handlePropertyCategoryChange = (propertyCategory: PropertyCategory) => {
    setFilterOptions(prev => ({ ...prev, propertyCategory }));
  };

  const handleLocationChange = (location: string) => {
    setFilterOptions(prev => ({ ...prev, location }));
  };

  const handleMaxBudgetChange = (maxBudget: number) => {
    setFilterOptions(prev => ({ ...prev, maxBudget }));
  };

  const handleCapacityChange = (capacity: number) => {
    setFilterOptions(prev => ({ ...prev, capacity }));
  };

  // Handle search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Replace the location_id check with location check
const filteredProperties = searchQuery
  ? properties.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.location && p.location.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  : properties;

  if (isLoading) {
    return <div>Loading properties...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <PageLayout>
      <div className="container mx-auto mt-8">
        <h1 className="text-2xl font-semibold mb-4">Find Your Perfect Accommodation</h1>

        {/* Search Input */}
        <Input
          type="text"
          placeholder="Search by name, address, or location..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full mb-4"
        />

        <div className="flex">
          {/* Filters Section */}
          <div className="w-1/4 p-4 border rounded">
            <h2 className="text-lg font-semibold mb-2">Filters</h2>

            {/* Gender Filter */}
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700">Gender</Label>
              <Select value={filterOptions.gender} onValueChange={handleGenderChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boys">Boys</SelectItem>
                  <SelectItem value="girls">Girls</SelectItem>
                  <SelectItem value="common">Common</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property Type Filter */}
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700">Property Type</Label>
              <Select value={filterOptions.propertyType} onValueChange={handlePropertyTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property Category Filter */}
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700">Category</Label>
              <Select value={filterOptions.propertyCategory} onValueChange={handlePropertyCategoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pg">PG</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                  <SelectItem value="dormitory">Dormitory</SelectItem>
                  <SelectItem value="independent_room">Independent Room</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                  <SelectItem value="coaching">Coaching</SelectItem>
                  <SelectItem value="tiffin_delivery">Tiffin Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="mb-4">
              <Label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</Label>
              <Input
                type="text"
                id="location"
                placeholder="Enter location"
                value={filterOptions.location || ''}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Max Budget Filter */}
            <div className="mb-4">
              <Label htmlFor="maxBudget" className="block text-sm font-medium text-gray-700">Max Budget</Label>
              <Input
                type="number"
                id="maxBudget"
                placeholder="Enter max budget"
                value={filterOptions.maxBudget || ''}
                onChange={(e) => handleMaxBudgetChange(e.target.value ? parseInt(e.target.value) : 0)}
                className="w-full"
              />
            </div>

             {/* Capacity Filter */}
             <div className="mb-4">
              <Label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity</Label>
              <Input
                type="number"
                id="capacity"
                placeholder="Enter capacity"
                value={filterOptions.capacity || ''}
                onChange={(e) => handleCapacityChange(e.target.value ? parseInt(e.target.value) : 0)}
                className="w-full"
              />
            </div>
          </div>

          {/* Properties List Section */}
          <div className="w-3/4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Properties;
