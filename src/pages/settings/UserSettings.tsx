
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileSettings from '@/components/settings/ProfileSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import PreferenceSettings from '@/components/settings/PreferenceSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import { UserCog, Shield, Bell, Settings2 } from 'lucide-react';

const UserSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, profile, refreshProfile } = useAuth();

  if (!user || !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Loading your settings</h2>
            <p className="text-muted-foreground">Please wait while we load your profile information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" /> 
              <span className="hidden md:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" /> 
              <span className="hidden md:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> 
              <span className="hidden md:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> 
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  This information will be displayed publicly so be careful what you share.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileSettings 
                  user={user} 
                  profile={profile} 
                  onUpdate={refreshProfile} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Accommodation Preferences</CardTitle>
                <CardDescription>
                  Set your preferences to help us find the perfect accommodation for you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PreferenceSettings 
                  user={user} 
                  profile={profile} 
                  onUpdate={refreshProfile} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecuritySettings user={user} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you receive notifications and alerts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationSettings 
                  user={user} 
                  profile={profile} 
                  onUpdate={refreshProfile} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserSettings;
