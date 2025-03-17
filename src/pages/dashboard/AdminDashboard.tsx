import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, BarChart3, Users, Home, Star, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const AdminDashboard = () => {
  const [pendingMerchants, setPendingMerchants] = useState<any[]>([]);
  const [pendingProperties, setPendingProperties] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch merchants pending verification
      const { data: merchants, error: merchantsError } = await supabase
        .from('merchants')
        .select('*, profiles(full_name, email)')
        .eq('is_verified', false);

      if (merchantsError) throw merchantsError;
      setPendingMerchants(merchants || []);

      // Fetch properties pending verification
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*, merchants(business_name), location:locations(name)')
        .eq('is_verified', false);

      if (propertiesError) throw propertiesError;
      setPendingProperties(properties || []);

      // Fetch recent reviews (we could add a flag for reviewed/approved in the future)
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*, user:profiles(full_name), property:properties(name)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsError) throw reviewsError;
      setPendingReviews(reviews || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error loading data',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const approveMerchant = async (id: string) => {
    try {
      const { error } = await supabase
        .from('merchants')
        .update({ is_verified: true })
        .eq('id', id);

      if (error) throw error;

      setPendingMerchants(prev => prev.filter(merchant => merchant.id !== id));
      toast({
        title: 'Merchant approved',
        description: 'The merchant has been verified successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error approving merchant',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const approveProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_verified: true })
        .eq('id', id);

      if (error) throw error;

      setPendingProperties(prev => prev.filter(property => property.id !== id));
      toast({
        title: 'Property verified',
        description: 'The property has been verified successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error verifying property',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="flex flex-col items-center pt-6">
                <Users className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-xl">Merchants</CardTitle>
                <p className="text-3xl font-bold mt-2">{pendingMerchants.length}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center pt-6">
                <Home className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-xl">Properties</CardTitle>
                <p className="text-3xl font-bold mt-2">{pendingProperties.length}</p>
                <p className="text-sm text-muted-foreground">Pending Verification</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center pt-6">
                <Star className="h-8 w-8 text-amber-500 mb-2" />
                <CardTitle className="text-xl">Reviews</CardTitle>
                <p className="text-3xl font-bold mt-2">{pendingReviews.length}</p>
                <p className="text-sm text-muted-foreground">Recent Reviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center pt-6">
                <BarChart3 className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle className="text-xl">Analytics</CardTitle>
                <p className="text-3xl font-bold mt-2">24</p>
                <p className="text-sm text-muted-foreground">Active Users Today</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="approval">
            <TabsList className="mb-6">
              <TabsTrigger value="approval">Approval Queue</TabsTrigger>
              <TabsTrigger value="merchants">Merchants</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Approval Queue Tab */}
            <TabsContent value="approval">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Merchants */}
                <Card>
                  <CardHeader>
                    <CardTitle>Merchants Pending Verification</CardTitle>
                    <CardDescription>
                      Review and approve merchant registrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-4">Loading...</div>
                    ) : pendingMerchants.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No pending merchant verifications
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingMerchants.map((merchant) => (
                          <div key={merchant.id} className="border rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                              <div className="font-medium">{merchant.business_name}</div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => approveMerchant(merchant.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                >
                                  <XCircle className="h-4 w-4 mr-1 text-red-500" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {merchant.contact_person || merchant.profiles?.full_name} • {merchant.email}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {merchant.phone} • {merchant.address || 'No address provided'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pending Properties */}
                <Card>
                  <CardHeader>
                    <CardTitle>Properties Pending Verification</CardTitle>
                    <CardDescription>
                      Review and verify property listings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-4">Loading...</div>
                    ) : pendingProperties.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No pending property verifications
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingProperties.map((property) => (
                          <div key={property.id} className="border rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                              <div className="font-medium">{property.name}</div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => approveProperty(property.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                  Verify
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                >
                                  <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                                  Flag
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {property.type} • {property.location?.name || property.address}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Listed by: {property.merchants?.business_name || 'Unknown Merchant'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Reviews */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                  <CardDescription>
                    Monitor and moderate user reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : pendingReviews.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No recent reviews
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingReviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <div className="font-medium">
                              {review.user?.full_name || 'Anonymous'} rated {review.property?.name || 'a property'}
                            </div>
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                              ))}
                              {Array.from({ length: 5 - review.rating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-gray-300" />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <div className="text-sm">"{review.comment}"</div>
                          )}
                          <div className="text-xs text-muted-foreground mt-2">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other Tabs (to be implemented) */}
            <TabsContent value="merchants">
              <Card>
                <CardHeader>
                  <CardTitle>Merchant Management</CardTitle>
                  <CardDescription>
                    Manage all registered merchants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-12 text-muted-foreground">
                    Merchant management tools will be implemented here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties">
              <Card>
                <CardHeader>
                  <CardTitle>Property Management</CardTitle>
                  <CardDescription>
                    Manage all property listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-12 text-muted-foreground">
                    Property management tools will be implemented here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Review Management</CardTitle>
                  <CardDescription>
                    Monitor and moderate all user reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-12 text-muted-foreground">
                    Review management tools will be implemented here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>
                    View usage statistics and business metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-12 text-muted-foreground">
                    Analytics dashboard will be implemented here
                  </p>
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

export default AdminDashboard;
