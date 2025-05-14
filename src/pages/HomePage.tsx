
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProductCarousel from '../components/ProductCarousel';
import ProductCard from '../components/ProductCard';
import ProductFilter from '../components/ProductFilter';
import { useAppContext } from '../context/AppContext';
import { mockProducts } from '../data/mockData';
import { Product, FilterOptions } from '../types';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';

const HomePage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { recentlyViewed, filterOptions } = state;
  
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterOptions>(filterOptions);
  
  // Load products (simulating API call)
  useEffect(() => {
    setProducts(mockProducts);
    dispatch({ type: 'SET_PRODUCTS', payload: mockProducts });
  }, [dispatch]);
  
  // Apply filters and search
  useEffect(() => {
    let results = products;
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(term) || 
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }
    
    // Apply category filters
    if (activeFilters.category.length > 0) {
      results = results.filter(product => 
        activeFilters.category.includes(product.category)
      );
    }
    
    // Apply color filters
    if (activeFilters.colors.length > 0) {
      results = results.filter(product => 
        product.colors.some(color => activeFilters.colors.includes(color))
      );
    }
    
    // Apply price range filter
    results = results.filter(product => 
      product.price >= activeFilters.priceRange.min && 
      product.price <= activeFilters.priceRange.max
    );
    
    setFilteredProducts(results);
  }, [products, searchTerm, activeFilters]);
  
  const handleFilterChange = (filters: FilterOptions) => {
    setActiveFilters(filters);
    dispatch({ type: 'UPDATE_FILTER_OPTIONS', payload: filters });
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search already applied via useEffect
  };

  return (
    <Layout>
      {/* Hero Carousel */}
      <ProductCarousel products={mockProducts} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto my-8">
          <div className="flex">
            <Input
              type="text"
              placeholder="Search for agricultural products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-agri-primary focus:ring-agri-primary"
            />
            <Button 
              type="submit"
              className="ml-2 bg-agri-primary hover:bg-agri-dark"
            >
              <Search className="h-4 w-4" />
              <span className="ml-2">Search</span>
            </Button>
          </div>
        </form>
        
        {/* Recently Viewed Products */}
        {recentlyViewed.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-agri-dark mb-4">Recently Viewed</h2>
            <div className="product-grid">
              {recentlyViewed.slice(0, 4).map((product) => (
                <ProductCard key={`recent-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            <ProductFilter onFilterChange={handleFilterChange} />
          </div>
          
          {/* Product Listings */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-agri-dark">
                {filteredProducts.length > 0 
                  ? 'Available Products'
                  : 'No Products Found'}
              </h2>
              <span className="text-sm text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </span>
            </div>
            
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
