
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import AdminLayout from './AdminLayout';
import { mockProducts, productCategories, availableColors } from '../../data/mockData';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/components/ui/sonner';
import { Trash, Plus } from 'lucide-react';

const AdminAddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: '',
    images: ['', '', ''],
    colors: [] as string[],
    specifications: {} as Record<string, string>
  });
  
  const [specKeys, setSpecKeys] = useState<string[]>([]);
  const [specValues, setSpecValues] = useState<string[]>([]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleImageChange = (index: number, value: string) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = value;
    setFormData({
      ...formData,
      images: updatedImages
    });
  };
  
  const handleColorToggle = (color: string) => {
    const updatedColors = [...formData.colors];
    
    if (updatedColors.includes(color)) {
      // Remove color
      setFormData({
        ...formData,
        colors: updatedColors.filter(c => c !== color)
      });
    } else {
      // Add color
      setFormData({
        ...formData,
        colors: [...updatedColors, color]
      });
    }
  };
  
  const handleAddSpecification = () => {
    setSpecKeys([...specKeys, '']);
    setSpecValues([...specValues, '']);
  };
  
  const handleRemoveSpecification = (index: number) => {
    const updatedKeys = [...specKeys];
    const updatedValues = [...specValues];
    
    updatedKeys.splice(index, 1);
    updatedValues.splice(index, 1);
    
    setSpecKeys(updatedKeys);
    setSpecValues(updatedValues);
  };
  
  const handleSpecKeyChange = (index: number, value: string) => {
    const updatedKeys = [...specKeys];
    updatedKeys[index] = value;
    setSpecKeys(updatedKeys);
  };
  
  const handleSpecValueChange = (index: number, value: string) => {
    const updatedValues = [...specValues];
    updatedValues[index] = value;
    setSpecValues(updatedValues);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.category ||
      !formData.stockQuantity ||
      !formData.images[0].trim()
    ) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Build specifications object from keys and values
    const specifications: Record<string, string> = {};
    specKeys.forEach((key, index) => {
      if (key.trim() && specValues[index].trim()) {
        specifications[key.trim()] = specValues[index].trim();
      }
    });
    
    // Filter out empty image URLs
    const filteredImages = formData.images.filter(img => img.trim() !== '');
    
    // Create new product
    const newProduct = {
      id: `product-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      stockQuantity: parseInt(formData.stockQuantity),
      images: filteredImages,
      colors: formData.colors.length > 0 ? formData.colors : ['black'],
      specifications,
      reviews: []
    };
    
    // Add to products
    dispatch({ type: 'SET_PRODUCTS', payload: [...mockProducts, newProduct] });
    
    toast.success('Product added successfully');
    navigate('/admin/products');
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="md:col-span-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Price */}
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Category */}
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2"
                required
              >
                <option value="">Select Category</option>
                {productCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Stock Quantity */}
            <div>
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Product Images */}
            <div className="md:col-span-2">
              <Label>Product Images (URLs)</Label>
              <div className="space-y-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      placeholder={`Image URL ${index + 1}`}
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      required={index === 0}
                    />
                    {image && (
                      <div className="w-12 h-12 flex-shrink-0 border rounded overflow-hidden">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                First image is required and will be used as the main product image.
              </p>
            </div>
            
            {/* Colors */}
            <div className="md:col-span-2">
              <Label>Available Colors</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {availableColors.map(color => (
                  <button
                    key={color.id}
                    type="button"
                    className={`flex items-center p-2 rounded-md ${
                      formData.colors.includes(color.id) 
                        ? 'bg-gray-100 border-2 border-agri-primary' 
                        : 'border border-gray-300'
                    }`}
                    onClick={() => handleColorToggle(color.id)}
                  >
                    <div
                      className="w-6 h-6 rounded-full mr-2"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
              {formData.colors.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  At least one color should be selected. Default: Black.
                </p>
              )}
            </div>
            
            {/* Specifications */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <Label>Specifications</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddSpecification}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Specification
                </Button>
              </div>
              
              {specKeys.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Add specifications like engine power, weight, dimensions, etc.
                </p>
              ) : (
                <div className="space-y-3">
                  {specKeys.map((key, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <Input
                        placeholder="Specification name"
                        value={key}
                        onChange={(e) => handleSpecKeyChange(index, e.target.value)}
                      />
                      <Input
                        placeholder="Value"
                        value={specValues[index]}
                        onChange={(e) => handleSpecValueChange(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSpecification(index)}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button type="button" variant="outline" className="mr-2" onClick={() => navigate('/admin/products')}>
              Cancel
            </Button>
            <Button type="submit" className="bg-agri-primary hover:bg-agri-dark">
              Add Product
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminAddProduct;
