
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from '@/components/ui/use-toast';
import { 
  Search, Plus, Edit, Trash2, ShoppingCart, 
  ArrowUpDown, Loader2
} from "lucide-react";

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProducts();
  }, [sortField, sortOrder]);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' });
        
      if (error) throw error;
      
      if (data) {
        // Format the data to match our Product type
        const formattedProducts: Product[] = data.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          images: product.images,
          category: product.category,
          stockQuantity: product.stock_quantity,
          colors: product.colors,
          specifications: product.specifications,
          reviews: []
        }));
        
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    setDeleteInProgress(id);
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update the local state
      setProducts(products.filter(product => product.id !== id));
      
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product"
      });
    } finally {
      setDeleteInProgress(null);
    }
  };
  
  const handleUpdateStock = async (id: string, currentStock: number) => {
    const newStock = prompt('Enter new stock quantity:', currentStock.toString());
    
    if (newStock === null) return; // User cancelled
    
    const stockQuantity = parseInt(newStock);
    
    if (isNaN(stockQuantity) || stockQuantity < 0) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Stock quantity must be a non-negative number"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: stockQuantity })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update the local state
      setProducts(products.map(product => 
        product.id === id ? { ...product, stockQuantity } : product
      ));
      
      toast({
        title: "Stock updated",
        description: "The stock quantity has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update stock quantity"
      });
    }
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Products Management</h1>
          
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full md:w-64"
              />
            </div>
            
            <Link to="/admin/add-product">
              <Button className="bg-agri-primary hover:bg-agri-dark">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-agri-primary" />
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {filteredProducts.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center"
                          onClick={() => handleSort('name')}
                        >
                          Product
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center"
                          onClick={() => handleSort('category')}
                        >
                          Category
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center"
                          onClick={() => handleSort('price')}
                        >
                          Price
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          className="flex items-center"
                          onClick={() => handleSort('stock_quantity')}
                        >
                          Stock
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="h-10 w-10 object-cover rounded-md"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">
                                {product.colors.length} colors
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{product.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleUpdateStock(product.id, product.stockQuantity)}
                            className="text-sm font-medium text-gray-900 hover:text-agri-primary"
                          >
                            {product.stockQuantity} units
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link to={`/product/${product.id}`}>
                              <Button 
                                size="sm" 
                                variant="outline"
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to={`/admin/edit-product/${product.id}`}>
                              <Button 
                                size="sm" 
                                variant="outline"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={deleteInProgress === product.id}
                            >
                              {deleteInProgress === product.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
