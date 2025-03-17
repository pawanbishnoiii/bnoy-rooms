
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import RatingInput from './RatingInput';
import { Review } from '@/types';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  cleanliness_rating: z.number().min(1, 'Please rate cleanliness').max(5),
  location_rating: z.number().min(1, 'Please rate location').max(5),
  value_rating: z.number().min(1, 'Please rate value').max(5),
  service_rating: z.number().min(1, 'Please rate service').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(500, 'Comment cannot exceed 500 characters'),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  propertyId: string;
  onSuccess?: (review: Review) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ propertyId, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      cleanliness_rating: 0,
      location_rating: 0,
      value_rating: 0,
      service_rating: 0,
      comment: '',
    },
  });

  const onSubmit = async (values: ReviewFormValues) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to submit a review',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const reviewData = {
        property_id: propertyId,
        user_id: user.id,
        rating: values.rating,
        cleanliness_rating: values.cleanliness_rating,
        location_rating: values.location_rating,
        value_rating: values.value_rating,
        service_rating: values.service_rating,
        comment: values.comment,
      };

      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select('*, user:profiles(*)')
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: 'Review submitted',
        description: 'Thank you for sharing your experience!',
      });

      form.reset();

      if (onSuccess && data) {
        onSuccess(data as Review);
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Submission failed',
        description: error.message || 'An error occurred while submitting your review',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overall Rating</FormLabel>
                <FormControl>
                  <RatingInput
                    value={field.value}
                    onChange={field.onChange}
                    size="lg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cleanliness_rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cleanliness</FormLabel>
                  <FormControl>
                    <RatingInput
                      value={field.value}
                      onChange={field.onChange}
                      size="sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location_rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <RatingInput
                      value={field.value}
                      onChange={field.onChange}
                      size="sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="value_rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value for Money</FormLabel>
                  <FormControl>
                    <RatingInput
                      value={field.value}
                      onChange={field.onChange}
                      size="sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="service_rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <FormControl>
                    <RatingInput
                      value={field.value}
                      onChange={field.onChange}
                      size="sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Review</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share your experience..."
                    className="resize-none min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ReviewForm;
