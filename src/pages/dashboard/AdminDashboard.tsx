
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Users,
  Home,
  Star,
  Clock,
  Map,
  Briefcase,
  PlusCircle,
  Building,
  BookMarked,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdminDashboard = () => {
  const [pendingMerchants, setPendingMerchants] = useState<any[]>([]);
  const [pendingProperties, setPendingProperties] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalMerchants: 0,
    totalStudents: 0,
    totalBookings: 0,
    pendingMerchants: 0,
    pendingProperties: 0
  });
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

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

      // Fetch recent reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*, user:profiles(full_name, avatar_url), property:properties(name)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsError) throw reviewsError;
      setPendingReviews(reviews || []);

      // Fetch recent users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (usersError) throw usersError;
      setRecentUsers(users || []);

      // Fetch statistics
      const [
        { count: totalProperties },
        { count: totalMerchants },
        { count: totalStudents },
        { count: totalBookings },
      ] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'merchant'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalProperties: totalProperties || 0,
        totalMerchants: totalMerchants || 0,
        totalStudents: totalStudents || 0,
        totalBookings: totalBookings || 0,
        pendingMerchants: merchants?.length || 0,
        pendingProperties: properties?.length || 0
      });
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
      setStats(prev => ({ ...prev, pendingMerchants: prev.pendingMerchants - 1 }));
      
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
      setStats(prev => ({ ...prev, pendingProperties: prev.pendingProperties - 1 }));
      
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

  const filteredUsers = recentUsers.filter(user => {
    if (filterType !== 'all' && user.role !== filterType) return false;
    
    // Search by name or email
    if (searchQuery && !(
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )) {
      return false;
    }
    
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage the entire platform from a single dashboard
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
            <Button 
              onClick={() => navigate('/admin/properties/new')} 
              variant="outline"
            >
              <Building className="mr-2 h-4 w-4" />
              Add Property
            </Button>
            <Button onClick={() => navigate('/admin/users/new')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
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
                  <h3 className="text-2xl font-bold">{stats.totalProperties}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-green-100">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Merchants</p>
                  <h3 className="text-2xl font-bold">{stats.totalMerchants}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-amber-100">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Students</p>
                  <h3 className="text-2xl font-bold">{stats.totalStudents}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-purple-100">
                  <BookMarked className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bookings</p>
                  <h3 className="text-2xl font-bold">{stats.totalBookings}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Cards for Pending Items */}
        {(stats.pendingMerchants > 0 || stats.pendingProperties > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.pendingMerchants > 0 && (
              <Card className="border-amber-200 bg-amber-50 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                    <div>
                      <p className="font-medium text-amber-800">Pending Merchant Approvals</p>
                      <p className="text-sm text-amber-700">{stats.pendingMerchants} merchant(s) awaiting verification</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-amber-300 bg-white hover:bg-amber-50"
                    onClick={() => document.getElementById('approval-tab')?.click()}
                  >
                    Review Now
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {stats.pendingProperties > 0 && (
              <Card className="border-amber-200 bg-amber-50 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                    <div>
                      <p className="font-medium text-amber-800">Pending Property Verifications</p>
                      <p className="text-sm text-amber-700">{stats.pendingProperties} property listings awaiting verification</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-amber-300 bg-white hover:bg-amber-50"
                    onClick={() => document.getElementById('approval-tab')?.click()}
                  >
                    Review Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="approval" className="space-y-4">
          <TabsList>
            <TabsTrigger value="approval" id="approval-tab">Approval Queue</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Approval Queue Tab */}
          <TabsContent value="approval" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pending Merchants */}
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Merchant Verifications</CardTitle>
                      <CardDescription>
                        Review and approve merchant registrations
                      </CardDescription>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {pendingMerchants.length} Pending
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading merchants...</p>
                    </div>
                  ) : pendingMerchants.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      No pending merchant verifications
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingMerchants.map((merchant) => (
                        <div key={merchant.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                          <div className="flex justify-between mb-2">
                            <div className="font-medium">{merchant.business_name}</div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-green-200 hover:bg-green-50 hover:text-green-600"
                                onClick={() => approveMerchant(merchant.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-red-200 hover:bg-red-50 hover:text-red-600"
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
                          <div className="text-xs text-muted-foreground mt-2 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Registered on {new Date(merchant.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Properties */}
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Property Verifications</CardTitle>
                      <CardDescription>
                        Review and verify property listings
                      </CardDescription>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {pendingProperties.length} Pending
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading properties...</p>
                    </div>
                  ) : pendingProperties.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      No pending property verifications
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingProperties.map((property) => (
                        <div key={property.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                          <div className="flex justify-between mb-2">
                            <div className="font-medium">{property.name}</div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-green-200 hover:bg-green-50 hover:text-green-600"
                                onClick={() => approveProperty(property.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                Verify
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-amber-200 hover:bg-amber-50 hover:text-amber-600"
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
                          <div className="flex space-x-2 mt-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                              ₹{property.monthly_price}/month
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
                              For {property.gender}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Reviews */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>
                  Monitor and moderate user reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading reviews...</p>
                  </div>
                ) : pendingReviews.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent reviews
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingReviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={review.user?.avatar_url} />
                              <AvatarFallback>
                                {review.user?.full_name?.substring(0, 2) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {review.user?.full_name || 'Anonymous'} 
                                <span className="font-normal text-muted-foreground"> reviewed </span>
                                {review.property?.name || 'a property'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <Clock className="inline h-3 w-3 mr-1" />
                                {new Date(review.created_at).toLocaleDateString()}
                              </div>
                            </div>
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
                          <div className="text-sm mt-2 mb-2">"{review.comment}"</div>
                        )}
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                            Approve
                          </Button>
                          <Button variant="outline" size="sm">
                            <XCircle className="h-4 w-4 mr-1 text-red-500" />
                            Hide
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      View and manage all registered users
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        className="pl-9 w-[200px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={filterType === 'all'}
                          onCheckedChange={() => setFilterType('all')}
                        >
                          All Users
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterType === 'student'}
                          onCheckedChange={() => setFilterType('student')}
                        >
                          Students
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterType === 'merchant'}
                          onCheckedChange={() => setFilterType('merchant')}
                        >
                          Merchants
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterType === 'admin'}
                          onCheckedChange={() => setFilterType('admin')}
                        >
                          Admins
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={() => navigate('/admin/users/new')}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <h3 className="font-medium text-lg mb-1">No users found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery ? 'Try a different search term' : 'There are no users to display'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-md border">
                    <div className="bg-gray-50 px-4 py-2 text-sm font-medium flex justify-between">
                      <div className="flex items-center space-x-2">
                        <span>User</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                      <div className="flex space-x-8">
                        <span>Role</span>
                        <span>Joined</span>
                        <span>Actions</span>
                      </div>
                    </div>
                    <div className="divide-y">
                      {filteredUsers.map((user) => (
                        <div key={user.id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>
                                {user.full_name?.substring(0, 2) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.full_name || 'Unnamed User'}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="w-24 text-center">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : user.role === 'merchant'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </div>
                            <div className="w-24 text-xs text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                            <div className="w-24 flex justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 px-4 py-2 text-sm text-muted-foreground text-center">
                      Showing {filteredUsers.length} of {stats.totalStudents + stats.totalMerchants + 1} users
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/admin/users')}
                  >
                    View All Users
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Property Management</CardTitle>
                    <CardDescription>
                      View, edit and manage all property listings
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => navigate('/admin/properties/map')}>
                      <Map className="mr-2 h-4 w-4" />
                      Map View
                    </Button>
                    <Button onClick={() => navigate('/admin/properties/new')}>
                      <Building className="mr-2 h-4 w-4" />
                      Add Property
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">Property management tools</h3>
                  <p className="max-w-md mx-auto mb-6">
                    View the full list of properties, edit details, verify listings, and manage property facilities.
                  </p>
                  <Button 
                    onClick={() => navigate('/admin/properties')}
                  >
                    Go to Property Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>
                  View and manage all accommodation bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BookMarked className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">Booking management tools</h3>
                  <p className="max-w-md mx-auto mb-6">
                    Monitor all bookings, handle disputes, process refunds, and view booking analytics.
                  </p>
                  <Button onClick={() => navigate('/admin/bookings')}>
                    Go to Booking Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>
                  View usage statistics and business metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">Analytics dashboard</h3>
                  <p className="max-w-md mx-auto mb-6">
                    Detailed analytics about bookings, user growth, revenue, and platform usage.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold">{stats.totalBookings}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">User Growth</p>
                      <p className="text-2xl font-bold">+{Math.floor(Math.random() * 20)}%</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">₹{(Math.random() * 1000000).toFixed(0)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Avg. Rating</p>
                      <p className="text-2xl font-bold">{(3.5 + Math.random() * 1.5).toFixed(1)}/5</p>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/admin/analytics')}>
                    View Detailed Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
