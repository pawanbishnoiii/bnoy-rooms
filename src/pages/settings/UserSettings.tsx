import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, Mail, Phone, MapPin, Building, Wallet, Bell, Shield, LogOut, Upload, Trash2, Loader2 } from 'lucide-react';

const UserSettings = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    gender: profile?.gender || 'common',
    preferred_gender_accommodation: profile?.preferred_gender_accommodation || 'common',
    preferred_location: profile?.preferred_location || '',
    preferred_property_type: profile?.preferred_property_type || '',
    max_budget: profile?.max_budget || 0,
    notifications_enabled: profile?.notifications_enabled || true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setProfileForm(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseInt(value)) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setProfileForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0] || !user) return;

    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    setIsUploading(true);
    try {
      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      if (publicUrlData && publicUrlData.publicUrl) {
        // Update profile with new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrlData.publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;

        // Refresh profile to get updated data
        await refreshProfile();

        toast({
          title: 'Avatar updated',
          description: 'Your profile picture has been updated successfully',
        });
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload avatar. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !profile?.avatar_url) return;

    setIsUploading(true);
    try {
      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refresh profile to get updated data
      await refreshProfile();

      toast({
        title: 'Avatar removed',
        description: 'Your profile picture has been removed',
      });
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast({
        title: 'Failed to remove avatar',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileForm)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Refresh profile to get updated data
      await refreshProfile();
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // This is a placeholder - in a real app, you'd want to implement a more secure
      // account deletion process, possibly with additional confirmation steps
      toast({
        title: 'Account deletion requested',
        description: 'Please contact support to complete account deletion',
      });
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and how others see you on the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="text-2xl">
                        {profile?.full_name?.substring(0, 2) || user?.email?.substring(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-medium">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a photo to personalize your account
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="relative" disabled={isUploading}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      {profile?.avatar_url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleRemoveAvatar}
                          disabled={isUploading}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Basic Info Form */}
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="full_name" className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={profileForm.full_name || ''}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileForm.email || ''}
                      onChange={handleInputChange}
                      placeholder="Your email address"
                      disabled={!!user?.email} // Disable if email is set through auth
                    />
                    {user?.email && (
                      <p className="text-xs text-muted-foreground">
                        Email is managed through your account settings
                      </p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileForm.phone || ''}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="gender" className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Gender
                    </Label>
                    <Select
                      value={profileForm.gender || 'common'}
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boys">Male</SelectItem>
                        <SelectItem value="girls">Female</SelectItem>
                        <SelectItem value="common">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setProfileForm({
                    full_name: profile?.full_name || '',
                    phone: profile?.phone || '',
                    email: profile?.email || '',
                    gender: profile?.gender || 'common',
                  })}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Accommodation Preferences</CardTitle>
                <CardDescription>
                  Set your preferences to help us find the best accommodations for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="preferred_gender_accommodation" className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      Preferred Accommodation Type
                    </Label>
                    <Select
                      value={profileForm.preferred_gender_accommodation || 'common'}
                      onValueChange={(value) => handleSelectChange('preferred_gender_accommodation', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select accommodation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boys">Boys Only</SelectItem>
                        <SelectItem value="girls">Girls Only</SelectItem>
                        <SelectItem value="common">Co-ed / No Preference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="preferred_location" className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Preferred Location
                    </Label>
                    <Input
                      id="preferred_location"
                      name="preferred_location"
                      value={profileForm.preferred_location || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. North Campus, South Delhi"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="preferred_property_type" className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      Preferred Property Type
                    </Label>
                    <Input
                      id="preferred_property_type"
                      name="preferred_property_type"
                      value={profileForm.preferred_property_type || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. PG, Hostel, Apartment"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="max_budget" className="flex items-center gap-1">
                      <Wallet className="h-4 w-4" />
                      Maximum Budget (₹/month)
                    </Label>
                    <Input
                      id="max_budget"
                      name="max_budget"
                      type="number"
                      value={profileForm.max_budget || ''}
                      onChange={handleInputChange}
                      placeholder="Your maximum monthly budget"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setProfileForm({
                    ...profileForm,
                    preferred_gender_accommodation: profile?.preferred_gender_accommodation || 'common',
                    preferred_location: profile?.preferred_location || '',
                    preferred_property_type: profile?.preferred_property_type || '',
                    max_budget: profile?.max_budget || 0,
                  })}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Preferences'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-1">
                        <Bell className="h-4 w-4" />
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about bookings and messages via email
                      </p>
                    </div>
                    <Switch
                      checked={profileForm.notifications_enabled || false}
                      onCheckedChange={(checked) => handleSwitchChange('notifications_enabled', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Booking Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications about your booking status changes
                      </p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Property Recommendations</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new properties matching your preferences
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional offers and newsletters
                      </p>
                    </div>
                    <Switch checked={false} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Notification Settings'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        Change Password
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Update your password to keep your account secure
                      </p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-1">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Sign out from your account on this device
                      </p>
                    </div>
                    <Button variant="outline" onClick={signOut}>Sign Out</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-1 text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all your data
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete Account</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove all your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserSettings;
