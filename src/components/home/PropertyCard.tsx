
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, BedDouble, Users, Bath, Wifi, Shield } from 'lucide-react';

interface PropertyCardProps {
  id: string;
  name: string;
  type: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  facilities: string[];
  distance: string;
  isVerified: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  name,
  type,
  location,
  price,
  rating,
  reviewCount,
  image,
  facilities,
  distance,
  isVerified
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  return (
    <Link to={`/property/${id}`} className="block">
      <div className="premium-card h-full">
        {/* Image Container */}
        <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
          <div 
            className={`absolute inset-0 bg-muted animate-pulse ${imageLoaded ? 'hidden' : 'block'}`}
          ></div>
          <img
            src={image}
            alt={name}
            className={`w-full h-full object-cover transition-transform duration-700 lazy-image ${imageLoaded ? 'loaded scale-100 hover:scale-110' : ''}`}
            onLoad={handleImageLoad}
          />
          
          {/* Property Type Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-bnoy-600 text-xs font-medium px-2.5 py-1 rounded-full">
              {type}
            </span>
          </div>
          
          {/* Verified Badge */}
          {isVerified && (
            <div className="absolute top-3 right-3">
              <span className="bg-bnoy-600/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                <Shield size={12} className="mr-1" />
                Verified
              </span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium text-lg text-foreground line-clamp-1">{name}</h3>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <MapPin size={14} className="mr-1 text-bnoy-500" />
                <span className="line-clamp-1">{location}</span>
              </div>
            </div>
            
            <div className="flex items-center bg-bnoy-50 px-2 py-1 rounded-md">
              <Star size={14} className="text-amber-500 mr-1" fill="#F59E0B" />
              <span className="text-sm font-medium">{rating}</span>
              <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
            </div>
          </div>
          
          {/* Facilities */}
          <div className="flex flex-wrap gap-2 my-3">
            {facilities.slice(0, 3).map((facility, index) => (
              <span 
                key={index} 
                className="inline-flex items-center text-xs bg-secondary px-2 py-1 rounded-full"
              >
                {facility === 'WiFi' && <Wifi size={12} className="mr-1" />}
                {facility === 'Attached Bathroom' && <Bath size={12} className="mr-1" />}
                {facility === 'Single Room' && <BedDouble size={12} className="mr-1" />}
                {facility === 'Double Sharing' && <Users size={12} className="mr-1" />}
                {facility}
              </span>
            ))}
            {facilities.length > 3 && (
              <span className="inline-flex items-center text-xs bg-secondary px-2 py-1 rounded-full">
                +{facilities.length - 3} more
              </span>
            )}
          </div>
          
          {/* Distance */}
          <div className="text-sm text-muted-foreground mb-3">
            <span>{distance} from city center</span>
          </div>
          
          {/* Price */}
          <div className="flex justify-between items-center pt-2 border-t border-border/50">
            <div>
              <span className="text-lg font-bold text-foreground">₹{price.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <button className="btn-primary py-1 px-3 h-auto text-sm">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
