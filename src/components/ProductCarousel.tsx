
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Product } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCarouselProps {
  products: Product[];
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ products }) => {
  const [current, setCurrent] = useState(0);
  const featuredProducts = products.slice(0, 5); // Only use the first 5 products
  
  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((current) => (current === featuredProducts.length - 1 ? 0 : current + 1));
    }, 5000);
    
    return () => clearInterval(timer);
  }, [featuredProducts.length]);
  
  const handlePrevious = () => {
    setCurrent((current) => (current === 0 ? featuredProducts.length - 1 : current - 1));
  };
  
  const handleNext = () => {
    setCurrent((current) => (current === featuredProducts.length - 1 ? 0 : current + 1));
  };

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden">
      {/* Carousel Images */}
      {featuredProducts.map((product, index) => (
        <div
          key={product.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ zIndex: index === current ? 10 : 0 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${product.images[0]})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-8 text-white z-20 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{product.name}</h2>
            <p className="mb-4 hidden sm:block">{product.description.substring(0, 120)}...</p>
            <Button 
              asChild
              className="bg-agri-primary hover:bg-agri-dark text-white"
              size="lg"
            >
              <a href={`/product/${product.id}`}>Shop Now</a>
            </Button>
          </div>
        </div>
      ))}
      
      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white z-20 rounded-full p-2"
        onClick={handlePrevious}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white z-20 rounded-full p-2"
        onClick={handleNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
      
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {featuredProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full ${
              index === current ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
