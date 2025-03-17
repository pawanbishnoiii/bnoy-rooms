
import React from 'react';
import { ChevronRight } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { Link } from 'react-router-dom';

// Mock data for featured properties
const featuredProperties = [
  {
    id: '1',
    name: 'Sunrise PG for Boys',
    type: 'PG',
    location: 'Sector 14, Suratgarh',
    price: 8500,
    rating: 4.7,
    reviewCount: 42,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    facilities: ['WiFi', 'Attached Bathroom', 'Single Room', 'AC', 'Meals Included'],
    distance: '1.2 km',
    isVerified: true
  },
  {
    id: '2',
    name: 'Green Valley Girls Hostel',
    type: 'Hostel',
    location: 'Near University, Bikaner',
    price: 7000,
    rating: 4.5,
    reviewCount: 28,
    image: 'https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    facilities: ['WiFi', 'Double Sharing', 'Library', 'Laundry'],
    distance: '0.5 km',
    isVerified: true
  },
  {
    id: '3',
    name: 'Royal Apartment',
    type: 'Independent Room',
    location: 'Civil Lines, Sri Ganganagar',
    price: 12000,
    rating: 4.8,
    reviewCount: 19,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    facilities: ['WiFi', 'Attached Bathroom', 'AC', 'Kitchen', 'Balcony'],
    distance: '2.0 km',
    isVerified: false
  },
  {
    id: '4',
    name: 'Student Palace',
    type: 'Rented House',
    location: 'Mahaveer Nagar, Kota',
    price: 15000,
    rating: 4.6,
    reviewCount: 35,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    facilities: ['WiFi', '3 Bedrooms', 'Fully Furnished', 'Parking', 'Security'],
    distance: '1.5 km',
    isVerified: true
  }
];

const FeaturedListings = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Featured Accommodations</h2>
            <p className="text-muted-foreground max-w-2xl">
              Discover our handpicked selection of top-rated accommodations across various cities.
            </p>
          </div>
          <Link to="/properties" className="btn-outline hidden md:flex items-center">
            View All 
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProperties.map((property) => (
            <PropertyCard 
              key={property.id}
              {...property}
            />
          ))}
        </div>
        
        <div className="mt-10 text-center md:hidden">
          <Link to="/properties" className="btn-outline inline-flex items-center">
            View All Properties
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
