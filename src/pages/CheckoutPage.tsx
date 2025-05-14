
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from '@/components/ui/sonner';
import { Address, Order, OrderItem } from '../types';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { cart, user, isAuthenticated } = state;
  
  const selectedItems = cart.filter(item => item.selected);
  
  const [addressDetails, setAddressDetails] = useState<Address>({
    doorNumber: '',
    street: '',
    cityOrVillage: '',
    state: '',
    pinCode: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState<string>('cashOnDelivery');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Redirect if not logged in or no items selected
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    
    if (selectedItems.length === 0) {
      toast.error('No items selected for checkout');
      navigate('/cart');
    }
  }, [isAuthenticated, selectedItems.length, navigate]);
  
  // Pre-fill address if user has one
  useEffect(() => {
    if (user?.address) {
      // Parse the address string (in a real app, you'd store address as an object)
      const addressParts = user.address.split(', ');
      
      if (addressParts.length >= 4) {
        setAddressDetails({
          doorNumber: addressParts[0] || '',
          street: addressParts[1] || '',
          cityOrVillage: addressParts[2] || '',
          state: addressParts[3] || '',
          pinCode: addressParts[4] || ''
        });
      }
    }
  }, [user]);
  
  // Calculate order total
  const subtotal = selectedItems.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  );
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressDetails({
      ...addressDetails,
      [e.target.name]: e.target.value
    });
  };
  
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
  };
  
  const initializePayment = () => {
    // Normally, this would make an API call to create a payment
    // For this demo, we'll just simulate a successful payment
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve();
        } else {
          reject(new Error('Payment failed'));
        }
      }, 2000);
    });
  };
  
  const handlePlaceOrder = async () => {
    // Validate address fields
    const addressFields = Object.values(addressDetails);
    if (addressFields.some(field => !field.trim())) {
      toast.error('Please fill all address fields');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      if (paymentMethod !== 'cashOnDelivery') {
        await initializePayment();
      }
      
      // Create order
      const orderItems: OrderItem[] = selectedItems.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        color: item.color,
        price: item.product.price,
        status: 'pending'
      }));
      
      const newOrder: Order = {
        id: `order-${Date.now()}`,
        userId: user?.id || 'guest',
        items: orderItems,
        shippingAddress: addressDetails,
        paymentMethod: paymentMethod,
        orderStatus: paymentMethod === 'cashOnDelivery' ? 'processing' : 'pending',
        totalAmount: subtotal,
        orderedAt: new Date().toISOString(),
        canCancel: true,
        canReplace: false,
        canReturn: false
      };
      
      // Add order to state
      dispatch({ type: 'ADD_ORDER', payload: newOrder });
      
      // Clear selected items from cart
      selectedItems.forEach(item => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: item.productId });
      });
      
      // Show success and redirect
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-agri-dark mb-6">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="flex-1">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doorNumber">Door/Building Number</Label>
                  <Input
                    id="doorNumber"
                    name="doorNumber"
                    value={addressDetails.doorNumber}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="street">Street Name</Label>
                  <Input
                    id="street"
                    name="street"
                    value={addressDetails.street}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cityOrVillage">City/Village</Label>
                  <Input
                    id="cityOrVillage"
                    name="cityOrVillage"
                    value={addressDetails.cityOrVillage}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={addressDetails.state}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pinCode">Pin Code</Label>
                  <Input
                    id="pinCode"
                    name="pinCode"
                    value={addressDetails.pinCode}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                <div className="flex items-center space-x-2 mb-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="flex-1 cursor-pointer">UPI Payment</Label>
                </div>
                
                <div className="flex items-center space-x-2 mb-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="netBanking" id="netBanking" />
                  <Label htmlFor="netBanking" className="flex-1 cursor-pointer">Net Banking</Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="cashOnDelivery" id="cashOnDelivery" />
                  <Label htmlFor="cashOnDelivery" className="flex-1 cursor-pointer">Cash on Delivery</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-4">
                {selectedItems.map(item => (
                  <div key={item.productId} className="flex">
                    <div className="w-16 h-16 flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <div className="flex text-sm text-gray-600">
                        <span className="capitalize mr-2">{item.color}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <div className="font-semibold text-agri-primary">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-agri-primary">₹{subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full mt-6 bg-agri-primary hover:bg-agri-dark h-12"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </Button>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
