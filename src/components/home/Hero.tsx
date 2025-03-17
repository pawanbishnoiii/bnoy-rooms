
import React from 'react';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-bnoy-950/50 via-bnoy-950/30 to-background/90"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 z-10 pt-10 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Find Your Perfect <span className="text-bnoy-300">Student Accommodation</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-white/80 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover AI-powered recommendations for PGs, hostels, and independent rooms
            tailored to your preferences and needs.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <SearchBar />
          </motion.div>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-6 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="glass-panel px-6 py-4 flex flex-col items-center">
              <span className="text-3xl font-bold text-bnoy-600 mb-1">1200+</span>
              <span className="text-sm text-foreground/80">Properties</span>
            </div>
            <div className="glass-panel px-6 py-4 flex flex-col items-center">
              <span className="text-3xl font-bold text-bnoy-600 mb-1">15+</span>
              <span className="text-sm text-foreground/80">Cities</span>
            </div>
            <div className="glass-panel px-6 py-4 flex flex-col items-center">
              <span className="text-3xl font-bold text-bnoy-600 mb-1">5000+</span>
              <span className="text-sm text-foreground/80">Happy Students</span>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Wave Shape Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
