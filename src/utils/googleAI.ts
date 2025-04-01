
import { supabase } from '@/integrations/supabase/client';
import { Property, Location, Facility, PropertyImage, PropertyWithScore } from '@/types';
import { mapDbPropertyToProperty } from './typeUtils';

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

    // Map database objects to our PropertyWithScore interface and simulate an AI recommendation
    const recommendedProperties = properties.map((property: any) => {
      // Create property object using our mapper to ensure it conforms to our interfaces
      const mappedProperty = mapDbPropertyToProperty(property);
      
      // Add the score and strengths properties
      const propertyWithScore: PropertyWithScore = {
        ...mappedProperty,
        matchScore: 100, // Default score
        ai_strengths: ['Good location', 'Well priced']
      };
      
      return propertyWithScore;
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
          const propertyFacilityNames = property.facilities?.map(f => f.name.toLowerCase()) || [];
          const requestedAmenities = options.userPreferences.amenities.map(a => a.toLowerCase());
          
          const matchedAmenities = requestedAmenities.filter(a => 
            propertyFacilityNames.some(f => f.includes(a))
          );
          
          const amenityScore = (matchedAmenities.length / requestedAmenities.length) * 20;
          matchScore -= 20 - amenityScore;
        }
        
        // Update the property score
        property.matchScore = Math.max(0, Math.min(100, matchScore));
        
        // Generate AI strengths based on the property's features
        const strengths: string[] = [];
        
        // Add strengths based on property features
        if (property.location?.name && options.userPreferences?.location && 
            property.location.name.toLowerCase().includes(options.userPreferences.location.toLowerCase())) {
          strengths.push('Excellent location match');
        }
        
        if (options.userPreferences?.budget && property.monthly_price <= options.userPreferences.budget) {
          strengths.push('Within budget');
        }
        
        if (property.facilities && property.facilities.length > 5) {
          strengths.push('Well-equipped');
        }
        
        if (property.is_verified) {
          strengths.push('Verified property');
        }
        
        if (property.average_rating && property.average_rating >= 4.5) {
          strengths.push('Highly rated');
        }
        
        // Ensure we have at least 2 strengths
        if (strengths.length < 2) {
          strengths.push('Good value');
        }
        
        property.ai_strengths = strengths.slice(0, 3); // Limit to top 3 strengths
      });
      
      // Sort by match score (descending)
      recommendedProperties.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    // Return the top N recommendations based on the limit
    return { 
      data: recommendedProperties.slice(0, options.limit || 4),
      error: null
    };
    
  } catch (error: any) {
    console.error('Error in AI recommendations:', error);
    return {
      data: [],
      error: error.message
    };
  }
};
