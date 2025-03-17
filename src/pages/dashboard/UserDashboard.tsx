
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Home, Search, Heart, Calendar, Bell, Settings, LogOut } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const UserDashboard = () => {
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
                <div className="w-16 h-16 rounded-full bg-bnoy-100 flex items-center justify-center">
                  <span className="text-xl font-medium text-bnoy-600">RS</span>
                </div>
                <div>
                  <h2 className="font-medium text-lg">Rahul Singh</h2>
                  <p className="text-muted-foreground text-sm">rahul.singh@example.com</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Link 
                  to="/dashboard/user" 
                  className="flex items-center space-x-3 p-3 rounded-md bg-bnoy-50 text-bnoy-600"
                >
                  <Home size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/dashboard/user/search" 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-bnoy-50 transition-colors"
                >
                  <Search size={18} />
                  <span>Search</span>
                </Link>
                <Link 
                  to="/dashboard/user/favorites" 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-bnoy-50 transition-colors"
                >
                  <Heart size={18} />
                  <span>Favorites</span>
                </Link>
                <Link 
                  to="/dashboard/user/bookings" 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-bnoy-50 transition-colors"
                >
                  <Calendar size={18} />
                  <span>Bookings</span>
                </Link>
                <Link 
                  to="/dashboard/user/notifications" 
                  className="flex items-center space-x-3 p-3 rounded-md hover:bg-bnoy-50 transition-colors"
                >
                  <Bell size={18} />
                  <span>Notifications</span>
                </Link>
                <Link 
                  to="/dashboard/user/settings" 
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
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="premium-card p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Saved Properties</h3>
                <p className="text-3xl font-bold">12</p>
              </div>
              <div className="premium-card p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Bookings</h3>
                <p className="text-3xl font-bold">2</p>
              </div>
              <div className="premium-card p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Searches</h3>
                <p className="text-3xl font-bold">18</p>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="premium-card">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-medium">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {[
                    { action: 'Booked a viewing', property: 'Sunrise PG for Boys', time: '2 hours ago' },
                    { action: 'Added to favorites', property: 'Green Valley Girls Hostel', time: '1 day ago' },
                    { action: 'Searched for properties', property: 'in Kota near Allen Coaching', time: '2 days ago' },
                    { action: 'Viewed property details', property: 'Royal Apartment', time: '2 days ago' },
                    { action: 'Contacted owner', property: 'Student Palace', time: '1 week ago' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-bnoy-500 mt-2 mr-3"></div>
                      <div>
                        <p className="text-foreground">
                          {activity.action} - <span className="font-medium">{activity.property}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Recommendations */}
            <div className="premium-card">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-medium">AI Recommendations</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on your search history and preferences
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: 'Lakeview Hostel', location: 'Near Engineering College, Kota', match: '98%' },
                    { name: 'Urban Nest PG', location: 'Sector 5, Suratgarh', match: '95%' },
                    { name: 'Scholar House', location: 'University Road, Bikaner', match: '92%' },
                    { name: 'City Center Rooms', location: 'Central Market, Sri Ganganagar', match: '90%' }
                  ].map((recommendation, index) => (
                    <div key={index} className="flex items-start border border-border/50 rounded-lg p-4 hover:border-bnoy-200 transition-colors cursor-pointer">
                      <div className="w-12 h-12 rounded bg-bnoy-100 flex items-center justify-center mr-4">
                        <Home className="text-bnoy-600" size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium">{recommendation.name}</h4>
                        <p className="text-sm text-muted-foreground">{recommendation.location}</p>
                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-bnoy-50 text-bnoy-600 text-xs">
                          {recommendation.match} Match
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button className="btn-outline">
                    View All Recommendations
                  </button>
                </div>
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

export default UserDashboard;
