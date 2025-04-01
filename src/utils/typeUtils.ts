
import { Property, PropertyCategory, GenderOption, Booking, Favorite, Room, Review } from '@/types';
import { Database } from '@/integrations/supabase/types';

// Type for database property row
export type SupabaseProperty = Database['public']['Tables']['properties']['Row'];
export type SupabaseRoom = Database['public']['Tables']['rooms']['Row'];
export type SupabaseBooking = Database['public']['Tables']['bookings']['Row'];

/**
 * Maps a database property object to the frontend Property type
 */
export function mapDbPropertyToProperty(dbProperty: any): Property {
  // Default values for required fields that might be missing
  const defaultValues = {
    is_featured: false,
    capacity: 0,
    rooms: [],
    facilities: [],
    images: [],
    location: null,
  };

  return {
    ...dbProperty,
    ...defaultValues,
    // Ensure properties match the expected types
    is_featured: dbProperty.is_featured || false,
    category: (dbProperty.category as PropertyCategory) || 'pg',
    gender: dbProperty.gender as GenderOption,
    // Add properties from type that might be missing in database object
    // but are required by the Property type
    location: dbProperty.location || null,
    facilities: dbProperty.facilities || [],
    images: dbProperty.images || [],
    rooms: dbProperty.rooms || [],
    capacity: dbProperty.capacity || 0
  };
}

/**
 * Maps a database booking object to the frontend Booking type
 */
export function mapDbBookingToBooking(dbBooking: any): Booking {
  // Get property from dbBooking if it exists
  let property = null;
  if (dbBooking.property) {
    property = mapDbPropertyToProperty(dbBooking.property);
  }

  return {
    ...dbBooking,
    // Ensure the status is of the correct type
    status: dbBooking.status || 'pending',
    // Map the property if it exists
    property: property,
    // Set default values for optional fields
    payment_status: dbBooking.payment_status || 'pending',
    payment_id: dbBooking.payment_id || undefined,
    number_of_guests: dbBooking.number_of_guests || 1,
  } as Booking;
}

/**
 * Maps a database favorite object to the frontend Favorite type
 */
export function mapDbFavoriteToFavorite(dbFavorite: any): Favorite {
  // Get property from dbFavorite if it exists
  let property = null;
  if (dbFavorite.property) {
    property = mapDbPropertyToProperty(dbFavorite.property);
  }

  return {
    id: dbFavorite.id,
    user_id: dbFavorite.user_id,
    property_id: dbFavorite.property_id,
    created_at: dbFavorite.created_at,
    property: property
  };
}

/**
 * Maps a database room object to the frontend Room type
 */
export function mapDbRoomToRoom(dbRoom: any): Room {
  return {
    ...dbRoom,
    // Set default values for optional fields
    is_available: dbRoom.is_available !== false, // Default to true if not explicitly false
    occupied_beds: dbRoom.occupied_beds || 0,
    security_deposit: dbRoom.security_deposit || 0,
    electricity_included: dbRoom.electricity_included || false,
    cleaning_included: dbRoom.cleaning_included || false,
    food_included: dbRoom.food_included || false,
    facilities: dbRoom.facilities || [],
    images: dbRoom.images || []
  };
}
