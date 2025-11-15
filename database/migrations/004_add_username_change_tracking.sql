-- Add username_last_changed_at column to track when username was last changed
ALTER TABLE user_profiles
ADD COLUMN username_last_changed_at TIMESTAMPTZ;

-- Set initial value for existing users to their updated_at timestamp
-- This ensures existing users can change their username immediately after this migration
UPDATE user_profiles
SET username_last_changed_at = updated_at
WHERE username_last_changed_at IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN user_profiles.username_last_changed_at IS 'Timestamp of when the username was last changed. Used to enforce 3-day cooldown period between changes.';
