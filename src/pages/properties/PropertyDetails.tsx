
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Property, Room } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BookingForm from '@/components/bookings/BookingForm';
import RoomCard from '@/components/properties/RoomCard';
import AIPropertyInsights from '@/components/properties/AIPropertyInsights';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  Star, 
  Home, 
  Bed, 
  Users, 
  Heart, 
  Share2, 
  Loader2,
  Lock
} from 'lucide-react';
import { mapDbPropertyToProperty } from '@/utils/typeUtils';

const PropertyDetails = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
      if (user) {
        checkIfFavorite();
      }
    }
  }, [propertyId, user]);

  const fetchPropertyDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch property details
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select(`
          *,
          location:locations(*),
          images:property_images(*),
          facilities:property_facilities(facility:facilities(*))
        `)
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;
      
      // Fetch rooms for this property
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select(`
          *,
          images:room_images(*)
        `)
        .eq('property_id', propertyId)
        .eq('is_available', true);
        
      if (roomsError) throw roomsError;

      // Transform the property data
      const transformedProperty = mapDbPropertyToProperty({
        ...propertyData,
        facilities: propertyData.facilities?.map((f: any) => f.facility) || [],
      });

      setProperty(transformedProperty);
      setRooms(roomsData || []);
    } catch (error: any) {
      console.error('Error fetching property details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .maybeSingle();
        
      if (error) throw error;
      
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to save favorites',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSavingFavorite(true);
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);
          
        if (error) throw error;
        
        toast({
          title: 'Removed from Favorites',
          description: 'Property has been removed from your favorites',
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            property_id: propertyId,
          });
          
        if (error) throw error;
        
        toast({
          title: 'Added to Favorites',
          description: 'Property has been added to your favorites',
        });
      }
      
      setIsFavorite(!isFavorite);
    } catch (error: any) {
      console.error('Error updating favorite status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingFavorite(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container max-w-6xl py-12 min-h-screen">
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="container max-w-6xl py-12 min-h-screen">
          <div className="text-center">
            <Home className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Property Not Found</h1>
            <p className="text-muted-foreground mb-4">The property you're looking for doesn't exist or may have been removed.</p>
            <Button asChild>
              <Link to="/properties">Browse Properties</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container max-w-6xl py-8">
          {/* Property Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{property.name}</h1>
                <div className="flex items-center text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.address}</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-xs font-normal">
                    {property.gender === 'boys' ? 'Boys Only' : 
                     property.gender === 'girls' ? 'Girls Only' : 'Co-ed'}
                  </Badge>
                  
                  <Badge variant="outline" className="text-xs font-normal">
                    {property.type}
                  </Badge>
                  
                  <Badge variant="outline" className="text-xs font-normal">
                    {property.category === 'pg' ? 'PG/Co-living' :
                     property.category === 'hostel' ? 'Hostel' :
                     property.category === 'dormitory' ? 'Dormitory' :
                     property.category === 'independent_room' ? 'Independent Room' :
                     property.category === 'hotel' ? 'Hotel' :
                     property.category === 'library' ? 'Library' :
                     property.category === 'coaching' ? 'Coaching Center' :
                     property.category === 'tiffin_delivery' ? 'Tiffin Delivery' :
                     property.category}
                  </Badge>
                  
                  {property.available_rooms !== undefined && (
                    <Badge variant={property.available_rooms > 0 ? "default" : "secondary"} className="text-xs">
                      {property.available_rooms} room{property.available_rooms !== 1 ? 's' : ''} available
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-2xl font-bold">₹{property.monthly_price.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">per month</div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleFavorite}
                    disabled={isSavingFavorite}
                  >
                    {isSavingFavorite ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    )}
                    {isFavorite ? 'Saved' : 'Save'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.share({
                        title: `${property.name}`,
                        text: `Check out this property: ${property.name} at ${property.address}`,
                        url: window.location.href,
                      }).catch(() => {
                        // Fallback if share is not supported
                        navigator.clipboard.writeText(window.location.href);
                        toast({
                          title: "Link Copied",
                          description: "Property link copied to clipboard"
                        });
                      });
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Property Images Gallery */}
              {property.images && property.images.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Property Images</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.images.map((image, index) => (
                      <div 
                        key={image.id} 
                        className={`overflow-hidden rounded-md ${index === 0 ? 'col-span-2 row-span-2' : ''}`}
                      >
                        <img 
                          src={image.image_url} 
                          alt={`${property.name} view ${index + 1}`}
                          className="w-full h-full object-cover aspect-video hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-center items-center h-64">
                  <p className="text-muted-foreground">No images available for this property</p>
                </div>
              )}
              
              {/* Property Details Tabs */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <Tabs defaultValue="details">
                  <TabsList className="w-full justify-start rounded-none border-b bg-white px-6 pt-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="rooms">Rooms</TabsTrigger>
                    <TabsTrigger value="facilities">Facilities</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="p-6">
                    <h2 className="text-lg font-semibold mb-3">Property Description</h2>
                    <p className="text-gray-700 mb-6">
                      {property.description || "No description provided for this property."}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center">
                        <Bed className="h-5 w-5 text-primary mr-2" />
                        <div>
                          <div className="text-sm text-muted-foreground">Room Type</div>
                          <div className="font-medium">{property.type}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-primary mr-2" />
                        <div>
                          <div className="text-sm text-muted-foreground">For</div>
                          <div className="font-medium capitalize">{property.gender}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-primary mr-2" />
                        <div>
                          <div className="text-sm text-muted-foreground">Available From</div>
                          <div className="font-medium">Immediate</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Home className="h-5 w-5 text-primary mr-2" />
                        <div>
                          <div className="text-sm text-muted-foreground">Category</div>
                          <div className="font-medium capitalize">
                            {property.category === 'pg' ? 'PG/Co-living' :
                             property.category === 'independent_room' ? 'Independent Room' : 
                             property.category}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-3">Rules & Policies</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <Lock className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <span className="font-medium">Security Deposit:</span> Typically one month's rent, refundable at the end of stay.
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Lock className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <span className="font-medium">Notice Period:</span> 30 days notice required before vacating.
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Lock className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <span className="font-medium">Visitors:</span> Allowed in common areas during specified hours.
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="rooms" className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Available Rooms</h2>
                    
                    {rooms.length === 0 ? (
                      <div className="text-center py-12">
                        <Bed className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No Rooms Available</h3>
                        <p className="text-muted-foreground">There are currently no rooms available for this property.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {rooms.map(room => (
                          <RoomCard key={room.id} room={room} propertyId={property.id} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="facilities" className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Facilities & Amenities</h2>
                    
                    {property.facilities && property.facilities.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {property.facilities.map((facility: any) => (
                          <div key={facility.id} className="flex items-center p-2 rounded-md border">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              <Star className="h-4 w-4 text-primary" />
                            </div>
                            <span>{facility.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No facilities information available.</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="location" className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Location</h2>
                    
                    <div className="mb-4">
                      <div className="font-medium">{property.address}</div>
                      {property.location && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {property.location.name}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gray-100 h-64 rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Map view would appear here</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ai-insights" className="p-6">
                    <AIPropertyInsights property={property} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Booking Section - Right Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {rooms.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Book This Property</CardTitle>
                      <CardDescription>
                        Choose a room and book your stay
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="monthly">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                          <TabsTrigger value="monthly">Monthly</TabsTrigger>
                          {property.daily_price && (
                            <TabsTrigger value="daily">Daily</TabsTrigger>
                          )}
                        </TabsList>
                        
                        <TabsContent value="monthly">
                          <BookingForm 
                            propertyId={property.id}
                            price={property.monthly_price}
                            timeFrame="monthly"
                          />
                        </TabsContent>
                        
                        {property.daily_price && (
                          <TabsContent value="daily">
                            <BookingForm 
                              propertyId={property.id}
                              price={property.daily_price}
                              timeFrame="daily"
                            />
                          </TabsContent>
                        )}
                      </Tabs>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Rooms Available</CardTitle>
                      <CardDescription>
                        This property currently has no available rooms
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button className="mt-4" asChild>
                        <Link to="/properties">Browse Other Properties</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Contact the property owner directly for more information or to schedule a visit.
                  </p>
                  <Button className="w-full">Contact Owner</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PropertyDetails;
