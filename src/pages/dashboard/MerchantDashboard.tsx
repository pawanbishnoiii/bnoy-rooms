
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Home, Plus, PenSquare, Calendar, MessageCircle, 
  BarChart2, Settings, Clock, Check, X, Shield
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Property, Booking } from '@/types';
import { Link } from 'react-router-dom';

const MerchantDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [merchantData, setMerchantData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchMerchantData();
      fetchProperties();
      fetchBookings();
    }
  }, [user]);

  const fetchMerchantData = async () => {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setMerchantData(data);
    } catch (error: any) {
      console.error('Error fetching merchant data:', error);
      toast({
        title: 'Error loading merchant profile',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          location:locations(name),
          images:property_images(image_url, is_primary)
        `)
        .eq('merchant_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error loading properties',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      // First get property IDs for this merchant
      const { data: propertyIds, error: propError } = await supabase
        .from('properties')
        .select('id')
        .eq('merchant_id', user?.id);

      if (propError) throw propError;
      
      if (propertyIds && propertyIds.length > 0) {
        // Get bookings for these properties
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            property:properties(name),
            user:profiles(full_name, email, phone)
          `)
          .in('property_id', propertyIds.map(p => p.id))
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } else {
        setBookings([]);
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error loading bookings',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const updateBookingStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Update the local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === id ? { ...booking, status } : booking
        )
      );

      toast({
        title: `Booking ${status}`,
        description: `The booking has been ${status} successfully.`
      });
    } catch (error: any) {
      toast({
        title: 'Error updating booking',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage your properties, bookings, and business
              </p>
            </div>
            <div className="flex items-center mt-4 md:mt-0">
              {merchantData?.is_verified ? (
                <Badge variant="outline" className="flex items-center bg-blue-50 text-blue-700 mr-4">
                  <Shield className="h-3 w-3 mr-1 fill-blue-500" />
                  Verified Merchant
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center bg-orange-50 text-orange-700 mr-4">
                  Verification Pending
                </Badge>
              )}
              <Link to="/property/add">
                <Button className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </Link>
            </div>
          </div>

          {/* Merchant Info Card */}
          {merchantData && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{merchantData.business_name}</h2>
                    <p className="text-muted-foreground">{merchantData.contact_person}</p>
                    <div className="flex flex-col sm:flex-row sm:space-x-4 mt-2">
                      <span className="text-sm">{merchantData.email}</span>
                      <span className="text-sm">{merchantData.phone}</span>
                    </div>
                    {merchantData.address && (
                      <p className="text-sm text-muted-foreground mt-1">{merchantData.address}</p>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="flex flex-col items-center pt-6">
                <Home className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-xl">Properties</CardTitle>
                <p className="text-3xl font-bold mt-2">{properties.length}</p>
                <p className="text-sm text-muted-foreground">Total Listings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center pt-6">
                <Calendar className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-xl">Bookings</CardTitle>
                <p className="text-3xl font-bold mt-2">{bookings.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center pt-6">
                <Clock className="h-8 w-8 text-amber-500 mb-2" />
                <CardTitle className="text-xl">Pending</CardTitle>
                <p className="text-3xl font-bold mt-2">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Awaiting Action</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center pt-6">
                <BarChart2 className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle className="text-xl">Occupancy</CardTitle>
                <p className="text-3xl font-bold mt-2">
                  {properties.length > 0 
                    ? Math.round((bookings.filter(b => b.status === 'confirmed').length / properties.length) * 100) 
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Average Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="properties">
            <TabsList className="mb-6">
              <TabsTrigger value="properties">My Properties</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Properties Tab */}
            <TabsContent value="properties">
              <Card>
                <CardHeader>
                  <CardTitle>My Properties</CardTitle>
                  <CardDescription>
                    Manage your property listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12">Loading your properties...</div>
                  ) : properties.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">You haven't added any properties yet</p>
                      <Link to="/property/add">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Property
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {properties.map((property) => (
                        <Card key={property.id} className="overflow-hidden">
                          <div className="aspect-video relative">
                            <img 
                              src={property.images?.find(img => img.is_primary)?.image_url || 
                                   property.images?.[0]?.image_url || 
                                   "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3"} 
                              alt={property.name}
                              className="object-cover w-full h-full"
                            />
                            {property.is_verified && (
                              <Badge className="absolute top-2 right-2 bg-blue-500">Verified</Badge>
                            )}
                          </div>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">{property.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {property.location?.name || property.address}
                                </p>
                              </div>
                              <div>
                                <Badge variant="outline" className={
                                  property.gender === 'boys' ? 'bg-blue-50 text-blue-700' :
                                  property.gender === 'girls' ? 'bg-pink-50 text-pink-700' :
                                  'bg-purple-50 text-purple-700'
                                }>
                                  {property.gender === 'boys' ? 'Boys Only' : 
                                   property.gender === 'girls' ? 'Girls Only' : 'Common'}
                                </Badge>
                              </div>
                            </div>
                            <Separator className="my-3" />
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">₹{property.monthly_price.toLocaleString()}/month</p>
                                {property.daily_price && (
                                  <p className="text-sm text-muted-foreground">
                                    ₹{property.daily_price.toLocaleString()}/day
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <PenSquare className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Link to={`/property/${property.id}`}>
                                  <Button size="sm">View</Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Link to="/property/add">
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Property
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Management</CardTitle>
                  <CardDescription>
                    View and manage booking requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No bookings found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <Card key={booking.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-semibold">{booking.property?.name}</h3>
                                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getBookingStatusColor(booking.status)}`}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Booked by: {booking.user?.full_name} ({booking.user?.email})
                                </p>
                                <div className="mt-2">
                                  <p className="text-sm">
                                    <span className="font-medium">Check-in:</span> {new Date(booking.check_in_date).toLocaleDateString()}
                                  </p>
                                  {booking.check_out_date && (
                                    <p className="text-sm">
                                      <span className="font-medium">Check-out:</span> {new Date(booking.check_out_date).toLocaleDateString()}
                                    </p>
                                  )}
                                  <p className="text-sm">
                                    <span className="font-medium">Type:</span> {booking.time_frame.charAt(0).toUpperCase() + booking.time_frame.slice(1)}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">Amount:</span> ₹{booking.total_amount.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              
                              {booking.status === 'pending' && (
                                <div className="flex space-x-2 mt-4 md:mt-0">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-green-500 text-green-600 hover:bg-green-50"
                                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Confirm
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-red-500 text-red-600 hover:bg-red-50"
                                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Decline
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>
                    Communicate with users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Messaging feature coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>
                    View insights about your properties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MerchantDashboard;
