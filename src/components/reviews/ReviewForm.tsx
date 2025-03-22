
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import RatingInput from './RatingInput';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewFormProps {
  propertyId: string;
  onSuccess?: () => void;
}

const formSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, {
    message: 'Review must be at least 5 characters.',
  }).max(500, {
    message: 'Review must not exceed 500 characters.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ReviewForm = ({ propertyId, onSuccess }: ReviewFormProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to submit a review.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          property_id: propertyId,
          user_id: user.id,
          rating: values.rating,
          comment: values.comment,
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Review submitted',
        description: 'Thank you for sharing your feedback!',
      });

      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Submission failed',
        description: error.message || 'There was an error submitting your review.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to submit a review.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.href = '/auth/login'}>
            Log in
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
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
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience with this property..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => form.reset()}>
          Cancel
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={isLoading || form.getValues().rating === 0}
        >
          {isLoading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReviewForm;
