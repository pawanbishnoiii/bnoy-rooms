
import { Property, PropertyWithScore, PropertyCategory, GenderOption } from "@/types";

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
  
  // Return mock data with correct types
  const currentTime = new Date().toISOString();
  
  return [
    {
      id: "property-1",
      name: "Sunrise PG",
      type: "residential",
      category: "pg" as PropertyCategory,
      address: "123 Main Street, Delhi",
      monthly_price: 8000,
      average_rating: 4.5,
      gender: "common" as GenderOption,
      merchant_id: "merchant-1",
      description: "A comfortable PG accommodation",
      is_verified: true,
      is_featured: false,
      capacity: 10,
      created_at: currentTime,
      updated_at: currentTime,
      images: [{ 
        id: "img-1", 
        property_id: "property-1", 
        image_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5",
        is_primary: true,
        created_at: currentTime
      }],
      location: { 
        id: "loc-1",
        name: "Central Delhi", 
        latitude: 28.6139, 
        longitude: 77.209,
        created_at: currentTime
      },
      facilities: [
        { id: "fac-1", name: "WiFi", created_at: currentTime }, 
        { id: "fac-2", name: "AC", created_at: currentTime }
      ],
      rooms: [],
      score: 0.95,
      match_reason: "High match based on location and amenities"
    },
    {
      id: "property-2",
      name: "Comfort Hostel",
      type: "residential",
      category: "hostel" as PropertyCategory,
      address: "456 Park Avenue, Mumbai",
      monthly_price: 6000,
      average_rating: 4.2,
      gender: "boys" as GenderOption,
      merchant_id: "merchant-2",
      description: "A comfortable hostel for students",
      is_verified: true,
      is_featured: false,
      capacity: 20,
      created_at: currentTime,
      updated_at: currentTime,
      images: [{ 
        id: "img-2", 
        property_id: "property-2", 
        image_url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af",
        is_primary: true,
        created_at: currentTime
      }],
      location: { 
        id: "loc-2",
        name: "South Mumbai", 
        latitude: 18.9667, 
        longitude: 72.8333,
        created_at: currentTime
      },
      facilities: [
        { id: "fac-3", name: "Meals", created_at: currentTime }, 
        { id: "fac-4", name: "Laundry", created_at: currentTime }
      ],
      rooms: [],
      score: 0.85,
      match_reason: "Good price match for your budget"
    },
    {
      id: "property-3",
      name: "Student Haven",
      type: "residential",
      category: "dormitory" as PropertyCategory,
      address: "789 College Road, Bangalore",
      monthly_price: 7500,
      average_rating: 4.0,
      gender: "girls" as GenderOption,
      merchant_id: "merchant-3",
      description: "A comfortable dormitory for students",
      is_verified: true,
      is_featured: false,
      capacity: 30,
      created_at: currentTime,
      updated_at: currentTime,
      images: [{ 
        id: "img-3", 
        property_id: "property-3", 
        image_url: "https://images.unsplash.com/photo-1554995207-c18c203602cb",
        is_primary: true,
        created_at: currentTime
      }],
      location: { 
        id: "loc-3",
        name: "North Bangalore", 
        latitude: 13.0827, 
        longitude: 77.5851,
        created_at: currentTime
      },
      facilities: [
        { id: "fac-5", name: "WiFi", created_at: currentTime }, 
        { id: "fac-6", name: "Gym", created_at: currentTime }
      ],
      rooms: [],
      score: 0.75,
      match_reason: "Close to university and good amenities"
    }
  ];
}
