import { UserProfile, Property, Review, Room, Booking, Favorite } from '@/types';

// Map Supabase data to our application types
export const mapDbProfileToProfile = (dbProfile: any): UserProfile => {
  return {
    id: dbProfile.id,
    created_at: dbProfile.created_at,
    updated_at: dbProfile.updated_at,
    full_name: dbProfile.full_name || '',
    email: dbProfile.email || '',
    phone: dbProfile.phone || '',
    role: dbProfile.role || 'student',
    avatar_url: dbProfile.avatar_url || '',
    preferred_location: dbProfile.preferred_location || '',
    preferred_property_type: dbProfile.preferred_property_type || '',
    preferred_gender_accommodation: dbProfile.preferred_gender_accommodation || 'common',
    notifications_enabled: dbProfile.notifications_enabled !== false,
    max_budget: dbProfile.max_budget || 0,
    gender: dbProfile.gender || ''
  };
};

export const mapDbFavoriteToFavorite = (dbFavorite: any): Favorite => {
  return {
    id: dbFavorite.id,
    created_at: dbFavorite.created_at,
    user_id: dbFavorite.user_id,
    property_id: dbFavorite.property_id,
    property: dbFavorite.property
  };
};

export const mapDbPropertyToProperty = (dbProperty: any): Property => {
  return {
    id: dbProperty.id,
    name: dbProperty.name || '',
    address: dbProperty.address || '',
    description: dbProperty.description || '',
    daily_price: dbProperty.daily_price || 0,
    monthly_price: dbProperty.monthly_price || 0,
    type: dbProperty.type || '',
    gender: dbProperty.gender || 'any',
    category: dbProperty.category || 'pg',
    is_verified: dbProperty.is_verified || false,
    merchant_id: dbProperty.merchant_id || '',
    location_id: dbProperty.location_id || null,
    latitude: dbProperty.latitude || null,
    longitude: dbProperty.longitude || null,
    created_at: dbProperty.created_at,
    updated_at: dbProperty.updated_at,
    location: dbProperty.location,
    images: dbProperty.images || [],
    facilities: dbProperty.facilities || [],
    rooms: dbProperty.rooms || [],
    merchant: dbProperty.merchant
  };
};
