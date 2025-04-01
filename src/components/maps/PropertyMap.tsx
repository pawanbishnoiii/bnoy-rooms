
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Property } from '@/types';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Leaflet marker icon fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon in Leaflet with React
const defaultIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface PropertyMapProps {
  property: Property;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ property }) => {
  // Default coordinates if property has no location
  const defaultPosition = { lat: 28.6139, lng: 77.2090 }; // Default to Delhi
  
  // Get coordinates from property
  const position = property.location ? 
    { lat: property.location.latitude, lng: property.location.longitude } : 
    defaultPosition;

  return (
    <MapContainer 
      center={position} 
      zoom={15} 
      style={{ height: "400px", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={defaultIcon}>
        <Popup>
          <div>
            <h3 className="font-semibold">{property.name}</h3>
            <p>{property.address}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default PropertyMap;
