import { Property, PropertyWithScore } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { getGoogleAIApiKey } from './settingsService';
import { mapDbPropertyToProperty } from './typeUtils';

/**
 * Fetches property recommendations from Google AI API
 * @param property The property to find recommendations for
 * @param propertyList The list of properties to compare against
 * @returns A list of properties with match scores, sorted by score
 */
export async function getAIPropertyRecommendations(property: Property, propertyList: Property[]): Promise<PropertyWithScore[]> {
  try {
    const apiKey = await getGoogleAIApiKey();
    if (!apiKey) {
      console.warn('Google AI API key not found. Recommendations will not be available.');
      return propertyList.map(p => ({ ...p, matchScore: 0, ai_strengths: [] }));
    }

    const model = 'gemini-1.0-pro';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Construct the prompt
    const prompt = `
      Analyze the following property and provide its 3 unique strengths that differentiate it from other properties.
      Also, compare the property to the following list of properties and provide a match score between 0 and 100.
      Return the results as a JSON array.
      
      Base Property:
      ${JSON.stringify(property, null, 2)}

      Comparison Properties:
      ${JSON.stringify(propertyList, null, 2)}
    `;

    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Extract the AI response
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Parse the AI response as JSON
    const recommendations = JSON.parse(aiResponse) as PropertyWithScore[];

    // Sort the properties by match score
    recommendations.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return recommendations;
  } catch (error) {
    console.error('Error fetching AI recommendations:', error);
    return propertyList.map(p => ({ ...p, matchScore: 0, ai_strengths: [] }));
  }
}

/**
 * Processes a list of properties to add AI-related fields
 * @param properties The list of properties to process
 * @returns A list of properties with AI-related fields
 */
const processPropertiesForAI = (properties: any[]): PropertyWithScore[] => {
  // Convert DB properties to our frontend Property type with AI-specific fields
  return properties.map(property => {
    const mappedProperty = mapDbPropertyToProperty(property);
    return {
      ...mappedProperty,
      matchScore: 0, // Default score to be calculated later
      ai_strengths: [] // Empty array to be populated later
    };
  });
};

/**
 * Fetches all properties from Supabase and enriches them with AI recommendations
 * @param property The property to find recommendations for
 * @returns A list of properties with match scores, sorted by score
 */
export async function getAllAIPropertyRecommendations(property: Property): Promise<PropertyWithScore[]> {
  try {
    // Fetch all properties from Supabase
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    // Process the properties to add AI-related fields
    const processedProperties = processPropertiesForAI(properties);

    // Get AI recommendations for the property
    const recommendations = await getAIPropertyRecommendations(property, processedProperties);

    return recommendations;
  } catch (error) {
    console.error('Error fetching all AI recommendations:', error);
    return [];
  }
}
