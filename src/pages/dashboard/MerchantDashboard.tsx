
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Building, Plus, ListFilter, Users, Calendar, Bell, 
  Settings, LogOut, BarChart2, TrendingUp, ArrowUp, ArrowDown
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const MerchantDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bnoy-50/30">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        <Link to="/" className="inline-flex items-center text-bnoy-600 hover:text-bnoy-700 mb-6">
          <ChevronLeft size={16} className="mr-1" />
          Back to Home
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="premium-card p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-bnoy-100 flex items-center justify-center relative">
                  <span className="text-xl font-medium text-bnoy-600">SP</span>
                  <div className="absolute -top-1 -right-1 bg-bnoy-600 text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <h2 className="font-medium text-lg">Sharma Properties</h2>
                    <div className="ml-2 bg-bnoy-600/10 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-bnoy-600">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">Verified Merchant</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Link 
                  to="/dashboard/merchant" 
                  className="flex items-center space-x-3 p-3 rounded-md bg-bnoy-50 text-bnoy-600"
                >
                  <Building size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/dashboard/merchant/properties" 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-bnoy-50 transition-colors"
                >
                  <ListFilter size={18} />
                  <span>My Properties</span>
                </Link>
                <Link 
                  to="/dashboard/merchant/bookings" 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-bnoy-50 transition-colors"
                >
                  <Calendar size={18} />
                  <span>Bookings</span>
                </Link>
                <Link 
                  to="/dashboard/merchant/inquiries" 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-bnoy-50 transition-colors"
                >
                  <Users size={18} />
                  <span>Inquiries</span>
                </Link>
                <Link 
                  to="/dashboard/merchant/analytics" 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-bnoy-50 transition-colors"
                >
                  <BarChart2 size={18} />
                  <span>Analytics</span>
                </Link>
                <Link 
                  to="/dashboard/merchant/notifications" 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-bnoy-50 transition-colors"
                >
                  <Bell size={18} />
                  <span>Notifications</span>
                </Link>
                <Link 
                  to="/dashboard/merchant/settings" 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-bnoy-50 transition-colors"
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
                
                <div className="pt-4 mt-4 border-t border-border">
                  <Link 
                    to="/logout" 
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Actions */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Merchant Dashboard</h1>
              <button className="btn-primary flex items-center">
                <Plus size={16} className="mr-2" />
                Add New Property
              </button>
            </div>
            
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="premium-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Properties</h3>
                  <div className="p-2 bg-green-50 rounded-md">
                    <Building size={18} className="text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold">8</p>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUp size={14} className="text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">2 new</span>
                  <span className="text-muted-foreground ml-1">this month</span>
                </div>
              </div>
              
              <div className="premium-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Active Bookings</h3>
                  <div className="p-2 bg-bnoy-50 rounded-md">
                    <Calendar size={18} className="text-bnoy-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold">12</p>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUp size={14} className="text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">3 new</span>
                  <span className="text-muted-foreground ml-1">this week</span>
                </div>
              </div>
              
              <div className="premium-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Inquiries</h3>
                  <div className="p-2 bg-blue-50 rounded-md">
                    <Users size={18} className="text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold">36</p>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUp size={14} className="text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">24%</span>
                  <span className="text-muted-foreground ml-1">increase</span>
                </div>
              </div>
            </div>
            
            {/* Performance Overview */}
            <div className="premium-card overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">Performance Overview</h2>
                  <select className="text-sm border rounded-md px-3 py-1">
                    <option>Last 30 Days</option>
                    <option>Last Week</option>
                    <option>Last 3 Months</option>
                    <option>Last Year</option>
                  </select>
                </div>
              </div>
              
              <div className="p-6">
                <div className="h-64 bg-bnoy-50/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp size={36} className="text-bnoy-600 mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Performance charts and analytics would be displayed here
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Bookings/Inquiries */}
            <div className="premium-card overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-medium">Recent Bookings & Inquiries</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { student: 'Amit Kumar', property: 'Sunrise PG for Boys', type: 'Booking', date: '22 Aug 2023', status: 'Confirmed' },
                      { student: 'Priya Sharma', property: 'Green Valley Girls Hostel', type: 'Inquiry', date: '21 Aug 2023', status: 'Pending' },
                      { student: 'Vikram Singh', property: 'Royal Apartment', type: 'Booking', date: '20 Aug 2023', status: 'Confirmed' },
                      { student: 'Neha Gupta', property: 'Student Palace', type: 'Inquiry', date: '19 Aug 2023', status: 'Responded' },
                      { student: 'Rahul Verma', property: 'Sunrise PG for Boys', type: 'Inquiry', date: '18 Aug 2023', status: 'Cancelled' }
                    ].map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {item.student}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {item.property}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                            item.type === 'Booking' 
                              ? 'bg-green-50 text-green-600' 
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {item.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                            item.status === 'Confirmed' 
                              ? 'bg-green-50 text-green-600' 
                              : item.status === 'Pending'
                              ? 'bg-amber-50 text-amber-600'
                              : item.status === 'Responded'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-red-50 text-red-600'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 text-center border-t border-border">
                <button className="text-bnoy-600 hover:text-bnoy-700 text-sm font-medium">
                  View All Bookings & Inquiries
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default MerchantDashboard;
