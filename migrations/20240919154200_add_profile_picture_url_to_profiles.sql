-- Add profile_picture_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT NULL;

-- Add comment for the new column
COMMENT ON COLUMN public.profiles.profile_picture_url IS 'URL de la photo de profil de l''utilisateur (optionnel)';

-- Update the updated_at timestamp
UPDATE public.profiles 
SET updated_at = NOW() 
WHERE updated_at IS NOT NULL;
