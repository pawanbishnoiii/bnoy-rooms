
-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS to system_settings table
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy that allows only admins to manage settings
CREATE POLICY "Allow admins to manage settings" 
  ON public.system_settings 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

-- Create functions to get and set settings safely
CREATE OR REPLACE FUNCTION public.get_setting(setting_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  setting_value text;
BEGIN
  SELECT value INTO setting_value FROM public.system_settings WHERE key = setting_key;
  RETURN setting_value;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_setting(setting_key text, setting_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.system_settings (key, value, updated_at)
  VALUES (setting_key, setting_value, now())
  ON CONFLICT (key) 
  DO UPDATE SET value = setting_value, updated_at = now();
END;
$$;

-- Insert default settings
INSERT INTO public.system_settings (key, value)
VALUES
  ('SITE_NAME', 'Bnoy Rooms'),
  ('CONTACT_EMAIL', 'support@bnoyrooms.com'),
  ('BOOKING_AUTO_CONFIRM', 'false'),
  ('ENABLE_REVIEWS', 'true'),
  ('MAINTENANCE_MODE', 'false'),
  ('VERSION', '1.2.0')
ON CONFLICT (key) DO NOTHING;

-- Create an admin user if there isn't one already
-- The password is "admin123" - you should change this in production!
DO $$
DECLARE
  admin_count integer;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM auth.users 
  JOIN public.profiles ON auth.users.id = public.profiles.id
  WHERE public.profiles.role = 'admin';
  
  IF admin_count = 0 THEN
    -- Insert admin user
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
      recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, 
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@bnoyrooms.com',
      -- This is the hash for "admin123" - in production, use a strong password!
      crypt('admin123', gen_salt('bf')),
      now(),
      NULL,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"System Administrator","role":"admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Make sure the profile is created for the admin user
    -- This relies on the handle_new_user trigger
  END IF;
END $$;

-- Insert sample facility data if not already present
INSERT INTO public.facilities (name)
VALUES 
  ('Wi-Fi'),
  ('Air Conditioning'),
  ('Parking'),
  ('Laundry'),
  ('Gym'),
  ('Swimming Pool'),
  ('Security Camera'),
  ('Study Room'),
  ('TV Lounge'),
  ('Kitchen'),
  ('Hot Water'),
  ('Elevator'),
  ('Power Backup'),
  ('Housekeeping'),
  ('Meal Service')
ON CONFLICT DO NOTHING;

-- Insert sample location data if not already present
INSERT INTO public.locations (name, latitude, longitude)
VALUES 
  ('Delhi', 28.6139, 77.2090),
  ('Mumbai', 19.0760, 72.8777),
  ('Bangalore', 12.9716, 77.5946),
  ('Hyderabad', 17.3850, 78.4867),
  ('Chennai', 13.0827, 80.2707),
  ('Kolkata', 22.5726, 88.3639),
  ('Pune', 18.5204, 73.8567),
  ('Ahmedabad', 23.0225, 72.5714),
  ('Jaipur', 26.9124, 75.7873),
  ('Lucknow', 26.8467, 80.9462)
ON CONFLICT DO NOTHING;
