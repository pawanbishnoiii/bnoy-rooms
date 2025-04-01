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

export const listRegionProperties = (region?: string): PropertyWithScore[] => {
  const currentTime = new Date().toISOString();
  
  return [
    {
      id: "prop1",
      merchant_id: "merchant1",
      name: "Sunny PG in Delhi University North Campus",
      description: "Spacious and well-ventilated PG accommodations near Delhi University North Campus with all modern amenities and facilities.",
      type: "residential",
      category: "pg",
      address: "Vijay Nagar, Delhi University North Campus, Delhi",
      gender: "boys",
      monthly_price: 8000,
      daily_price: null,
      is_verified: true,
      is_featured: true,
      capacity: 50,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-03-10T14:45:00Z",
      location: {
        id: "loc1",
        name: "Delhi University North Campus",
        latitude: 28.6875,
        longitude: 77.2034,
        created_at: "2024-01-01T00:00:00Z"
      },
      images: [],
      facilities: [],
      rooms: [],
      available_rooms: 10,
      total_rooms: 25,
      matchScore: 0.95,
      ai_strengths: ["Close to campus", "Well-maintained", "Good security"]
    },
    {
      id: "prop2",
      merchant_id: "merchant2",
      name: "Comfort Hostel in Mumbai",
      description: "A comfortable hostel for students near Mumbai University.",
      type: "residential",
      category: "hostel",
      address: "456 Park Avenue, Mumbai",
      gender: "boys",
      monthly_price: 6000,
      daily_price: null,
      is_verified: true,
      is_featured: false,
      capacity: 20,
      created_at: "2024-02-10T12:00:00Z",
      updated_at: "2024-04-05T16:30:00Z",
      location: {
        id: "loc2",
        name: "Mumbai University",
        latitude: 18.9667,
        longitude: 72.8333,
        created_at: "2024-02-01T00:00:00Z"
      },
      images: [],
      facilities: [
        { id: "fac-1", name: "Meals", created_at: "2024-02-01T00:00:00Z" },
        { id: "fac-2", name: "Laundry", created_at: "2024-02-01T00:00:00Z" }
      ],
      rooms: [],
      matchScore: 0.85,
      ai_strengths: ["Good price match", "Near campus"]
    },
    {
      id: "prop3",
      merchant_id: "merchant3",
      name: "Student Haven in Bangalore",
      description: "A comfortable dormitory for students near Bangalore University.",
      type: "residential",
      category: "dormitory",
      address: "789 College Road, Bangalore",
      gender: "girls",
      monthly_price: 7500,
      daily_price: null,
      is_verified: true,
      is_featured: false,
      capacity: 30,
      created_at: "2024-03-05T14:00:00Z",
      updated_at: "2024-05-10T18:45:00Z",
      location: {
        id: "loc3",
        name: "Bangalore University",
        latitude: 13.0827,
        longitude: 77.5851,
        created_at: "2024-03-01T00:00:00Z"
      },
      images: [],
      facilities: [
        { id: "fac-3", name: "WiFi", created_at: "2024-03-01T00:00:00Z" },
        { id: "fac-4", name: "Gym", created_at: "2024-03-01T00:00:00Z" }
      ],
      rooms: [],
      matchScore: 0.75,
      ai_strengths: ["Good amenities", "Near university"]
    }
  ];
};

