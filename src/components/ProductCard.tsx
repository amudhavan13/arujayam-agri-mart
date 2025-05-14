
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { id, name, description, price, images } = product;
  
  // Truncate description to 100 characters
  const truncatedDescription = description.length > 100
    ? `${description.substring(0, 100)}...`
    : description;

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/product/${id}`}>
          <img 
            src={images[0]} 
            alt={name} 
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" 
          />
        </Link>
      </div>
      
      <CardContent className="flex-1 p-4">
        <Link to={`/product/${id}`}>
          <h3 className="text-lg font-semibold mb-2 text-agri-dark hover:text-agri-primary transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-3">{truncatedDescription}</p>
        <p className="font-bold text-agri-primary text-lg">₹{price.toLocaleString()}</p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link to={`/product/${id}`} className="w-full">
          <Button 
            variant="outline" 
            className="w-full border-agri-primary text-agri-primary hover:bg-agri-primary hover:text-white transition-colors"
          >
            View Product
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
