
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, KeyRound, Mail, AtSign, Phone, MapPin, Building } from 'lucide-react';

const profileFormSchema = z.object({
  full_name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  preferred_gender_accommodation: z.enum(['boys', 'girls', 'common']).optional(),
  preferred_location: z.string().optional(),
  preferred_property_type: z.string().optional(),
  max_budget: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  notifications_enabled: z.boolean().default(true)
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z.object({
  current_password: z.string().min(6, { message: 'Current password is required' }),
  new_password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirm_password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const UserSettings = () => {
  const { user, profile, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const locationOptions = [
    'Suratgarh', 'Bikaner', 'Anupgarh', 'RaiSinghnagar', 
    'Sri Ganganagar', 'Abohar', 'Gharsana', 'Hanumangarh',
    'Sangariya', 'Sikar', 'Gopalpura Jaipur', 'Ridhi Sidhi Jaipur',
    'Mansarovar Jaipur', 'Kota'
  ];

  const propertyTypes = ['pg', 'hostel', 'independent', 'rented', 'hotel'];

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      gender: (profile?.gender as any) || undefined,
      preferred_gender_accommodation: (profile?.preferred_gender_accommodation as any) || 'common',
      preferred_location: profile?.preferred_location || '',
      preferred_property_type: profile?.preferred_property_type || '',
      max_budget: profile?.max_budget ? profile.max_budget.toString() : '',
      notifications_enabled: profile?.notifications_enabled !== false
    }
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        full_name: profile.full_name || '',
        email: user?.email || '',
        phone: profile.phone || '',
        gender: (profile.gender as any) || undefined,
        preferred_gender_accommodation: (profile.preferred_gender_accommodation as any) || 'common',
        preferred_location: profile.preferred_location || '',
        preferred_property_type: profile.preferred_property_type || '',
        max_budget: profile.max_budget ? profile.max_budget.toString() : '',
        notifications_enabled: profile.notifications_enabled !== false
      });
    }
  }, [profile, user]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Only update email if it has changed
      if (data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email
        });
        
        if (emailError) throw emailError;
        
        toast({
          title: 'Email update initiated',
          description: 'Please check your inbox to confirm your new email address.'
        });
      }
      
      // Update profile info
      await updateProfile({
        full_name: data.full_name,
        phone: data.phone || null,
        gender: data.gender || null,
        preferred_gender_accommodation: data.preferred_gender_accommodation || 'common',
        preferred_location: data.preferred_location || null,
        preferred_property_type: data.preferred_property_type || null,
        max_budget: data.max_budget,
        notifications_enabled: data.notifications_enabled
      });
      
      setSuccess('Your profile has been updated successfully.');
      
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully.'
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'An error occurred while updating your profile.');
      
      toast({
        title: 'Update failed',
        description: error.message || 'An error occurred while updating your profile.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // First verify the current password is correct by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: data.current_password
      });
      
      if (signInError) {
        throw new Error('Current password is incorrect');
      }
      
      // If sign-in successful, update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.new_password
      });
      
      if (updateError) throw updateError;
      
      setSuccess('Your password has been updated successfully.');
      passwordForm.reset();
      
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.'
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      setError(error.message || 'An error occurred while updating your password.');
      
      toast({
        title: 'Password update failed',
        description: error.message || 'An error occurred while updating your password.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-10" placeholder="Your name" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-10" placeholder="Your email" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Changing your email will require verification
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-10" placeholder="Your phone number" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="male" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Male
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="female" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Female
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="other" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Other
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Profile Information
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to secure your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="current_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-10" type="password" placeholder="••••••••" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="new_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-10" type="password" placeholder="••••••••" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirm_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-10" type="password" placeholder="••••••••" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Password
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Accommodation Preferences</CardTitle>
                <CardDescription>
                  Set your preferences for accommodation recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="preferred_gender_accommodation"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Preferred Accommodation Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="boys" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Boys Accommodation
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="girls" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Girls Accommodation
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="common" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  No Preference
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="preferred_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Location</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <div className="flex items-center">
                                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <SelectValue placeholder="Select a location" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No preference</SelectItem>
                              {locationOptions.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="preferred_property_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Property Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <div className="flex items-center">
                                  <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <SelectValue placeholder="Select a property type" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No preference</SelectItem>
                              <SelectItem value="pg">PG</SelectItem>
                              <SelectItem value="hostel">Hostel</SelectItem>
                              <SelectItem value="independent">Independent Room</SelectItem>
                              <SelectItem value="rented">Rented House</SelectItem>
                              <SelectItem value="hotel">Hotel</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="max_budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Budget (₹/month)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Your monthly budget" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="notifications_enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Notifications
                            </FormLabel>
                            <FormDescription>
                              Receive notifications about new properties that match your preferences
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Preferences
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserSettings;
