import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, BarChart3, Building, DollarSign, Home, MapPin, TrendingUp, User, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Property, Booking, UserProfile } from '@/types';
import { BarChart, LineChart, PieChart } from '../charts';
import { mapDbPropertyToProperty } from '@/utils/typeUtils';

const AdminPanel = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [totalMerchants, setTotalMerchants] = useState<number>(0);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [usersByRole, setUsersByRole] = useState<any[]>([]);
  const [bookingsByStatus, setBookingsByStatus] = useState<any[]>([]);
  const [propertyByCategory, setPropertyByCategory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch total properties
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*');

      // Fetch total users
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total bookings
      const { count: bookingCount, error: bookingError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      // Fetch total merchants
      const { count: merchantCount, error: merchantError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'merchant');

      // Fetch recent bookings with property and user details
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties(name, address),
          user:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch users by role for pie chart
      const { data: usersRoleData, error: usersRoleError } = await supabase
        .from('profiles')
        .select('role');

      // Process errors
      if (propertyError) console.error('Error fetching properties:', propertyError);
      if (userError) console.error('Error fetching users count:', userError);
      if (bookingError) console.error('Error fetching bookings count:', bookingError);
      if (merchantError) console.error('Error fetching merchants count:', merchantError);
      if (bookingsError) console.error('Error fetching recent bookings:', bookingsError);
      if (usersRoleError) console.error('Error fetching users by role:', usersRoleError);

      // Set the state with the fetched data
      if (propertyData) setProperties(propertyData.map(mapDbPropertyToProperty));
      if (userCount !== null) setTotalUsers(userCount);
      if (bookingCount !== null) setTotalBookings(bookingCount);
      if (merchantCount !== null) setTotalMerchants(merchantCount);
      if (bookingsData) setRecentBookings(bookingsData as unknown as Booking[]);

      // Process users by role data
      if (usersRoleData) {
        const roleCount: Record<string, number> = {};
        usersRoleData.forEach(user => {
          const role = user.role || 'unknown';
          roleCount[role] = (roleCount[role] || 0) + 1;
        });

        const roleData = Object.keys(roleCount).map(role => ({
          name: role.charAt(0).toUpperCase() + role.slice(1),
          value: roleCount[role]
        }));

        setUsersByRole(roleData);
      }

      // Get property categories count
      if (propertyData) {
        const categoryCount: Record<string, number> = {};
        propertyData.forEach(property => {
          const category = property.category || 'other';
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const categoryData = Object.keys(categoryCount).map(category => ({
          name: category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1),
          value: categoryCount[category]
        }));

        setPropertyByCategory(categoryData);
      }

      // Create booking status data
      const { data: bookingStatusData, error: bookingStatusError } = await supabase
        .from('bookings')
        .select('status');

      if (bookingStatusData) {
        const statusCount: Record<string, number> = {};
        bookingStatusData.forEach(booking => {
          const status = booking.status || 'unknown';
          statusCount[status] = (statusCount[status] || 0) + 1;
        });

        const statusData = Object.keys(statusCount).map(status => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: statusCount[status]
        }));

        setBookingsByStatus(statusData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalRevenue = () => {
    return recentBookings.reduce((sum, booking) => {
      // Make sure to parse the number correctly
      const amount = typeof booking.total_amount === 'number' ? booking.total_amount : 0;
      return sum + amount;
    }, 0);
  };

  const getMonthlyBookingStats = () => {
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        name: date.toLocaleString('default', { month: 'short' }),
        bookings: Math.floor(Math.random() * 50) + 10, // Placeholder for real data
        revenue: Math.floor(Math.random() * 5000) + 1000 // Placeholder for real data
      };
    }).reverse();

    return last6Months;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of platform metrics and performance.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Properties
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{properties.length}</div>
                <p className="text-xs text-muted-foreground">
                  {properties.filter(p => p.is_verified).length} verified
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {totalMerchants} merchants, {totalUsers - totalMerchants} students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Bookings
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBookings}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((totalBookings / (totalUsers || 1)) * 100) / 100} avg. per user
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{getTotalRevenue().toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  ₹{totalBookings ? Math.round(getTotalRevenue() / totalBookings) : 0} avg. per booking
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7 md:col-span-4">
              <CardHeader>
                <CardTitle>Revenue & Booking Trends</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <BarChart data={getMonthlyBookingStats()} />
              </CardContent>
            </Card>

            <Card className="col-span-7 md:col-span-3">
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart data={usersByRole} />
              </CardContent>
            </Card>
          </div>

          {/* Other stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart data={bookingsByStatus} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Properties by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart data={propertyByCategory} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>
                In-depth analysis of platform metrics and trends.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Detailed analytics content will be shown here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>
                Download and view system reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reports section is under construction.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
