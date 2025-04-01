
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <h3 className="text-xl font-bold mb-4">PG Finder</h3>
            <p className="text-gray-300 mb-4">
              Finding the perfect accommodation for students and professionals. We connect you with the best PGs, hostels, and rooms across India.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/properties" className="text-gray-300 hover:text-white">Find Properties</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white">Blog</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Property Owners */}
          <div>
            <h3 className="text-lg font-bold mb-4">For Property Owners</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/auth/register" className="text-gray-300 hover:text-white">Register as Merchant</Link>
              </li>
              <li>
                <Link to="/dashboard/properties" className="text-gray-300 hover:text-white">List Your Property</Link>
              </li>
              <li>
                <Link to="/owner-guidelines" className="text-gray-300 hover:text-white">Owner Guidelines</Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-white">Pricing</Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white">Help Center</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin size={20} className="mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-300">123 Main Street, New Delhi, India - 110001</p>
              </div>
              <div className="flex items-center">
                <Phone size={20} className="mr-2 flex-shrink-0" />
                <p className="text-gray-300">+91 98765 43210</p>
              </div>
              <div className="flex items-center">
                <Mail size={20} className="mr-2 flex-shrink-0" />
                <p className="text-gray-300">contact@pgfinder.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <p className="text-center text-gray-400">
            &copy; {year} PG Finder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
