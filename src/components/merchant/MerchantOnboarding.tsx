
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PropertyCategory } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Hotel, Home, LibraryBig, BookOpen, Utensils, Users, Warehouse } from 'lucide-react';

const propertyCategories = [
  { id: 'pg', label: 'PG/Co-living', icon: <Building className="h-6 w-6" />, description: 'Paying Guest accommodations for students and working professionals' },
  { id: 'hostel', label: 'Hostel', icon: <Users className="h-6 w-6" />, description: 'Shared rooms with multiple beds and common facilities' },
  { id: 'dormitory', label: 'Dormitory', icon: <Users className="h-6 w-6" />, description: 'Large shared spaces with multiple beds' },
  { id: 'independent_room', label: 'Independent Room', icon: <Home className="h-6 w-6" />, description: 'Private room for rent' },
  { id: 'hotel', label: 'Hotel', icon: <Hotel className="h-6 w-6" />, description: 'Short-term stay with hotel amenities' },
  { id: 'library', label: 'Library', icon: <LibraryBig className="h-6 w-6" />, description: 'Study space with books and resources' },
  { id: 'coaching', label: 'Coaching Center', icon: <BookOpen className="h-6 w-6" />, description: 'Educational centers for academic support' },
  { id: 'tiffin_delivery', label: 'Tiffin Delivery', icon: <Utensils className="h-6 w-6" />, description: 'Food delivery service for students and professionals' },
];

const MerchantOnboarding = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<PropertyCategory | null>(null);
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    contactPerson: '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    address: '',
  });

  const handleCategorySelect = (category: PropertyCategory) => {
    setSelectedCategory(category);
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBusinessInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedCategory) {
      toast({
        title: "Category required",
        description: "Please select a property category",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if merchant profile already exists
      const { data: existingMerchant, error: fetchError } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      let merchantData;
      
      if (existingMerchant) {
        // Update existing merchant
        const { data, error } = await supabase
          .from('merchants')
          .update({
            business_name: businessInfo.businessName,
            contact_person: businessInfo.contactPerson,
            phone: businessInfo.phone,
            email: businessInfo.email,
            address: businessInfo.address,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single();
          
        if (error) throw error;
        merchantData = data;
      } else {
        // Create new merchant
        const { data, error } = await supabase
          .from('merchants')
          .insert({
            id: user.id,
            business_name: businessInfo.businessName,
            contact_person: businessInfo.contactPerson,
            phone: businessInfo.phone,
            email: businessInfo.email,
            address: businessInfo.address,
            is_verified: false,
          })
          .select()
          .single();
          
        if (error) throw error;
        merchantData = data;
      }
      
      // Update user profile role to merchant if needed
      if (profile?.role !== 'merchant') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'merchant' })
          .eq('id', user.id);
          
        if (updateError) throw updateError;
        
        // Refresh the profile to get updated role
        await refreshProfile();
      }
      
      toast({
        title: "Success!",
        description: "Your merchant profile has been created successfully.",
      });
      
      // Navigate to merchant dashboard
      navigate('/merchant/dashboard');
      
    } catch (error: any) {
      console.error('Error creating merchant profile:', error);
      toast({
        title: "Failed to create profile",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <Card className="shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl">Become a Property Partner</CardTitle>
          <CardDescription>
            Join our platform and start listing your properties to reach thousands of students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Select your business category</h3>
              <p className="text-sm text-muted-foreground">Choose the type of service you want to offer on our platform</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {propertyCategories.map((category) => (
                  <div
                    key={category.id}
                    className="border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                    onClick={() => handleCategorySelect(category.id as PropertyCategory)}
                  >
                    <div className="flex items-center mb-2">
                      <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                        {category.icon}
                      </div>
                      <h3 className="font-medium">{category.label}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Business Information</h3>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setStep(1)}
                  >
                    Change Category
                  </Button>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      placeholder="Your business name"
                      value={businessInfo.businessName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      name="contactPerson"
                      placeholder="Full name"
                      value={businessInfo.contactPerson}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="Your phone number"
                        value={businessInfo.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Your email address"
                        value={businessInfo.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Your business address"
                      value={businessInfo.address}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">What happens next?</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Next Steps</DialogTitle>
                      <DialogDescription>
                        Here's what happens after you submit your merchant application
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex gap-3">
                        <div className="bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center shrink-0">1</div>
                        <div>
                          <h4 className="font-medium">Application Review</h4>
                          <p className="text-sm text-muted-foreground">Our team will review your application</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center shrink-0">2</div>
                        <div>
                          <h4 className="font-medium">Dashboard Access</h4>
                          <p className="text-sm text-muted-foreground">You'll get immediate access to your merchant dashboard</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center shrink-0">3</div>
                        <div>
                          <h4 className="font-medium">Add Properties</h4>
                          <p className="text-sm text-muted-foreground">Start adding your properties and rooms</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center shrink-0">4</div>
                        <div>
                          <h4 className="font-medium">Go Live</h4>
                          <p className="text-sm text-muted-foreground">Once verified, your properties will be visible to users</p>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="secondary" onClick={() => document.body.click()}>Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button type="submit" disabled={loading}>
                  {loading ? "Processing..." : "Submit Application"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantOnboarding;
