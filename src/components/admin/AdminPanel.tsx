import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard, OverviewChart, RevenueChart } from '@/components/charts';
import { Users, Building, CreditCard, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const AdminPanel = () => {
  const { user } = useAuth();
  const [usersCount, setUsersCount] = useState(0);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [latestBookings, setLatestBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Fetch users count
      const { count: users, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (usersError) throw usersError;

      // Fetch properties count
      const { count: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*', { count: 'exact' });

      if (propertiesError) throw propertiesError;

      // Fetch bookings count
      const { count: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' });

      if (bookingsError) throw bookingsError;

      // Fetch latest bookings
      const { data: latestBookingsData, error: latestBookingsError } = await supabase
        .from('bookings')
        .select('*, property:properties(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (latestBookingsError) throw latestBookingsError;

      setUsersCount(users || 0);
      setPropertiesCount(properties || 0);
      setBookingsCount(bookings || 0);
      setLatestBookings(latestBookingsData || []);
    } catch (error: any) {
      console.error('Error fetching admin dashboard data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sample data for Overview Chart
  const overviewData = [
    { name: 'Jan', total: 120 },
    { name: 'Feb', total: 80 },
    { name: 'Mar', total: 150 },
    { name: 'Apr', total: 100 },
    { name: 'May', total: 180 },
  ];

  // Sample data for Revenue Chart
  const revenueData = [
    { name: 'Jan', revenue: 5000 },
    { name: 'Feb', revenue: 7000 },
    { name: 'Mar', revenue: 6000 },
    { name: 'Apr', revenue: 8000 },
    { name: 'May', revenue: 9000 },
  ];

  if (isLoading) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Total Users"
          value={usersCount}
          icon={<Users className="h-4 w-4" />}
          description="Registered users"
        />
        <StatsCard
          title="Total Properties"
          value={propertiesCount}
          icon={<Building className="h-4 w-4" />}
          description="Available properties"
        />
        <StatsCard
          title="Total Bookings"
          value={bookingsCount}
          icon={<CreditCard className="h-4 w-4" />}
          description="Confirmed bookings"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <OverviewChart title="Monthly Bookings Overview" data={overviewData} />
        <RevenueChart title="Monthly Revenue" data={revenueData} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Bookings</CardTitle>
          <CardDescription>Recent booking activities</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestBookings.map((booking: any) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <Link to={`/bookings/${booking.id}`} className="hover:underline">
                      {booking.id}
                    </Link>
                  </TableCell>
                  <TableCell>{booking.property?.name}</TableCell>
                  <TableCell>{new Date(booking.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
