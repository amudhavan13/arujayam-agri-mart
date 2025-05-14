
import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from '@/components/ui/use-toast';
import { Search, CheckCircle, Loader2 } from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  color: string;
  price: number;
  status: string;
}

interface Order {
  id: string;
  user_id: string;
  shipping_address: {
    doorNumber: string;
    street: string;
    cityOrVillage: string;
    state: string;
    pinCode: string;
  };
  payment_method: string;
  order_status: string;
  total_amount: number;
  ordered_at: string;
  delivered_at: string | null;
  can_cancel: boolean;
  can_replace: boolean;
  can_return: boolean;
  items: OrderItem[];
  profiles: {
    username: string;
  };
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch orders with user information
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .order('ordered_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Fetch order items for each order
        const ordersWithItems = await Promise.all(data.map(async (order) => {
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
            
          if (itemsError) throw itemsError;
          
          return {
            ...order,
            items: items || []
          };
        }));
        
        setOrders(ordersWithItems);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filter and search orders
  const filteredOrders = orders.filter(order => {
    // Apply status filter
    if (filter !== 'all' && order.order_status !== filter) {
      return false;
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesOrderId = order.id.toLowerCase().includes(term);
      const matchesUserId = order.user_id.toLowerCase().includes(term);
      const matchesItems = order.items.some(item => 
        item.product_name.toLowerCase().includes(term)
      );
      
      return matchesOrderId || matchesUserId || matchesItems;
    }
    
    return true;
  });
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };
  
  const handleUpdateItemStatus = async (orderId: string, itemId: string, status: string) => {
    try {
      // Update the item status
      const { error } = await supabase
        .from('order_items')
        .update({ status })
        .eq('id', itemId);
        
      if (error) throw error;
      
      // Update the local state
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === orderId) {
            const updatedItems = order.items.map(item => 
              item.id === itemId ? { ...item, status } : item
            );
            
            // Check if all items are processed
            const allProcessed = updatedItems.every(
              item => item.status === 'processed' || item.status === 'shipped' || item.status === 'delivered'
            );
            
            return {
              ...order,
              items: updatedItems,
              order_status: allProcessed ? 'shipped' : order.order_status
            };
          }
          return order;
        })
      );
      
      toast({
        title: "Status updated",
        description: "Order item status updated successfully"
      });
    } catch (error) {
      console.error('Error updating item status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update item status"
      });
    }
  };
  
  const handleCompleteOrder = async (orderId: string) => {
    try {
      // Update the order status
      const { error } = await supabase
        .from('orders')
        .update({ 
          order_status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      if (error) throw error;
      
      // Also update all items to delivered
      const { error: itemsError } = await supabase
        .from('order_items')
        .update({ status: 'delivered' })
        .eq('order_id', orderId);
        
      if (itemsError) throw itemsError;
      
      // Update the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                order_status: 'delivered',
                delivered_at: new Date().toISOString(),
                items: order.items.map(item => ({ ...item, status: 'delivered' }))
              } 
            : order
        )
      );
      
      toast({
        title: "Order completed",
        description: "Order marked as delivered successfully"
      });
    } catch (error) {
      console.error('Error completing order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete order"
      });
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 border rounded-md w-full md:w-64"
          />
        </div>
        
        {/* Filter */}
        <div className="flex items-center">
          <label htmlFor="status-filter" className="mr-2">Status:</label>
          <select
            id="status-filter"
            value={filter}
            onChange={handleFilterChange}
            className="border rounded-md p-2"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {/* Orders List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-agri-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Order Header */}
              <div className="p-4 bg-gray-50 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium">Order #{order.id.substring(0, 8)}</h3>
                    <Badge 
                      variant="outline" 
                      className={`ml-3 ${getStatusBadgeColor(order.order_status)}`}
                    >
                      {order.order_status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span className="mr-3">User: {order.profiles.username}</span>
                    <span>Date: {new Date(order.ordered_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="font-semibold text-agri-primary mr-4">
                    Total: ₹{parseFloat(order.total_amount.toString()).toLocaleString()}
                  </span>
                  
                  {order.order_status !== 'delivered' && order.order_status !== 'cancelled' && (
                    <Button 
                      onClick={() => handleCompleteOrder(order.id)}
                      className="bg-agri-primary hover:bg-agri-dark"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Order Items */}
              <div className="p-4">
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{item.product_name}</div>
                            <div className="text-sm text-gray-500">Color: {item.color}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ₹{parseFloat(item.price.toString()).toLocaleString()} x {item.quantity} = 
                            ₹{(parseFloat(item.price.toString()) * item.quantity).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant="outline" 
                              className={getStatusBadgeColor(item.status)}
                            >
                              {item.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {order.order_status !== 'delivered' && order.order_status !== 'cancelled' && (
                              <div className="space-x-2">
                                {item.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleUpdateItemStatus(order.id, item.id, 'processed')}
                                  >
                                    Mark Processed
                                  </Button>
                                )}
                                {item.status === 'processed' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleUpdateItemStatus(order.id, item.id, 'shipped')}
                                  >
                                    Mark Shipped
                                  </Button>
                                )}
                                {item.status === 'shipped' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleUpdateItemStatus(order.id, item.id, 'delivered')}
                                  >
                                    Mark Delivered
                                  </Button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Shipping Information */}
              <div className="p-4 border-t bg-gray-50">
                <h4 className="font-medium mb-2">Shipping Information</h4>
                <p className="text-sm">
                  {order.shipping_address.doorNumber}, {order.shipping_address.street},
                  {order.shipping_address.cityOrVillage}, {order.shipping_address.state}, 
                  {order.shipping_address.pinCode}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Payment Method:</span> {order.payment_method}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
