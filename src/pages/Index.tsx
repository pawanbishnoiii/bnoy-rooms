
import React from 'react';
import { motion } from 'framer-motion';
import { Map, Users, School, Building2, ShieldCheck, BrainCircuit } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import FeaturedListings from '../components/home/FeaturedListings';
import MapView from '../components/maps/MapView';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Search */}
        <Hero />
        
        {/* Featured Properties */}
        <FeaturedListings />
        
        {/* Locations Section */}
        <section className="py-20 bg-bnoy-50/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-2">Available Locations</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're currently operational in these cities, with more coming soon
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                'Suratgarh', 'Bikaner', 'Anupgarh', 'RaiSinghnagar', 
                'Sri Ganganagar', 'Abohar', 'Gharsana', 'Hanumangarh',
                'Sangariya', 'Sikar', 'Gopalpura Jaipur', 'Ridhi Sidhi Jaipur',
                'Mansarovar Jaipur', 'Kota'
              ].map((city, index) => (
                <motion.div
                  key={city}
                  className="glass-panel p-4 text-center cursor-pointer hover:bg-white transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <span className="block text-foreground font-medium">{city}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Map Integration Preview */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full bg-bnoy-50 text-bnoy-600 text-sm">
                  <Map size={16} className="mr-2" />
                  Interactive Maps
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Find Accommodations With <span className="text-bnoy-600">Perfect Locations</span>
                </h2>
                <p className="text-muted-foreground mb-6">
                  Our interactive map helps you find accommodations near important landmarks like coaching centers, 
                  hospitals, and educational institutions. See real distances and get a feel for the area before booking.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    'View properties on an interactive map',
                    'Check distances to important places',
                    'See nearby amenities and facilities',
                    'Get directions and navigation assistance'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-bnoy-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className="btn-primary">
                  Explore Map View
                </button>
              </div>
              
              <div className="h-96 rounded-xl overflow-hidden shadow-lg">
                <MapView 
                  center={[26.4367, 74.6400]} // Center of Rajasthan
                  zoom={7}
                  markers={[
                    { position: [26.9124, 75.7873], title: 'Jaipur', type: 'city' },
                    { position: [25.1765, 75.8389], title: 'Kota', type: 'city' },
                    { position: [28.0229, 73.3119], title: 'Bikaner', type: 'city' },
                    { position: [29.9457, 73.8837], title: 'Sri Ganganagar', type: 'city' }
                  ]}
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-gradient-to-br from-bnoy-50/50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-2">Why Choose Bnoy Rooms?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform offers unique features designed specifically for students
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <BrainCircuit size={28} className="text-bnoy-600" />,
                  title: 'AI-Powered Recommendations',
                  description: 'Get personalized accommodation suggestions based on your preferences and needs'
                },
                {
                  icon: <Map size={28} className="text-bnoy-600" />,
                  title: 'Interactive Location Maps',
                  description: 'Explore properties with real-time distance calculations to important landmarks'
                },
                {
                  icon: <Users size={28} className="text-bnoy-600" />,
                  title: 'Student Community',
                  description: 'Connect with other students and read genuine reviews from real occupants'
                },
                {
                  icon: <School size={28} className="text-bnoy-600" />,
                  title: 'Educational Proximity',
                  description: 'Find accommodations close to your educational institutions and coaching centers'
                },
                {
                  icon: <Building2 size={28} className="text-bnoy-600" />,
                  title: 'Variety of Options',
                  description: 'Choose from PGs, hostels, independent rooms, and rented houses based on your budget'
                },
                {
                  icon: <ShieldCheck size={28} className="text-bnoy-600" />,
                  title: 'Verified Listings',
                  description: 'All properties undergo thorough verification for your safety and satisfaction'
                }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="premium-card p-6 h-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="p-3 bg-bnoy-50 rounded-xl inline-block mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-bnoy-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Are You a Property Owner?
              </h2>
              <p className="text-white/80 text-lg mb-8">
                List your PG, hostel, or rental property on our platform and connect with thousands of students looking for accommodation.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="btn-primary bg-white text-bnoy-600 hover:bg-white/90">
                  List Your Property
                </button>
                <button className="btn-outline border-white text-white hover:bg-white/10">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
