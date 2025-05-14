
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { useAppContext } from '../context/AppContext';
import { mockProducts } from '../data/mockData';
import { Product } from '../types';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart,
  Star,
  Minus,
  Plus,
  MessageCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/components/ui/sonner';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { state, dispatch } = useAppContext();
  const { products } = state;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  
  // Fetch product data
  useEffect(() => {
    // In a real app, this would be an API call
    const foundProduct = mockProducts.find(p => p.id === productId);
    
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedColor(foundProduct.colors[0] || '');
      
      // Add to recently viewed
      dispatch({ type: 'ADD_TO_RECENTLY_VIEWED', payload: foundProduct });
      
      // Find similar products (same category, excluding current product)
      const similar = mockProducts.filter(
        p => p.category === foundProduct.category && p.id !== foundProduct.id
      ).slice(0, 4);
      setSimilarProducts(similar);
    }
  }, [productId, dispatch]);
  
  const handleIncreaseQuantity = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };
  
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          productId: product.id,
          product: product,
          quantity: quantity,
          color: selectedColor,
          selected: true
        }
      });
      
      toast.success(`Added ${product.name} to your cart!`);
    }
  };
  
  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center py-16">Loading product...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Images */}
          <div className="w-full md:w-1/2">
            <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`aspect-square cursor-pointer rounded-md overflow-hidden 
                    ${activeImage === index ? 'ring-2 ring-agri-primary' : 'ring-1 ring-gray-200'}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Product Details */}
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold text-agri-dark mb-2">{product.name}</h1>
            
            {/* Price */}
            <p className="text-2xl font-bold text-agri-primary mb-4">₹{product.price.toLocaleString()}</p>
            
            {/* Stock Status */}
            <div className="mb-6">
              <Badge variant={product.stockQuantity > 0 ? "outline" : "destructive"}>
                {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
              </Badge>
              {product.stockQuantity > 0 && (
                <span className="text-sm text-gray-500 ml-2">
                  {product.stockQuantity} units available
                </span>
              )}
            </div>
            
            {/* Description */}
            <p className="text-gray-700 mb-6">{product.description}</p>
            
            {/* Color Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Color</h3>
              <div className="flex space-x-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={`w-10 h-10 rounded-full border-2 ${
                      selectedColor === color ? 'border-agri-primary' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>
            </div>
            
            {/* Quantity Selector */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Quantity</h3>
              <div className="flex items-center border rounded-md w-32">
                <button
                  onClick={handleDecreaseQuantity}
                  disabled={quantity <= 1}
                  className="px-3 py-1 border-r"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= product.stockQuantity) {
                      setQuantity(val);
                    }
                  }}
                  className="w-full text-center p-1 focus:outline-none"
                  min="1"
                  max={product.stockQuantity}
                />
                <button
                  onClick={handleIncreaseQuantity}
                  disabled={quantity >= product.stockQuantity}
                  className="px-3 py-1 border-l"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="w-full bg-agri-primary hover:bg-agri-dark text-white mb-4 py-6"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            
            {/* Specifications */}
            <div className="mt-8">
              <Tabs defaultValue="specifications">
                <TabsList className="w-full">
                  <TabsTrigger value="specifications" className="flex-1">Specifications</TabsTrigger>
                  <TabsTrigger value="reviews" className="flex-1">Reviews ({product.reviews.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="specifications">
                  <div className="mt-4 border rounded-lg p-4">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <tr key={key} className="border-b last:border-0">
                            <td className="py-2 font-medium capitalize">{key}</td>
                            <td className="py-2 text-right">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <div className="mt-4">
                    {product.reviews.length === 0 ? (
                      <div className="text-center py-8 border rounded-lg">
                        <MessageCircle className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-gray-500">No reviews yet</p>
                        <p className="text-sm text-gray-400">Be the first to review this product</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {product.reviews.map((review) => (
                          <div key={review.id} className="border rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="ml-2 font-medium">{review.username}</span>
                              <span className="ml-auto text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Link to={`/product/${product.id}/review`}>
                      <Button className="mt-4 w-full bg-agri-secondary hover:bg-agri-primary">
                        Write a Review
                      </Button>
                    </Link>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        
        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-agri-dark mb-6">Similar Products</h2>
            <div className="product-grid">
              {similarProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
