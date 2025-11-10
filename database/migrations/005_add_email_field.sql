-- Add email field to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN email TEXT;

-- Update the public_user_profiles view to include email
CREATE OR REPLACE VIEW public_user_profiles AS
SELECT 
    id,
    username,
    created_at,
    linkedin,
    twitter_handle,
    ig_handle,
    website,
    evm_wallet_address,
    solana_wallet_address,
    email
FROM user_profiles;

-- Refresh grants on the updated view
GRANT SELECT ON public_user_profiles TO authenticated;
