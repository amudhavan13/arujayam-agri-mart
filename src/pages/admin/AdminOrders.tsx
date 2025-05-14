
import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useAppContext } from '../../context/AppContext';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from '@/components/ui/sonner';
import { Search, CheckCircle } from 'lucide-react';

const AdminOrders: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { orders } = state;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Filter and search orders
  const filteredOrders = orders.filter(order => {
    // Apply status filter
    if (filter !== 'all' && order.orderStatus !== filter) {
      return false;
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesOrderId = order.id.toLowerCase().includes(term);
      const matchesUserId = order.userId.toLowerCase().includes(term);
      const matchesItems = order.items.some(item => 
        item.productName.toLowerCase().includes(term)
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
  
  const handleUpdateItemStatus = (orderId: string, itemIndex: number, status: string) => {
    // In a real app, this would call an API
    // For this demo, we'll just assume it succeeded
    
    // Find the order
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return;
    
    // Update the item status
    const updatedOrders = [...orders];
    updatedOrders[orderIndex].items[itemIndex].status = status as any;
    
    // Check if all items are processed
    const allProcessed = updatedOrders[orderIndex].items.every(
      item => item.status === 'processed' || item.status === 'shipped' || item.status === 'delivered'
    );
    
    // Update order status if all items are processed
    if (allProcessed) {
      updatedOrders[orderIndex].orderStatus = 'shipped';
    }
    
    dispatch({ type: 'SET_ORDERS', payload: updatedOrders });
    toast.success('Order item updated successfully');
  };
  
  const handleCompleteOrder = (orderId: string) => {
    // In a real app, this would call an API
    // For this demo, we'll just assume it succeeded
    
    // Find the order
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return;
    
    // Update the order status
    dispatch({
      type: 'UPDATE_ORDER_STATUS',
      payload: { orderId, status: 'delivered' }
    });
    
    toast.success('Order marked as delivered');
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
        {filteredOrders.length === 0 ? (
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
                    <h3 className="font-medium">Order #{order.id}</h3>
                    <Badge 
                      variant="outline" 
                      className={`ml-3 ${getStatusBadgeColor(order.orderStatus)}`}
                    >
                      {order.orderStatus.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span className="mr-3">User: {order.userId}</span>
                    <span>Date: {new Date(order.orderedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="font-semibold text-agri-primary mr-4">
                    Total: ₹{order.totalAmount.toLocaleString()}
                  </span>
                  
                  {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
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
                      {order.items.map((item, index) => (
                        <tr key={`${order.id}-${index}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-gray-500">Color: {item.color}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ₹{item.price.toLocaleString()} x {item.quantity} = 
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant="outline" 
                              className={`${getStatusBadgeColor(item.status)}`}
                            >
                              {item.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                              <div className="space-x-2">
                                {item.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleUpdateItemStatus(order.id, index, 'processed')}
                                  >
                                    Mark Processed
                                  </Button>
                                )}
                                {item.status === 'processed' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleUpdateItemStatus(order.id, index, 'shipped')}
                                  >
                                    Mark Shipped
                                  </Button>
                                )}
                                {item.status === 'shipped' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleUpdateItemStatus(order.id, index, 'delivered')}
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
                  {order.shippingAddress.doorNumber}, {order.shippingAddress.street},
                  {order.shippingAddress.cityOrVillage}, {order.shippingAddress.state}, 
                  {order.shippingAddress.pinCode}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Payment Method:</span> {order.paymentMethod}
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
