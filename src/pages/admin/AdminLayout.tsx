
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  User
} from 'lucide-react';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
      exact: true
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: <Package className="h-5 w-5 mr-3" />
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: <ShoppingCart className="h-5 w-5 mr-3" />
    },
    {
      name: 'Profile',
      path: '/admin/profile',
      icon: <User className="h-5 w-5 mr-3" />
    }
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Layout hideFooter={false}>
      <div className="bg-gray-50">
        {/* Admin header */}
        <div className="bg-white border-b px-4 py-3">
          <div className="container mx-auto">
            <h1 className="text-xl font-bold text-agri-primary">Admin Panel</h1>
          </div>
        </div>
        
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 p-6">
            {/* Sidebar navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                        isActive(item.path, item.exact)
                          ? 'bg-agri-primary text-white'
                          : 'text-gray-700 hover:text-agri-primary hover:bg-gray-50'
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLayout;
