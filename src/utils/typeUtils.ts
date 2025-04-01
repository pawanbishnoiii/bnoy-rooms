
import { Booking, Facility, Favorite, Location, Property, PropertyImage, Room, UserProfile } from "@/types";

/**
 * Map a database property object to frontend Property type
 */
export function mapDbPropertyToProperty(dbProperty: any): Property {
  return {
    id: dbProperty.id,
    name: dbProperty.name,
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
    merchant_id: dbProperty.merchant_id,
    created_at: dbProperty.created_at,
    updated_at: dbProperty.updated_at,
    location: dbProperty.location || null,
    images: dbProperty.images || [],
    facilities: dbProperty.facilities || [],
    rooms: dbProperty.rooms || [],
    available_rooms: dbProperty.available_rooms || 0,
    total_rooms: dbProperty.total_rooms || 0
  };
}

/**
 * Map a database room object to frontend Room type
 */
export function mapDbRoomToRoom(dbRoom: any): Room {
  return {
    id: dbRoom.id,
    property_id: dbRoom.property_id,
    room_number: dbRoom.room_number,
    capacity: dbRoom.capacity || 1,
    occupied_beds: dbRoom.occupied_beds || 0,
    monthly_price: dbRoom.monthly_price || 0,
    daily_price: dbRoom.daily_price || null,
    description: dbRoom.description || null,
    is_available: dbRoom.is_available !== false, // Default to true if not specified
    created_at: dbRoom.created_at,
    updated_at: dbRoom.updated_at,
    security_deposit: dbRoom.security_deposit,
    electricity_included: dbRoom.electricity_included,
    cleaning_included: dbRoom.cleaning_included,
    food_included: dbRoom.food_included,
    facilities: dbRoom.facilities,
    images: dbRoom.images
  };
}

/**
 * Map a database booking object to frontend Booking type
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
    status: dbBooking.status || 'pending',
    payment_status: dbBooking.payment_status,
    payment_id: dbBooking.payment_id,
    special_requests: dbBooking.special_requests,
    number_of_guests: dbBooking.number_of_guests,
    cancellation_reason: dbBooking.cancellation_reason,
    refund_amount: dbBooking.refund_amount,
    created_at: dbBooking.created_at,
    updated_at: dbBooking.updated_at,
    property: dbBooking.property,
    user: dbBooking.user
  };
}

/**
 * Map a database favorite object to frontend Favorite type
 */
export function mapDbFavoriteToFavorite(dbFavorite: any): Favorite {
  return {
    id: dbFavorite.id,
    user_id: dbFavorite.user_id,
    property_id: dbFavorite.property_id,
    created_at: dbFavorite.created_at,
    property: dbFavorite.property ? mapDbPropertyToProperty(dbFavorite.property) : undefined
  };
}
