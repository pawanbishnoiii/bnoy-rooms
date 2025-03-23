
import { Property, Booking, Favorite, Room, PropertyImage, Facility, Location, UserProfile } from '@/types';

/**
 * Safely maps database property objects to our Property interface
 * @param dbProperty The property object from the database
 * @returns Property object that conforms to our interface
 */
export function mapDbPropertyToProperty(dbProperty: any): Property {
  return {
    id: dbProperty.id,
    merchant_id: dbProperty.merchant_id,
    name: dbProperty.name,
    description: dbProperty.description || '',
    type: dbProperty.type,
    category: dbProperty.category,
    address: dbProperty.address,
    gender: dbProperty.gender,
    monthly_price: dbProperty.monthly_price,
    daily_price: dbProperty.daily_price,
    is_verified: dbProperty.is_verified || false,
    is_featured: dbProperty.is_featured || false,
    capacity: dbProperty.capacity || 0,
    rating: dbProperty.rating,
    review_count: dbProperty.review_count,
    created_at: dbProperty.created_at,
    updated_at: dbProperty.updated_at,
    // Handle nested objects
    location: dbProperty.location as Location,
    latitude: dbProperty.latitude,
    longitude: dbProperty.longitude,
    // Handle arrays
    images: (dbProperty.images || []) as PropertyImage[],
    facilities: (dbProperty.facilities || []) as Facility[],
    rooms: (dbProperty.rooms || []) as Room[],
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
  };
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
    // Handle nested objects if they exist
    property: dbBooking.property ? mapDbPropertyToProperty(dbBooking.property) : undefined,
    user: dbBooking.user as UserProfile,
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
