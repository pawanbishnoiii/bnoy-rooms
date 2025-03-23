import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Property, Location, PropertyImage, PropertyCategory, GenderOption } from '@/types';
import { useToast } from './use-toast';

interface UseRealTimePropertiesOptions {
  gender?: GenderOption;
  propertyType?: string;
  propertyCategory?: PropertyCategory;
  location?: string;
  maxBudget?: number;
  amenities?: string[];
  capacity?: number;
  limit?: number;
}

export const useRealTimeProperties = (options: UseRealTimePropertiesOptions = {}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();

    // Set up real-time subscription
    const channel = supabase
      .channel('properties-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'properties'
      }, () => {
        console.log('Received real-time update for properties');
        fetchProperties();
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    options.gender, 
    options.propertyType, 
    options.propertyCategory,
    options.location, 
    options.maxBudget, 
    options.amenities, 
    options.capacity,
    options.limit
  ]);

  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Start building the query
      let query = supabase
        .from('properties')
        .select(`
          *,
          location:locations(*),
          images:property_images(*),
          facilities:property_facilities(facility:facilities(*)),
          rooms:rooms(*)
        `)
        .eq('is_verified', true);

      // Apply filters
      if (options.gender && options.gender !== 'common') {
        query = query.eq('gender', options.gender);
      }

      if (options.propertyType) {
        query = query.eq('type', options.propertyType);
      }
      
      if (options.propertyCategory) {
        query = query.eq('category', options.propertyCategory);
      }

      if (options.location) {
        query = query.ilike('address', `%${options.location}%`);
      }

      if (options.maxBudget) {
        query = query.lte('monthly_price', options.maxBudget);
      }
      
      // Filter by capacity if specified
      if (options.capacity && options.capacity > 0) {
        // This is more complex - we need properties that have rooms with enough capacity
        // We'll handle this after fetching the data
      }

      if (options.limit) {
        query = query.limit(options.limit);
      } else {
        query = query.limit(20); // Default limit
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Filter by capacity if needed
      let filteredData = data;
      if (options.capacity && options.capacity > 0) {
        filteredData = data.filter(property => {
          if (!property.rooms || property.rooms.length === 0) {
            return false;
          }
          return property.rooms.some(room => room.capacity >= options.capacity!);
        });
      }

      // Transform the data to match our expected types
      const transformedProperties = filteredData.map((property: any) => ({
        ...property,
        location: property.location ? {
          id: property.location.id,
          name: property.location.name,
          latitude: property.location.latitude,
          longitude: property.location.longitude,
          created_at: property.location.created_at
        } : null,
        facilities: property.facilities.map((f: any) => f.facility),
        images: property.images.map((img: any) => ({
          id: img.id,
          property_id: img.property_id,
          image_url: img.image_url,
          is_primary: img.is_primary,
          created_at: img.created_at
        })),
        rooms: property.rooms || [],
        category: property.category || 'pg', // Ensure category has a default value
        // Calculate available rooms
        available_rooms: property.rooms ? property.rooms.filter((room: any) => room.is_available).length : 0,
        total_rooms: property.rooms ? property.rooms.length : 0
      }));

      setProperties(transformedProperties);
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load properties. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { properties, isLoading, error, refetch: fetchProperties };
};
