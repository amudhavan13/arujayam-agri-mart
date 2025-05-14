
import React, { useState, useEffect } from 'react';
import { Star, Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/types';

interface ReviewListProps {
  productId: string;
  refreshTrigger: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId, refreshTrigger }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        // Fetch reviews for the product
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          const formattedReviews = data.map(review => ({
            id: review.id,
            userId: review.user_id,
            username: review.username,
            rating: review.rating,
            comment: review.comment,
            images: review.images || [],
            createdAt: review.created_at
          }));
          
          setReviews(formattedReviews);
          
          // Calculate average rating
          if (formattedReviews.length > 0) {
            const total = formattedReviews.reduce((sum, review) => sum + review.rating, 0);
            setAverageRating(total / formattedReviews.length);
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [productId, refreshTrigger]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="h-8 w-8 animate-spin text-agri-primary" />
      </div>
    );
  }
  
  if (reviews.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }
  
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>
        <div className="flex items-center">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-gray-700 font-medium">
            {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>
      
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-agri-primary/20 flex items-center justify-center text-agri-primary font-semibold">
                  {review.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{review.username}</p>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            {review.comment && (
              <p className="mt-3 text-gray-700">{review.comment}</p>
            )}
            
            {review.images && review.images.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {review.images.map((img, index) => (
                  <img 
                    key={index} 
                    src={img} 
                    alt={`Review by ${review.username}`}
                    className="h-20 w-20 object-cover rounded-md border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
