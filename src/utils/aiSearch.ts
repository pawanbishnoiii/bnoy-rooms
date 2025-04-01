
import { Property, PropertyWithScore } from "@/types";
import { getAIRecommendations } from "@/utils/googleAI";

/**
 * Search for properties using AI-powered recommendations
 */
export async function searchPropertiesWithAI(query: string): Promise<PropertyWithScore[]> {
  try {
    // Call the AI recommendation function
    const properties = await getAIRecommendations(query);
    return properties;
  } catch (error) {
    console.error("Error searching properties with AI:", error);
    return [];
  }
}
