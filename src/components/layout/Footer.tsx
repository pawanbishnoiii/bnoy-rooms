
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Github, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <span className="font-bold text-xl text-bnoy-600">Bnoy</span>
              <span className="font-light text-xl">Rooms</span>
            </Link>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              AI-driven booking platform for students to find PGs, hostels, and rental accommodations with ease.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-muted-foreground hover:text-bnoy-600 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-bnoy-600 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-bnoy-600 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-bnoy-600 transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <h4 className="font-medium text-base mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
                  Properties
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h4 className="font-medium text-base mb-4">Our Services</h4>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
                  PG Accommodations
                </Link>
              </li>
              <li>
                <Link to="#" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
                  Hostels
                </Link>
              </li>
              <li>
                <Link to="#" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
                  Independent Rooms
                </Link>
              </li>
              <li>
                <Link to="#" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
                  Rented Houses
                </Link>
              </li>
              <li>
                <Link to="#" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
                  Hotels
                </Link>
              </li>
              <li>
                <Link to="#" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
                  For Property Owners
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h4 className="font-medium text-base mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-bnoy-600 mt-0.5" />
                <span className="text-muted-foreground text-sm">123 Main Street, Suratgarh, Rajasthan, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-bnoy-600" />
                <a href="tel:+919876543210" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-bnoy-600" />
                <a href="mailto:info@bnoyrooms.com" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
                  info@bnoyrooms.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Bnoy Rooms. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
              Terms
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
              Privacy
            </Link>
            <Link to="/cookies" className="text-muted-foreground hover:text-bnoy-600 transition-colors text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
