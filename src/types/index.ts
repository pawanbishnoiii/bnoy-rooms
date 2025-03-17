
// Auth types
export type UserRole = 'student' | 'merchant' | 'admin';
export type GenderOption = 'boys' | 'girls' | 'common';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type TimeFrame = 'daily' | 'monthly';

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Merchant {
  id: string;
  business_name: string;
  contact_person: string | null;
  phone: string;
  email: string;
  address: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface Facility {
  id: string;
  name: string;
  created_at: string;
}

export interface Property {
  id: string;
  merchant_id: string;
  name: string;
  type: string;
  gender: GenderOption;
  description: string | null;
  location_id: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  daily_price: number | null;
  monthly_price: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  location?: Location;
  facilities?: Facility[];
  images?: PropertyImage[];
  reviews?: Review[];
  average_rating?: number;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface PropertyFacility {
  id: string;
  property_id: string;
  facility_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  property_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: UserProfile;
}

export interface Booking {
  id: string;
  property_id: string;
  user_id: string;
  check_in_date: string;
  check_out_date: string | null;
  time_frame: TimeFrame;
  price_per_unit: number;
  total_amount: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  property?: Property;
  user?: UserProfile;
}
