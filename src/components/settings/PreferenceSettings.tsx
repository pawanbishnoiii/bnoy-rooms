
import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, GenderOption, PropertyCategory } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface PreferenceSettingsProps {
  user: User;
  profile: UserProfile;
  onUpdate: () => void;
}

const propertyCategories = [
  { value: 'pg', label: 'PG/Co-living' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'dormitory', label: 'Dormitory' },
  { value: 'independent_room', label: 'Independent Room' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'library', label: 'Library' },
  { value: 'coaching', label: 'Coaching Center' },
  { value: 'tiffin_delivery', label: 'Tiffin Delivery' },
];

const PreferenceSettings: React.FC<PreferenceSettingsProps> = ({ user, profile, onUpdate }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [preferredGender, setPreferredGender] = useState<GenderOption>(
    (profile.preferred_gender_accommodation as GenderOption) || 'common'
  );
  const [preferredLocation, setPreferredLocation] = useState(profile.preferred_location || '');
  const [preferredPropertyType, setPreferredPropertyType] = useState(profile.preferred_property_type || '');
  const [maxBudget, setMaxBudget] = useState(profile.max_budget?.toString() || '');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          preferred_gender_accommodation: preferredGender,
          preferred_location: preferredLocation,
          preferred_property_type: preferredPropertyType,
          max_budget: maxBudget ? parseInt(maxBudget) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Preferences updated',
        description: 'Your accommodation preferences have been updated successfully.',
      });
      
      // Call the parent's onUpdate function to refresh the profile data
      onUpdate();
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'Failed to update preferences. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="preferredGender">Preferred Gender Accommodation</Label>
          <Select 
            value={preferredGender} 
            onValueChange={(value) => setPreferredGender(value as GenderOption)}
          >
            <SelectTrigger id="preferredGender">
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boys">Boys Only</SelectItem>
              <SelectItem value="girls">Girls Only</SelectItem>
              <SelectItem value="common">Common (Any Gender)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            This will help us find properties that match your gender preference.
          </p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="preferredLocation">Preferred Location</Label>
          <Input
            id="preferredLocation"
            value={preferredLocation}
            onChange={(e) => setPreferredLocation(e.target.value)}
            placeholder="e.g. North Campus, South Delhi"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="preferredPropertyType">Preferred Property Type</Label>
          <Select 
            value={preferredPropertyType} 
            onValueChange={setPreferredPropertyType}
          >
            <SelectTrigger id="preferredPropertyType">
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Accommodation Types</SelectLabel>
                {propertyCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="maxBudget">Maximum Budget (₹ per month)</Label>
          <Input
            id="maxBudget"
            type="number"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            placeholder="e.g. 10000"
            min="0"
          />
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
            'Save Preferences'
          )}
        </Button>
      </div>
    </form>
  );
};

export default PreferenceSettings;
