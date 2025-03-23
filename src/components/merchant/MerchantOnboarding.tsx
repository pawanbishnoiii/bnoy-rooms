
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Steps, Step } from '@/components/ui/steps';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyCategory } from '@/types';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  Building,
  Hotel,
  Library,
  School,
  Utensils,
  Home,
  Store,
  Users,
  Loader2
} from 'lucide-react';

// Define the property categories with icons
const propertyCategories = [
  { id: 'pg', label: 'PG/Co-living', icon: Building },
  { id: 'hostel', label: 'Hostel', icon: Users },
  { id: 'dormitory', label: 'Dormitory', icon: Home },
  { id: 'independent_room', label: 'Independent Room', icon: Home },
  { id: 'hotel', label: 'Hotel', icon: Hotel },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'coaching', label: 'Coaching Center', icon: School },
  { id: 'tiffin_delivery', label: 'Tiffin Delivery', icon: Utensils },
];

const MerchantOnboarding: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<PropertyCategory | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCategorySelect = (category: PropertyCategory) => {
    setSelectedCategory(category);
  };

  const handleNextStep = () => {
    if (currentStep === 0 && !selectedCategory) {
      toast({
        title: 'Please select a category',
        description: 'You need to select a category to continue',
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = async () => {
    if (!user || !selectedCategory) return;
    
    setIsLoading(true);
    try {
      // Update the user's profile to include the selected property type
      const { error } = await supabase
        .from('profiles')
        .update({
          preferred_property_type: selectedCategory,
          role: 'merchant', // Ensure the role is set to merchant
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh the user profile to get the updated role
      await refreshProfile();

      toast({
        title: 'Success!',
        description: 'Your merchant account is now ready. You can start adding properties.',
      });

      // Redirect to the merchant dashboard
      navigate('/merchant/dashboard');
    } catch (error: any) {
      console.error('Merchant onboarding error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Merchant Onboarding</CardTitle>
        <CardDescription>
          Set up your merchant account to start listing properties for booking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Steps value={currentStep} className="mb-8">
          <Step value={0} title="Choose Category" />
          <Step value={1} title="Business Details" />
          <Step value={2} title="Review & Finish" />
        </Steps>

        {currentStep === 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">What type of property or service do you offer?</h3>
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="grid">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {propertyCategories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <div
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id as PropertyCategory)}
                        className={`
                          border rounded-lg p-4 text-center cursor-pointer transition
                          hover:border-primary hover:shadow
                          ${selectedCategory === category.id ? 'border-2 border-primary bg-primary/5' : ''}
                        `}
                      >
                        <IconComponent className="h-10 w-10 mx-auto mb-2 text-primary" />
                        <h4 className="font-medium">{category.label}</h4>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="list">
                <div className="space-y-2">
                  {propertyCategories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <div
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id as PropertyCategory)}
                        className={`
                          flex items-center border rounded-lg p-4 cursor-pointer transition
                          hover:border-primary hover:shadow
                          ${selectedCategory === category.id ? 'border-2 border-primary bg-primary/5' : ''}
                        `}
                      >
                        <IconComponent className="h-6 w-6 mr-4 text-primary" />
                        <h4 className="font-medium">{category.label}</h4>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Your Business Details</h3>
            <p className="text-muted-foreground">
              You've selected:
              <Badge className="ml-2 bg-primary">
                {propertyCategories.find(c => c.id === selectedCategory)?.label || selectedCategory}
              </Badge>
            </p>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Your profile information will be used for your merchant account. If you need to update your profile information, you can do so in the settings page after completing the onboarding process.
              </p>
            </div>

            <div className="grid gap-4 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Name:</div>
                <div>{profile?.full_name || user?.email}</div>
                
                <div className="font-medium">Email:</div>
                <div>{user?.email}</div>
                
                <div className="font-medium">Phone:</div>
                <div>{profile?.phone || 'Not provided'}</div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Review & Finish</h3>
            <div className="bg-muted p-6 rounded-lg">
              <h4 className="font-semibold mb-4">Summary</h4>
              <div className="grid gap-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Property Type:</div>
                  <div className="capitalize">
                    {propertyCategories.find(c => c.id === selectedCategory)?.label || selectedCategory}
                  </div>
                  
                  <div className="font-medium">Account Name:</div>
                  <div>{profile?.full_name || user?.email}</div>
                  
                  <div className="font-medium">Email:</div>
                  <div>{user?.email}</div>
                  
                  <div className="font-medium">Phone:</div>
                  <div>{profile?.phone || 'Not provided'}</div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium mb-2">Next Steps:</h5>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Complete your merchant profile in settings</li>
                    <li>Add your first property listing</li>
                    <li>Set up rooms and facilities</li>
                    <li>Start accepting bookings</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
              <p className="text-sm">
                By completing this setup, you agree to our terms of service for listing properties and services on our platform.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {currentStep > 0 ? (
            <Button variant="outline" onClick={handlePrevStep} disabled={isLoading}>
              Back
            </Button>
          ) : (
            <Button variant="outline" onClick={() => navigate('/')} disabled={isLoading}>
              Cancel
            </Button>
          )}
          
          {currentStep < 2 ? (
            <Button onClick={handleNextStep} disabled={isLoading || (currentStep === 0 && !selectedCategory)}>
              Next
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MerchantOnboarding;
