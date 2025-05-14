
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAppContext } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { Clock, Package, Check, X, AlertCircle, Truck, RefreshCcw, ShoppingCart, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">
          <Clock size={14} className="mr-1" />
          Pending
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
          <Package size={14} className="mr-1" />
          Processing
        </Badge>
      );
    case 'shipped':
      return (
        <Badge variant="outline" className="border-indigo-500 text-indigo-700 bg-indigo-50">
          <Truck size={14} className="mr-1" />
          Shipped
        </Badge>
      );
    case 'delivered':
      return (
        <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
          <Check size={14} className="mr-1" />
          Delivered
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">
          <X size={14} className="mr-1" />
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
};

const OrdersPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchOrders();
  }, [state.isAuthenticated, navigate]);
  
  const fetchOrders = async () => {
    if (!state.user?.id) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('user_id', state.user.id)
        .order('ordered_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Map the Supabase data to our Order type
        const mappedOrders: Order[] = data.map(order => ({
          id: order.id,
          orderStatus: order.order_status,
          userId: order.user_id,
          shippingAddress: order.shipping_address as any,
          paymentMethod: order.payment_method,
          totalAmount: parseFloat(order.total_amount.toString()),
          orderedAt: new Date(order.ordered_at),
          deliveredAt: order.delivered_at ? new Date(order.delivered_at) : undefined,
          canCancel: order.can_cancel || false, 
          canReplace: order.can_replace || false,
          canReturn: order.can_return || false,
          items: order.items.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            price: parseFloat(item.price.toString()),
            color: item.color,
            selected: false
          }))
        }));
        
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelOrder = async (orderId: string) => {
    try {
      // Update order status in Supabase
      const { error } = await supabase
        .from('orders')
        .update({ order_status: 'cancelled', can_cancel: false })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update order items status
      await supabase
        .from('order_items')
        .update({ status: 'cancelled' })
        .eq('order_id', orderId);
      
      // Update local state
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, orderStatus: 'cancelled', canCancel: false } 
          : order
      );
      
      setOrders(updatedOrders);
      
      // Update app context
      dispatch({
        type: 'UPDATE_ORDER_STATUS',
        payload: { orderId, status: 'cancelled' }
      });
      
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully."
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel order."
      });
    }
  };
  
  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'active':
        return orders.filter(order => 
          !['delivered', 'cancelled'].includes(order.orderStatus.toLowerCase())
        );
      case 'completed':
        return orders.filter(order => 
          order.orderStatus.toLowerCase() === 'delivered'
        );
      case 'cancelled':
        return orders.filter(order => 
          order.orderStatus.toLowerCase() === 'cancelled'
        );
      default:
        return orders;
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">My Orders</h1>
        
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 animate-pulse mx-auto text-gray-300" />
                <p className="mt-4 text-gray-500">Loading your orders...</p>
              </div>
            ) : getFilteredOrders().length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <ShoppingCart className="h-16 w-16 mx-auto text-gray-300" />
                <h3 className="mt-4 text-xl font-semibold">No Orders Found</h3>
                <p className="mt-2 text-gray-500">
                  {activeTab === 'all' 
                    ? "You haven't placed any orders yet." 
                    : `You don't have any ${activeTab} orders.`}
                </p>
                {activeTab !== 'all' && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('all')}
                  >
                    View All Orders
                  </Button>
                )}
                <Button 
                  className="mt-4 ml-3 bg-agri-primary hover:bg-agri-dark"
                  onClick={() => navigate('/')}
                >
                  Shop Now
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <Accordion type="single" collapsible className="space-y-4">
                  {getFilteredOrders().map((order) => (
                    <AccordionItem key={order.id} value={order.id} className="border rounded-md overflow-hidden">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between w-full text-left">
                          <div className="flex flex-col mb-3 md:mb-0">
                            <div className="flex items-center">
                              <Label className="text-gray-500 mr-2">Order ID:</Label>
                              <span className="font-medium">{order.id.substring(0, 8)}...</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(order.orderedAt)}
                            </span>
                          </div>
                          <div className="flex flex-col md:items-center">
                            <StatusBadge status={order.orderStatus} />
                            <span className="text-sm mt-1 font-semibold">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="border-t pt-4 mt-2">
                          <h4 className="font-semibold mb-2">Order Items</h4>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {/* Product image would go here if available */}
                                    <Package className="h-8 w-8 text-gray-400" />
                                  </div>
                                  <div className="ml-4">
                                    <p className="font-medium">{item.productName}</p>
                                    <div className="text-sm text-gray-500">
                                      <span>Qty: {item.quantity}</span>
                                      <span className="mx-2">•</span>
                                      <span>Color: {item.color}</span>
                                    </div>
                                  </div>
                                </div>
                                <p className="font-semibold">
                                  {formatCurrency(item.price * item.quantity)}
                                </p>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-6 border-t pt-4">
                            <div className="flex justify-between mb-2">
                              <h4 className="font-semibold">Shipping Address</h4>
                            </div>
                            <div className="text-gray-600">
                              <p>{order.shippingAddress.doorNumber}, {order.shippingAddress.street}</p>
                              <p>{order.shippingAddress.cityOrVillage}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}</p>
                            </div>
                          </div>
                          
                          <div className="mt-6 border-t pt-4">
                            <div className="flex justify-between mb-2">
                              <h4 className="font-semibold">Payment Method</h4>
                              <span>{order.paymentMethod}</span>
                            </div>
                          </div>
                          
                          {order.deliveredAt && (
                            <div className="mt-4 flex justify-between text-sm">
                              <span className="text-gray-500">Delivered on:</span>
                              <span className="font-medium">{formatDate(order.deliveredAt)}</span>
                            </div>
                          )}
                          
                          {order.orderStatus.toLowerCase() !== 'cancelled' && order.canCancel && (
                            <div className="mt-6 flex justify-end">
                              <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancel Order
                              </Button>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OrdersPage;
