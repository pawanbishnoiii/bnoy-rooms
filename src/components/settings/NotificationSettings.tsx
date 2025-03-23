
import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface NotificationSettingsProps {
  user: User;
  profile: UserProfile;
  onUpdate: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ user, profile, onUpdate }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile.notifications_enabled ?? true);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notifications_enabled: notificationsEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Notification settings updated',
        description: 'Your notification preferences have been updated successfully.',
      });
      
      // Call the parent's onUpdate function to refresh the profile data
      onUpdate();
    } catch (error: any) {
      console.error('Error updating notification settings:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'Failed to update notification settings. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notifications" className="text-base">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive updates about new properties, booking confirmations, and other important information.
            </p>
          </div>
          <Switch
            id="notifications"
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
          />
        </div>
        
        <div className="text-sm text-muted-foreground pt-4 border-t">
          <p>
            Note: By enabling notifications, you agree to receive emails from us about new properties, booking status updates, and other related information.
          </p>
          <p className="mt-2">
            You can manage your email preferences at any time by updating these settings.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Notification Settings'
          )}
        </Button>
      </div>
    </form>
  );
};

export default NotificationSettings;
