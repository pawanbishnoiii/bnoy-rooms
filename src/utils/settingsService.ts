
import { supabase } from '@/integrations/supabase/client';

/**
 * Get a system setting value by key
 * @param key The setting key to retrieve
 * @returns The setting value as a string, or null if not found
 */
export async function getSetting(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_setting', { setting_key: key });

    if (error) {
      console.error('Error getting setting:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getSetting:', error);
    return null;
  }
}

/**
 * Set a system setting value
 * @param key The setting key
 * @param value The setting value
 * @returns True if successful, false otherwise
 */
export async function setSetting(key: string, value: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('set_setting', { 
        setting_key: key,
        setting_value: value
      });

    if (error) {
      console.error('Error setting setting:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in setSetting:', error);
    return false;
  }
}

/**
 * Get property room counts
 * @param propertyId The property ID
 * @returns Object with total_rooms and available_rooms
 */
export async function getPropertyRoomCounts(propertyId: string): Promise<{ total_rooms: number, available_rooms: number } | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_property_room_counts', { property_id: propertyId });

    if (error) {
      console.error('Error getting room counts:', error);
      return null;
    }

    if (data && data.length > 0) {
      return {
        total_rooms: data[0].total_rooms,
        available_rooms: data[0].available_rooms
      };
    }

    return { total_rooms: 0, available_rooms: 0 };
  } catch (error) {
    console.error('Error in getPropertyRoomCounts:', error);
    return null;
  }
}
