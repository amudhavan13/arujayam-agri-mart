
import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard: React.FC = () => {
  const { state } = useAppContext();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  
  const [monthlySales, setMonthlySales] = useState<{ month: string; sales: number }[]>([]);
  
  useEffect(() => {
    // Redirect if not admin
    if (!state.isAuthenticated || !state.user?.isAdmin) {
      navigate('/login');
    }
  }, [state, navigate]);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch product count
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
          
        // Fetch order count
        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
          
        // Fetch user count
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        // Fetch total revenue
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount');
          
        const totalRevenue = orders?.reduce((sum, order) => 
          sum + parseFloat(order.total_amount.toString()), 0
        ) || 0;
        
        setStats({
          totalProducts: productCount || 0,
          totalOrders: orderCount || 0,
          totalUsers: userCount || 0,
          totalRevenue
        });
        
        // Generate sample monthly sales data
        // In a real app, this would come from your database
        const currentDate = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const salesData = [];
        
        for (let i = 5; i >= 0; i--) {
          const month = new Date(currentDate);
          month.setMonth(currentDate.getMonth() - i);
          salesData.push({
            month: monthNames[month.getMonth()],
            sales: Math.floor(Math.random() * 10000) + 5000
          });
        }
        
        setMonthlySales(salesData);
        
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    
    fetchStats();
  }, []);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-baseline">
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <ShoppingBag className="ml-auto h-5 w-5 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-baseline">
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <Package className="ml-auto h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-baseline">
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <Users className="ml-auto h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-baseline">
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <TrendingUp className="ml-auto h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sales Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  width={500}
                  height={300}
                  data={monthlySales}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="sales" name="Sales" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
