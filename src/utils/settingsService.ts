
import { supabase } from "@/integrations/supabase/client";
import { SystemSetting } from "@/types";

/**
 * Get a system setting value by key
 * @param key The setting key to retrieve
 * @returns The setting value or undefined if not found
 */
export async function getSystemSetting(key: string): Promise<string | undefined> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      console.error('Error fetching system setting:', error);
      return undefined;
    }

    return data?.value;
  } catch (error) {
    console.error('Error in getSystemSetting:', error);
    return undefined;
  }
}

/**
 * Set a system setting value
 * @param key The setting key
 * @param value The setting value
 * @returns Success status
 */
export async function setSystemSetting(key: string, value: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('Error setting system setting:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in setSystemSetting:', error);
    return false;
  }
}

/**
 * Get the Google AI API key
 * @returns The API key or undefined if not found
 */
export async function getGoogleAIApiKey(): Promise<string | undefined> {
  return getSystemSetting('GOOGLE_AI_API_KEY');
}
