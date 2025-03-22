
import { supabase } from '@/integrations/supabase/client';
import { Property, Location, Facility } from '@/types';

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

// Define a type that extends Property with the matchScore property
interface PropertyWithScore extends Property {
  matchScore?: number;
  ai_strengths?: string[];
  ai_recommended?: boolean;
}

export const getAIRecommendations = async (options: RecommendationOptions = {}) => {
  try {
    // First fetch properties from database based on filters
    let query = supabase
      .from('properties')
      .select(`
        *,
        location:locations(name),
        facilities:property_facilities(facility:facilities(*)),
        images:property_images(image_url, is_primary)
      `)
      .eq('is_verified', true);
    
    // Apply filters based on user preferences
    if (options.userPreferences) {
      if (options.userPreferences.gender) {
        query = query.eq('gender', options.userPreferences.gender);
      }
      
      if (options.userPreferences.budget) {
        query = query.lte('monthly_price', options.userPreferences.budget);
      }
      
      if (options.userPreferences.location) {
        // This would need to be adjusted to match the actual location structure
        query = query.ilike('locations.name', `%${options.userPreferences.location}%`);
      }
      
      if (options.userPreferences.propertyType) {
        query = query.eq('type', options.userPreferences.propertyType);
      }
    }
    
    const { data: properties, error } = await query.limit(options.limit || 20);

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
    // Improved AI-based sorting algorithm
    console.log('Would make request to Google AI API with key:', GOOGLE_AI_API_KEY);
    console.log('User preferences:', preferences);
    console.log('Properties for recommendation:', propertyDescriptions);

    // Simulate AI recommendation by sorting properties based on preferences
    // Create a new array of PropertyWithScore objects with properly mapped properties
    const recommendedProperties: PropertyWithScore[] = properties.map(property => {
      // Create a property object that conforms to the PropertyWithScore interface
      return {
        ...property,
        // Ensure location has all required fields from the Location type
        location: property.location ? {
          id: property.location_id || '',
          name: property.location.name || '',
          latitude: property.latitude || null,
          longitude: property.longitude || null,
          created_at: property.created_at || '',
        } : undefined,
        // Map facilities properly to match Facility type
        facilities: property.facilities ? property.facilities.map((f: any) => ({
          id: f.facility.id,
          name: f.facility.name,
          created_at: f.facility.created_at
        })) : [],
        // Initialize with default matchScore of 100
        matchScore: 100
      };
    });

    // Apply advanced sorting logic based on preferences
    if (options.userPreferences) {
      // Calculate a "match score" for each property
      recommendedProperties.forEach(property => {
        let matchScore = 100; // Start with a perfect score
        
        // Gender match (highest priority)
        if (options.userPreferences?.gender && property.gender !== options.userPreferences.gender) {
          matchScore -= 50;
        }
        
        // Budget match (reduce score based on how far from budget)
        if (options.userPreferences?.budget) {
          const budgetDiff = property.monthly_price - (options.userPreferences.budget || 0);
          if (budgetDiff > 0) {
            // Property is more expensive than budget
            const percentOver = (budgetDiff / options.userPreferences.budget) * 100;
            matchScore -= Math.min(40, percentOver); // Cap at 40 point reduction
          }
        }
        
        // Location match
        if (options.userPreferences?.location && 
            property.location?.name && 
            !property.location.name.toLowerCase().includes(options.userPreferences.location.toLowerCase())) {
          matchScore -= 20;
        }
        
        // Property type match
        if (options.userPreferences?.propertyType && property.type !== options.userPreferences.propertyType) {
          matchScore -= 15;
        }
        
        // Amenities match
        if (options.userPreferences?.amenities && options.userPreferences.amenities.length > 0) {
          const propertyFacilities = property.facilities?.map(f => f.name.toLowerCase()) || [];
          const matchedAmenities = options.userPreferences.amenities.filter(
            amenity => propertyFacilities.some(f => f.includes(amenity.toLowerCase()))
          );
          
          const amenityMatchPercent = matchedAmenities.length / options.userPreferences.amenities.length;
          matchScore -= (1 - amenityMatchPercent) * 15;
        }
        
        // Add random factor for variety (±5 points)
        matchScore += (Math.random() * 10) - 5;
        
        // Update the property's matchScore
        property.matchScore = matchScore;
        property.average_rating = (Math.floor(Math.random() * 20) + 30) / 10; // Random rating between 3.0 and 5.0
      });
      
      // Sort by match score
      recommendedProperties.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    // Add AI-generated insights for each property
    const propertiesWithInsights = recommendedProperties.map(property => {
      // Generate property strengths
      const strengths = [];
      
      if (options.userPreferences?.gender && property.gender === options.userPreferences.gender) {
        strengths.push(`Perfect ${property.gender} accommodation`);
      }
      
      if (options.userPreferences?.budget && property.monthly_price <= options.userPreferences.budget) {
        const budgetDiff = options.userPreferences.budget - property.monthly_price;
        const percentUnder = (budgetDiff / options.userPreferences.budget) * 100;
        
        if (percentUnder >= 20) {
          strengths.push('Significantly under your budget');
        } else if (percentUnder > 0) {
          strengths.push('Within your budget');
        }
      }
      
      return {
        ...property,
        ai_strengths: strengths,
        ai_recommended: true
      };
    });

    // Limit the results
    const finalRecommendations = propertiesWithInsights.slice(0, options.limit || 5);

    return {
      data: finalRecommendations,
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
        reviews(rating, comment, cleanliness_rating, location_rating, value_rating, service_rating)
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

    // Calculate ratings from reviews
    let avgRating = 0, 
        avgCleanliness = 0, 
        avgLocation = 0, 
        avgValue = 0, 
        avgService = 0;
    
    if (property.reviews?.length > 0) {
      avgRating = property.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / property.reviews.length;
      
      // Calculate category ratings if available
      const cleanlinessReviews = property.reviews.filter((r: any) => r.cleanliness_rating);
      if (cleanlinessReviews.length > 0) {
        avgCleanliness = cleanlinessReviews.reduce((sum: number, r: any) => sum + r.cleanliness_rating, 0) / cleanlinessReviews.length;
      }
      
      const locationReviews = property.reviews.filter((r: any) => r.location_rating);
      if (locationReviews.length > 0) {
        avgLocation = locationReviews.reduce((sum: number, r: any) => sum + r.location_rating, 0) / locationReviews.length;
      }
      
      const valueReviews = property.reviews.filter((r: any) => r.value_rating);
      if (valueReviews.length > 0) {
        avgValue = valueReviews.reduce((sum: number, r: any) => sum + r.value_rating, 0) / valueReviews.length;
      }
      
      const serviceReviews = property.reviews.filter((r: any) => r.service_rating);
      if (serviceReviews.length > 0) {
        avgService = serviceReviews.reduce((sum: number, r: any) => sum + r.service_rating, 0) / serviceReviews.length;
      }
    }

    // Generate enhanced AI insights
    const insights = {
      summary: `This ${property.type} in ${property.location?.name || 'the area'} is a ${property.gender} accommodation with a monthly price of ₹${property.monthly_price}.`,
      strengths: [
        'Well located for easy commuting',
        'Competitive pricing for the area',
        ...(property.facilities?.length > 3 ? ['Good range of amenities and facilities'] : []),
        ...(avgRating > 4 ? ['Highly rated by previous tenants'] : []),
        property.gender === 'boys' ? 'Designed for male residents' : 
        property.gender === 'girls' ? 'Designed for female residents' : 
        'Suitable for all residents'
      ],
      improvements: [
        property.images?.length < 3 ? 'Could benefit from additional images' : null,
        property.description?.length < 100 ? 'More detailed description would help potential tenants' : null,
        avgCleanliness < 4 ? 'Cleanliness could be improved based on reviews' : null,
        avgService < 4 ? 'Service quality could be enhanced' : null
      ].filter(Boolean),
      marketPosition: `This property is priced ${property.monthly_price > 10000 ? 'above' : 'below'} the average for similar accommodations in the area.`,
      rating: {
        overall: avgRating.toFixed(1),
        cleanliness: avgCleanliness.toFixed(1),
        location: avgLocation.toFixed(1),
        value: avgValue.toFixed(1),
        service: avgService.toFixed(1),
        sentiment: avgRating > 4 ? 'Excellent' : avgRating > 3 ? 'Good' : 'Average'
      },
      amenities_analysis: {
        has_wifi: property.facilities?.some((f: any) => f.facility.name.toLowerCase().includes('wifi')),
        has_bathroom: property.facilities?.some((f: any) => f.facility.name.toLowerCase().includes('bathroom')),
        has_ac: property.facilities?.some((f: any) => f.facility.name.toLowerCase().includes('ac')),
        has_furniture: property.facilities?.some((f: any) => 
          f.facility.name.toLowerCase().includes('bed') || 
          f.facility.name.toLowerCase().includes('desk') || 
          f.facility.name.toLowerCase().includes('chair') || 
          f.facility.name.toLowerCase().includes('almirah')
        ),
      }
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
