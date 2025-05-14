
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import AdminLayout from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';
import { mockProducts, mockUsers } from '../../data/mockData';

const AdminDashboard: React.FC = () => {
  const { state } = useAppContext();
  const { orders } = state;
  
  const stats = {
    totalOrders: orders.length,
    totalProducts: mockProducts.length,
    totalUsers: mockUsers.length,
    revenue: orders.reduce((total, order) => total + order.totalAmount, 0),
    pendingOrders: orders.filter(order => ['pending', 'processing'].includes(order.orderStatus)).length,
    deliveredOrders: orders.filter(order => order.orderStatus === 'delivered').length,
    cancelledOrders: orders.filter(order => order.orderStatus === 'cancelled').length,
    popularProducts: mockProducts.sort((a, b) => b.reviews.length - a.reviews.length).slice(0, 5)
  };
  
  const recentOrders = orders.sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()).slice(0, 5);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-agri-primary">₹{stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500">
              From {stats.totalOrders} orders
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-gray-500">
              In {mockProducts.reduce((acc, curr) => acc + curr.reviews.length, 0)} categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-gray-500">
              {stats.pendingOrders} pending, {stats.deliveredOrders} delivered
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500">
              {stats.totalUsers - 1} registered users
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                <div className="divide-y">
                  {recentOrders.map(order => (
                    <div key={order.id} className="py-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-gray-500">{new Date(order.orderedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-agri-primary">₹{order.totalAmount.toLocaleString()}</p>
                          <p className={`text-xs ${
                            order.orderStatus === 'delivered' ? 'text-green-600' :
                            order.orderStatus === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {order.orderStatus.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm mt-1">
                        {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Popular Products */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularProducts.map(product => (
                <div key={product.id} className="flex items-center gap-3">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.category} • {product.reviews.length} reviews
                    </p>
                  </div>
                  <div className="font-medium">₹{product.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
