
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
  rating?: number;
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
      query = query.ilike('locations.name', `%${filters.location}%`);
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
        // Transform the AI recommendations
        const enhancedResults = aiRecommendations.data.map(property => ({
          ...property,
          isAiRecommended: true,
          ai_strengths: property.ai_strengths || [],
          matchScore: property.matchScore || 0
        }));
        
        if (filters.rating && filters.rating > 0) {
          return enhancedResults.filter(p => 
            p.average_rating && p.average_rating >= filters.rating
          );
        }
        
        return enhancedResults;
      }
    }

    // Add random ratings for demo purposes
    const enhancedProperties = properties?.map(property => ({
      ...property,
      average_rating: Math.floor(Math.random() * 20 + 30) / 10 // Random rating between 3.0 and 5.0
    })) || [];
    
    // Apply rating filter if specified
    let filteredProperties = enhancedProperties;
    if (filters.rating && filters.rating > 0) {
      filteredProperties = enhancedProperties.filter(p => 
        p.average_rating && p.average_rating >= filters.rating
      );
    }

    // Sort results based on sortBy parameter
    let sortedProperties = [...filteredProperties];
    
    if (filters.sortBy === 'price_asc') {
      sortedProperties.sort((a, b) => a.monthly_price - b.monthly_price);
    } else if (filters.sortBy === 'price_desc') {
      sortedProperties.sort((a, b) => b.monthly_price - a.monthly_price);
    } else if (filters.sortBy === 'rating_desc') {
      sortedProperties.sort((a, b) => 
        (b.average_rating || 0) - (a.average_rating || 0)
      );
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
        location:locations(name),
        facilities:property_facilities(facility:facilities(*))
      `)
      .eq('id', propertyId)
      .single();
      
    if (error) throw error;
    
    // Get the facility IDs from the current property
    const facilityIds = property.facilities?.map((f: any) => f.facility.id) || [];
    
    // Find similar properties based on location, type, and facilities
    const { data: similarProperties } = await supabase
      .from('properties')
      .select(`
        *,
        location:locations(name),
        images:property_images(image_url, is_primary),
        facilities:property_facilities(facility:facilities(*))
      `)
      .eq('location_id', property.location_id)
      .eq('type', property.type)
      .neq('id', propertyId)
      .eq('is_verified', true)
      .limit(6);
      
    if (!similarProperties || similarProperties.length === 0) {
      // If no properties in the same location and type, try just the same location
      const { data: locationProperties } = await supabase
        .from('properties')
        .select(`
          *,
          location:locations(name),
          images:property_images(image_url, is_primary),
          facilities:property_facilities(facility:facilities(*))
        `)
        .eq('location_id', property.location_id)
        .neq('id', propertyId)
        .eq('is_verified', true)
        .limit(4);
        
      return locationProperties || [];
    }
    
    // Score and sort properties based on similarity
    const scoredProperties = similarProperties.map(prop => {
      // Calculate facility overlap
      const propFacilityIds = prop.facilities?.map((f: any) => f.facility.id) || [];
      const sharedFacilities = facilityIds.filter(id => propFacilityIds.includes(id));
      const facilityScore = facilityIds.length > 0 ? (sharedFacilities.length / facilityIds.length) : 0;
      
      // Calculate price similarity (closer to the original price = higher score)
      const priceRatio = property.monthly_price > 0 
        ? Math.min(property.monthly_price, prop.monthly_price) / Math.max(property.monthly_price, prop.monthly_price)
        : 0;
      
      // Gender match
      const genderScore = property.gender === prop.gender ? 1 : 0;
      
      // Calculate overall similarity score
      const similarityScore = (facilityScore * 0.5) + (priceRatio * 0.3) + (genderScore * 0.2);
      
      return {
        ...prop,
        similarityScore,
        average_rating: Math.floor(Math.random() * 20 + 30) / 10 // Random rating for demo
      };
    });
    
    // Sort by similarity score
    scoredProperties.sort((a, b) => b.similarityScore - a.similarityScore);
      
    return scoredProperties.slice(0, 4);
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
    
    // Count available properties by type and gender
    const typeCount: Record<string, number> = {};
    const genderCount: Record<string, number> = {};
    searchResults.forEach(property => {
      typeCount[property.type] = (typeCount[property.type] || 0) + 1;
      genderCount[property.gender] = (genderCount[property.gender] || 0) + 1;
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
      
    // Price distribution analysis
    const prices = searchResults.map(p => p.monthly_price);
    prices.sort((a, b) => a - b);
    
    const priceDistribution = {
      min: prices[0],
      lowerQuartile: prices[Math.floor(prices.length * 0.25)],
      median: prices[Math.floor(prices.length * 0.5)],
      upperQuartile: prices[Math.floor(prices.length * 0.75)],
      max: prices[prices.length - 1]
    };
    
    // Calculate average rating
    const ratedProperties = searchResults.filter(p => p.average_rating);
    const avgRating = ratedProperties.length > 0
      ? ratedProperties.reduce((sum, p) => sum + p.average_rating, 0) / ratedProperties.length
      : 0;
      
    // Best value properties (good rating relative to price)
    let bestValueProperties: any[] = [];
    if (ratedProperties.length > 0) {
      const valueScores = ratedProperties.map(p => ({
        id: p.id,
        name: p.name,
        valueScore: p.average_rating / (p.monthly_price / averagePrice),
        rating: p.average_rating,
        price: p.monthly_price
      }));
      
      valueScores.sort((a, b) => b.valueScore - a.valueScore);
      bestValueProperties = valueScores.slice(0, 3);
    }
    
    // AI-driven recommendations based on the search
    const recommendations = [];
    
    // Budget recommendation
    if (filters.maxPrice && filters.maxPrice < averagePrice) {
      recommendations.push(`Consider increasing your budget to ₹${averagePrice.toLocaleString()} for more options`);
    } else {
      recommendations.push(`The average price in this area is ₹${averagePrice.toLocaleString()}`);
    }
    
    // Amenities recommendation
    if (topAmenities.length > 0) {
      recommendations.push(`Most properties in this area offer: ${topAmenities.slice(0, 3).join(', ')}`);
    }
    
    // Property type recommendation
    if (Object.keys(typeCount).length > 0) {
      const mostCommonType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0][0];
      recommendations.push(`Most common accommodation type: ${mostCommonType}`);
    }
    
    // Gender recommendation
    if (Object.keys(genderCount).length > 0 && !filters.gender) {
      const genderDistribution = Object.entries(genderCount)
        .map(([gender, count]) => `${gender} (${Math.round(count/searchResults.length*100)}%)`)
        .join(', ');
      recommendations.push(`Gender distribution: ${genderDistribution}`);
    }
    
    // Location insight
    if (filters.location) {
      recommendations.push(`${filters.location} offers ${searchResults.length} options within your criteria`);
    }
    
    // Generate insights
    return {
      totalResults: searchResults.length,
      averagePrice,
      averageRating: avgRating.toFixed(1),
      priceRange: {
        min: Math.min(...searchResults.map(p => p.monthly_price)),
        max: Math.max(...searchResults.map(p => p.monthly_price))
      },
      priceDistribution,
      typeDistribution: typeCount,
      genderDistribution: genderCount,
      topAmenities,
      location: filters.location || 'All locations',
      bestValueProperties,
      suggestions: recommendations.filter(Boolean)
    };
  } catch (error) {
    console.error('Error generating search insights:', error);
    return null;
  }
};
