
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, Trash, ShoppingCart, ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { cart, isAuthenticated } = state;
  
  const selectedItems = cart.filter(item => item.selected);
  const selectedItemsCount = selectedItems.length;
  
  const totalPrice = selectedItems.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  );
  
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch({
        type: 'UPDATE_CART_ITEM_QUANTITY',
        payload: { productId, quantity: newQuantity }
      });
    }
  };
  
  const handleRemoveItem = (productId: string) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: productId
    });
    toast.success('Item removed from cart');
  };
  
  const handleToggleSelect = (productId: string) => {
    dispatch({
      type: 'TOGGLE_CART_ITEM_SELECTION',
      payload: productId
    });
  };
  
  const handleCheckout = () => {
    if (selectedItemsCount === 0) {
      toast.error('Please select at least one item to checkout');
      return;
    }
    
    if (!isAuthenticated) {
      toast.error('Please login to continue to checkout');
      navigate('/login');
      return;
    }
    
    navigate('/checkout');
  };
  
  if (cart.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild className="bg-agri-primary hover:bg-agri-dark">
              <Link to="/">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-agri-dark mb-6">Your Shopping Cart</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox 
                      checked={cart.length > 0 && cart.every(item => item.selected)}
                      onCheckedChange={(checked) => {
                        cart.forEach(item => {
                          if (checked !== item.selected) {
                            handleToggleSelect(item.productId);
                          }
                        });
                      }}
                      className="mr-2"
                    />
                    <span className="font-medium">Select All</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {selectedItemsCount} of {cart.length} items selected
                  </span>
                </div>
              </div>
              
              <div className="divide-y">
                {cart.map((item) => (
                  <div key={item.productId} className="p-4 flex items-center">
                    {/* Selection Checkbox */}
                    <div className="mr-4">
                      <Checkbox 
                        checked={item.selected}
                        onCheckedChange={() => handleToggleSelect(item.productId)}
                      />
                    </div>
                    
                    {/* Product Image */}
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium">
                        <Link to={`/product/${item.productId}`} className="hover:text-agri-primary">
                          {item.product.name}
                        </Link>
                      </h3>
                      
                      <div className="flex items-center mt-1 text-sm">
                        <div 
                          className="w-4 h-4 rounded-full mr-1" 
                          style={{ backgroundColor: item.color }} 
                        />
                        <span className="capitalize">{item.color}</span>
                      </div>
                      
                      <p className="font-semibold text-agri-primary mt-1">
                        ₹{item.product.price.toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1 border-r"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center py-1">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                        className="px-3 py-1 border-l"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Subtotal */}
                    <div className="ml-6 text-right min-w-24">
                      <p className="font-semibold">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-red-500 text-sm flex items-center mt-1 hover:underline"
                      >
                        <Trash className="h-3 w-3 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="w-full md:w-80">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({selectedItemsCount} items)</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-agri-primary">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleCheckout}
                disabled={selectedItemsCount === 0}
                className="w-full bg-agri-primary hover:bg-agri-dark"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                Prices are inclusive of all taxes
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
