import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import RatingInput from './RatingInput';
import { useAuth } from '@/contexts/AuthContext';
import { Review, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  rating: z.number().min(1, { message: 'Rating must be at least 1 star' }),
  comment: z.string().optional(),
});

interface ReviewFormProps {
  propertyId: string;
  onReviewSubmitted: (review: Review) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ propertyId, onReviewSubmitted }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
  if (!user) return;
  
  try {
    setIsSubmitting(true);
    
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        property_id: propertyId,
        user_id: user.id,
        rating: values.rating,
        comment: values.comment
      })
      .select('*, user:profiles(*)')
      .single();
      
    if (error) throw error;
    
    // Transform the review data to match the Review type
    const newReview: Review = {
      id: data.id,
      property_id: data.property_id,
      user_id: data.user_id,
      rating: data.rating,
      comment: data.comment,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user: data.user && !data.user.error ? {
        id: data.user.id || '',
        full_name: data.user.full_name || null,
        role: data.user.role as UserRole || 'student',
        phone: data.user.phone || null,
        email: data.user.email || null,
        avatar_url: data.user.avatar_url || null,
        created_at: data.user.created_at || '',
        updated_at: data.user.updated_at || ''
      } : undefined
    };
    
    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback!"
    });
    
    onReviewSubmitted(newReview);
    form.reset();
  } catch (error: any) {
    console.error('Error submitting review:', error);
    toast({
      title: "Submission Failed",
      description: error.message || "There was an error submitting your review.",
      variant: "destructive"
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <RatingInput
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your experience"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </Form>
  );
};

export default ReviewForm;
