// Auth types
export type UserRole = 'student' | 'merchant' | 'admin';
export type GenderOption = 'boys' | 'girls' | 'common';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'processing' | 'refunded';
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
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
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
  location?: Location;
  facilities?: Facility[];
  images?: PropertyImage[];
  reviews?: Review[];
  average_rating?: number;
  available_rooms?: number;
  total_rooms?: number;
  amenities_summary?: string;
  distance_to_center?: number;
  popular_landmarks?: string[];
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
  cleanliness_rating?: number;
  location_rating?: number;
  value_rating?: number;
  service_rating?: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  helpful_count?: number;
  reported?: boolean;
  admin_approved?: boolean;
  images?: string[];
  response?: ReviewResponse;
}

export interface ReviewResponse {
  id: string;
  review_id: string;
  merchant_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
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
  property?: Property | null;
  user?: UserProfile | null;
  payment_id?: string;
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
  check_in_time?: string;
  check_out_time?: string;
  special_requests?: string;
  number_of_guests?: number;
  cancellation_reason?: string;
  refund_amount?: number;
}

export interface SearchResult {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  filters_applied: SearchFilters;
}

export interface SearchFilters {
  location?: string;
  price_min?: number;
  price_max?: number;
  gender?: GenderOption;
  property_type?: string[];
  facilities?: string[];
  rating?: number;
  sort_by?: 'price_low' | 'price_high' | 'rating' | 'newest';
  distance?: number;
  near_institution?: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}
