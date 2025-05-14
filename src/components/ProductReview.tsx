
import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ProductReviewProps {
  productId: string;
  onReviewAdded: () => void;
}

const ProductReview: React.FC<ProductReviewProps> = ({ productId, onReviewAdded }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };
  
  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to submit a review"
      });
      return;
    }
    
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Rating required",
        description: "Please select a rating"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Get user profile for username
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      
      const username = profile?.username || user.email?.split('@')[0] || 'Anonymous';
      
      // Submit review to Supabase
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id: productId,
          username,
          rating,
          comment,
          images: images.length > 0 ? images : null
        });
      
      if (error) throw error;
      
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!"
      });
      
      // Reset form
      setRating(0);
      setComment('');
      setImages([]);
      
      // Trigger refresh of reviews
      onReviewAdded();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to submit review",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="mt-6 p-4 border rounded-md bg-gray-50">
        <p className="text-center text-gray-600">
          Please <a href="/login" className="text-agri-primary hover:underline">login</a> to leave a review
        </p>
      </div>
    );
  }
  
  return (
    <div className="mt-6 p-4 border rounded-md">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Rating</label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-8 w-8 cursor-pointer ${
                  star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                }`}
                onClick={() => handleRatingChange(star)}
              />
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="comment" className="block text-gray-700 mb-1">Your Review</label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Write your thoughts about this product..."
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Add Images (Optional)</label>
          <div className="flex">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image URL"
              className="flex-1 p-2 border rounded-l-md"
            />
            <Button 
              type="button" 
              onClick={handleAddImage} 
              className="rounded-l-none"
            >
              Add
            </Button>
          </div>
          
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <img 
                    src={img} 
                    alt={`Review image ${index + 1}`} 
                    className="h-20 w-20 object-cover rounded-md border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 h-6 w-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-agri-primary hover:bg-agri-dark"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </Button>
      </form>
    </div>
  );
};

export default ProductReview;
