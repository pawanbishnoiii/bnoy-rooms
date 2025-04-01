
import { Property, PropertyWithScore } from "@/types";
import { getAIRecommendations } from "@/utils/googleAI";

/**
 * Search for properties using AI recommendations
 * @param query Search query string
 * @returns Array of properties with relevance scores
 */
export async function searchPropertiesWithAI(query: string): Promise<PropertyWithScore[]> {
  return await getAIRecommendations(query);
}

/**
 * Get personalized property recommendations for a user
 * @param preferences User preferences object
 * @param limit Number of results to return
 * @returns Array of properties with relevance scores and match reasons
 */
export async function getPersonalizedRecommendations(
  preferences: {
    gender?: string;
    budget?: number;
    location?: string;
    propertyType?: string;
  },
  limit: number = 5
): Promise<PropertyWithScore[]> {
  return await getAIRecommendations({ 
    userPreferences: preferences, 
    limit 
  });
}
