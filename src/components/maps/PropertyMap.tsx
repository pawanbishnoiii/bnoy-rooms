
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Property } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet default marker issue in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface PropertyMapProps {
  properties: Property[];
  height?: string;
  zoom?: number;
  center?: [number, number];
}

// Component to recenter map
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  properties, 
  height = '500px',
  zoom = 12,
  center
}) => {
  const navigate = useNavigate();
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  
  // Default center if none provided
  const defaultCenter: [number, number] = center || 
    (properties.length > 0 && properties[0].latitude && properties[0].longitude) ? 
    [properties[0].latitude, properties[0].longitude] : 
    [28.6139, 77.2090]; // Default to Delhi
  
  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={defaultCenter} zoom={zoom} />
        
        {properties.map((property) => (
          <Marker 
            key={property.id}
            position={[
              property.latitude || (property.location?.latitude || 0), 
              property.longitude || (property.location?.longitude || 0)
            ]}
            eventHandlers={{
              click: () => {
                setActiveProperty(property);
              },
            }}
          >
            <Popup>
              <Card className="w-[250px] border-0 shadow-none">
                <CardContent className="p-0">
                  <div 
                    className="h-32 w-full bg-gray-100 mb-2 rounded-t-lg bg-center bg-cover"
                    style={{
                      backgroundImage: property.images && property.images.length > 0 
                        ? `url(${property.images[0].image_url})` 
                        : undefined
                    }}
                  />
                  <div className="px-2 pb-2">
                    <h3 className="font-medium text-sm">{property.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{property.address}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span className="text-xs">{property.average_rating || '4.5'}</span>
                      </div>
                      <div className="text-sm font-medium">
                        ₹{property.monthly_price.toLocaleString()}/mo
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={() => navigate(`/properties/${property.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
