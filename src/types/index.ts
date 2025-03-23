
// User role definition
export type UserRole = 'admin' | 'merchant' | 'student';

// Gender options
export type GenderOption = 'boys' | 'girls' | 'common';

// Property categories
export type PropertyCategory = 
  | 'pg' 
  | 'hostel' 
  | 'dormitory' 
  | 'independent_room' 
  | 'hotel' 
  | 'library' 
  | 'coaching' 
  | 'tiffin_delivery';

// Property type
export type PropertyType = 'residential' | 'commercial';

// Time frame options
export type TimeFrame = 'daily' | 'monthly';

// Booking status
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'processing' | 'refunded';

// User profile interface
export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
  is_verified?: boolean;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
  preferred_gender_accommodation?: GenderOption;
  preferred_location?: string;
  preferred_property_type?: string;
  max_budget?: number;
  notifications_enabled?: boolean;
}

// Location interface
export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

// Property interface
export interface Property {
  id: string;
  merchant_id: string;
  name: string;
  description: string;
  type: PropertyType;
  category: PropertyCategory;
  address: string;
  gender: GenderOption;
  monthly_price: number;
  daily_price?: number;
  is_verified: boolean;
  is_featured: boolean;
  capacity: number;
  rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
  location: Location | null;
  images: PropertyImage[];
  facilities: Facility[];
  rooms: Room[];
  available_rooms?: number;
  total_rooms?: number;
  security_deposit?: number;
  electricity_included?: boolean;
  cleaning_included?: boolean;
  food_included?: boolean;
  // For AI recommendations
  average_rating?: number;
  latitude?: number;
  longitude?: number;
  matchScore?: number;
  ai_strengths?: string[];
}

// Room interface
export interface Room {
  id: string;
  property_id: string;
  room_number: string;
  capacity: number;
  occupied_beds: number;
  monthly_price: number;
  daily_price: number | null;
  description: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  security_deposit?: number;
  electricity_included?: boolean;
  cleaning_included?: boolean;
  food_included?: boolean;
  facilities?: string[];
  images?: RoomImage[];
}

// Room Image interface
export interface RoomImage {
  id: string;
  room_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

// Property image interface
export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

// Facility interface
export interface Facility {
  id: string;
  name: string;
  icon?: string;
  created_at: string;
}

// Booking interface
export interface Booking {
  id: string;
  user_id: string;
  property_id: string;
  room_id?: string;
  check_in_date: string;
  check_out_date: string;
  check_in_time?: string;
  check_out_time?: string;
  time_frame: TimeFrame;
  price_per_unit: number;
  total_amount: number;
  status: BookingStatus;
  payment_status?: string;
  payment_id?: string;
  special_requests?: string;
  number_of_guests?: number;
  cancellation_reason?: string;
  refund_amount?: number;
  created_at: string;
  updated_at: string;
  property?: Property;
  user?: UserProfile;
}

// Review interface
export interface Review {
  id: string;
  property_id: string;
  user_id: string;
  booking_id?: string;
  rating: number;
  comment: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

// Favorite properties interface
export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}

// System settings interface
export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

// For AI property recommendations
export interface PropertyWithScore extends Property {
  matchScore?: number;
  ai_strengths?: string[];
}