export const getPropertyRecommendations = (userId: string): PropertyWithScore[] => {
  const currentTime = new Date().toISOString();
  
  return [
    {
      id: "prop1",
      merchant_id: "merchant1",
      name: "Sunny PG in Delhi University North Campus",
      description: "Spacious and well-ventilated PG accommodations near Delhi University North Campus with all modern amenities and facilities.",
      type: "residential",
      category: "pg",
      address: "Vijay Nagar, Delhi University North Campus, Delhi",
      gender: "boys",
      monthly_price: 8000,
      daily_price: null,
      is_verified: true,
      is_featured: true,
      capacity: 50,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-03-10T14:45:00Z",
      location: {
        id: "loc1",
        name: "Delhi University North Campus",
        latitude: 28.6875,
        longitude: 77.2034,
        created_at: "2024-01-01T00:00:00Z"
      },
      images: [],
      facilities: [],
      rooms: [],
      available_rooms: 10,
      total_rooms: 25,
      matchScore: 0.92,
      ai_strengths: ["Matches your budget", "Near your preferred location", "Gender-specific accommodation"]
    },
    {
      id: "prop2",
      merchant_id: "merchant2",
      name: "Comfort Hostel in Mumbai",
      description: "A comfortable hostel for students near Mumbai University.",
      type: "residential",
      category: "hostel",
      address: "456 Park Avenue, Mumbai",
      gender: "boys",
      monthly_price: 6000,
      daily_price: null,
      is_verified: true,
      is_featured: false,
      capacity: 20,
      created_at: "2024-02-10T12:00:00Z",
      updated_at: "2024-04-05T16:30:00Z",
      location: {
        id: "loc2",
        name: "Mumbai University",
        latitude: 18.9667,
        longitude: 72.8333,
        created_at: "2024-02-01T00:00:00Z"
      },
      images: [],
      facilities: [
        { id: "fac-1", name: "Meals", created_at: "2024-02-01T00:00:00Z" },
        { id: "fac-2", name: "Laundry", created_at: "2024-02-01T00:00:00Z" }
      ],
      rooms: [],
      matchScore: 0.85,
      ai_strengths: ["Good price match", "Near campus"]
    },
    {
      id: "prop3",
      merchant_id: "merchant3",
      name: "Student Haven in Bangalore",
      description: "A comfortable dormitory for students near Bangalore University.",
      type: "residential",
      category: "dormitory",
      address: "789 College Road, Bangalore",
      gender: "girls",
      monthly_price: 7500,
      daily_price: null,
      is_verified: true,
      is_featured: false,
      capacity: 30,
      created_at: "2024-03-05T14:00:00Z",
      updated_at: "2024-05-10T18:45:00Z",
      location: {
        id: "loc3",
        name: "Bangalore University",
        latitude: 13.0827,
        longitude: 77.5851,
        created_at: "2024-03-01T00:00:00Z"
      },
      images: [],
      facilities: [
        { id: "fac-3", name: "WiFi", created_at: "2024-03-01T00:00:00Z" },
        { id: "fac-4", name: "Gym", created_at: "2024-03-01T00:00:00Z" }
      ],
      rooms: [],
      matchScore: 0.75,
      ai_strengths: ["Good amenities", "Near university"]
    }
  ];
};

export const simulatePropertySearchResults = (query: string): PropertyWithScore[] => {
  const currentTime = new Date().toISOString();
  
  return [
    {
      id: "prop1",
      merchant_id: "merchant1",
      name: "Sunny PG in Delhi University North Campus",
      description: "Spacious and well-ventilated PG accommodations near Delhi University North Campus with all modern amenities and facilities.",
      type: "residential",
      category: "pg",
      address: "Vijay Nagar, Delhi University North Campus, Delhi",
      gender: "boys",
      monthly_price: 8000,
      daily_price: null,
      is_verified: true,
      is_featured: true,
      capacity: 50,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-03-10T14:45:00Z",
      location: {
        id: "loc1",
        name: "Delhi University North Campus",
        latitude: 28.6875,
        longitude: 77.2034,
        created_at: "2024-01-01T00:00:00Z"
      },
      images: [],
      facilities: [],
      rooms: [],
      available_rooms: 10,
      total_rooms: 25,
      matchScore: 0.89,
      ai_strengths: ["Matches search query", "Good reviews", "Value for money"]
    },
    {
      id: "prop2",
      merchant_id: "merchant2",
      name: "Comfort Hostel in Mumbai",
      description: "A comfortable hostel for students near Mumbai University.",
      type: "residential",
      category: "hostel",
      address: "456 Park Avenue, Mumbai",
      gender: "boys",
      monthly_price: 6000,
      daily_price: null,
      is_verified: true,
      is_featured: false,
      capacity: 20,
      created_at: "2024-02-10T12:00:00Z",
      updated_at: "2024-04-05T16:30:00Z",
      location: {
        id: "loc2",
        name: "Mumbai University",
        latitude: 18.9667,
        longitude: 72.8333,
        created_at: "2024-02-01T00:00:00Z"
      },
      images: [],
      facilities: [
        { id: "fac-1", name: "Meals", created_at: "2024-02-01T00:00:00Z" },
        { id: "fac-2", name: "Laundry", created_at: "2024-02-01T00:00:00Z" }
      ],
      rooms: [],
      matchScore: 0.85,
      ai_strengths: ["Good price match", "Near campus"]
    },
    {
      id: "prop3",
      merchant_id: "merchant3",
      name: "Student Haven in Bangalore",
      description: "A comfortable dormitory for students near Bangalore University.",
      type: "residential",
      category: "dormitory",
      address: "789 College Road, Bangalore",
      gender: "girls",
      monthly_price: 7500,
      daily_price: null,
      is_verified: true,
      is_featured: false,
      capacity: 30,
      created_at: "2024-03-05T14:00:00Z",
      updated_at: "2024-05-10T18:45:00Z",
      location: {
        id: "loc3",
        name: "Bangalore University",
        latitude: 13.0827,
        longitude: 77.5851,
        created_at: "2024-03-01T00:00:00Z"
      },
      images: [],
      facilities: [
        { id: "fac-3", name: "WiFi", created_at: "2024-03-01T00:00:00Z" },
        { id: "fac-4", name: "Gym", created_at: "2024-03-01T00:00:00Z" }
      ],
      rooms: [],
      matchScore: 0.75,
      ai_strengths: ["Good amenities", "Near university"]
    }
  ];
};
