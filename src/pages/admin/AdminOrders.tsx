
import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';

const AdminOrders: React.FC = () => {
  const { state } = useAppContext();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  useEffect(() => {
    // Redirect if not admin
    if (!state.isAuthenticated || !state.user?.isAdmin) {
      navigate('/login');
    }
  }, [state, navigate]);
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          profiles:profiles(username, email, phone_number)
        `)
        .order('ordered_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Map the Supabase data to match our Order type
        const mappedOrders = data.map(order => ({
          id: order.id,
          orderStatus: order.order_status,
          userId: order.user_id,
          shippingAddress: order.shipping_address as any,
          paymentMethod: order.payment_method,
          totalAmount: parseFloat(order.total_amount.toString()),
          orderedAt: new Date(order.ordered_at),
          deliveredAt: order.delivered_at ? new Date(order.delivered_at) : undefined,
          canCancel: order.can_cancel ?? false,
          canReplace: order.can_replace ?? false,
          canReturn: order.can_return ?? false,
          items: order.items.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            price: parseFloat(item.price.toString()),
            color: item.color,
            selected: false
          })),
          // Add customer info from the profiles
          customer: {
            name: order.profiles?.username || 'Unknown',
            email: order.profiles?.email || 'No email',
            phone: order.profiles?.phone_number || 'No phone'
          }
        }));
        
        setOrders(mappedOrders as Order[]);
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
  
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      // Update order status in Supabase
      const { error } = await supabase
        .from('orders')
        .update({ 
          order_status: newStatus,
          // Automatically set delivered_at date if status is delivered
          delivered_at: newStatus === 'delivered' ? new Date().toISOString() : null,
          // Update action flags based on status
          can_cancel: ['pending', 'processing'].includes(newStatus),
          can_replace: newStatus === 'delivered',
          can_return: newStatus === 'delivered'
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update order items status
      await supabase
        .from('order_items')
        .update({ status: newStatus })
        .eq('order_id', orderId);
      
      // Update local state
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order, 
            orderStatus: newStatus,
            deliveredAt: newStatus === 'delivered' ? new Date() : order.deliveredAt,
            canCancel: ['pending', 'processing'].includes(newStatus),
            canReplace: newStatus === 'delivered',
            canReturn: newStatus === 'delivered'
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      
      // If we're viewing this order, update the view as well
      if (viewOrder && viewOrder.id === orderId) {
        setViewOrder({
          ...viewOrder,
          orderStatus: newStatus,
          deliveredAt: newStatus === 'delivered' ? new Date() : viewOrder.deliveredAt
        });
      }
      
      toast({
        title: "Status updated",
        description: `Order status has been updated to ${newStatus}.`
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status."
      });
    }
  };
  
  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Apply status filter
      if (statusFilter !== 'all' && order.orderStatus.toLowerCase() !== statusFilter) {
        return false;
      }
      
      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const orderIdMatch = order.id.toLowerCase().includes(query);
        const customerNameMatch = order.customer?.name?.toLowerCase().includes(query);
        return orderIdMatch || customerNameMatch;
      }
      
      return true;
    });
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
  
  const handleViewOrder = (order: Order) => {
    setViewOrder(order);
    setIsViewDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Card className="flex-1">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders or customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : getFilteredOrders().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {searchQuery || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders found'}
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredOrders().map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{order.customer?.name}</p>
                        <p className="text-xs text-gray-500">{order.customer?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(order.orderedAt)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={order.orderStatus.toLowerCase()} 
                        onValueChange={(value) => handleUpdateStatus(order.id, value)}
                        disabled={order.orderStatus.toLowerCase() === 'cancelled'}
                      >
                        <SelectTrigger className="h-8 w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Order details dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order ID: {viewOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {viewOrder && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>Name: {viewOrder.customer?.name}</p>
                    <p>Email: {viewOrder.customer?.email}</p>
                    <p>Phone: {viewOrder.customer?.phone || 'Not provided'}</p>
                  </div>
                  
                  <h3 className="font-semibold mt-4 mb-2">Shipping Address</h3>
                  <div className="space-y-1 text-sm">
                    <p>{viewOrder.shippingAddress.doorNumber}, {viewOrder.shippingAddress.street}</p>
                    <p>{viewOrder.shippingAddress.cityOrVillage}, {viewOrder.shippingAddress.state}</p>
                    <p>PIN: {viewOrder.shippingAddress.pinCode}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>Order Date: {formatDate(viewOrder.orderedAt)}</p>
                    <p>Status: <Badge>{viewOrder.orderStatus}</Badge></p>
                    <p>Payment Method: {viewOrder.paymentMethod}</p>
                    {viewOrder.deliveredAt && (
                      <p>Delivery Date: {formatDate(viewOrder.deliveredAt)}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {viewOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-gray-600">
                          {item.quantity} x {formatCurrency(item.price)} • {item.color}
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between mt-4 pt-2 border-t">
                  <p className="font-semibold">Total Amount:</p>
                  <p className="font-bold">{formatCurrency(viewOrder.totalAmount)}</p>
                </div>
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                {viewOrder.orderStatus.toLowerCase() !== 'cancelled' && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Select 
                      defaultValue={viewOrder.orderStatus.toLowerCase()} 
                      onValueChange={(value) => {
                        handleUpdateStatus(viewOrder.id, value);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
