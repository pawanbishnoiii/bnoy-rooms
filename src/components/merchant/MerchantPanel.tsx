
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Home, CreditCard, Star, User, Bell, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Property, Booking } from '@/types';

const MerchantPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeBookings: 0,
    pendingVerifications: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchMerchantData();
    }
  }, [user]);
  
  const fetchMerchantData = async () => {
    setIsLoading(true);
    try {
      // Fetch properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          *,
          images:property_images(*),
          rooms(count)
        `)
        .eq('merchant_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (propertiesError) throw propertiesError;
      
      // Calculate property IDs for booking query
      const propertyIds = propertiesData?.map(p => p.id) || [];
      
      // Fetch recent bookings across all properties
      let bookingsData: Booking[] = [];
      if (propertyIds.length > 0) {
        const { data, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            property:properties(name, address),
            user:profiles(full_name, email, phone)
          `)
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (bookingsError) throw bookingsError;
        bookingsData = data || [];
      }
      
      // Calculate statistics
      const totalProperties = propertiesData?.length || 0;
      const activeBookings = bookingsData.filter(b => 
        b.status === 'confirmed' || b.status === 'pending'
      ).length;
      const pendingVerifications = propertiesData?.filter(p => 
        !p.is_verified
      ).length || 0;
      const totalRevenue = bookingsData
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, booking) => sum + booking.total_amount, 0);
      
      setProperties(propertiesData || []);
      setBookings(bookingsData);
      setStats({
        totalProperties,
        activeBookings,
        pendingVerifications,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching merchant data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Merchant Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your merchant dashboard. Manage your properties and bookings.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => navigate('/dashboard/properties')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total properties listed
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => navigate('/dashboard/bookings')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Current active bookings
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => navigate('/dashboard/properties')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Properties awaiting verification
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From confirmed bookings
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Recent bookings across all properties</CardDescription>
            </div>
            <button 
              onClick={() => navigate('/dashboard/bookings')}
              className="text-sm text-primary hover:underline flex items-center"
            >
              View all
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium mb-1">No bookings yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You don't have any bookings for your properties yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-medium">{booking.user?.full_name || 'Unknown user'}</span>
                      <span className="text-sm text-muted-foreground mt-1">
                        {booking.property?.name}
                      </span>
                      <div className="mt-1 flex items-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ₹{booking.total_amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle>Your Properties</CardTitle>
              <CardDescription>Manage your property listings</CardDescription>
            </div>
            <button 
              onClick={() => navigate('/dashboard/properties/new')}
              className="text-sm text-primary hover:underline flex items-center"
            >
              Add new
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8">
                <Home className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium mb-1">No properties yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You don't have any listed properties yet.
                </p>
                <button 
                  onClick={() => navigate('/dashboard/properties/new')}
                  className="text-sm text-primary hover:underline"
                >
                  Add your first property
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.slice(0, 3).map((property) => (
                  <div key={property.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div 
                      className="h-12 w-12 rounded-md overflow-hidden bg-gray-100"
                      style={{
                        backgroundImage: property.images && property.images.length > 0 ? 
                          `url(${property.images[0].image_url})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{property.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${property.is_verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {property.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground mt-1">
                        {property.address}
                      </span>
                      <div className="flex mt-1">
                        <button
                          onClick={() => navigate(`/dashboard/properties/${property.id}/rooms`)}
                          className="text-xs text-primary hover:underline"
                        >
                          Manage rooms
                        </button>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <button
                          onClick={() => navigate(`/dashboard/properties/${property.id}/edit`)}
                          className="text-xs text-primary hover:underline"
                        >
                          Edit property
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {properties.length > 3 && (
                  <button 
                    onClick={() => navigate('/dashboard/properties')}
                    className="text-sm text-primary hover:underline flex items-center"
                  >
                    View all {properties.length} properties
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MerchantPanel;
