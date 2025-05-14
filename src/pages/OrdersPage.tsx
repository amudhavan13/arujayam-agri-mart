import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/components/ui/sonner';
import { Badge } from "@/components/ui/badge";
import { Package, FileText } from 'lucide-react';
import { Order } from '../types';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { orders, isAuthenticated, user } = state;
  
  const [activeTab, setActiveTab] = useState('all');
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Redirect if not logged in
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view your orders');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Filter orders based on active tab
  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    return orders.filter(order => {
      switch (activeTab) {
        case 'pending':
          return ['pending', 'processing'].includes(order.orderStatus);
        case 'delivered':
          return order.orderStatus === 'delivered';
        case 'cancelled':
          return order.orderStatus === 'cancelled';
        default:
          return true;
      }
    });
  };
  
  const filteredOrders = getFilteredOrders();
  
  const handleCancelOrder = (orderId: string) => {
    setCancelOrderId(orderId);
    setShowCancelModal(true);
  };
  
  const confirmCancelOrder = async () => {
    if (!cancelOrderId || !cancelReason) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    
    // Simulate OTP Verification for order cancellation
    toast.info('OTP sent to your email for verification');
    
    // Normally this would wait for OTP verification
    // For demo, we'll just proceed after a delay
    setTimeout(() => {
      dispatch({
        type: 'UPDATE_ORDER_STATUS',
        payload: { orderId: cancelOrderId, status: 'cancelled' }
      });
      
      toast.success('Order cancelled successfully');
      setCancelOrderId(null);
      setCancelReason('');
      setShowCancelModal(false);
    }, 2000);
  };
  
  const handleDownloadInvoice = (order: Order) => {
    // In a real app, this would generate and download a PDF
    toast.success('Invoice downloaded');
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-agri-dark mb-6">Your Orders</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-8">You haven't placed any orders yet.</p>
            <Button asChild className="bg-agri-primary hover:bg-agri-dark">
              <a href="/">Continue Shopping</a>
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md">
              <Tabs 
                defaultValue="all" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="px-4 pt-4">
                  <TabsList className="w-full justify-start border-b">
                    <TabsTrigger value="all" className="flex-1 sm:flex-none">
                      All Orders
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="flex-1 sm:flex-none">
                      Pending
                    </TabsTrigger>
                    <TabsTrigger value="delivered" className="flex-1 sm:flex-none">
                      Delivered
                    </TabsTrigger>
                    <TabsTrigger value="cancelled" className="flex-1 sm:flex-none">
                      Cancelled
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="all" className="p-0">
                  <div className="divide-y">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="p-6">
                        <div className="flex flex-wrap justify-between items-center mb-4">
                          <div>
                            <span className="text-sm text-gray-500">Order ID: {order.id}</span>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-gray-500 mr-4">
                                Placed on: {new Date(order.orderedAt).toLocaleDateString()}
                              </span>
                              {getStatusBadge(order.orderStatus)}
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-agri-primary text-agri-primary hover:bg-agri-primary hover:text-white mr-2"
                              onClick={() => handleDownloadInvoice(order)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Invoice
                            </Button>
                            
                            {order.canCancel && order.orderStatus !== 'cancelled' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={`${order.id}-${idx}`} className="flex items-center">
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-gray-500 ml-2">
                                x{item.quantity} (₹{item.price.toLocaleString()}/unit)
                              </div>
                              <div className="ml-auto font-medium">
                                ₹{(item.quantity * item.price).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <div>
                            <div className="text-sm text-gray-500">
                              Shipped to: {order.shippingAddress.doorNumber}, {order.shippingAddress.street}, 
                              {order.shippingAddress.cityOrVillage}, {order.shippingAddress.state}, {order.shippingAddress.pinCode}
                            </div>
                            <div className="text-sm text-gray-500">
                              Payment: {order.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : 'Online Payment'}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-agri-primary">
                            ₹{order.totalAmount.toLocaleString()}
                          </div>
                        </div>
                        
                        {['delivered', 'shipped'].includes(order.orderStatus) && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex space-x-2">
                              {order.canReplace && (
                                <Button variant="outline" size="sm">Request Replacement</Button>
                              )}
                              
                              {order.canReturn && (
                                <Button variant="outline" size="sm">Return Product</Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                {/* Other tabs show the same content, filtered by the getFilteredOrders function */}
                <TabsContent value="pending" className="p-0">
                  <div className="divide-y">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="p-6">
                        <div className="flex flex-wrap justify-between items-center mb-4">
                          <div>
                            <span className="text-sm text-gray-500">Order ID: {order.id}</span>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-gray-500 mr-4">
                                Placed on: {new Date(order.orderedAt).toLocaleDateString()}
                              </span>
                              {getStatusBadge(order.orderStatus)}
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-agri-primary text-agri-primary hover:bg-agri-primary hover:text-white mr-2"
                              onClick={() => handleDownloadInvoice(order)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Invoice
                            </Button>
                            
                            {order.canCancel && order.orderStatus !== 'cancelled' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                               onClick={() => handleCancelOrder(order.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={`${order.id}-${idx}`} className="flex items-center">
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-gray-500 ml-2">
                                x{item.quantity} (₹{item.price.toLocaleString()}/unit)
                              </div>
                              <div className="ml-auto font-medium">
                                ₹{(item.quantity * item.price).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <div>
                            <div className="text-sm text-gray-500">
                              Shipped to: {order.shippingAddress.doorNumber}, {order.shippingAddress.street}, 
                              {order.shippingAddress.cityOrVillage}, {order.shippingAddress.state}, {order.shippingAddress.pinCode}
                            </div>
                            <div className="text-sm text-gray-500">
                              Payment: {order.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : 'Online Payment'}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-agri-primary">
                            ₹{order.totalAmount.toLocaleString()}
                          </div>
                        </div>
                        
                        {['delivered', 'shipped'].includes(order.orderStatus) && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex space-x-2">
                              {order.canReplace && (
                                <Button variant="outline" size="sm">Request Replacement</Button>
                              )}
                              
                              {order.canReturn && (
                                <Button variant="outline" size="sm">Return Product</Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="delivered" className="p-0">
                  <div className="divide-y">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="p-6">
                        <div className="flex flex-wrap justify-between items-center mb-4">
                          <div>
                            <span className="text-sm text-gray-500">Order ID: {order.id}</span>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-gray-500 mr-4">
                                Placed on: {new Date(order.orderedAt).toLocaleDateString()}
                              </span>
                              {getStatusBadge(order.orderStatus)}
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-agri-primary text-agri-primary hover:bg-agri-primary hover:text-white mr-2"
                              onClick={() => handleDownloadInvoice(order)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Invoice
                            </Button>
                            
                            {order.canCancel && order.orderStatus !== 'cancelled' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={`${order.id}-${idx}`} className="flex items-center">
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-gray-500 ml-2">
                                x{item.quantity} (₹{item.price.toLocaleString()}/unit)
                              </div>
                              <div className="ml-auto font-medium">
                                ₹{(item.quantity * item.price).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <div>
                            <div className="text-sm text-gray-500">
                              Shipped to: {order.shippingAddress.doorNumber}, {order.shippingAddress.street}, 
                              {order.shippingAddress.cityOrVillage}, {order.shippingAddress.state}, {order.shippingAddress.pinCode}
                            </div>
                            <div className="text-sm text-gray-500">
                              Payment: {order.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : 'Online Payment'}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-agri-primary">
                            ₹{order.totalAmount.toLocaleString()}
                          </div>
                        </div>
                        
                        {['delivered', 'shipped'].includes(order.orderStatus) && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex space-x-2">
                              {order.canReplace && (
                                <Button variant="outline" size="sm">Request Replacement</Button>
                              )}
                              
                              {order.canReturn && (
                                <Button variant="outline" size="sm">Return Product</Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="cancelled" className="p-0">
                  <div className="divide-y">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="p-6">
                        <div className="flex flex-wrap justify-between items-center mb-4">
                          <div>
                            <span className="text-sm text-gray-500">Order ID: {order.id}</span>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-gray-500 mr-4">
                                Placed on: {new Date(order.orderedAt).toLocaleDateString()}
                              </span>
                              {getStatusBadge(order.orderStatus)}
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-agri-primary text-agri-primary hover:bg-agri-primary hover:text-white mr-2"
                              onClick={() => handleDownloadInvoice(order)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Invoice
                            </Button>
                            
                            {order.canCancel && order.orderStatus !== 'cancelled' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={`${order.id}-${idx}`} className="flex items-center">
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-gray-500 ml-2">
                                x{item.quantity} (₹{item.price.toLocaleString()}/unit)
                              </div>
                              <div className="ml-auto font-medium">
                                ₹{(item.quantity * item.price).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <div>
                            <div className="text-sm text-gray-500">
                              Shipped to: {order.shippingAddress.doorNumber}, {order.shippingAddress.street}, 
                              {order.shippingAddress.cityOrVillage}, {order.shippingAddress.state}, {order.shippingAddress.pinCode}
                            </div>
                            <div className="text-sm text-gray-500">
                              Payment: {order.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : 'Online Payment'}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-agri-primary">
                            ₹{order.totalAmount.toLocaleString()}
                          </div>
                        </div>
                        
                        {['delivered', 'shipped'].includes(order.orderStatus) && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex space-x-2">
                              {order.canReplace && (
                                <Button variant="outline" size="sm">Request Replacement</Button>
                              )}
                              
                              {order.canReturn && (
                                <Button variant="outline" size="sm">Return Product</Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Cancel Order Modal */}
            {showCancelModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                  <h3 className="text-xl font-semibold mb-4">Cancel Order</h3>
                  
                  <p className="mb-4">
                    Please provide a reason for cancellation. An OTP will be sent to your email for verification.
                  </p>
                  
                  <div className="mb-4">
                    <Label htmlFor="cancelReason">Reason for Cancellation</Label>
                    <select
                      id="cancelReason"
                      className="w-full p-2 border rounded-md mt-1"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    >
                      <option value="">Select a reason</option>
                      <option value="wrong-product">Ordered Wrong Product</option>
                      <option value="better-price">Found Better Price Elsewhere</option>
                      <option value="changed-mind">Changed My Mind</option>
                      <option value="delay">Shipping Delay</option>
                      <option value="other">Other Reason</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCancelModal(false);
                        setCancelOrderId(null);
                        setCancelReason('');
                      }}
                    >
                      Go Back
                    </Button>
                    <Button
                      className="bg-red-500 hover:bg-red-600"
                      onClick={confirmCancelOrder}
                      disabled={!cancelReason}
                    >
                      Confirm Cancellation
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;
