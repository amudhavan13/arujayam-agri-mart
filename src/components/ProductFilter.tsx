
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { productCategories, availableColors } from '../data/mockData';
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FilterOptions } from '../types';

interface ProductFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ onFilterChange }) => {
  const { state } = useAppContext();
  const { filterOptions } = state;

  const [localFilters, setLocalFilters] = useState<FilterOptions>(filterOptions);
  const [expanded, setExpanded] = useState({
    price: true,
    category: true,
    color: true,
    specifications: false
  });

  // Update local filters when global filters change
  useEffect(() => {
    setLocalFilters(filterOptions);
  }, [filterOptions]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    let updatedCategories: string[];
    
    if (checked) {
      updatedCategories = [...localFilters.category, categoryId];
    } else {
      updatedCategories = localFilters.category.filter(id => id !== categoryId);
    }
    
    const updatedFilters = {
      ...localFilters,
      category: updatedCategories
    };
    
    setLocalFilters(updatedFilters);
  };

  const handleColorChange = (colorId: string, checked: boolean) => {
    let updatedColors: string[];
    
    if (checked) {
      updatedColors = [...localFilters.colors, colorId];
    } else {
      updatedColors = localFilters.colors.filter(id => id !== colorId);
    }
    
    const updatedFilters = {
      ...localFilters,
      colors: updatedColors
    };
    
    setLocalFilters(updatedFilters);
  };

  const handlePriceChange = (values: number[]) => {
    const updatedFilters = {
      ...localFilters,
      priceRange: {
        min: values[0],
        max: values[1]
      }
    };
    
    setLocalFilters(updatedFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      category: [],
      priceRange: { min: 0, max: 100000 },
      colors: [],
      specifications: {}
    };
    
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-agri-dark mb-4">Filter Products</h3>
      
      {/* Price Range */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer mb-2"
          onClick={() => setExpanded({...expanded, price: !expanded.price})}
        >
          <h4 className="font-medium">Price Range</h4>
          <span>{expanded.price ? '−' : '+'}</span>
        </div>
        
        {expanded.price && (
          <div className="mt-2">
            <div className="mb-4">
              <Slider
                defaultValue={[localFilters.priceRange.min, localFilters.priceRange.max]}
                min={0}
                max={200000}
                step={5000}
                onValueChange={handlePriceChange}
                className="my-6"
              />
              <div className="flex justify-between text-sm">
                <span>₹{localFilters.priceRange.min.toLocaleString()}</span>
                <span>₹{localFilters.priceRange.max.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Categories */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer mb-2"
          onClick={() => setExpanded({...expanded, category: !expanded.category})}
        >
          <h4 className="font-medium">Categories</h4>
          <span>{expanded.category ? '−' : '+'}</span>
        </div>
        
        {expanded.category && (
          <div className="space-y-2 mt-2">
            {productCategories.map((category) => (
              <div key={category.id} className="flex items-center">
                <Checkbox 
                  id={`category-${category.id}`} 
                  checked={localFilters.category.includes(category.id)}
                  onCheckedChange={(checked) => handleCategoryChange(category.id, checked === true)}
                  className="mr-2"
                />
                <Label htmlFor={`category-${category.id}`} className="text-sm cursor-pointer">
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Colors */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer mb-2"
          onClick={() => setExpanded({...expanded, color: !expanded.color})}
        >
          <h4 className="font-medium">Colors</h4>
          <span>{expanded.color ? '−' : '+'}</span>
        </div>
        
        {expanded.color && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-2">
              {availableColors.map((color) => (
                <div key={color.id} className="flex flex-col items-center">
                  <button
                    className={`w-8 h-8 rounded-full border-2 ${
                      localFilters.colors.includes(color.id) ? 'border-gray-800' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleColorChange(
                      color.id, 
                      !localFilters.colors.includes(color.id)
                    )}
                    aria-label={`Select ${color.name} color`}
                  />
                  <span className="text-xs mt-1">{color.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Filter Action Buttons */}
      <div className="flex gap-2">
        <Button 
          onClick={handleApplyFilters} 
          className="flex-1 bg-agri-primary hover:bg-agri-dark"
        >
          Apply Filters
        </Button>
        <Button 
          onClick={handleClearFilters} 
          variant="outline" 
          className="flex-1 border-agri-primary text-agri-primary hover:bg-agri-primary hover:text-white"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default ProductFilter;
