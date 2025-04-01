
import { Property } from '@/types';

/**
 * Maps database property object to our frontend Property type
 */
export function mapDbPropertyToProperty(dbProperty: any): Property {
  return {
    id: dbProperty.id,
    name: dbProperty.name || '',
    address: dbProperty.address || '',
    description: dbProperty.description || '',
    type: dbProperty.type || '',
    category: dbProperty.category || 'pg',
    gender: dbProperty.gender || 'common',
    merchant_id: dbProperty.merchant_id,
    monthly_price: dbProperty.monthly_price || 0,
    daily_price: dbProperty.daily_price || 0,
    is_verified: dbProperty.is_verified || false,
    is_featured: dbProperty.is_featured || false,
    created_at: dbProperty.created_at,
    updated_at: dbProperty.updated_at,
    capacity: dbProperty.capacity || 0,
    location: dbProperty.location || null,
    facilities: dbProperty.facilities?.map((f: any) => f.facility) || [],
    images: dbProperty.images || [],
    rooms: dbProperty.rooms || []
  };
}

/**
 * Maps database booking object to our frontend Booking type
 */
export function mapDbBookingToBooking(dbBooking: any): any {
  return {
    id: dbBooking.id,
    property_id: dbBooking.property_id,
    user_id: dbBooking.user_id,
    check_in_date: dbBooking.check_in_date,
    check_out_date: dbBooking.check_out_date,
    time_frame: dbBooking.time_frame,
    price_per_unit: dbBooking.price_per_unit,
    total_amount: dbBooking.total_amount,
    status: dbBooking.status,
    created_at: dbBooking.created_at,
    updated_at: dbBooking.updated_at,
    property: dbBooking.property ? mapDbPropertyToProperty(dbBooking.property) : null
  };
}
