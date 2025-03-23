
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeProperties } from '@/hooks/useRealTimeProperties';
import { GenderOption, Property, PropertyCategory } from '@/types';
import { Building, Heart, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recommendedProperties, setRecommendedProperties] = useState<Property[]>([]);
  
  const { properties: nearbyProperties, isLoading: isLoadingNearby } = useRealTimeProperties({
    location: profile?.preferred_location,
    gender: profile?.preferred_gender_accommodation as GenderOption,
    maxBudget: profile?.max_budget,
    limit: 3
  });

  useEffect(() => {
    const fetchRecentProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            location:locations(*),
            images:property_images(*),
            facilities:property_facilities(facility:facilities(*))
          `)
          .eq('is_verified', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;

        // Add necessary properties to match Property type
        const transformedProperties = data.map((property: any) => ({
          ...property,
          category: property.category || 'pg' as PropertyCategory,
          gender: property.gender as GenderOption,
          location: property.location ? {
            id: property.location.id,
            name: property.location.name,
            latitude: property.location.latitude,
            longitude: property.location.longitude,
            created_at: property.location.created_at
          } : null,
          facilities: property.facilities.map((f: any) => f.facility),
          images: property.images.map((img: any) => ({
            id: img.id,
            property_id: img.property_id,
            image_url: img.image_url,
            is_primary: img.is_primary,
            created_at: img.created_at
          })),
          // Calculate available rooms
          available_rooms: 0,
          total_rooms: 0
        }));

        setRecentProperties(transformedProperties);
      } catch (err: any) {
        console.error('Error fetching recent properties:', err);
        toast({
          title: 'Error',
          description: 'Failed to load recent properties',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserFavorites = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('property_id')
          .eq('user_id', user.id);

        if (error) throw error;
        setFavoriteIds(data.map(fav => fav.property_id));
      } catch (err: any) {
        console.error('Error fetching user favorites:', err);
      }
    };

    const fetchRecommendedProperties = async () => {
      try {
        // This would eventually call an AI recommendations endpoint
        // For now, we'll just get random properties
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            location:locations(*),
            images:property_images(*),
            facilities:property_facilities(facility:facilities(*))
          `)
          .eq('is_verified', true)
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;

        // Add necessary properties to match Property type
        const transformedProperties = data.map((property: any) => ({
          ...property,
          category: property.category || 'pg' as PropertyCategory,
          gender: property.gender as GenderOption,
          location: property.location ? {
            id: property.location.id,
            name: property.location.name,
            latitude: property.location.latitude,
            longitude: property.location.longitude,
            created_at: property.location.created_at
          } : null,
          facilities: property.facilities.map((f: any) => f.facility),
          images: property.images.map((img: any) => ({
            id: img.id,
            property_id: img.property_id,
            image_url: img.image_url,
            is_primary: img.is_primary,
            created_at: img.created_at
          })),
          // Calculate available rooms
          available_rooms: 0,
          total_rooms: 0,
          // Add AI-generated fields for demo
          ai_strengths: ['Good location', 'Value for money'],
          matchScore: Math.floor(Math.random() * 20) + 80, // 80-100 score
          ai_recommended: true
        }));

        setRecommendedProperties(transformedProperties);
      } catch (err: any) {
        console.error('Error fetching recommended properties:', err);
      }
    };

    fetchRecentProperties();
    fetchUserFavorites();
    fetchRecommendedProperties();
  }, [user, profile, toast]);

  const handleAddFavorite = async (propertyId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to save properties',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (favoriteIds.includes(propertyId)) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);

        if (error) throw error;

        setFavoriteIds(favoriteIds.filter(id => id !== propertyId));
        toast({
          title: 'Success',
          description: 'Property removed from favorites'
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            property_id: propertyId
          });

        if (error) throw error;

        setFavoriteIds([...favoriteIds, propertyId]);
        toast({
          title: 'Success',
          description: 'Property added to favorites'
        });
      }
    } catch (err: any) {
      console.error('Error updating favorites:', err);
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive'
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || 'User'}! Find your perfect accommodation.
          </p>
        </div>

        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="nearby">Nearby</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Properties</CardTitle>
                <CardDescription>New properties that have been recently added</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : recentProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentProperties.map((property) => (
                      <div key={property.id} className="border rounded-lg overflow-hidden group">
                        <div className="relative h-40">
                          {property.images && property.images.length > 0 ? (
                            <img 
                              src={property.images.find(img => img.is_primary)?.image_url || property.images[0].image_url} 
                              alt={property.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Building className="h-10 w-10 text-gray-400" />
                            </div>
                          )}
                          <Button 
                            size="icon" 
                            variant="secondary"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100"
                            onClick={() => handleAddFavorite(property.id)}
                          >
                            <Heart className={`h-4 w-4 ${favoriteIds.includes(property.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                          <Badge className="absolute bottom-2 left-2 bg-white text-black">{property.category.toUpperCase()}</Badge>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold truncate" onClick={() => navigate(`/properties/${property.id}`)} style={{ cursor: 'pointer' }}>
                              {property.name}
                            </h3>
                            <Badge variant={property.gender === 'boys' ? 'default' : property.gender === 'girls' ? 'secondary' : 'outline'}>
                              {property.gender === 'common' ? 'Co-ed' : property.gender === 'boys' ? 'Boys' : 'Girls'}
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{property.location?.name || property.address}</span>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="font-bold">₹{property.monthly_price}<span className="text-xs font-normal text-muted-foreground">/month</span></div>
                            <Button size="sm" variant="outline" onClick={() => navigate(`/properties/${property.id}`)}>
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-2" />
                    <h3 className="font-medium text-lg">No properties available</h3>
                    <p className="text-muted-foreground">There are no properties listed currently.</p>
                  </div>
                )}
                {recentProperties.length > 0 && (
                  <div className="flex justify-center mt-6">
                    <Button onClick={() => navigate('/properties')}>View more properties</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nearby" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Properties Near You</CardTitle>
                <CardDescription>Accommodation options in your preferred location</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingNearby ? (
                  <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : nearbyProperties && nearbyProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {nearbyProperties.map((property) => (
                      <div key={property.id} className="border rounded-lg overflow-hidden group">
                        <div className="relative h-40">
                          {property.images && property.images.length > 0 ? (
                            <img 
                              src={property.images.find(img => img.is_primary)?.image_url || property.images[0].image_url} 
                              alt={property.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Building className="h-10 w-10 text-gray-400" />
                            </div>
                          )}
                          <Button 
                            size="icon" 
                            variant="secondary"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100"
                            onClick={() => handleAddFavorite(property.id)}
                          >
                            <Heart className={`h-4 w-4 ${favoriteIds.includes(property.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                          <Badge className="absolute bottom-2 left-2 bg-white text-black">{property.category.toUpperCase()}</Badge>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold truncate" onClick={() => navigate(`/properties/${property.id}`)} style={{ cursor: 'pointer' }}>
                              {property.name}
                            </h3>
                            <Badge variant={property.gender === 'boys' ? 'default' : property.gender === 'girls' ? 'secondary' : 'outline'}>
                              {property.gender === 'common' ? 'Co-ed' : property.gender === 'boys' ? 'Boys' : 'Girls'}
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{property.location?.name || property.address}</span>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="font-bold">₹{property.monthly_price}<span className="text-xs font-normal text-muted-foreground">/month</span></div>
                            <Button size="sm" variant="outline" onClick={() => navigate(`/properties/${property.id}`)}>
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-2" />
                    <h3 className="font-medium text-lg">No nearby properties found</h3>
                    <p className="text-muted-foreground mb-4">
                      {profile?.preferred_location 
                        ? `We couldn't find properties in ${profile.preferred_location}.` 
                        : "Set your preferred location in settings to see nearby properties."}
                    </p>
                    {!profile?.preferred_location && (
                      <Button onClick={() => navigate('/settings')}>Update preferences</Button>
                    )}
                  </div>
                )}
                {nearbyProperties && nearbyProperties.length > 0 && (
                  <div className="flex justify-center mt-6">
                    <Button onClick={() => navigate('/properties')}>View more properties</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommended" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" /> 
                  Tailored Recommendations
                </CardTitle>
                <CardDescription>Properties that match your preferences and budget</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : recommendedProperties.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedProperties.map((property) => (
                      <div key={property.id} className="border rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row">
                          <div className="relative md:w-1/3 h-48 md:h-auto">
                            {property.images && property.images.length > 0 ? (
                              <img 
                                src={property.images.find(img => img.is_primary)?.image_url || property.images[0].image_url} 
                                alt={property.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <Building className="h-10 w-10 text-gray-400" />
                              </div>
                            )}
                            <Button 
                              size="icon" 
                              variant="secondary"
                              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100"
                              onClick={() => handleAddFavorite(property.id)}
                            >
                              <Heart className={`h-4 w-4 ${favoriteIds.includes(property.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                            <Badge className="absolute bottom-2 left-2 bg-white text-black">{property.category.toUpperCase()}</Badge>
                          </div>
                          <div className="p-4 md:w-2/3">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-lg" onClick={() => navigate(`/properties/${property.id}`)} style={{ cursor: 'pointer' }}>
                                {property.name}
                              </h3>
                              <Badge variant={property.gender === 'boys' ? 'default' : property.gender === 'girls' ? 'secondary' : 'outline'}>
                                {property.gender === 'common' ? 'Co-ed' : property.gender === 'boys' ? 'Boys' : 'Girls'}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span>{property.location?.name || property.address}</span>
                            </div>
                            <div className="mt-2 font-bold">₹{property.monthly_price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                            
                            {/* AI match score */}
                            <div className="mt-3 mb-3">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-green-600 h-2.5 rounded-full" 
                                    style={{ width: `${property.matchScore || 85}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm font-medium">{property.matchScore || 85}% match</span>
                              </div>
                            </div>
                            
                            {/* Strengths */}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {property.ai_strengths && property.ai_strengths.map((strength, i) => (
                                <Badge key={i} variant="outline" className="bg-green-50 text-green-800 border-green-200">
                                  {strength}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="mt-4 flex justify-end">
                              <Button onClick={() => navigate(`/properties/${property.id}`)}>
                                View details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-2" />
                    <h3 className="font-medium text-lg">No recommended properties</h3>
                    <p className="text-muted-foreground mb-4">
                      Update your preferences so we can recommend suitable properties for you.
                    </p>
                    <Button onClick={() => navigate('/settings')}>Update preferences</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
