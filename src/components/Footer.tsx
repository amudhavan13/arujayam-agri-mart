
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-agri-dark text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Information */}
          <div>
            <h3 className="text-xl font-semibold mb-4">ARUL JAYAM MACHINERY</h3>
            <div className="flex items-center mb-2">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsHPUdeeW67M7jsF1y4JxssrQB4ab90-VRfA&s" 
                alt="Arul Jayam Machinery" 
                className="h-12 w-auto mr-2 bg-white p-1 rounded" 
              />
            </div>
            <p className="text-sm mb-4">
              Providing quality agricultural machinery and equipment since 2010.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products/category/tractors" className="text-gray-300 hover:text-white transition">
                  Tractors
                </Link>
              </li>
              <li>
                <Link to="/products/category/implements" className="text-gray-300 hover:text-white transition">
                  Farm Implements
                </Link>
              </li>
              <li>
                <Link to="/products/category/irrigation" className="text-gray-300 hover:text-white transition">
                  Irrigation Systems
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">📍</span>
                <span>123 Agriculture Road, Tamil Nadu, India</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📞</span>
                <a href="tel:+919876543210" className="hover:underline">+91 98765 43210</a>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✉️</span>
                <a href="mailto:contact@aruljayam.com" className="hover:underline">contact@aruljayam.com</a>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Monday - Friday:</span>
                <span>9:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday:</span>
                <span>9:00 AM - 4:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span>Closed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6">
          <p className="text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} ARUL JAYAM MACHINERY. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
