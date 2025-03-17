
import { supabase } from '@/integrations/supabase/client';

// Google AI API Key
const GOOGLE_AI_API_KEY = 'AIzaSyA88AkZfdrXeNDnRX0R45m1rw_GkstEb_U';

interface RecommendationOptions {
  userPreferences?: {
    gender?: 'boys' | 'girls' | 'common';
    budget?: number;
    amenities?: string[];
    location?: string;
    propertyType?: string;
  };
  nearbyAmenities?: boolean;
  limit?: number;
}

export const getAIRecommendations = async (options: RecommendationOptions = {}) => {
  try {
    // First fetch properties from database based on filters
    const { data: properties, error } = await supabase
      .from('properties')
      .select(`
        *,
        location:locations(name),
        facilities:property_facilities(facility:facilities(*)),
        images:property_images(image_url, is_primary)
      `)
      .eq('is_verified', true)
      .limit(options.limit || 20);

    if (error) {
      throw error;
    }

    if (!properties || properties.length === 0) {
      return { data: [], error: 'No properties found for recommendation analysis' };
    }

    // Create a preference description for the AI
    const preferences = options.userPreferences ? `
      User preferences:
      ${options.userPreferences.gender ? `- Gender: ${options.userPreferences.gender}` : ''}
      ${options.userPreferences.budget ? `- Budget: ₹${options.userPreferences.budget} per month` : ''}
      ${options.userPreferences.location ? `- Preferred location: ${options.userPreferences.location}` : ''}
      ${options.userPreferences.propertyType ? `- Property type: ${options.userPreferences.propertyType}` : ''}
      ${options.userPreferences.amenities && options.userPreferences.amenities.length > 0 
        ? `- Desired amenities: ${options.userPreferences.amenities.join(', ')}` 
        : ''}
    ` : 'No specific user preferences provided.';

    // Process properties for AI input
    const propertyDescriptions = properties.map(property => {
      const facilities = property.facilities 
        ? property.facilities.map((f: any) => f.facility.name).join(', ')
        : 'None';
      
      return `
        Property ID: ${property.id}
        Name: ${property.name}
        Type: ${property.type}
        Location: ${property.location?.name || property.address}
        Gender: ${property.gender}
        Monthly Price: ₹${property.monthly_price}
        Daily Price: ${property.daily_price ? `₹${property.daily_price}` : 'Not available'}
        Facilities: ${facilities}
      `;
    }).join('\n\n');

    // Make AI request to generate personalized recommendations
    // In a real implementation, we'd make an actual API call to Google AI
    // This is a simplified example that mocks the behavior
    console.log('Would make request to Google AI API with key:', GOOGLE_AI_API_KEY);
    console.log('User preferences:', preferences);
    console.log('Properties for recommendation:', propertyDescriptions);

    // Simulate AI recommendation by sorting properties based on preferences
    let recommendedProperties = [...properties];

    // Apply simple sorting logic based on preferences
    if (options.userPreferences) {
      // Sort by gender match first
      if (options.userPreferences.gender) {
        recommendedProperties.sort((a, b) => {
          if (a.gender === options.userPreferences?.gender && b.gender !== options.userPreferences?.gender) return -1;
          if (a.gender !== options.userPreferences?.gender && b.gender === options.userPreferences?.gender) return 1;
          return 0;
        });
      }

      // Then sort by budget match
      if (options.userPreferences.budget) {
        recommendedProperties.sort((a, b) => {
          const aDiff = Math.abs(a.monthly_price - (options.userPreferences?.budget || 0));
          const bDiff = Math.abs(b.monthly_price - (options.userPreferences?.budget || 0));
          return aDiff - bDiff;
        });
      }
    }

    // Limit the results
    recommendedProperties = recommendedProperties.slice(0, options.limit || 5);

    return {
      data: recommendedProperties,
      message: 'AI recommendations generated successfully'
    };
  } catch (error: any) {
    console.error('Error generating AI recommendations:', error);
    return { data: [], error: error.message };
  }
};

// Function to get property insights using AI
export const getPropertyInsights = async (propertyId: string) => {
  try {
    // Fetch property details
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        *,
        location:locations(name),
        facilities:property_facilities(facility:facilities(*)),
        images:property_images(image_url, is_primary),
        reviews(rating, comment)
      `)
      .eq('id', propertyId)
      .single();

    if (error) {
      throw error;
    }

    if (!property) {
      return { data: null, error: 'Property not found' };
    }

    // In a real implementation, we'd make an actual API call to Google AI
    console.log('Would analyze property using Google AI:', property);

    // Mock AI insights
    const avgRating = property.reviews?.length > 0 
      ? property.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / property.reviews.length
      : null;

    const insights = {
      summary: `This ${property.type} in ${property.location?.name || 'the area'} is a ${property.gender} accommodation with a monthly price of ₹${property.monthly_price}.`,
      strengths: [
        'Well located for easy commuting',
        'Competitive pricing for the area',
        ...(property.facilities?.length > 3 ? ['Good range of amenities and facilities'] : [])
      ],
      improvements: [
        'Could benefit from additional images',
        'More detailed description would help potential tenants'
      ],
      marketPosition: `This property is priced ${property.monthly_price > 10000 ? 'above' : 'below'} the average for similar accommodations in the area.`,
      rating: avgRating ? {
        value: avgRating.toFixed(1),
        sentiment: avgRating > 4 ? 'Excellent' : avgRating > 3 ? 'Good' : 'Average'
      } : null
    };

    return {
      data: insights,
      message: 'Property insights generated successfully'
    };
  } catch (error: any) {
    console.error('Error generating property insights:', error);
    return { data: null, error: error.message };
  }
};
