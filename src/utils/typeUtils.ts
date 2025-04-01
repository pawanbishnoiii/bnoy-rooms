
import { Property, Booking, Favorite, Room, PropertyImage, Facility, Location, UserProfile } from '@/types';

/**
 * Safely maps database property objects to our Property interface
 * @param dbProperty The property object from the database
 * @returns Property object that conforms to our interface
 */
export function mapDbPropertyToProperty(dbProperty: any): Property {
  // Start with default values for required fields
  const property: Property = {
    id: dbProperty.id,
    merchant_id: dbProperty.merchant_id,
    name: dbProperty.name || '',
    description: dbProperty.description || '',
    type: dbProperty.type || 'residential',
    category: dbProperty.category || 'pg',
    address: dbProperty.address || '',
    gender: dbProperty.gender || 'common',
    monthly_price: dbProperty.monthly_price || 0,
    daily_price: dbProperty.daily_price || null,
    is_verified: dbProperty.is_verified || false,
    is_featured: dbProperty.is_featured || false,
    capacity: dbProperty.capacity || 0,
    rating: dbProperty.rating || 0,
    review_count: dbProperty.review_count || 0,
    created_at: dbProperty.created_at,
    updated_at: dbProperty.updated_at,
    // Handle nested objects with safe defaults
    location: dbProperty.location || null,
    images: Array.isArray(dbProperty.images) ? dbProperty.images : [],
    facilities: Array.isArray(dbProperty.facilities) ? dbProperty.facilities : [],
    rooms: Array.isArray(dbProperty.rooms) ? dbProperty.rooms : [],
    // Optional fields
    available_rooms: dbProperty.available_rooms,
    total_rooms: dbProperty.total_rooms,
    security_deposit: dbProperty.security_deposit,
    electricity_included: dbProperty.electricity_included,
    cleaning_included: dbProperty.cleaning_included,
    food_included: dbProperty.food_included,
    average_rating: dbProperty.average_rating,
    matchScore: dbProperty.matchScore,
    ai_strengths: dbProperty.ai_strengths,
    // Include latitude/longitude directly on the property to simplify map rendering
    latitude: dbProperty.latitude || (dbProperty.location?.latitude) || 0,
    longitude: dbProperty.longitude || (dbProperty.location?.longitude) || 0,
  };

  return property;
}

/**
 * Maps database booking objects to our Booking interface
 * @param dbBooking The booking object from the database
 * @returns Booking object that conforms to our interface
 */
export function mapDbBookingToBooking(dbBooking: any): Booking {
  return {
    id: dbBooking.id,
    user_id: dbBooking.user_id,
    property_id: dbBooking.property_id,
    room_id: dbBooking.room_id,
    check_in_date: dbBooking.check_in_date,
    check_out_date: dbBooking.check_out_date,
    check_in_time: dbBooking.check_in_time,
    check_out_time: dbBooking.check_out_time,
    time_frame: dbBooking.time_frame,
    price_per_unit: dbBooking.price_per_unit,
    total_amount: dbBooking.total_amount,
    status: dbBooking.status,
    payment_status: dbBooking.payment_status,
    payment_id: dbBooking.payment_id,
    special_requests: dbBooking.special_requests,
    number_of_guests: dbBooking.number_of_guests,
    cancellation_reason: dbBooking.cancellation_reason,
    refund_amount: dbBooking.refund_amount,
    created_at: dbBooking.created_at,
    updated_at: dbBooking.updated_at,
    // Handle nested objects safely
    property: dbBooking.property ? mapDbPropertyToProperty(dbBooking.property) : undefined,
    user: dbBooking.user || undefined,
  };
}

/**
 * Maps database favorite objects to our Favorite interface
 * @param dbFavorite The favorite object from the database
 * @returns Favorite object that conforms to our interface
 */
export function mapDbFavoriteToFavorite(dbFavorite: any): Favorite {
  return {
    id: dbFavorite.id,
    user_id: dbFavorite.user_id,
    property_id: dbFavorite.property_id,
    created_at: dbFavorite.created_at,
    // Handle nested property if it exists
    property: dbFavorite.property ? mapDbPropertyToProperty(dbFavorite.property) : undefined,
  };
}

/**
 * A utility function to safely cast database objects to our interfaces
 * This is useful when working with data from Supabase that doesn't match our types exactly
 */
export function safelyMapData<T>(data: any, mapper: (item: any) => T): T[] {
  if (!Array.isArray(data)) return [];
  return data.map(mapper);
}
