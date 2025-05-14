
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button } from "@/components/ui/button";
import { ShoppingCart, Home, Package, User, LogIn } from "lucide-react";

const Navbar: React.FC = () => {
  const { state } = useAppContext();
  const { user, isAuthenticated, cart } = state;
  const location = useLocation();
  const navigate = useNavigate();

  const cartItemCount = cart.length;
  
  // Check if it's the admin panel route
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-white shadow-md sticky top-0 w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsHPUdeeW67M7jsF1y4JxssrQB4ab90-VRfA&s" 
                alt="Arul Jayam Machinery" 
                className="h-8 w-auto mr-2" 
              />
              <span className="font-semibold text-agri-primary text-lg">
                ARUL JAYAM MACHINERY
              </span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <Link 
              to="/" 
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === "/" 
                  ? "text-agri-primary border-b-2 border-agri-primary" 
                  : "text-gray-700 hover:text-agri-primary"
              }`}
            >
              <Home className="h-5 w-5 mr-1" />
              <span className="hidden md:inline">Home</span>
            </Link>
            
            <Link 
              to="/cart" 
              className={`relative flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === "/cart" 
                  ? "text-agri-primary border-b-2 border-agri-primary" 
                  : "text-gray-700 hover:text-agri-primary"
              }`}
            >
              <ShoppingCart className="h-5 w-5 mr-1" />
              <span className="hidden md:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-agri-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            <Link 
              to="/orders" 
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === "/orders" 
                  ? "text-agri-primary border-b-2 border-agri-primary" 
                  : "text-gray-700 hover:text-agri-primary"
              }`}
            >
              <Package className="h-5 w-5 mr-1" />
              <span className="hidden md:inline">Orders</span>
            </Link>
            
            {isAuthenticated ? (
              <div className="relative ml-3">
                <Link 
                  to="/profile" 
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === "/profile" 
                      ? "text-agri-primary border-b-2 border-agri-primary" 
                      : "text-gray-700 hover:text-agri-primary"
                  }`}
                >
                  <User className="h-5 w-5 mr-1" />
                  <span className="hidden md:inline">{user?.username}</span>
                </Link>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="ghost" className="flex items-center text-gray-700 hover:text-agri-primary">
                  <LogIn className="h-5 w-5 mr-1" />
                  <span className="hidden md:inline">Login</span>
                </Button>
              </Link>
            )}
            
            {/* Admin Panel Link - only visible for admins */}
            {isAuthenticated && user?.isAdmin && (
              <Link 
                to="/admin" 
                className={`ml-2 flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isAdminRoute 
                    ? "bg-agri-primary text-white" 
                    : "text-gray-700 hover:text-agri-primary border border-agri-primary"
                }`}
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
