
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Steps } from '@/components/ui/steps';

const MerchantOnboarding = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: '',
    website: '',
  });

  const steps = [
    { 
      title: 'Business Information',
      description: 'Tell us about your business'
    },
    { 
      title: 'Contact Details',
      description: 'How can we reach you?'
    },
    { 
      title: 'Legal Information',
      description: 'Provide legal & tax details'
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitForm = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Update user profile to merchant role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'merchant' })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Create merchant entry
      const { error: merchantError } = await supabase
        .from('merchants')
        .insert({
          id: user.id,
          business_name: formData.businessName,
          contact_person: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          is_verified: false
        });
        
      if (merchantError) throw merchantError;
      
      // Refresh the user profile to get updated role
      await refreshProfile();
      
      toast({
        title: 'Welcome aboard!',
        description: 'Your merchant account has been created successfully.',
      });
      
      navigate('/dashboard/overview');
      
    } catch (error: any) {
      console.error('Error creating merchant account:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create merchant account.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Become a Property Owner</CardTitle>
          <CardDescription>
            Start listing your properties and earn rental income
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Steps 
            steps={steps}
            currentStep={currentStep}
            className="mb-8"
          />
          
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter your business name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Enter contact person name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your business address"
                  required
                />
              </div>
            </div>
          )}
          
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Enter your website URL"
                />
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-medium mb-2">Terms of Service</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  By creating a merchant account, you agree to our terms of service and listing policies. You acknowledge that:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                  <li>You have legal rights to list the properties</li>
                  <li>All information provided is accurate and up-to-date</li>
                  <li>You will respond to booking inquiries within 24 hours</li>
                  <li>You accept the platform's service fee for each successful booking</li>
                </ul>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-medium mb-2">What Happens Next?</h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-5">
                  <li>Create your merchant profile</li>
                  <li>Add your properties and rooms</li>
                  <li>Set pricing and availability</li>
                  <li>Start receiving bookings</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {currentStep > 0 ? (
            <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
              Previous
            </Button>
          ) : (
            <Button variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep}>Next Step</Button>
          ) : (
            <Button onClick={submitForm} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Create Merchant Account'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default MerchantOnboarding;
