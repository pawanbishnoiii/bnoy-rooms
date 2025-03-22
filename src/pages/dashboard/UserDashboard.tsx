import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Bookmark, Calendar, Clock, Settings, User, Building, MapPin, PieChart, Book, Heart } from 'lucide-react';
import AIRecommendations from '@/components/properties/AIRecommendations';

interface ExtendedUserProfile {
  id: string;
  full_name: string | null;
  role: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  gender?: 'boys' | 'girls' | 'common';
}

interface BookingWithProperty {
  id: string;
  property_id: string;
  user_id: string;
  check_in_date: string;
  check_out_date: string | null;
  time_frame: 'daily' | 'monthly';
  price_per_unit: number;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  property: {
    id: string;
    name: string;
    address: string;
    type: string;
    [key: string]: any;
  } | null;
}

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [recentBookings, setRecentBookings] = useState<BookingWithProperty[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const extendedProfile = profile as ExtendedUserProfile | null;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            property:properties(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (bookingsError) throw bookingsError;
        
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('properties')
          .select('*')
          .limit(4);
          
        if (favoritesError) throw favoritesError;
        
        const processedBookings: BookingWithProperty[] = bookingsData.map(booking => {
          const property = booking.property || {
            id: '',
            name: 'Unknown Property',
            address: 'Address not available',
            type: 'Unknown type'
          };
          
          return {
            ...booking,
            property: {
              id: property.id || '',
              name: property.name || 'Unknown Property',
              address: property.address || 'Address not available',
              type: property.type || 'Unknown type',
              ...property
            }
          };
        });
        
        setRecentBookings(processedBookings);
        setFavoriteProperties(favoritesData || []);
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error loading data',
          description: error.message || 'Could not load your dashboard data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, toast]);

  if (!user || !profile) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your dashboard</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.location.href = '/auth/login'}>Log In</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container py-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}</h1>
          <p className="text-muted-foreground">Manage your accommodations and bookings</p>
        </div>
        
        <div className="flex gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings size={16} />
            <span>Settings</span>
          </Button>
          <Button className="flex items-center gap-2">
            <MapPin size={16} />
            <span>Find Accommodation</span>
          </Button>
        </div>
      </motion.div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Overview
          </TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Bookings
          </TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Favorites
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              variants={item}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <User className="mr-2 h-5 w-5 text-primary" />
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-center mb-4">
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold">
                        {profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S'}
                      </div>
                    </div>
                    <p className="text-center font-medium text-lg">{profile.full_name || 'Student'}</p>
                    <p className="text-center text-muted-foreground">{user.email}</p>
                    <p className="text-center bg-primary/10 text-primary rounded-full py-0.5 px-2 text-xs inline-block mt-1 mx-auto">
                      {profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1) || 'Student'}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
            
            <motion.div
              variants={item}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-primary" />
                    Upcoming Stay
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                  ) : recentBookings.length > 0 ? (
                    <div>
                      <h3 className="font-semibold">{recentBookings[0].property?.name || 'Property'}</h3>
                      <p className="text-muted-foreground text-sm flex items-center mt-1">
                        <MapPin className="mr-1 h-3 w-3" />
                        {recentBookings[0].property?.address || 'Address unavailable'}
                      </p>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Check in:</span>
                          <span className="text-sm font-medium">
                            {new Date(recentBookings[0].check_in_date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {recentBookings[0].time_frame === 'daily' && (
                          <div className="flex justify-between">
                            <span className="text-sm">Check out:</span>
                            <span className="text-sm font-medium">
                              {new Date(recentBookings[0].check_out_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-sm">Status:</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            recentBookings[0].status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            recentBookings[0].status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {recentBookings[0].status.charAt(0).toUpperCase() + recentBookings[0].status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Building className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No upcoming stays</p>
                      <p className="text-xs text-muted-foreground mt-1">Book your first accommodation</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab('bookings')}
                  >
                    View All Bookings
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
            
            <motion.div
              variants={item}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <PieChart className="mr-2 h-5 w-5 text-primary" />
                    Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Total Bookings</p>
                        <p className="text-2xl font-bold">{isLoading ? '-' : recentBookings.length}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <Heart className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Saved Properties</p>
                        <p className="text-2xl font-bold">{isLoading ? '-' : favoriteProperties.length}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Days as Member</p>
                        <p className="text-2xl font-bold">
                          {profile?.created_at 
                            ? Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <AIRecommendations 
            userPreferences={{
              gender: (extendedProfile?.gender as any) || 'common',
              location: 'Jaipur',
              propertyType: 'hostel'
            }}
          />
        </TabsContent>
        
        <TabsContent value="bookings">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Your Bookings</h2>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <motion.div variants={item} key={booking.id}>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{booking.property?.name || 'Property'}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-sm flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              {booking.property?.address || 'Address unavailable'}
                            </p>
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Check in: </span>
                              <span>{new Date(booking.check_in_date).toLocaleDateString()}</span>
                              {booking.time_frame === 'daily' && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="font-medium">Check out: </span>
                                  <span>{new Date(booking.check_out_date).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/bookings/${booking.id}/confirmation`}>View Details</a>
                            </Button>
                            
                            {booking.status === 'pending' && (
                              <Button size="sm" variant="destructive">Cancel</Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Book className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">No bookings yet</h3>
                  <p className="text-muted-foreground mb-4">Start exploring accommodations to make your first booking</p>
                  <Button asChild>
                    <a href="/properties">Browse Properties</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="favorites">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Saved Properties</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-40 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : favoriteProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favoriteProperties.map((property) => (
                  <motion.div variants={item} key={property.id}>
                    <Card className="overflow-hidden">
                      <div className="h-40 bg-muted relative">
                        <img 
                          src={property.image_url || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3"} 
                          alt={property.name} 
                          className="w-full h-full object-cover"
                        />
                        <Button size="icon" variant="secondary" className="absolute top-2 right-2 rounded-full">
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg">{property.name}</h3>
                        <p className="text-muted-foreground text-sm flex items-center mt-1">
                          <MapPin className="mr-1 h-3 w-3" />
                          {property.address}
                        </p>
                        <p className="font-medium text-lg mt-2">₹{property.monthly_price?.toLocaleString() || property.daily_price?.toLocaleString()}</p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm">View Details</Button>
                          <Button size="sm" variant="outline">Book Now</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">No saved properties</h3>
                  <p className="text-muted-foreground mb-4">Save properties you like to compare them later</p>
                  <Button asChild>
                    <a href="/properties">Browse Properties</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
