
import React, { useEffect, useRef } from 'react';
import { Property } from '@/types';

interface PropertyMapProps {
  property?: Property;
  properties?: Property[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  property,
  properties = [],
  center,
  zoom = 15,
  height = '400px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Calculate map center
    let mapCenter: [number, number];
    if (center) {
      mapCenter = center;
    } else if (property && property.location?.latitude && property.location?.longitude) {
      mapCenter = [property.location.latitude as number, property.location.longitude as number];
    } else if (property && property.latitude && property.longitude) {
      mapCenter = [property.latitude as number, property.longitude as number];
    } else if (properties.length > 0 && properties[0].location?.latitude && properties[0].location?.longitude) {
      mapCenter = [properties[0].location.latitude as number, properties[0].location.longitude as number];
    } else {
      // Default to center of India if no coordinates provided
      mapCenter = [20.5937, 78.9629];
    }

    console.log('Initializing map with center:', mapCenter);

    // In a real implementation, this is where we would initialize the Leaflet map
    // For example:
    // const map = L.map(mapContainerRef.current).setView(mapCenter, zoom);
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(map);
    
    // Add markers for properties
    if (property) {
      const lat = property.location?.latitude || property.latitude;
      const lng = property.location?.longitude || property.longitude;
      
      if (lat && lng) {
        console.log('Would add marker for single property:', property.name);
        // In real implementation: 
        // L.marker([lat, lng])
        //   .addTo(map)
        //   .bindPopup(`<b>${property.name}</b><br>${property.address}`);
      }
    } else if (properties.length > 0) {
      console.log(`Would add ${properties.length} markers to the map`);
      // In real implementation:
      // properties.forEach(p => {
      //   const lat = p.location?.latitude || p.latitude;
      //   const lng = p.location?.longitude || p.longitude;
      //   if (lat && lng) {
      //     L.marker([lat, lng])
      //       .addTo(map)
      //       .bindPopup(`<b>${p.name}</b><br>${p.address}`);
      //   }
      // });
    }

    // Cleanup function for when component unmounts
    return () => {
      if (mapInstanceRef.current) {
        console.log('Would remove map instance');
        // In real implementation: mapInstanceRef.current.remove();
      }
    };
  }, [property, properties, center, zoom]);

  return (
    <div className="relative rounded-lg overflow-hidden shadow-md" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full bg-blue-50/30">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
            <h3 className="font-medium mb-2">Interactive Map</h3>
            <p className="text-sm text-muted-foreground">
              In the actual implementation, this would display an interactive Leaflet.js map
              showing the property location and nearby amenities.
            </p>
            {property && (
              <div className="mt-3 text-sm">
                <p className="font-medium">{property.name}</p>
                <p>{property.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;
