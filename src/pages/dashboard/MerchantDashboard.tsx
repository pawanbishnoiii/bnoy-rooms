import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Building, Home, User, BookMarked, DollarSign, TrendingUp, Star, ClipboardList, Map } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const MerchantDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    propertyCount: 0,
    bookingCount: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    recentBookings: [],
    recentReviews: [],
    propertiesList: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // First, check if merchant profile exists
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .single();

      if (merchantError && merchantError.code !== 'PGRST116') {
        throw merchantError;
      }

      // If no merchant profile, create one
      if (!merchantData) {
        const { error: createError } = await supabase
          .from('merchants')
          .insert({
            id: user.id,
            business_name: profile?.full_name || 'New Business',
            email: user.email,
            phone: profile?.phone || '',
            is_verified: false
          });

        if (createError) throw createError;
      }

      // Get property count
      const { count: propertyCount, error: propertyCountError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', user.id);

      if (propertyCountError) throw propertyCountError;

      // Get booking count
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *, 
          property:properties(
            id, 
            name, 
            merchant_id
          )
        `)
        .eq('property.merchant_id', user.id);

      if (bookingsError) throw bookingsError;

      // Calculate booking statistics
      const bookingCount = bookings?.length || 0;
      const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
      const totalRevenue = bookings?.reduce((sum, b) => sum + b.total_amount, 0) || 0;

      // Get properties with locations
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          *,
          location:locations(name)
        `)
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (propertiesError) throw propertiesError;

      // Get recent reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          property:properties(id, name, merchant_id),
          user:profiles(id, full_name, avatar_url)
        `)
        .eq('property.merchant_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reviewsError) throw reviewsError;

      setDashboardData({
        propertyCount: propertyCount || 0,
        bookingCount,
        pendingBookings,
        totalRevenue,
        recentBookings: bookings?.slice(0, 5) || [],
        recentReviews: reviews || [],
        propertiesList: properties || [],
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error loading data',
        description: 'Could not load dashboard data. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProperty = () => {
    navigate('/merchant/properties/new');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Merchant Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your properties and monitor bookings from a single dashboard
            </p>
          </div>
          <Button 
            onClick={handleAddProperty} 
            className="mt-4 md:mt-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Property
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-blue-100">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Properties</p>
                  <h3 className="text-2xl font-bold">{dashboardData.propertyCount}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-green-100">
                  <BookMarked className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                  <h3 className="text-2xl font-bold">{dashboardData.bookingCount}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-amber-100">
                  <ClipboardList className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Bookings</p>
                  <h3 className="text-2xl font-bold">{dashboardData.pendingBookings}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-purple-100">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <h3 className="text-2xl font-bold">₹{dashboardData.totalRevenue.toLocaleString()}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Quick Actions Card */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks you might want to perform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-auto flex-col items-start p-4 justify-start"
                      onClick={() => navigate('/merchant/properties/new')}
                    >
                      <div className="flex items-center mb-2">
                        <Building className="h-5 w-5 mr-2 text-primary" />
                        <span className="font-medium">Add Property</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        List a new property for rent
                      </p>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-auto flex-col items-start p-4 justify-start"
                      onClick={() => navigate('/merchant/bookings')}
                    >
                      <div className="flex items-center mb-2">
                        <BookMarked className="h-5 w-5 mr-2 text-primary" />
                        <span className="font-medium">View Bookings</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        Manage all property bookings
                      </p>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-auto flex-col items-start p-4 justify-start"
                      onClick={() => navigate('/merchant/properties')}
                    >
                      <div className="flex items-center mb-2">
                        <Home className="h-5 w-5 mr-2 text-primary" />
                        <span className="font-medium">My Properties</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        View and edit your properties
                      </p>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-auto flex-col items-start p-4 justify-start"
                      onClick={() => navigate('/merchant/settings')}
                    >
                      <div className="flex items-center mb-2">
                        <User className="h-5 w-5 mr-2 text-primary" />
                        <span className="font-medium">Profile</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        Update your business profile
                      </p>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Insights Card */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>Your business performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Booking Rate</span>
                      </div>
                      <span className="text-sm">
                        {dashboardData.bookingCount > 0 && dashboardData.propertyCount > 0 
                          ? `${Math.round((dashboardData.bookingCount / (dashboardData.propertyCount * 30)) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Average Rating</span>
                      </div>
                      <span className="text-sm">
                        {dashboardData.recentReviews.length > 0
                          ? (dashboardData.recentReviews.reduce((sum, review) => sum + review.rating, 0) / dashboardData.recentReviews.length).toFixed(1)
                          : 'No reviews yet'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Map className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Property Distribution</span>
                      </div>
                      <span className="text-sm">
                        {dashboardData.propertyCount} {dashboardData.propertyCount === 1 ? 'Location' : 'Locations'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Revenue per Property</span>
                      </div>
                      <span className="text-sm">
                        {dashboardData.propertyCount > 0
                          ? `₹${Math.round(dashboardData.totalRevenue / dashboardData.propertyCount).toLocaleString()}`
                          : '₹0'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Properties Map Placeholder */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Property Locations</CardTitle>
                <CardDescription>Geographic distribution of your properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 flex items-center justify-center rounded-md">
                  <div className="text-center">
                    <Map className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Map view will be available soon</p>
                    <Button variant="outline" className="mt-2">Enable Map View</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>My Properties</CardTitle>
                  <CardDescription>Manage your property listings</CardDescription>
                </div>
                <Button onClick={handleAddProperty}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading properties...</p>
                  </div>
                ) : dashboardData.propertiesList.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <h3 className="font-medium text-lg mb-1">No properties yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add your first property to start receiving bookings
                    </p>
                    <Button onClick={handleAddProperty}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Your First Property
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.propertiesList.map((property) => (
                      <div 
                        key={property.id} 
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => navigate(`/merchant/properties/${property.id}`)}
                      >
                        <div className="mb-2 sm:mb-0">
                          <div className="font-medium">{property.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Map className="h-3 w-3 inline mr-1" />
                            {property.location ? property.location.name : property.address}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
                          <span className={`text-xs rounded-full px-2 py-1 ${
                            property.is_verified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {property.is_verified ? 'Verified' : 'Pending Verification'}
                          </span>
                          <div className="text-sm">₹{property.monthly_price}/month</div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/merchant/properties/${property.id}/edit`);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {dashboardData.propertiesList.length > 0 && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/merchant/properties')}
                      >
                        View All Properties
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Recent booking requests for your properties</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading bookings...</p>
                  </div>
                ) : dashboardData.recentBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <BookMarked className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <h3 className="font-medium text-lg mb-1">No bookings yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You have not received any booking requests yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.recentBookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => navigate(`/merchant/bookings/${booking.id}`)}
                      >
                        <div className="mb-2 sm:mb-0">
                          <div className="font-medium">
                            {booking.property?.name || 'Property'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(booking.check_in_date).toLocaleDateString()} 
                            {booking.check_out_date && ` - ${new Date(booking.check_out_date).toLocaleDateString()}`}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
                          <span className={`text-xs rounded-full px-2 py-1 ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                          <div className="text-sm">₹{booking.total_amount}</div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/merchant/bookings/${booking.id}`);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {dashboardData.recentBookings.length > 0 && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/merchant/bookings')}
                      >
                        View All Bookings
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>What users are saying about your properties</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading reviews...</p>
                  </div>
                ) : dashboardData.recentReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <h3 className="font-medium text-lg mb-1">No reviews yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your properties haven't received any reviews yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.recentReviews.map((review) => (
                      <div 
                        key={review.id} 
                        className="p-4 border rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.user?.avatar_url} />
                              <AvatarFallback>
                                {review.user?.full_name?.substring(0, 2) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{review.user?.full_name || 'Anonymous User'}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm mb-2">
                          {review.comment || 'No comment provided.'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Property: {review.property?.name || 'Unknown property'}
                        </div>
                      </div>
                    ))}
                    
                    {dashboardData.recentReviews.length > 0 && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/merchant/reviews')}
                      >
                        View All Reviews
                      </Button>
                    )}
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

export default MerchantDashboard;
