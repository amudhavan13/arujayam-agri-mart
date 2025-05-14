
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import AdminLayout from './AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from '@/components/ui/sonner';
import { PlusCircle, Search, Edit, Trash } from 'lucide-react';

const AdminProducts: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { products } = state;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  
  // Update filtered products when search term or products change
  React.useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search already applied via useEffect
  };
  
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      // In a real app, this would call an API
      
      // Filter out the deleted product
      const updatedProducts = products.filter(p => p.id !== productId);
      dispatch({ type: 'SET_PRODUCTS', payload: updatedProducts });
      
      toast.success('Product deleted successfully');
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button asChild className="bg-agri-primary hover:bg-agri-dark">
          <Link to="/admin/add-product">
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </form>
      
      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-center">Stock</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover mr-3"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ₹{product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      product.stockQuantity > 10
                        ? 'bg-green-100 text-green-800'
                        : product.stockQuantity > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stockQuantity} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/admin/edit-product/${product.id}`}
                      className="text-agri-primary hover:text-agri-dark inline-flex items-center mr-3"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center"
                    >
                      <Trash className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No products found
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
