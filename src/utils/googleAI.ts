
import { supabase } from "@/integrations/supabase/client";
import { Property, PropertyWithScore } from "@/types";
import { mapDbPropertyToProperty } from "@/utils/typeUtils";

/**
 * Get AI recommendations for properties based on search prompt
 * @param prompt The search prompt or configuration object
 * @returns An array of properties with scores
 */
export async function getAIRecommendations(prompt: string | { userPreferences?: any, limit?: number }): Promise<PropertyWithScore[]> {
  try {
    // In a real implementation, we would call the Google AI API
    // For now, we'll fetch some random properties as a fallback
    
    // Handle both string and object parameters
    const limit = typeof prompt === 'object' && prompt.limit ? prompt.limit : 5;
    const searchQuery = typeof prompt === 'string' ? prompt : '';
    
    // Build query
    let query = supabase
      .from('properties')
      .select(`
        *,
        location:locations(*),
        images:property_images(*),
        facilities:property_facilities(facility:facilities(*))
      `)
      .limit(limit);
    
    // If we have preferences in an object format, apply filters
    if (typeof prompt === 'object' && prompt.userPreferences) {
      const { gender, budget, location, propertyType } = prompt.userPreferences;
      
      if (gender && gender !== 'common') {
        query = query.eq('gender', gender);
      }
      
      if (budget) {
        query = query.lte('monthly_price', budget);
      }
      
      if (location) {
        query = query.ilike('address', `%${location}%`);
      }
      
      if (propertyType) {
        query = query.eq('type', propertyType);
      }
    } else if (searchQuery) {
      // If we have a string query, search by name or address
      query = query.or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
    }
    
    const { data, error } = await query;
      
    if (error) {
      throw new Error(error.message);
    }
    
    // Map and add scores
    return data.map((property: any, index: number) => {
      // Convert to Property type
      const mappedProperty = mapDbPropertyToProperty(property);
      
      // Add a score (just for demonstration)
      const score = 1 - (index * 0.1); // Descending scores
      
      // Generate a simple match reason based on prompt or preferences
      let matchReason = '';
      
      if (typeof prompt === 'object' && prompt.userPreferences) {
        const { gender, budget, location } = prompt.userPreferences;
        if (gender) matchReason += `Matches your gender preference (${gender}). `;
        if (budget) matchReason += `Within your budget of ₹${budget}. `;
        if (location) matchReason += `Located near ${location}. `;
      } else if (searchQuery) {
        matchReason = `Matches your search for "${searchQuery}"`;
      }
      
      if (!matchReason) {
        matchReason = 'Recommended based on popularity';
      }
      
      return {
        ...mappedProperty,
        score,
        matchReason
      };
    });
  } catch (error) {
    console.error('Error in getAIRecommendations:', error);
    return [];
  }
}
