
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, Upload, User } from 'lucide-react';

const UserSettings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<string>('');
  const [preferredGender, setPreferredGender] = useState<'boys' | 'girls' | 'common'>('common');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [preferredPropertyType, setPreferredPropertyType] = useState('');
  const [maxBudget, setMaxBudget] = useState<number | ''>('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setEmail(profile.email || '');
      setAvatarUrl(profile.avatar_url);
      setGender(profile.gender || '');
      setPreferredGender(profile.preferred_gender_accommodation as 'boys' | 'girls' | 'common' || 'common');
      setPreferredLocation(profile.preferred_location || '');
      setPreferredPropertyType(profile.preferred_property_type || '');
      setMaxBudget(profile.max_budget || '');
      setNotificationsEnabled(profile.notifications_enabled || true);
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Avatar image must be less than 2MB',
          variant: 'destructive',
        });
        return;
      }
      setAvatarFile(file);
      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;
    
    try {
      setUploading(true);
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    try {
      let updatedAvatarUrl = avatarUrl;
      
      // Upload new avatar if selected
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar();
        if (newAvatarUrl) {
          updatedAvatarUrl = newAvatarUrl;
        }
      }
      
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          avatar_url: updatedAvatarUrl,
          gender,
          preferred_gender_accommodation: preferredGender,
          preferred_location: preferredLocation,
          preferred_property_type: preferredPropertyType,
          max_budget: maxBudget === '' ? null : maxBudget,
          notifications_enabled: notificationsEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh the profile
      await refreshProfile();
      
      toast({
        title: 'Settings updated',
        description: 'Your profile settings have been updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
      setAvatarFile(null); // Clear the file input
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and how we can contact you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <Avatar className="h-24 w-24">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={fullName || 'User'} />
                    ) : (
                      <AvatarFallback className="text-xl">
                        <User className="h-12 w-12" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="avatar" className="text-sm font-medium">
                      Profile Picture
                    </Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Supported formats: JPG, PNG. Max size: 2MB
                    </p>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      placeholder="Your email address"
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact support to update your email address
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone || ''}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={gender} 
                      onValueChange={(value) => setGender(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Accommodation Preferences</CardTitle>
                <CardDescription>
                  Set your preferences for accommodation to get personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preferredGender">Preferred Accommodation Type</Label>
                    <Select 
                      value={preferredGender} 
                      onValueChange={(value: 'boys' | 'girls' | 'common') => setPreferredGender(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select accommodation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boys">Boys Hostel/PG</SelectItem>
                        <SelectItem value="girls">Girls Hostel/PG</SelectItem>
                        <SelectItem value="common">Common/Co-ed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredLocation">Preferred Location</Label>
                    <Input
                      id="preferredLocation"
                      value={preferredLocation || ''}
                      onChange={(e) => setPreferredLocation(e.target.value)}
                      placeholder="e.g., North Campus, South Delhi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredPropertyType">Preferred Property Type</Label>
                    <Select 
                      value={preferredPropertyType || ''} 
                      onValueChange={(value) => setPreferredPropertyType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hostel">Hostel</SelectItem>
                        <SelectItem value="pg">PG</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="independent">Independent Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Monthly Budget (₹)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={maxBudget}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : '';
                        setMaxBudget(value);
                      }}
                      placeholder="Your maximum monthly budget"
                      min="0"
                      step="500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure how you receive notifications from us
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about new properties and booking updates
                    </p>
                  </div>
                  <Switch 
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving || uploading}>
                {(isSaving || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving changes...' : 'Save changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default UserSettings;
