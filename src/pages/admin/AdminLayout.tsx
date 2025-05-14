
import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Navbar from '../../components/Navbar';
import { toast } from '@/components/ui/sonner';
import { Home, Package, ShoppingCart, PlusCircle, Users, Settings, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useAppContext();
  const { user, isAuthenticated } = state;
  
  // Check if user is admin
  React.useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      toast.error('You do not have permission to access the admin panel');
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-agri-dark text-white h-[calc(100vh-64px)] sticky top-16 overflow-y-auto hidden md:block">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
            
            <nav className="space-y-1">
              <Link
                to="/admin"
                className={`flex items-center px-4 py-3 rounded-md 
                  ${isActive('/admin') ? 'bg-agri-primary' : 'hover:bg-gray-700'}`}
              >
                <Home className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
              
              <Link
                to="/admin/products"
                className={`flex items-center px-4 py-3 rounded-md 
                  ${isActive('/admin/products') ? 'bg-agri-primary' : 'hover:bg-gray-700'}`}
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                Products
              </Link>
              
              <Link
                to="/admin/add-product"
                className={`flex items-center px-4 py-3 rounded-md 
                  ${isActive('/admin/add-product') ? 'bg-agri-primary' : 'hover:bg-gray-700'}`}
              >
                <PlusCircle className="w-5 h-5 mr-3" />
                Add Product
              </Link>
              
              <Link
                to="/admin/orders"
                className={`flex items-center px-4 py-3 rounded-md 
                  ${isActive('/admin/orders') ? 'bg-agri-primary' : 'hover:bg-gray-700'}`}
              >
                <Package className="w-5 h-5 mr-3" />
                Orders
              </Link>
              
              <Link
                to="/admin/users"
                className={`flex items-center px-4 py-3 rounded-md 
                  ${isActive('/admin/users') ? 'bg-agri-primary' : 'hover:bg-gray-700'}`}
              >
                <Users className="w-5 h-5 mr-3" />
                Users
              </Link>
              
              <Link
                to="/admin/settings"
                className={`flex items-center px-4 py-3 rounded-md 
                  ${isActive('/admin/settings') ? 'bg-agri-primary' : 'hover:bg-gray-700'}`}
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 rounded-md text-left hover:bg-gray-700"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </nav>
          </div>
        </aside>
        
        {/* Mobile Sidebar */}
        <div className="md:hidden sticky top-16 w-full bg-agri-dark text-white z-10">
          <div className="flex overflow-x-auto p-2 space-x-2">
            <Link
              to="/admin"
              className={`flex flex-col items-center p-2 rounded-md min-w-16 
                ${isActive('/admin') ? 'bg-agri-primary' : 'hover:bg-gray-700'}`}
            >
              <Home className="w-5 h-5 mb-1" />
              <span className="text-xs">Dashboard</span>
            </Link>
            
            <Link
              to="/admin/products"
              className={`flex flex-col items-center p-2 rounded-md min-w-16 
                ${isActive('/admin/products') ? 'bg-agri-primary' : 'hover:bg-gray-700'}`}
            >
              <ShoppingCart className="w-5 h-5 mb-1" />
              <span className="text-xs">Products</span>
            </Link>
            
            <Link
              to="/admin/add-product"
              className={`flex flex-col items-center p-2 rounded-md min-w-16 
                ${isActive('/admin/add-product') ? 'bg-agri-primary' : 'hover:bg-gray-700'}`}
            >
              <PlusCircle className="w-5 h-5 mb-1" />
              <span className="text-xs">Add</span>
            </Link>
            
            <Link
              to="/admin/orders"
              className={`flex flex-col items-center p-2 rounded-md min-w-16 
                ${isActive('/admin/orders') ? 'bg-agri-primary' : 'hover:bg-gray-700'}`}
            >
              <Package className="w-5 h-5 mb-1" />
              <span className="text-xs">Orders</span>
            </Link>
            
            <Link
              to="/admin/users"
              className={`flex flex-col items-center p-2 rounded-md min-w-16 
                ${isActive('/admin/users') ? 'bg-agri-primary' : 'hover:bg-gray-700'}`}
            >
              <Users className="w-5 h-5 mb-1" />
              <span className="text-xs">Users</span>
            </Link>
            
            <Link
              to="/admin/settings"
              className={`flex flex-col items-center p-2 rounded-md min-w-16 
                ${isActive('/admin/settings') ? 'bg-agri-primary' : 'hover:bg-gray-700'}`}
            >
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-xs">Settings</span>
            </Link>
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
