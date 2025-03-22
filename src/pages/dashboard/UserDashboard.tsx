
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Home, Search, Heart, Calendar, Bell, Settings, LogOut, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Booking, Property } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const UserDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);
  const [activity, setActivity] = useState<{action: string, property: string, time: string}[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch user's bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            property:properties(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (bookingsError) throw bookingsError;
        
        // Transform and set bookings
        const transformedBookings = bookingsData.map(booking => {
          const propertyData = booking.property && !booking.property.error ? booking.property : null;
          
          return {
            ...booking,
            property: propertyData ? {
              id: propertyData.id,
              merchant_id: propertyData.merchant_id,
              name: propertyData.name,
              type: propertyData.type,
              gender: propertyData.gender,
              description: propertyData.description,
              location_id: propertyData.location_id,
              address: propertyData.address,
              latitude: propertyData.latitude,
              longitude: propertyData.longitude,
              daily_price: propertyData.daily_price,
              monthly_price: propertyData.monthly_price,
              is_verified: propertyData.is_verified,
              created_at: propertyData.created_at,
              updated_at: propertyData.updated_at,
            } : null
          } as Booking;
        });
        
        setBookings(transformedBookings);
        
        // Count active bookings (confirmed status)
        const activeCount = transformedBookings.filter(
          booking => booking.status === 'confirmed' || booking.status === 'pending'
        ).length;
        setActiveBookingsCount(activeCount);
        
        // For demo purposes, set some mock activity data
        // In a real app, you would fetch this from the database
        setActivity([
          { action: 'Booked a viewing', property: transformedBookings[0]?.property?.name || 'Sunrise PG for Boys', time: '2 hours ago' },
          { action: 'Added to favorites', property: 'Green Valley Girls Hostel', time: '1 day ago' },
          { action: 'Searched for properties', property: 'in Kota near Allen Coaching', time: '2 days ago' },
          { action: 'Viewed property details', property: 'Royal Apartment', time: '2 days ago' },
          { action: 'Contacted owner', property: 'Student Palace', time: '1 week ago' }
        ]);
        
        // Fetch saved properties would go here in a real implementation
        setSavedProperties([]);
        
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Could not load your dashboard data.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, toast]);

  // Get user initials for avatar
  const getInitials = () => {
    if (!profile?.full_name) return 'U';
    return profile.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 animate-fade-in">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors">
          <ChevronLeft size={16} className="mr-1" />
          Back to Home
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border animate-scale-in">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                  <AvatarFallback className="bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium text-lg">{profile?.full_name || 'User'}</h2>
                  <p className="text-muted-foreground text-sm">{user?.email}</p>
                  <Badge className="mt-1 capitalize">{profile?.role || 'student'}</Badge>
                </div>
              </div>
              
              <div className="space-y-1">
                <Link 
                  to="/dashboard/student" 
                  className="flex items-center space-x-3 p-3 rounded-md bg-primary/10 text-primary font-medium"
                >
                  <Home size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/properties" 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Search size={18} />
                  <span>Search Properties</span>
                </Link>
                <Link 
                  to="#" 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Heart size={18} />
                  <span>Favorites</span>
                </Link>
                <Link 
                  to="#" 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Calendar size={18} />
                  <span>My Bookings</span>
                </Link>
                <Link 
                  to="#" 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Bell size={18} />
                  <span>Notifications</span>
                </Link>
                <Link 
                  to="#" 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 p-3 rounded-md w-full text-left hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow animate-fade-in animation-delay-100">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Saved Properties</h3>
                  <p className="text-3xl font-bold">{savedProperties.length}</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow animate-fade-in animation-delay-200">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Bookings</h3>
                  <p className="text-3xl font-bold">{activeBookingsCount}</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow animate-fade-in animation-delay-300">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Searches</h3>
                  <p className="text-3xl font-bold">12</p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="bookings" className="animate-fade-in animation-delay-400">
              <TabsList className="w-full bg-white justify-start mb-4">
                <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bookings" className="space-y-4 animate-fade-in animation-delay-100">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Your Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">Loading your bookings...</div>
                    ) : bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">You haven't made any bookings yet.</p>
                        <Button onClick={() => navigate('/properties')}>Browse Properties</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <h4 className="font-medium">{booking.property?.name}</h4>
                                <p className="text-sm text-muted-foreground">{booking.property?.address}</p>
                                <div className="flex items-center mt-2">
                                  <Calendar className="h-4 w-4 mr-1 text-primary" />
                                  <span className="text-sm">
                                    {format(new Date(booking.check_in_date), 'PPP')}
                                    {booking.check_out_date && ` - ${format(new Date(booking.check_out_date), 'PPP')}`}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mt-3 md:mt-0 flex flex-col items-start md:items-end">
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)} capitalize`}>
                                  {booking.status}
                                </div>
                                <p className="text-sm mt-1">₹{booking.total_amount}</p>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="mt-2 hover:bg-primary/10 transition-colors"
                                  onClick={() => navigate(`/bookings/${booking.id}/confirmation`)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity" className="animate-fade-in">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {activity.map((item, index) => (
                        <div key={index} className="flex items-start hover:bg-gray-50 p-2 rounded-md -mx-2 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3"></div>
                          <div>
                            <p className="text-foreground">
                              {item.action} - <span className="font-medium">{item.property}</span>
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="recommendations" className="animate-fade-in">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { name: 'Lakeview Hostel', location: 'Near Engineering College, Kota', match: '98%' },
                        { name: 'Urban Nest PG', location: 'Sector 5, Suratgarh', match: '95%' },
                        { name: 'Scholar House', location: 'University Road, Bikaner', match: '92%' },
                        { name: 'City Center Rooms', location: 'Central Market, Sri Ganganagar', match: '90%' }
                      ].map((recommendation, index) => (
                        <div 
                          key={index} 
                          className="flex items-start border rounded-lg p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer animate-scale-in"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center mr-4">
                            <Home className="text-primary" size={20} />
                          </div>
                          <div>
                            <h4 className="font-medium">{recommendation.name}</h4>
                            <p className="text-sm text-muted-foreground">{recommendation.location}</p>
                            <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                              {recommendation.match} Match
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Button variant="outline" className="hover:bg-primary/5 transition-colors">
                        View All Recommendations
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default UserDashboard;
