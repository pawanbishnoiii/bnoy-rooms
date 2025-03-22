
import { supabase } from '@/integrations/supabase/client';
import { getAIRecommendations } from '@/utils/googleAI';

export interface SearchFilters {
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  gender?: 'boys' | 'girls' | 'common';
  amenities?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'recent';
  aiEnabled?: boolean;
}

export const searchProperties = async (filters: SearchFilters) => {
  try {
    // Start with a basic query
    let query = supabase
      .from('properties')
      .select(`
        *,
        location:locations(name),
        facilities:property_facilities(facility:facilities(*)),
        images:property_images(image_url, is_primary)
      `)
      .eq('is_verified', true);

    // Apply filters
    if (filters.location) {
      query = query.eq('location.name', filters.location);
    }

    if (filters.propertyType) {
      query = query.eq('type', filters.propertyType);
    }

    if (filters.gender && filters.gender !== 'common') {
      query = query.eq('gender', filters.gender);
    }

    if (filters.minPrice) {
      query = query.gte('monthly_price', filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte('monthly_price', filters.maxPrice);
    }

    // Execute the query
    const { data: properties, error } = await query.limit(20);

    if (error) {
      throw new Error(error.message);
    }

    // If AI is enabled, use AI recommendations
    if (filters.aiEnabled && properties && properties.length > 0) {
      const aiRecommendations = await getAIRecommendations({
        userPreferences: {
          gender: filters.gender,
          budget: filters.maxPrice,
          amenities: filters.amenities,
          location: filters.location,
          propertyType: filters.propertyType
        },
        limit: 20
      });

      if (aiRecommendations.data && aiRecommendations.data.length > 0) {
        // Add a flag to identify AI-recommended properties
        return aiRecommendations.data.map(property => ({
          ...property,
          isAiRecommended: true
        }));
      }
    }

    // Sort results based on sortBy parameter
    let sortedProperties = [...(properties || [])];
    
    if (filters.sortBy === 'price_asc') {
      sortedProperties.sort((a, b) => a.monthly_price - b.monthly_price);
    } else if (filters.sortBy === 'price_desc') {
      sortedProperties.sort((a, b) => b.monthly_price - a.monthly_price);
    } else if (filters.sortBy === 'recent') {
      sortedProperties.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    
    return sortedProperties;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

export const getPropertyRecommendations = async (propertyId: string) => {
  try {
    // Get details of the current property
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        *,
        location:locations(name)
      `)
      .eq('id', propertyId)
      .single();
      
    if (error) throw error;
    
    // Find similar properties based on location and type
    const { data: similarProperties } = await supabase
      .from('properties')
      .select(`
        *,
        location:locations(name),
        images:property_images(image_url, is_primary)
      `)
      .eq('location_id', property.location_id)
      .eq('type', property.type)
      .neq('id', propertyId)
      .eq('is_verified', true)
      .limit(4);
      
    return similarProperties || [];
  } catch (error) {
    console.error('Error getting property recommendations:', error);
    throw error;
  }
};

// Function to generate search insights with AI
export const generateSearchInsights = (searchResults: any[], filters: SearchFilters) => {
  if (!searchResults || searchResults.length === 0) return null;
  
  try {
    // Calculate average price
    const totalPrice = searchResults.reduce((sum, property) => sum + property.monthly_price, 0);
    const averagePrice = Math.round(totalPrice / searchResults.length);
    
    // Count available properties by type
    const typeCount: Record<string, number> = {};
    searchResults.forEach(property => {
      typeCount[property.type] = (typeCount[property.type] || 0) + 1;
    });
    
    // Find most common amenities
    const amenitiesCount: Record<string, number> = {};
    searchResults.forEach(property => {
      if (property.facilities) {
        property.facilities.forEach((facility: any) => {
          const facilityName = facility.facility?.name;
          if (facilityName) {
            amenitiesCount[facilityName] = (amenitiesCount[facilityName] || 0) + 1;
          }
        });
      }
    });
    
    const topAmenities = Object.entries(amenitiesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
    
    // Generate insights
    return {
      totalResults: searchResults.length,
      averagePrice,
      priceRange: {
        min: Math.min(...searchResults.map(p => p.monthly_price)),
        max: Math.max(...searchResults.map(p => p.monthly_price))
      },
      typeDistribution: typeCount,
      topAmenities,
      location: filters.location || 'All locations',
      suggestions: [
        filters.maxPrice && filters.maxPrice < averagePrice
          ? `Consider increasing your budget to ₹${averagePrice.toLocaleString()} for more options`
          : `The average price in this area is ₹${averagePrice.toLocaleString()}`,
        topAmenities.length > 0
          ? `Most properties in this area offer: ${topAmenities.slice(0, 3).join(', ')}`
          : null,
        Object.keys(typeCount).length > 0
          ? `Most common accommodation type: ${
              Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0][0]
            }`
          : null
      ].filter(Boolean)
    };
  } catch (error) {
    console.error('Error generating search insights:', error);
    return null;
  }
};
