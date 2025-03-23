
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, Home, FileText, Building, MapPin, 
  TrendingUp, CreditCard, Calendar, ShieldAlert 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  
  const stats = [
    { title: "Total Users", value: "1,845", icon: Users, link: "/dashboard/users", color: "bg-blue-100 text-blue-700" },
    { title: "Properties", value: "342", icon: Building, link: "/dashboard/properties", color: "bg-green-100 text-green-700" },
    { title: "Merchants", value: "56", icon: Home, link: "/dashboard/merchants", color: "bg-amber-100 text-amber-700" },
    { title: "Bookings", value: "198", icon: Calendar, link: "/dashboard/bookings", color: "bg-purple-100 text-purple-700" },
    { title: "Locations", value: "24", icon: MapPin, link: "/dashboard/locations", color: "bg-red-100 text-red-700" },
    { title: "Reviews", value: "156", icon: FileText, link: "/dashboard/reviews", color: "bg-indigo-100 text-indigo-700" },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the admin dashboard. Manage all aspects of the platform.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card 
            key={i} 
            className="cursor-pointer hover:bg-accent/5 transition-colors" 
            onClick={() => navigate(stat.link)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground pt-1">
                Click to manage {stat.title.toLowerCase()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium">New property verification needed</p>
                  <p className="text-sm text-muted-foreground">
                    Property #342 was submitted for verification
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">New merchant signup</p>
                  <p className="text-sm text-muted-foreground">
                    Merchant "Delhi PG Services" created an account
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Calendar className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Booking confirmed</p>
                  <p className="text-sm text-muted-foreground">
                    Booking #123 was confirmed automatically
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>All systems operational</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span>Database</span>
                </div>
                <span className="text-sm text-green-500">Operational</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span>Storage</span>
                </div>
                <span className="text-sm text-green-500">Operational</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span>Authentication</span>
                </div>
                <span className="text-sm text-green-500">Operational</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span>API</span>
                </div>
                <span className="text-sm text-green-500">Operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
