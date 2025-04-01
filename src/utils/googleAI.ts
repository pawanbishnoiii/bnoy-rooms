
import { Property, PropertyWithScore } from "@/types";

/**
 * Get AI recommendations based on query or user preferences
 * @param query Search query string or user preferences object
 * @returns Array of properties with relevance scores
 */
export async function getAIRecommendations(
  query: string | { userPreferences?: any; limit?: number }
): Promise<PropertyWithScore[]> {
  // This is a stub implementation that would be replaced with actual AI logic
  console.log("Generating AI recommendations for:", query);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data
  return [
    {
      id: "property-1",
      name: "Sunrise PG",
      type: "pg",
      address: "123 Main Street, Delhi",
      monthly_price: 8000,
      average_rating: 4.5,
      images: [{ image_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5" }],
      is_verified: true,
      location: { 
        name: "Central Delhi", 
        latitude: 28.6139, 
        longitude: 77.209
      },
      facilities: [{ name: "WiFi" }, { name: "AC" }],
      score: 0.95,
      match_reason: "High match based on location and amenities"
    },
    {
      id: "property-2",
      name: "Comfort Hostel",
      type: "hostel",
      address: "456 Park Avenue, Mumbai",
      monthly_price: 6000,
      average_rating: 4.2,
      images: [{ image_url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af" }],
      is_verified: true,
      location: { 
        name: "South Mumbai", 
        latitude: 18.9667, 
        longitude: 72.8333
      },
      facilities: [{ name: "Meals" }, { name: "Laundry" }],
      score: 0.85,
      match_reason: "Good price match for your budget"
    },
    {
      id: "property-3",
      name: "Student Haven",
      type: "dormitory",
      address: "789 College Road, Bangalore",
      monthly_price: 7500,
      average_rating: 4.0,
      images: [{ image_url: "https://images.unsplash.com/photo-1554995207-c18c203602cb" }],
      is_verified: true,
      location: { 
        name: "North Bangalore", 
        latitude: 13.0827, 
        longitude: 77.5851
      },
      facilities: [{ name: "WiFi" }, { name: "Gym" }],
      score: 0.75,
      match_reason: "Close to university and good amenities"
    }
  ];
}
