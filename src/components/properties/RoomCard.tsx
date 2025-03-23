
import React from 'react';
import { Room } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bed, Users, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoomCardProps {
  room: Room;
  propertyId: string;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, propertyId }) => {
  const navigate = useNavigate();
  
  const handleBookRoom = () => {
    // Navigate to booking page with property and room details
    navigate(`/properties/${propertyId}`, {
      state: { selectedRoomId: room.id }
    });
  };
  
  // Calculate occupancy percentage
  const occupancyPercentage = ((room.occupied_beds || 0) / room.capacity) * 100;
  
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Room Image */}
        <div className="relative">
          {room.images && room.images.length > 0 ? (
            <img 
              src={room.images[0].image_url} 
              alt={`Room ${room.room_number}`}
              className="w-full h-48 md:h-full object-cover"
            />
          ) : (
            <div className="w-full h-48 md:h-full bg-muted flex items-center justify-center">
              <Bed className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          <div className="absolute top-2 left-2">
            <Badge variant="default" className="bg-white/90 text-primary hover:bg-white/90">
              Room {room.room_number}
            </Badge>
          </div>
        </div>
        
        {/* Room Details */}
        <div className="p-4 md:col-span-2">
          <div className="flex justify-between mb-3">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <h3 className="font-semibold text-lg">
                  {room.capacity} {room.capacity > 1 ? 'Bed Room' : 'Single Room'}
                </h3>
                <Badge variant={room.is_available ? "outline" : "secondary"} className="ml-2">
                  {room.is_available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {room.capacity - (room.occupied_beds || 0)} of {room.capacity} beds available
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold">₹{room.monthly_price.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">per month</div>
            </div>
          </div>
          
          {room.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {room.description}
            </p>
          )}
          
          {/* Amenities & Extra Charges */}
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div className="flex items-center">
              {room.electricity_included ? (
                <Check className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <X className="h-4 w-4 text-gray-400 mr-1" />
              )}
              <span className={room.electricity_included ? "" : "text-muted-foreground"}>
                Electricity included
              </span>
            </div>
            
            <div className="flex items-center">
              {room.cleaning_included ? (
                <Check className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <X className="h-4 w-4 text-gray-400 mr-1" />
              )}
              <span className={room.cleaning_included ? "" : "text-muted-foreground"}>
                Cleaning included
              </span>
            </div>
            
            <div className="flex items-center">
              {room.food_included ? (
                <Check className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <X className="h-4 w-4 text-gray-400 mr-1" />
              )}
              <span className={room.food_included ? "" : "text-muted-foreground"}>
                Food included
              </span>
            </div>
            
            {room.security_deposit && (
              <div className="flex items-center">
                <span>Security: ₹{room.security_deposit.toLocaleString()}</span>
              </div>
            )}
          </div>
          
          {/* Facilities */}
          {room.facilities && room.facilities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {room.facilities.map((facility, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {facility}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Occupancy Indicator */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Occupancy</span>
              <span>{room.occupied_beds || 0}/{room.capacity} beds</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${occupancyPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <Button 
            onClick={handleBookRoom} 
            className="w-full"
            disabled={!room.is_available}
          >
            {room.is_available ? 'Book This Room' : 'Currently Unavailable'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RoomCard;
